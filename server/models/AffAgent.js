import mongoose from "mongoose";

const affAgentSchema = new mongoose.Schema(
  {
    titleBn: { type: String, default: "" },
    titleEn: { type: String, default: "" },

    p1Bn: { type: String, default: "" },
    p1En: { type: String, default: "" },

    p2Bn: { type: String, default: "" },
    p2En: { type: String, default: "" },

    p3Bn: { type: String, default: "" },
    p3En: { type: String, default: "" },

    // ✅ checklist items
    listBn: { type: [String], default: [] },
    listEn: { type: [String], default: [] },

    // ✅ right card
    percentText: { type: String, default: "60%" }, // "60%" / "70%" etc
    stripBn: { type: String, default: "" },
    stripEn: { type: String, default: "" },

    btnBn: { type: String, default: "" },
    btnEn: { type: String, default: "" },

    // optional: link path (default /register)
    btnLink: { type: String, default: "/register" },
  },
  { timestamps: true }
);

export default mongoose.model("AffAgent", affAgentSchema);
