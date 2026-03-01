import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import AutoDepositToken from "../models/AutoDepositToken.js";
import AutoDeposit from "../models/AutoDeposit.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * Helper: always ensure settings exists
 */
async function getOrCreateSetting() {
  let s = await AutoDepositToken.findOne();
  if (!s) {
    s = new AutoDepositToken({
      businessToken: "",
      active: false,
      minAmount: 5,
      maxAmount: 500000,
    });
    await s.save();
  }
  return s;
}

/**
 * ✅ ADMIN: GET settings
 * GET /api/auto-deposit/admin
 */
router.get("/admin", async (req, res) => {
  try {
    const s = await getOrCreateSetting();
    res.json({
      success: true,
      data: {
        businessToken: s.businessToken || "",
        active: !!s.active,
        minAmount: Number(s.minAmount || 5),
        maxAmount: Number(s.maxAmount || 0),
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ✅ ADMIN: UPDATE settings
 * PUT /api/auto-deposit/admin
 * body: { businessToken, active, minAmount, maxAmount }
 */
router.put("/admin", async (req, res) => {
  try {
    const { businessToken, active, minAmount, maxAmount } = req.body;
    const s = await getOrCreateSetting();

    if (typeof businessToken === "string") s.businessToken = businessToken.trim();
    if (typeof active === "boolean") s.active = active;

    const min = Number(minAmount);
    const max = Number(maxAmount);

    if (Number.isFinite(min)) s.minAmount = Math.max(1, Math.floor(min));
    if (Number.isFinite(max)) s.maxAmount = Math.max(0, Math.floor(max));

    if (s.maxAmount > 0 && s.minAmount > s.maxAmount) {
      return res.status(400).json({
        success: false,
        message: "minAmount cannot be greater than maxAmount",
      });
    }

    await s.save();

    res.json({
      success: true,
      message: "AutoDeposit settings updated",
      data: {
        active: !!s.active,
        minAmount: s.minAmount,
        maxAmount: s.maxAmount,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * ✅ FRONTEND: STATUS (token hide)
 * GET /api/auto-deposit/status
 */
router.get("/status", async (req, res) => {
  try {
    const s = await getOrCreateSetting();
    const enabled = !!(s.active && s.businessToken);

    res.json({
      success: true,
      data: {
        enabled,
        minAmount: Number(s.minAmount || 5),
        maxAmount: Number(s.maxAmount || 0),
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ✅ CREATE PAYMENT LINK
 * POST /api/auto-deposit/create
 * body: { amount, userIdentity, invoiceNumber, checkoutItems }
 */
router.post("/create", async (req, res) => {
  try {
    const s = await getOrCreateSetting();
    if (!s.active || !s.businessToken) {
      return res
        .status(400)
        .json({ success: false, message: "AutoDeposit is disabled by admin." });
    }

    const { amount, userIdentity, invoiceNumber, checkoutItems } = req.body;

    const numAmount = Math.floor(Number(amount || 0));
    if (!userIdentity) {
      return res.status(400).json({ success: false, message: "userIdentity required" });
    }
    if (!invoiceNumber) {
      return res.status(400).json({ success: false, message: "invoiceNumber required" });
    }
    if (!numAmount || numAmount < 1) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const minAmount = Number(s.minAmount || 5);
    const maxAmount = Number(s.maxAmount || 0);

    if (numAmount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount is ${minAmount}`,
      });
    }
    if (maxAmount > 0 && numAmount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum amount is ${maxAmount}`,
      });
    }

    // ✅ user validate (must be valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(String(userIdentity))) {
      return res.status(400).json({ success: false, message: "Invalid userIdentity" });
    }

    // ✅ Ensure user exists
    const user = await User.findById(userIdentity).select("_id username isActive role");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isActive !== true) {
      return res.status(403).json({ success: false, message: "User is inactive" });
    }

    const callbackUrl = `${process.env.PUBLIC_BACKEND_URL}/api/auto-deposit/webhook`;
    const successRedirectUrl = `${process.env.PUBLIC_FRONTEND_URL}`;

    const opayRes = await axios.post(
      "https://api.oraclepay.org/api/opay-business/generate-payment-page",
      {
        payment_amount: numAmount,
        user_identity_address: String(userIdentity),
        callback_url: callbackUrl,
        success_redirect_url: successRedirectUrl,
        checkout_items: checkoutItems || {},
        invoice_number: String(invoiceNumber),
      },
      {
        headers: { "X-Opay-Business-Token": s.businessToken },
      }
    );

    if (!opayRes?.data?.success || !opayRes?.data?.payment_page_url) {
      await AutoDeposit.updateOne(
        { invoiceNumber },
        { $set: { status: "FAILED" } }
      );

      return res.status(400).json({
        success: false,
        message: "Failed to create payment link",
        data: opayRes?.data || null,
      });
    }

    res.json({
      success: true,
      payment_page_url: opayRes.data.payment_page_url,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "invoiceNumber already exists. Try again.",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ✅ USER HISTORY
 * GET /api/auto-deposit/history/:userId
 */
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await AutoDeposit.find({ userIdentity: String(userId) })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: list });
  } catch (err) {
    console.error("AutoDeposit history error:", err?.message || err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ✅ ADMIN: DEPOSITS LIST (pagination + search)
 * GET /api/auto-deposit/deposits/admin?page=1&limit=20&q=abc&status=PAID
 */
router.get("/deposits/admin", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "").trim().toUpperCase();

    const matchStage = {};
    if (["PENDING", "PAID", "FAILED"].includes(status)) {
      matchStage.status = status;
    }

    const pipeline = [
      { $match: matchStage },

      // userIdentity string -> ObjectId (safe)
      {
        $addFields: {
          userObjectId: {
            $convert: {
              input: "$userIdentity",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },

      // ✅ lookup users
      {
        $lookup: {
          from: "users",
          localField: "userObjectId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $addFields: { user: { $arrayElemAt: ["$user", 0] } } },

      // ✅ search (username/phone/invoice/transaction)
      ...(q
        ? [
            {
              $match: {
                $or: [
                  { "user.username": { $regex: q, $options: "i" } },
                  { "user.phone": { $regex: q, $options: "i" } },
                  { invoiceNumber: { $regex: q, $options: "i" } },
                  { transactionId: { $regex: q, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                userIdentity: 1,
                amount: 1,
                invoiceNumber: 1,
                status: 1,
                checkoutItems: 1,
                transactionId: 1,
                sessionCode: 1,
                bank: 1,
                footprint: 1,
                paidAt: 1,
                createdAt: 1,
                updatedAt: 1,
                balanceAdded: 1,

                // user info
                userName: { $ifNull: ["$user.username", "Unknown"] },
                userPhone: { $ifNull: ["$user.phone", ""] },
                userRole: { $ifNull: ["$user.role", "user"] },
                userId: "$userObjectId",
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await AutoDeposit.aggregate(pipeline);
    const data = result?.[0]?.data || [];
    const total = result?.[0]?.total?.[0]?.count || 0;

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("auto-deposit deposits admin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/**
 * ✅ WEBHOOK (OraclePay -> Backend)
 * POST /api/auto-deposit/webhook
 * OraclePay requirement: Always reply 'OK'
 */
router.post("/webhook", async (req, res) => {
  // ✅ Always respond OK first
  res.send("OK");

  try {
    const data = req.body || {};

    const invoiceNumber = String(data.invoice_number || "").trim();
    const userId = String(data.user_identity || "").trim();
    const statusRaw = String(data.status || "").toUpperCase(); // COMPLETED etc
    const amount = Math.floor(Number(data.amount || 0));

    if (!invoiceNumber) return console.log("❌ invoice_number missing");
    if (!userId) return console.log("❌ user_identity missing");
    if (!mongoose.Types.ObjectId.isValid(userId)) return console.log("❌ invalid user id:", userId);
    if (!amount || amount <= 0) return console.log("❌ invalid amount:", amount);

    const isCompleted = statusRaw === "COMPLETED";

    // ✅ update deposit fields (create route already creates PENDING, but keep safe)
    let dep = await AutoDeposit.findOneAndUpdate(
      { invoiceNumber },
      {
        $set: {
          userIdentity: userId,
          amount,
          transactionId: data.transaction_id || "",
          sessionCode: data.session_code || "",
          bank: data.bank || "",
          footprint: data.footprint || "",
          checkoutItems: data.checkout_items || {},
          status: isCompleted ? "PAID" : "PENDING",
          paidAt: isCompleted ? new Date() : undefined,
        },
        $setOnInsert: { balanceAdded: false },
      },
      { new: true, upsert: true }
    );

    if (!isCompleted) {
      console.log("ℹ️ not completed:", statusRaw);
      return;
    }

    // ✅ idempotent guard: balance only once
    const paidOnce = await AutoDeposit.findOneAndUpdate(
      { invoiceNumber, balanceAdded: false },
      { $set: { balanceAdded: true } },
      { new: true }
    );

    if (!paidOnce) {
      console.log("ℹ️ balance already added, skip:", invoiceNumber);
      return;
    }

    // ✅ add balance to USER (your schema)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } },
      { new: true }
    ).select("username balance role");

    if (!updatedUser) {
      console.log("❌ User not found:", userId);
      return;
    }

    console.log(
      `✅ COMPLETED -> Balance Added | user=${updatedUser.username} (${updatedUser.role}) | +${amount} | newBalance=${updatedUser.balance}`
    );
  } catch (err) {
    console.error("❌ webhook error:", err?.message || err);
  }
});

export default router;