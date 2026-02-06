// routes/adminRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

const router = express.Router();

// ✅ Demo Admin Data (default)
const demoAdmin = {
  email: "admin@babu88.com",
  password: "123456",
};

/* =========================
   Inline Protect (JWT)
========================= */
const protectAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) return res.status(401).json({ message: "Not authorized - no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) return res.status(401).json({ message: "Not authorized - admin not found" });

    req.admin = admin;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Not authorized - invalid token" });
  }
};

/* =========================
   Create first admin (demo)
========================= */
router.post("/create-first-time", async (req, res) => {
  try {
    const { email, password } = req.body?.email ? req.body : demoAdmin;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await Admin.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "✅ Admin created & saved to DB",
      admin: { id: admin._id, email: admin.email },
      demoLogin: { email: demoAdmin.email, password: demoAdmin.password },
    });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   Login
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin._id, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ GET Profile (Protected)
   Returns current admin email
========================= */
router.get("/profile", protectAdmin, async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      email: req.admin.email,
    },
  });
});

/* =========================
   ✅ UPDATE Profile (Protected)
   - email change
   - password change
   - change হলে frontend এ logout করবে
========================= */
router.put("/profile", protectAdmin, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const wantEmailChange = typeof email === "string" && email.toLowerCase().trim() !== admin.email;
    const wantPassChange = typeof newPassword === "string" && newPassword.length > 0;

    if (!wantEmailChange && !wantPassChange) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    // ✅ security: যেকোন change এর জন্য currentPassword লাগবে
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const ok = await bcrypt.compare(currentPassword, admin.password);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    // Email update
    if (wantEmailChange) {
      const normalizedEmail = email.toLowerCase().trim();
      const exists = await Admin.findOne({ email: normalizedEmail });
      if (exists) return res.status(409).json({ message: "Email already in use" });
      admin.email = normalizedEmail;
    }

    // Password update
    if (wantPassChange) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    res.json({
      success: true,
      message: "✅ Profile updated. Please login again.",
      admin: { id: admin._id, email: admin.email },
    });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
