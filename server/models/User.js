import mongoose from "mongoose";

const { Schema } = mongoose;

const ReferralTierSchema = new Schema(
  {
    from: {
      type: Number,
      required: true,
      min: 1,
    },

    to: {
      type: Number,
      required: true,
      min: 1,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    label: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  },
);

const ReferralTierStatSchema = new Schema(
  {
    from: {
      type: Number,
      required: true,
      min: 1,
    },

    to: {
      type: Number,
      required: true,
      min: 1,
    },

    count: {
      type: Number,
      default: 0,
      min: 0,
    },

    earned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    /**
     * Normal Oracle games username.
     * Must be exactly 10 lowercase letters.
     */
    userGamePlayName: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      minlength: 10,
      maxlength: 10,
    },

    /**
     * NineWicket username.
     * Must be exactly 6 lowercase letters.
     */
    nineWicketUsername: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      minlength: 6,
      maxlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "aff-user"],
      default: "user",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    currency: {
      type: String,
      enum: ["BDT", "USDT"],
      default: "BDT",
    },

    /**
     * User main balance.
     */
    balance: {
      type: Number,
      default: 0,
    },

    /**
     * Check-In থেকে পাওয়া Reward Coin।
     */
    rewardCoin: {
      type: Number,
      default: 0,
      min: 0,
    },

    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    createdUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referralCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    referralTierOverride: {
      type: [ReferralTierSchema],
      default: null,
    },

    referralTierStats: {
      type: [ReferralTierStatSchema],
      default: [],
    },

    commissionBalance: {
      type: Number,
      default: 0,
    },

    gameLossCommission: {
      type: Number,
      default: 0,
    },

    depositCommission: {
      type: Number,
      default: 0,
    },

    referCommission: {
      type: Number,
      default: 0,
    },

    gameWinCommission: {
      type: Number,
      default: 0,
    },

    gameLossCommissionBalance: {
      type: Number,
      default: 0,
    },

    depositCommissionBalance: {
      type: Number,
      default: 0,
    },

    referCommissionBalance: {
      type: Number,
      default: 0,
    },

    gameWinCommissionBalance: {
      type: Number,
      default: 0,
    },

    firstName: {
      type: String,
      default: "",
    },

    lastName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   INDEXES
========================================================= */

userSchema.index(
  {
    username: 1,
  },
  {
    unique: true,
  },
);

userSchema.index(
  {
    phone: 1,
  },
  {
    unique: true,
  },
);

userSchema.index(
  {
    referralCode: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

userSchema.index(
  {
    userGamePlayName: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      userGamePlayName: {
        $type: "string",
      },
    },
  },
);

userSchema.index(
  {
    nineWicketUsername: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      nineWicketUsername: {
        $type: "string",
      },
    },
  },
);

userSchema.index({
  role: 1,
  isActive: 1,
});

userSchema.index({
  referredBy: 1,
});

const User = mongoose.model(
  "User",
  userSchema,
);

export default User;