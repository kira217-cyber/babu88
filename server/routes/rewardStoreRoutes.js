// routes/rewardStoreRoutes.js

import express from "express";
import RewardStore from "../models/RewardStore.js";
import RewardClaim from "../models/RewardClaim.js";
import upload from "../config/multer.js";

const router = express.Router();

/* ======================================================
   GET ALL REWARDS
   GET /api/admin/rewards
====================================================== */

router.get("/admin/rewards", async (req, res) => {
  try {
    const rewards = await RewardStore.find().sort({
      order: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      rewards,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   GET SINGLE REWARD
   GET /api/admin/rewards/:id
====================================================== */

router.get("/admin/rewards/:id", async (req, res) => {
  try {
    const reward = await RewardStore.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.json({
      success: true,
      reward,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   CREATE REWARD
   POST /api/admin/rewards
====================================================== */

router.post(
  "/admin/rewards",
  upload.single("bannerImage"),
  async (req, res) => {
    try {
      const {
        titleBn,
        titleEn,
        descriptionBn,
        descriptionEn,
        conditionType,
        calculationPeriod,
        requiredAmount,
        rewardAmount,
        turnoverMultiplier,
        startAt,
        endAt,
        claimType,
        order,
        status,
        imageUrl,
      } = req.body || {};

      const bannerImage = req.file
        ? `/uploads/${req.file.filename}`
        : imageUrl || "";

      if (
        !bannerImage ||
        !titleBn ||
        !titleEn ||
        !conditionType ||
        !calculationPeriod ||
        requiredAmount === undefined ||
        rewardAmount === undefined ||
        turnoverMultiplier === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing",
        });
      }

      if (!["deposit", "turnover", "game_loss"].includes(conditionType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid condition type",
        });
      }

      if (!["campaign", "lifetime"].includes(calculationPeriod)) {
        return res.status(400).json({
          success: false,
          message: "Invalid calculation period",
        });
      }

      if (!["once", "repeatable"].includes(claimType || "once")) {
        return res.status(400).json({
          success: false,
          message: "Invalid claim type",
        });
      }

      if (!["active", "inactive"].includes(status || "active")) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward status",
        });
      }

      const requiredAmountNumber = Number(requiredAmount);

      const rewardAmountNumber = Number(rewardAmount);

      const turnoverMultiplierNumber = Number(turnoverMultiplier);

      const orderNumber = Number(order || 0);

      if (!Number.isFinite(requiredAmountNumber) || requiredAmountNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Required amount must be a valid positive number",
        });
      }

      if (!Number.isFinite(rewardAmountNumber) || rewardAmountNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Reward amount must be a valid positive number",
        });
      }

      if (
        !Number.isFinite(turnoverMultiplierNumber) ||
        turnoverMultiplierNumber < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Turnover multiplier must be a valid positive number",
        });
      }

      if (!Number.isFinite(orderNumber) || orderNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Order must be a valid positive number",
        });
      }

      let campaignStartAt = null;
      let campaignEndAt = null;

      if (calculationPeriod === "campaign") {
        if (!startAt || !endAt) {
          return res.status(400).json({
            success: false,
            message: "Campaign reward requires start date and end date",
          });
        }

        campaignStartAt = new Date(startAt);
        campaignEndAt = new Date(endAt);

        if (
          Number.isNaN(campaignStartAt.getTime()) ||
          Number.isNaN(campaignEndAt.getTime())
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid campaign date",
          });
        }

        if (campaignEndAt <= campaignStartAt) {
          return res.status(400).json({
            success: false,
            message: "Campaign end date must be later than start date",
          });
        }
      }

      const reward = await RewardStore.create({
        bannerImage,

        title: {
          bn: titleBn.trim(),
          en: titleEn.trim(),
        },

        description: {
          bn: descriptionBn?.trim() || "",
          en: descriptionEn?.trim() || "",
        },

        conditionType,
        calculationPeriod,

        requiredAmount: requiredAmountNumber,
        rewardAmount: rewardAmountNumber,

        turnoverMultiplier: turnoverMultiplierNumber,

        startAt: campaignStartAt,
        endAt: campaignEndAt,

        claimType: claimType || "once",
        order: orderNumber,
        status: status || "active",
      });

      res.status(201).json({
        success: true,
        message: "Reward created successfully",
        reward,
      });
    } catch (err) {
      console.error("Create reward error:", err);

      res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  },
);

/* ======================================================
   UPDATE REWARD
   PUT /api/admin/rewards/:id
====================================================== */

