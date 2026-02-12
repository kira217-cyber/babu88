// models/Admin.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ✅ mother or sub
    role: {
      type: String,
      enum: ["mother", "sub"],
      default: "sub",
    },

    // ✅ permission keys
    permissions: {
      type: [String], // ["dashboard","all-user","add-game","add-promotion"]
      default: [],
    },
  },
  { timestamps: true },
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
