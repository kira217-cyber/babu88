import express from "express";
import jwt from "jsonwebtoken";
import NineWicketWallet from "../models/NineWicketWallet.js";
import User from "../models/User.js";

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const admin = await User.findById(id).select("role isActive");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    if (!["admin", "mother", "master"].includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.admin = { id };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const requireUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(id).select("role isActive");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only normal user allowed",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    req.user = { id };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * USER: own NineWicket wallet summary
 * GET /api/nine-wicket-wallet/me
 */
router.get("/me", requireUser, async (req, res) => {
  try {
    const wallet = await NineWicketWallet.findOne({
      user: req.user.id,
    }).lean();

    return res.json({
      success: true,
      data: wallet || {
        totalTransferred: 0,
        totalReturned: 0,
        exposureBalance: 0,
        lastTransferAmount: 0,
        lastReturnedAmount: 0,
        status: "idle",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get NineWicket wallet",
      error: error.message,
    });
  }
});

/**
 * ADMIN: list all NineWicket wallets
 * GET /api/nine-wicket-wallet?page=1&limit=20&search=&status=&hasExposure=true
 */
router.get("/", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const hasExposure = String(req.query.hasExposure || "").trim();

    const query = {};

    if (status) {
      query.status = status;
    }

    if (hasExposure === "true") {
      query.exposureBalance = { $gt: 0 };
    }

    if (hasExposure === "false") {
      query.exposureBalance = { $lte: 0 };
    }

    if (search) {
      const matchedUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: "i" } },
          { userId: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { userGamePlayName: { $regex: search, $options: "i" } },
        ],
      })
        .select("_id")
        .lean();

      const userIds = matchedUsers.map((u) => u._id);

      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { user: { $in: userIds } },
      ];
    }

    const [items, total] = await Promise.all([
      NineWicketWallet.find(query)
        .populate(
          "user",
          "username userId phone email balance currency isActive",
        )
        .sort({ exposureBalance: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      NineWicketWallet.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get NineWicket wallets",
      error: error.message,
    });
  }
});

/**
 * ADMIN: single user wallet
 * GET /api/nine-wicket-wallet/:userId
 */
router.get("/:userId", requireAdmin, async (req, res) => {
  try {
    const wallet = await NineWicketWallet.findOne({
      user: req.params.userId,
    })
      .populate("user", "username userId phone email balance currency isActive")
      .lean();

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "NineWicket wallet not found",
      });
    }

    return res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get NineWicket wallet",
      error: error.message,
    });
  }
});

export default router;
