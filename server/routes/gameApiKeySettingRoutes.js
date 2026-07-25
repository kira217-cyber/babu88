import express from "express";
import axios from "axios";
import GameApiKeySetting from "../models/GameApiKeySetting.js";
import { protectAdmin } from "../middleware/adminAuth.js";

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

const jsonError = (res, message, status = 500, data = null) => {
  return res.status(status).json({
    success: false,
    message,
    data,
  });
};

const getMasterApiBaseUrl = () => {
  return cleanBaseUrl(
    // process.env.MASTER_API_BASE_URL ||
      "https://mother-api.babu666.live",
  );
};

const verifyMasterApiKey = async (apiKey) => {
  const masterApiBaseUrl = getMasterApiBaseUrl();
  const cleanKey = String(apiKey || "").trim();

  if (!masterApiBaseUrl) {
    throw new Error("MASTER_API_BASE_URL is missing in .env");
  }

  if (!cleanKey) {
    throw new Error("API key is missing");
  }

  console.log("MASTER_API_BASE_URL:", masterApiBaseUrl);
  console.log("VERIFY TOKEN:", cleanKey);

  const res = await axios.post(
    `${masterApiBaseUrl}/api/master/sites/verify-token`,
    {
      token: cleanKey,
    },
    {
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  console.log("MASTER VERIFY RESPONSE:", JSON.stringify(res.data, null, 2));

  const response = res.data || {};
  const payload = response?.data || response;

  const valid = Boolean(
    payload?.valid === true ||
    response?.valid === true ||
    response?.success === true,
  );

  const site = payload?.site || response?.site || payload || null;

  return {
    valid,
    site,
    raw: response,
  };
};

/* ======================================================
   GET API KEY SETTING
====================================================== */

// ✅ public: client site reads this to know if the master game API is active
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

router.post("/", protectAdmin, async (req, res) => {
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
        valid: isVerified,
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

router.post("/verify", protectAdmin, async (req, res) => {
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
        site: verifyData?.site || null,
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

      return jsonError(res, setting.lastVerifyError, 401, {
        valid: false,
        setting,
      });
    }
  } catch (error) {
    return jsonError(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   ACTIVE / INACTIVE API KEY
====================================================== */

router.patch("/status", protectAdmin, async (req, res) => {
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

router.delete("/", protectAdmin, async (req, res) => {
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
