import mongoose from "mongoose";

const { Schema } = mongoose;

const CheckInDaySchema = new Schema(
  {
    /**
     * Day position: 1 থেকে সর্বোচ্চ 7।
     */
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    /**
     * Client site-এ প্রদর্শিত Day name।
     */
    dayName: {
      bn: {
        type: String,
        required: true,
        trim: true,
      },

      en: {
        type: String,
        required: true,
        trim: true,
      },
    },

    /**
     * balance হলে main balance-এ যোগ হবে।
     * reward_coin হলে User.rewardCoin-এ যোগ হবে।
     */
    rewardType: {
      type: String,
      enum: ["balance", "reward_coin"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const CheckInRewardSettingSchema = new Schema(
  {
    /**
     * শুধু একটি global Check-In setting থাকবে।
     */
    settingKey: {
      type: String,
      default: "global",
      unique: true,
      trim: true,
    },

    title: {
      bn: {
        type: String,
        default: "দৈনিক চেক ইন",
        trim: true,
      },

      en: {
        type: String,
        default: "Daily Check In",
        trim: true,
      },
    },

    description: {
      bn: {
        type: String,
        default: "প্রতিদিন চেক ইন করুন এবং আপনার দৈনিক পুরস্কার সংগ্রহ করুন।",
        trim: true,
      },

      en: {
        type: String,
        default: "Check in daily and collect your daily reward.",
        trim: true,
      },
    },

    /**
     * সর্বোচ্চ 7টি Day route থেকে নিয়ন্ত্রণ করা হবে।
     */
    days: {
      type: [CheckInDaySchema],
      default: [],
    },

    /**
     * Admin Day configuration পরিবর্তন করলে
     * version এক বাড়ানো হবে।
     */
    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

CheckInRewardSettingSchema.index({
  settingKey: 1,
  isActive: 1,
});

const CheckInRewardSetting = mongoose.model(
  "CheckInRewardSetting",
  CheckInRewardSettingSchema,
);

export default CheckInRewardSetting;