router.put(
  "/admin/rewards/:id",
  upload.single("bannerImage"),
  async (req, res) => {
    try {
      const {
        titleBn,
        titleEn,
        descriptionBn,
        descriptionEn,
        conditionType,
        calculationPeriod,
        requiredAmount,
        rewardAmount,
        turnoverMultiplier,
        startAt,
        endAt,
        claimType,
        order,
        status,
        imageUrl,
      } = req.body || {};

      const found = await RewardStore.findById(req.params.id);

      if (!found) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      const bannerImage = req.file
        ? `/uploads/${req.file.filename}`
        : imageUrl || found.bannerImage;

      if (
        !bannerImage ||
        !titleBn ||
        !titleEn ||
        !conditionType ||
        !calculationPeriod ||
        requiredAmount === undefined ||
        rewardAmount === undefined ||
        turnoverMultiplier === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing",
        });
      }

      if (!["deposit", "turnover", "game_loss"].includes(conditionType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid condition type",
        });
      }

      if (!["campaign", "lifetime"].includes(calculationPeriod)) {
        return res.status(400).json({
          success: false,
          message: "Invalid calculation period",
        });
      }

      if (!["once", "repeatable"].includes(claimType || "once")) {
        return res.status(400).json({
          success: false,
          message: "Invalid claim type",
        });
      }

      if (!["active", "inactive"].includes(status || "active")) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward status",
        });
      }

      const requiredAmountNumber = Number(requiredAmount);

      const rewardAmountNumber = Number(rewardAmount);

      const turnoverMultiplierNumber = Number(turnoverMultiplier);

      const orderNumber = Number(order || 0);

      if (!Number.isFinite(requiredAmountNumber) || requiredAmountNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid required amount",
        });
      }

      if (!Number.isFinite(rewardAmountNumber) || rewardAmountNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward amount",
        });
      }

      if (
        !Number.isFinite(turnoverMultiplierNumber) ||
        turnoverMultiplierNumber < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid turnover multiplier",
        });
      }

      if (!Number.isFinite(orderNumber) || orderNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid display order",
        });
      }

      let campaignStartAt = null;
      let campaignEndAt = null;

      if (calculationPeriod === "campaign") {
        if (!startAt || !endAt) {
          return res.status(400).json({
            success: false,
            message: "Campaign reward requires start date and end date",
          });
        }

        campaignStartAt = new Date(startAt);
        campaignEndAt = new Date(endAt);

        if (
          Number.isNaN(campaignStartAt.getTime()) ||
          Number.isNaN(campaignEndAt.getTime())
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid campaign date",
          });
        }

        if (campaignEndAt <= campaignStartAt) {
          return res.status(400).json({
            success: false,
            message: "Campaign end date must be later than start date",
          });
        }
      }

      found.bannerImage = bannerImage;

      found.title = {
        bn: titleBn.trim(),
        en: titleEn.trim(),
      };

      found.description = {
        bn: descriptionBn?.trim() || "",
        en: descriptionEn?.trim() || "",
      };

      found.conditionType = conditionType;
      found.calculationPeriod = calculationPeriod;

      found.requiredAmount = requiredAmountNumber;

      found.rewardAmount = rewardAmountNumber;

      found.turnoverMultiplier = turnoverMultiplierNumber;

      found.startAt = campaignStartAt;
      found.endAt = campaignEndAt;

      found.claimType = claimType || "once";
      found.order = orderNumber;
      found.status = status || "active";

      await found.save();

      res.json({
        success: true,
        message: "Reward updated successfully",
        reward: found,
      });
    } catch (err) {
      console.error("Update reward error:", err);

      res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  },
);

/* ======================================================
   UPDATE REWARD STATUS
   PATCH /api/admin/rewards/:id/status
====================================================== */

router.patch("/admin/rewards/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reward status",
      });
    }

    const reward = await RewardStore.findByIdAndUpdate(
      req.params.id,
      {
        status,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.json({
      success: true,
      message: "Reward status updated",
      reward,
    });
  } catch (err) {
    console.error("Update reward status error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ======================================================
   DELETE REWARD
   DELETE /api/admin/rewards/:id
====================================================== */

router.delete("/admin/rewards/:id", async (req, res) => {
  try {
    const found = await RewardStore.findById(req.params.id);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    const claimExists = await RewardClaim.exists({
      reward: found._id,
    });

    if (claimExists) {
      return res.status(400).json({
        success: false,
        message: "This reward has claim history. Make it inactive instead.",
      });
    }

    await RewardStore.deleteOne({
      _id: found._id,
    });

    res.json({
      success: true,
      message: "Reward deleted successfully",
    });
  } catch (err) {
    console.error("Delete reward error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
