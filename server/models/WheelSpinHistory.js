import mongoose from "mongoose";

const { Schema } = mongoose;

/* ======================================================
   WHEEL SPIN HISTORY
====================================================== */

const WheelSpinHistorySchema = new Schema(
  {
    /**
     * প্রতিটি Spin-এর unique ID।
     * Route থেকে crypto.randomUUID() দিয়ে তৈরি হবে।
     */
    spinId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    wheel: {
      type: Schema.Types.ObjectId,
      ref: "WheelReward",
      required: true,
      index: true,
    },

    /**
     * যে segment নির্বাচিত হয়েছে।
     */
    selectedPosition: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      index: true,
    },

    /**
     * Spin-এর সময় Wheel snapshot।
     * Admin পরে Wheel edit করলেও history বদলাবে না।
     */
    wheelSnapshot: {
      wheelImage: {
        type: String,
        default: "",
      },

      title: {
        bn: {
          type: String,
          default: "",
        },

        en: {
          type: String,
          default: "",
        },
      },

      spinCost: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /**
     * Selected prize-এর snapshot।
     */
    prizeSnapshot: {
      position: {
        type: Number,
        required: true,
        min: 1,
        max: 8,
      },

      text: {
        bn: {
          type: String,
          default: "",
        },

        en: {
          type: String,
          default: "",
        },
      },

      prizeType: {
        type: String,
        enum: ["balance", "reward_coin", "no_prize"],
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },

      probability: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      turnoverMultiplier: {
        type: Number,
        default: 0,
        min: 0,
      },

      backgroundColor: {
        type: String,
        default: "#ffc800",
      },

      textColor: {
        type: String,
        default: "#000000",
      },
    },

    /**
     * User-এর Reward Coin হিসাব।
     */
    rewardCoinBefore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    spinCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    rewardCoinPrize: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardCoinAfter: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    /**
     * User-এর main balance হিসাব।
     */
    balanceBefore: {
      type: Number,
      required: true,
      default: 0,
    },

    balancePrize: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      default: 0,
    },

    /**
     * Balance prize-এর turnover।
     * TurnOver sourceType হবে "redeem"।
     */
    turnoverMultiplier: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnoverRequired: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnover: {
      type: Schema.Types.ObjectId,
      ref: "TurnOver",
      default: null,
    },

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
      index: true,
    },

    failureReason: {
      type: String,
      default: "",
      trim: true,
    },

    spunAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/* ======================================================
   INDEXES
====================================================== */

WheelSpinHistorySchema.index({
  user: 1,
  createdAt: -1,
});

WheelSpinHistorySchema.index({
  wheel: 1,
  createdAt: -1,
});

WheelSpinHistorySchema.index({
  user: 1,
  wheel: 1,
  createdAt: -1,
});

WheelSpinHistorySchema.index({
  wheel: 1,
  status: 1,
  createdAt: -1,
});

WheelSpinHistorySchema.index({
  "prizeSnapshot.prizeType": 1,
  createdAt: -1,
});

const WheelSpinHistory = mongoose.model(
  "WheelSpinHistory",
  WheelSpinHistorySchema,
);

export default WheelSpinHistory;
