import mongoose from "mongoose";

const BiTextSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  { _id: false },
);

const MainRowSchema = new mongoose.Schema(
  {
    level: { type: String, required: true }, // "1","2","3"
    newReg: { type: BiTextSchema, required: true }, // "1-9" text BN/EN
    base: { type: String, required: true }, // "20%"
    extra: { type: String, required: true }, // "5%"
    need: { type: BiTextSchema, required: true }, // requirement BN/EN
    total: { type: String, required: true }, // "25%"
  },
  { _id: false },
);

const ExRowSchema = new mongoose.Schema(
  {
    no: { type: String, required: true },
    wl: { type: String, required: true },
    op: { type: String, required: true },
    bonus: { type: String, required: true },
    formula: { type: BiTextSchema, required: true },
    agent: { type: String, required: true },
  },
  { _id: false },
);

const ExTotalSchema = new mongoose.Schema(
  {
    wl: { type: String, default: "" },
    op: { type: String, default: "" },
    bonus: { type: String, default: "" },
    agent: { type: String, default: "" },
  },
  { _id: false },
);

const AffCommissionSchema = new mongoose.Schema(
  {
    // optional: multiple configs রাখতে চাইলে (A/B / version)
    name: { type: String, default: "Default Commission" },

    isActive: { type: Boolean, default: true },

    // ===== Section =====
    sectionTitle: { type: BiTextSchema, required: true },
    btnMore: { type: BiTextSchema, required: true },

    // ===== Main Table =====
    th: {
      bn: { type: [String], default: [] },
      en: { type: [String], default: [] },
    },
    rows: { type: [MainRowSchema], default: [] },

    // ===== Modal =====
    modalTitle: { type: BiTextSchema, required: true },
    bullets: {
      bn: { type: [String], default: [] },
      en: { type: [String], default: [] },
    },

    // formula section
    formulaTitle: { type: BiTextSchema, required: true },
    formulaLabels: {
      bn: { type: [String], default: [] },
      en: { type: [String], default: [] },
    },

    // example section
    exampleTitle: { type: BiTextSchema, required: true },
    exTh: {
      bn: { type: [String], default: [] },
      en: { type: [String], default: [] },
    },
    exRows: { type: [ExRowSchema], default: [] },

    exTotalLabel: { type: BiTextSchema, required: true },
    exTotal: { type: ExTotalSchema, default: {} },

    close: { type: BiTextSchema, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("AffCommission", AffCommissionSchema);
