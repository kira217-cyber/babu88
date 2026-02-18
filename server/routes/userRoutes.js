// routes/userRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   helpers
========================= */
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

const safeUser = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  phone: u.phone,
  role: u.role,
  isActive: u.isActive,
  currency: u.currency,
  balance: u.balance,
  referralCode: u.referralCode,
  createdUsers: u.createdUsers,
  referredBy: u.referredBy,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

// ✅ common duplicate key handler
const handleMongoDup = (err) => {
  if (err?.code === 11000) {
    const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    if (key === "username") return "এই username ইতিমধ্যে ব্যবহার করা হয়েছে";
    if (key === "phone") return "এই phone number ইতিমধ্যে ব্যবহার করা হয়েছে";
    if (key === "referralCode") return "referralCode already exists";
    return `${key} already exists`;
  }
  return null;
};

// ✅ referral generator (6 chars)
const genReferralCode = (len = 6) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

// ✅ unique referral maker (avoid collision)
const makeUniqueReferralCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = genReferralCode(6);
    const exists = await User.findOne({ referralCode: code }).select("_id");
    if (!exists) return code;
  }
  // fallback (very rare)
  return `${genReferralCode(6)}${Math.floor(Math.random() * 10)}`;
};



/**
 * ============================
 * ✅ Get Logged-in User Balance (NO middleware)
 * GET /api/users/me/balance
 * headers: Authorization: Bearer <token>
 * ============================
 */
router.get("/me/balance", async (req, res) => {
  try {
    // 1️⃣ token extract
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized (no token)" });
    }

    // 2️⃣ token verify
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded.id;

    // 3️⃣ user fetch
    const user = await User.findById(userId).select(
      "balance currency role isActive",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ security checks
    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only normal user allowed" });
    }

    if (user.isActive !== true) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // 5️⃣ success
    return res.json({
      balance: user.balance || 0,
      currency: user.currency || "BDT",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


/**
 * ============================
 * ✅ Affiliate Register (role: aff-user)
 * POST /api/users/register-aff
 * body: { username, email?, phone, password, currency? }
 * ============================
 */
router.post("/register-aff", async (req, res) => {
  try {
    const {
      username,
      email = "",
      phone,
      password,
      currency = "BDT",
    } = req.body;

    if (!username || !phone || !password) {
      return res
        .status(400)
        .json({ message: "username, phone, password required" });
    }

    const hash = await bcrypt.hash(password, 10);

    // ✅ referralCode will be generated for aff-user too
    const referralCode = await makeUniqueReferralCode();

    const aff = await User.create({
      username: String(username).trim(),
      email,
      phone: String(phone).trim(),
      password: hash,
      currency,
      role: "aff-user",
      referralCode,
      isActive: false, // ✅ admin approve required
    });

    const token = signToken(aff);
    return res.json({ token, user: safeUser(aff) });
  } catch (err) {
    const msg = handleMongoDup(err);
    if (msg) return res.status(409).json({ message: msg });
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Normal User Register (role: user)
 * POST /api/users/register
 * body: { username, phone, password, currency?, referral? }
 * referral = affiliate referralCode (optional)
 *
 * ✅ তোমার চাহিদা:
 * - referral code affiliate এর হলে -> নতুন একাউন্ট role হবে "user" (always)
 * - নতুন user এরও নিজের referralCode generate হবে
 * ============================
 */
router.post("/register", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      username,
      phone,
      password,
      currency = "BDT",
      referral = "",
    } = req.body;

    if (!username || !phone || !password) {
      return res
        .status(400)
        .json({ message: "username, phone, password required" });
    }

    const hash = await bcrypt.hash(password, 10);
    let createdUserDoc = null;

    await session.withTransaction(async () => {
      let affiliate = null;

      // ✅ referral থাকলে affiliate খুঁজবে (role aff-user + referralCode + approved)
      const ref = String(referral || "")
        .trim()
        .toUpperCase();
      if (ref) {
        affiliate = await User.findOne({
          role: "aff-user",
          referralCode: ref,
          isActive: true,
        }).session(session);

        if (!affiliate) {
          // referral invalid হলে error
          throw new Error("INVALID_REFERRAL");
        }
      }

      // ✅ new user also gets a unique referralCode
      // ⚠️ must be generated INSIDE transaction so that we can retry if collision happens
      let myRef = genReferralCode(6);
      for (let i = 0; i < 10; i++) {
        const exists = await User.findOne({ referralCode: myRef })
          .session(session)
          .select("_id");
        if (!exists) break;
        myRef = genReferralCode(6);
      }

      // ✅ create user (role ALWAYS user)
      createdUserDoc = await User.create(
        [
          {
            username: String(username).trim(),
            phone: String(phone).trim(),
            password: hash,
            currency,
            role: "user", // ✅ always "user"
            isActive: true,
            referredBy: affiliate?._id || null,
            referralCode: myRef, // ✅ generate for normal user too
          },
        ],
        { session },
      );

      const newUser = createdUserDoc[0];

      // ✅ affiliate এর createdUsers এ push (referral use করলে)
      if (affiliate) {
        await User.updateOne(
          { _id: affiliate._id },
          { $addToSet: { createdUsers: newUser._id } },
          { session },
        );
      }
    });

    const newUser = createdUserDoc?.[0];
    const token = signToken(newUser);
    return res.json({ token, user: safeUser(newUser) });
  } catch (err) {
    if (err.message === "INVALID_REFERRAL") {
      return res.status(400).json({ message: "Invalid referral code" });
    }
    const msg = handleMongoDup(err);
    if (msg) return res.status(409).json({ message: msg });
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * ============================
 * ✅ Affiliate Login (aff-user only) - username + password only
 * POST /api/users/login-aff
 * body: { username, password }
 * ============================
 */
router.post("/login-aff", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password required" });
    }

    const user = await User.findOne({ username: String(username).trim() });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role !== "aff-user") {
      return res.status(403).json({ message: "Not an affiliate account" });
    }

    if (user.isActive !== true) {
      return res.status(403).json({ message: "Admin not approved for login" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Normal User Login (user only) - username + password only
 * POST /api/users/login
 * body: { username, password }
 * ============================
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ required
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password required" });
    }

    const uname = String(username).trim();

    // ✅ username দিয়ে শুধু খোঁজা হবে
    const user = await User.findOne({ username: uname });

    // ❌ user না পেলে
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ শুধু normal user allow
    if (user.role !== "user") {
      return res.status(403).json({ message: "Not a user account" });
    }

    // ✅ active check
    if (user.isActive !== true) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // ✅ password match
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ success
    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});




export default router;
