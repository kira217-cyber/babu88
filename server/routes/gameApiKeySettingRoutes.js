import express from "express";
import axios from "axios";
import GameApiKeySetting from "../models/GameApiKeySetting.js";

const router = express.Router();

const cleanBaseUrl = (url = "") => {
  return String(url || "")
    .trim()
    .replace(/\/+$/, "");
};

const jsonOk = (res, message, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const jsonError = (res, message, status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const getMasterApiBaseUrl = () => {
  return cleanBaseUrl(process.env.MASTER_API_BASE_URL || "");
};

const verifyMasterApiKey = async (apiKey) => {
  const masterApiBaseUrl = getMasterApiBaseUrl();

  if (!masterApiBaseUrl) {
    throw new Error("MASTER_API_BASE_URL is missing in .env");
  }

  const res = await axios.post(
    `${masterApiBaseUrl}/api/master/sites/verify-token`,
    {
      token: apiKey,
    },
    {
      timeout: 15000,
    },
  );

  return res.data?.data;
};

/* ======================================================
   GET API KEY SETTING
====================================================== */

router.get("/", async (req, res) => {
  try {
    const setting = await GameApiKeySetting.findOne().sort({
      createdAt: -1,
    });

    return jsonOk(res, "Game API key setting fetched successfully.", {
      setting,
    });
  } catch (error) {
    return jsonError(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   SAVE / UPDATE API KEY
====================================================== */

router.post("/", async (req, res) => {
  try {
    const { apiKey, isActive = true } = req.body || {};

    if (!apiKey) {
      return jsonError(res, "API key is required.", 400);
    }

    const cleanKey = String(apiKey).trim();

    let isVerified = false;
    let lastVerifyError = "";

    try {
      const verifyData = await verifyMasterApiKey(cleanKey);

      isVerified = Boolean(verifyData?.valid);

      if (!isVerified) {
        lastVerifyError = "Invalid API key.";
      }
    } catch (error) {
      isVerified = false;
      lastVerifyError =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to verify API key.";
    }

    const setting = await GameApiKeySetting.findOneAndUpdate(
      {},
      {
        apiKey: cleanKey,
        isActive: isActive === true || isActive === "true",
        isVerified,
        lastVerifiedAt: new Date(),
        lastVerifyError,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return jsonOk(
      res,
      isVerified
        ? "API key saved and verified successfully."
        : "API key saved but verification failed.",
      {
        setting,
      },
      isVerified ? 200 : 202,
    );
  } catch (error) {
    return jsonError(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   VERIFY SAVED API KEY
====================================================== */

router.post("/verify", async (req, res) => {
  try {
    const setting = await GameApiKeySetting.findOne().sort({
      createdAt: -1,
    });

    if (!setting) {
      return jsonError(res, "No API key setting found.", 404);
    }

    try {
      const verifyData = await verifyMasterApiKey(setting.apiKey);

      setting.isVerified = Boolean(verifyData?.valid);
      setting.lastVerifiedAt = new Date();
      setting.lastVerifyError = setting.isVerified ? "" : "Invalid API key.";

      await setting.save();

      return jsonOk(res, "API key verified successfully.", {
        valid: setting.isVerified,
        setting,
      });
    } catch (error) {
      setting.isVerified = false;
      setting.lastVerifiedAt = new Date();
      setting.lastVerifyError =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to verify API key.";

      await setting.save();

      return jsonError(res, setting.lastVerifyError, 401);
    }
  } catch (error) {
    return jsonError(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   ACTIVE / INACTIVE API KEY
====================================================== */

router.patch("/status", async (req, res) => {
  try {
    const { isActive } = req.body || {};

    const setting = await GameApiKeySetting.findOneAndUpdate(
      {},
      {
        isActive: isActive === true || isActive === "true",
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!setting) {
      return jsonError(res, "No API key setting found.", 404);
    }

    return jsonOk(res, "API key status updated successfully.", {
      setting,
    });
  } catch (error) {
    return jsonError(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE / CLEAR API KEY
====================================================== */

router.delete("/", async (req, res) => {
  try {
    const setting = await GameApiKeySetting.findOneAndDelete();

    if (!setting) {
      return jsonError(res, "No API key setting found.", 404);
    }

    return jsonOk(res, "API key setting deleted successfully.", {
      setting,
    });
  } catch (error) {
    return jsonError(res, error.message || "Server error", 500);
  }
});

export default router;
