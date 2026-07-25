// middleware/adminAuth.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

/**
 * Verifies the admin JWT AND checks it against the admin's current
 * tokenVersion in the DB. If the password was changed, the account was
 * force-logged-out, or the admin was deleted, old tokens stop working
 * immediately (not just after JWT expiry).
 */
export const protectAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized - no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Not authorized - admin not found" });
    }

    const tokenVersion = Number(decoded.tokenVersion || 0);
    if (tokenVersion !== Number(admin.tokenVersion || 0)) {
      return res
        .status(401)
        .json({ message: "Session expired - please login again" });
    }

    req.admin = admin;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Not authorized - invalid token" });
  }
};

// ✅ mother only
export const requireMother = (req, res, next) => {
  if (req.admin?.role !== "mother") {
    return res.status(403).json({ message: "Only mother admin allowed" });
  }
  next();
};
