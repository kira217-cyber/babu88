// models/WheelTermsCondition.js

import mongoose from "mongoose";

const { Schema } = mongoose;

/* ======================================================
   BANGLA AND ENGLISH TEXT
====================================================== */

const LanguageTextSchema = new Schema(
  {
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
  {
    _id: false,
  },
);

/* ======================================================
   WHEEL TERMS AND CONDITIONS
====================================================== */

const WheelTermsConditionSchema = new Schema(
  {
    /**
     * পুরো system-এ শুধু একটি document রাখার জন্য।
     * Unique থাকার কারণে Admin একাধিক Terms তৈরি করতে পারবে না।
     */
    settingKey: {
      type: String,
      default: "wheel-terms-condition",
      unique: true,
      immutable: true,
      trim: true,
    },

    /**
     * উপরের badge/title text।
     *
     * Example:
     * bn: "শর্তাবলী"
     * en: "Terms & Conditions"
     */
    title: {
      type: LanguageTextSchema,
      required: true,
    },

    /**
     * Terms box-এর ভেতরের heading।
     *
     * Example:
     * bn: "লাকি হুইল"
     * en: "LUCKY WHEEL"
     */
    heading: {
      type: LanguageTextSchema,
      required: true,
    },

    /**
     * Terms & Conditions-এর সম্পূর্ণ content।
     *
     * Admin textarea থেকে নতুন line এবং numbering
     * ব্যবহার করে content লিখতে পারবে।
     *
     * Client component white-space: pre-line ব্যবহার করে
     * line break অনুযায়ী content দেখাবে।
     */
    content: {
      type: LanguageTextSchema,
      required: true,
    },

    /**
     * Admin থেকে সম্পূর্ণ Terms section-এর color ও design
     * control করা যাবে।
     */
    design: {
      /**
       * সম্পূর্ণ section-এর background color।
       */
      pageBackgroundColor: {
        type: String,
        default: "#172178",
        trim: true,
      },

      /**
       * Terms content card gradient colors।
       */
      cardGradientFrom: {
        type: String,
        default: "#172b88",
        trim: true,
      },

      cardGradientTo: {
        type: String,
        default: "#4b4b4b",
        trim: true,
      },

      /**
       * Card border।
       */
      cardBorderColor: {
        type: String,
        default: "#5364ba",
        trim: true,
      },

      cardBorderWidth: {
        type: Number,
        default: 1,
        min: 0,
        max: 20,
      },

      /**
       * Card corner roundness।
       */
      cardBorderRadius: {
        type: Number,
        default: 18,
        min: 0,
        max: 60,
      },

      /**
       * Card shadow color।
       */
      cardShadowColor: {
        type: String,
        default: "#000000",
        trim: true,
      },

      /**
       * উপরের Terms & Conditions title badge gradient।
       */
      titleGradientFrom: {
        type: String,
        default: "#ffb65c",
        trim: true,
      },

      titleGradientTo: {
        type: String,
        default: "#c79b00",
        trim: true,
      },

      titleBorderColor: {
        type: String,
        default: "#f5ca24",
        trim: true,
      },

      titleTextColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      /**
       * Card-এর ভেতরের heading color।
       */
      headingTextColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      /**
       * Terms content-এর text color।
       */
      contentTextColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      /**
       * Font sizes।
       */
      titleFontSize: {
        type: Number,
        default: 22,
        min: 12,
        max: 60,
      },

      headingFontSize: {
        type: Number,
        default: 15,
        min: 10,
        max: 50,
      },

      contentFontSize: {
        type: Number,
        default: 14,
        min: 10,
        max: 40,
      },

      /**
       * Content line height।
       */
      contentLineHeight: {
        type: Number,
        default: 1.8,
        min: 1,
        max: 4,
      },

      /**
       * Card maximum width।
       */
      maxWidth: {
        type: Number,
        default: 900,
        min: 300,
        max: 1800,
      },
    },

    /**
     * Inactive করলে Client site-এ Terms section দেখাবে না।
     */
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

/* ======================================================
   INDEX
====================================================== */

WheelTermsConditionSchema.index({
  settingKey: 1,
  isActive: 1,
});

/* ======================================================
   MODEL
====================================================== */

const WheelTermsCondition = mongoose.model(
  "WheelTermsCondition",
  WheelTermsConditionSchema,
);

export default WheelTermsCondition;
