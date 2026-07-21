import express from "express";
import mongoose from "mongoose";
import CheckInRewardSetting from "../models/CheckInRewardSetting.js";

const router = express.Router();

/* ======================================================
   HELPERS
====================================================== */

const normalizeDays = (days = []) => {
  if (!Array.isArray(days)) {
    throw new Error("Days must be an array");
  }

  if (days.length < 1) {
    throw new Error("At least one Check-In day is required");
  }

  if (days.length > 7) {
    throw new Error("You cannot create more than 7 Check-In days");
  }

  const normalizedDays = days.map((day, index) => {
    const dayNumber = Number(day?.dayNumber ?? index + 1);

    const dayNameBn = String(day?.dayName?.bn || day?.dayNameBn || "").trim();

    const dayNameEn = String(day?.dayName?.en || day?.dayNameEn || "").trim();

    const rewardType = String(day?.rewardType || "").trim();

    const amount = Number(day?.amount);

    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 7) {
      throw new Error(`Invalid day number at position ${index + 1}`);
    }

    if (!dayNameBn) {
      throw new Error(`Bangla day name is required for Day ${dayNumber}`);
    }

    if (!dayNameEn) {
      throw new Error(`English day name is required for Day ${dayNumber}`);
    }

    if (!["balance", "reward_coin"].includes(rewardType)) {
      throw new Error(`Invalid reward type for Day ${dayNumber}`);
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(
        `Reward amount must be greater than 0 for Day ${dayNumber}`,
      );
    }

    return {
      dayNumber,

      dayName: {
        bn: dayNameBn,
        en: dayNameEn,
      },

      rewardType,
      amount,
    };
  });

  normalizedDays.sort((a, b) => a.dayNumber - b.dayNumber);

  const uniqueDayNumbers = new Set(normalizedDays.map((day) => day.dayNumber));

  if (uniqueDayNumbers.size !== normalizedDays.length) {
    throw new Error("Duplicate day numbers are not allowed");
  }

  /**
   * Days অবশ্যই 1 থেকে ধারাবাহিক হতে হবে।
   * যেমন: 1,2,3 অথবা 1,2,3,4,5,6,7
   */
  normalizedDays.forEach((day, index) => {
    const expectedDayNumber = index + 1;

    if (day.dayNumber !== expectedDayNumber) {
      throw new Error(
        `Day numbers must be continuous. Expected Day ${expectedDayNumber}`,
      );
    }
  });

  return normalizedDays;
};

/* ======================================================
   ADMIN: GET CHECK-IN SETTING
   GET /api/admin/check-in-reward
====================================================== */

router.get("/admin/check-in-reward", async (req, res) => {
  try {
    const setting = await CheckInRewardSetting.findOne({
      settingKey: "global",
    }).lean();

    res.json({
      success: true,
      setting: setting || null,
    });
  } catch (err) {
    console.error("Get Check-In setting error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   ADMIN: CREATE CHECK-IN SETTING
   POST /api/admin/check-in-reward
====================================================== */

router.post("/admin/check-in-reward", async (req, res) => {
  try {
    const {
      title,
      titleBn,
      titleEn,

      description,
      descriptionBn,
      descriptionEn,

      days,
      isActive,
    } = req.body || {};

    const existing = await CheckInRewardSetting.findOne({
      settingKey: "global",
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Check-In setting already exists. Please update the existing setting.",
        setting: existing,
      });
    }

    const normalizedDays = normalizeDays(days);

    const setting = await CheckInRewardSetting.create({
      settingKey: "global",

      title: {
        bn: String(title?.bn || titleBn || "দৈনিক চেক ইন").trim(),

        en: String(title?.en || titleEn || "Daily Check In").trim(),
      },

      description: {
        bn: String(
          description?.bn ||
            descriptionBn ||
            "প্রতিদিন চেক ইন করুন এবং আপনার দৈনিক পুরস্কার সংগ্রহ করুন।",
        ).trim(),

        en: String(
          description?.en ||
            descriptionEn ||
            "Check in daily and collect your daily reward.",
        ).trim(),
      },

      days: normalizedDays,
      version: 1,

      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: "Check-In reward created successfully",
      setting,
    });
  } catch (err) {
    console.error("Create Check-In reward error:", err);

    res.status(400).json({
      success: false,
      message: err.message || "Failed to create Check-In reward",
    });
  }
});

/* ======================================================
   ADMIN: UPDATE CHECK-IN SETTING
   PUT /api/admin/check-in-reward/:id
====================================================== */

router.put("/admin/check-in-reward/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting id",
      });
    }

    const setting = await CheckInRewardSetting.findById(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Check-In setting not found",
      });
    }

    const {
      title,
      titleBn,
      titleEn,

      description,
      descriptionBn,
      descriptionEn,

      days,
      isActive,
    } = req.body || {};

    const normalizedDays = normalizeDays(days);

    setting.title = {
      bn: String(
        title?.bn || titleBn || setting.title?.bn || "দৈনিক চেক ইন",
      ).trim(),

      en: String(
        title?.en || titleEn || setting.title?.en || "Daily Check In",
      ).trim(),
    };

    setting.description = {
      bn: String(
        description?.bn || descriptionBn || setting.description?.bn || "",
      ).trim(),

      en: String(
        description?.en || descriptionEn || setting.description?.en || "",
      ).trim(),
    };

    setting.days = normalizedDays;

    /**
     * Configuration update হলে version বাড়বে।
     * Client claim route version mismatch পেলে
     * user-এর progress আবার Day 1 করবে।
     */
    setting.version = Number(setting.version || 1) + 1;

    if (typeof isActive === "boolean") {
      setting.isActive = isActive;
    }

    await setting.save();

    res.json({
      success: true,
      message: "Check-In reward updated successfully",
      setting,
    });
  } catch (err) {
    console.error("Update Check-In reward error:", err);

    res.status(400).json({
      success: false,
      message: err.message || "Failed to update Check-In reward",
    });
  }
});

/* ======================================================
   ADMIN: UPDATE ACTIVE/INACTIVE STATUS
   PATCH /api/admin/check-in-reward/:id/status
====================================================== */

router.patch("/admin/check-in-reward/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting id",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const setting = await CheckInRewardSetting.findByIdAndUpdate(
      id,
      {
        isActive,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Check-In setting not found",
      });
    }

    res.json({
      success: true,

      message: isActive
        ? "Check-In reward activated successfully"
        : "Check-In reward deactivated successfully",

      setting,
    });
  } catch (err) {
    console.error("Update Check-In status error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
