// routes/adminRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { protectAdmin, requireMother } from "../middleware/adminAuth.js";
import {
  loginRateLimit,
  registerFailedLogin,
  clearFailedLogin,
} from "../middleware/loginRateLimit.js";

const router = express.Router();

const signAdminToken = (admin) =>
  jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      tokenVersion: admin.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

/* =========================
   Create first admin
   - ✅ only works when NO admin exists yet (one-time bootstrap)
   - ✅ first admin always mother
   - ✅ no hardcoded demo credentials - must be supplied explicitly
========================= */
router.post("/create-first-time", async (req, res) => {
  try {
    const alreadyHasAdmin = await Admin.exists({});
    if (alreadyHasAdmin) {
      return res
        .status(403)
        .json({ message: "Setup already completed - an admin already exists" });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: "mother",
      permissions: [],
    });

    res.status(201).json({
      success: true,
      message: "✅ Admin created & saved to DB",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
    });
  } catch (err) {
    if (err?.code === 11000)
      return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   Login
   - ✅ return role & permissions
   - ✅ rate limited against brute-force
   - ✅ JWT carries tokenVersion, expires in 1 day
========================= */
router.post("/login", loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      registerFailedLogin(req);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      registerFailedLogin(req);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    clearFailedLogin(req);

    const token = signAdminToken(admin);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ GET Profile (Protected)
========================= */
router.get("/profile", protectAdmin, async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions || [],
    },
  });
});

/* =========================
   ✅ UPDATE Profile (Protected)
   - password change bumps tokenVersion -> every device (incl. this one)
     must log in again with the new password
========================= */
router.put("/profile", protectAdmin, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const wantEmailChange =
      typeof email === "string" && email.toLowerCase().trim() !== admin.email;
    const wantPassChange =
      typeof newPassword === "string" && newPassword.length > 0;

    if (!wantEmailChange && !wantPassChange) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const ok = await bcrypt.compare(currentPassword, admin.password);
    if (!ok)
      return res.status(400).json({ message: "Current password is incorrect" });

    if (wantEmailChange) {
      const normalizedEmail = email.toLowerCase().trim();
      const exists = await Admin.findOne({ email: normalizedEmail });
      if (exists)
        return res.status(409).json({ message: "Email already in use" });
      admin.email = normalizedEmail;
    }

    if (wantPassChange) {
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }
      admin.password = await bcrypt.hash(newPassword, 10);
      admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    }

    await admin.save();

    res.json({
      success: true,
      message: wantPassChange
        ? "✅ Profile updated. You have been logged out of all devices - please login again."
        : "✅ Profile updated.",
      forceLogout: wantPassChange,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    if (err?.code === 11000)
      return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ CREATE ADMIN (Mother Only)
   POST /api/admin/create-admin
========================= */
router.post("/create-admin", protectAdmin, requireMother, async (req, res) => {
  try {
    const { email, password, role, permissions } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await Admin.findOne({ email: normalizedEmail });
    if (exists)
      return res.status(409).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: role === "mother" ? "mother" : "sub",
      permissions: Array.isArray(permissions) ? permissions : [],
    });

    res.status(201).json({
      success: true,
      message: "✅ Admin created",
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions || [],
      },
    });
  } catch (err) {
    if (err?.code === 11000)
      return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ LIST ADMINS (Mother Only)
   GET /api/admin/admins
========================= */
router.get("/admins", protectAdmin, requireMother, async (req, res) => {
  try {
    const list = await Admin.find()
      .select("_id email role permissions createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, admins: list });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ UPDATE ADMIN (Mother Only)
   PUT /api/admin/admins/:id
   body: { email?, role?, permissions?, newPassword? }
   - password reset here also bumps that admin's tokenVersion
     -> they're logged out everywhere immediately
========================= */
router.put("/admins/:id", protectAdmin, requireMother, async (req, res) => {
  try {
    const { email, role, permissions, newPassword } = req.body || {};

    const target = await Admin.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Admin not found" });

    // Email update (optional)
    if (typeof email === "string" && email.trim() !== "") {
      // Prevent changing to existing email (except own)
      if (email !== target.email) {
        const emailExists = await Admin.findOne({ email: email.toLowerCase() });
        if (emailExists) {
          return res.status(400).json({ message: "Email already in use by another admin" });
        }
      }
      target.email = email.toLowerCase().trim();
    }

    // Role update
    if (typeof role === "string") {
      target.role = role === "mother" ? "mother" : "sub";
      // mother হলে permissions সবসময় empty
      if (target.role === "mother") {
        target.permissions = [];
      }
    }

    // Permissions update (only if not mother)
    if (Array.isArray(permissions) && target.role !== "mother") {
      target.permissions = permissions;
    }

    // Password update (optional)
    if (typeof newPassword === "string" && newPassword.length > 0) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      target.password = await bcrypt.hash(newPassword, 10);
      target.tokenVersion = (target.tokenVersion || 0) + 1;
    }

    await target.save();

    res.json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        id: target._id,
        email: target.email,
        role: target.role,
        permissions: target.permissions || [],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ FORCE LOGOUT (Mother Only) - all devices, no password change
   POST /api/admin/admins/:id/force-logout
========================= */
router.post(
  "/admins/:id/force-logout",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const target = await Admin.findById(req.params.id);
      if (!target) return res.status(404).json({ message: "Admin not found" });

      target.tokenVersion = (target.tokenVersion || 0) + 1;
      await target.save();

      res.json({ success: true, message: "✅ Admin logged out of all devices" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

/* =========================
   ✅ DELETE ADMIN (Mother Only)
   DELETE /api/admin/admins/:id
========================= */
router.delete("/admins/:id", protectAdmin, requireMother, async (req, res) => {
  try {
    const target = await Admin.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Admin not found" });

    // ✅ optional safety: prevent deleting self
    if (String(target._id) === String(req.admin._id)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin" });
    }

    await Admin.deleteOne({ _id: target._id });
    res.json({ success: true, message: "✅ Admin deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
