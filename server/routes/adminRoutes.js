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

    if (!token)
      return res.status(401).json({ message: "Not authorized - no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin)
      return res
        .status(401)
        .json({ message: "Not authorized - admin not found" });

    req.admin = admin;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Not authorized - invalid token" });
  }
};

// ✅ mother only
const requireMother = (req, res, next) => {
  if (req.admin?.role !== "mother") {
    return res.status(403).json({ message: "Only mother admin allowed" });
  }
  next();
};

/* =========================
   Create first admin (demo)
   - ✅ first admin always mother
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
      demoLogin: { email: demoAdmin.email, password: demoAdmin.password },
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
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin)
      return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

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
    }

    await admin.save();

    res.json({
      success: true,
      message: "✅ Profile updated. Please login again.",
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
      // mother হলে permissions সবসময় empty
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
