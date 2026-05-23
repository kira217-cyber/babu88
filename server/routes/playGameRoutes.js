// routes/playGameRoutes.js
import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import qs from "qs";

import User from "../models/User.js";

const router = express.Router();

const ORACLE_BASE = "https://api.oraclegames.live/api";
const ORACLE_BY_IDS_API = `${ORACLE_BASE}/games/by-ids`;
const TEST_LAUNCH_URL = `${ORACLE_BASE}/admin/games/launch`;
const LIVE_LAUNCH_URL = "https://crazybet99.com/getgameurl/v2";

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = { id };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const getOracleKey = () => {
  return (
    process.env.ORACLE_TOKEN ||
    process.env.DSTGAME_TOKEN ||
    process.env.ORACLE_KEY ||
    ""
  ).trim();
};

const getDstGameKey = () => {
  return (
    process.env.DSTGAME_KEY ||
    process.env.DSTGAME_TOKEN ||
    process.env.ORACLE_TOKEN ||
    ""
  ).trim();
};

const fetchOracleGameDetailsById = async ({ oracleGameId, apiKey }) => {
  const response = await axios.post(
    ORACLE_BY_IDS_API,
    {
      ids: [String(oracleGameId).trim()],
    },
    {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      timeout: 30000,
    },
  );

  const game = response?.data?.data?.[0] || null;

  if (!game) return null;

  return {
    oracleGameId: String(game?._id || "").trim(),

    game_code: String(game?.game_code || "").trim(),

    provider_code: String(
      game?.provider?.provider_code ||
        game?.provider?.providerCode ||
        game?.provider_code ||
        game?.providerCode ||
        "",
    )
      .trim()
      .toUpperCase(),

    game_type: String(
      game?.provider?.gameType || game?.game_type || game?.gameType || "",
    )
      .trim()
      .toUpperCase(),

    gameName: game?.gameName || game?.name || "",
    image: game?.image || "",
    raw: game,
  };
};

const extractGameUrl = (responseData) => {
  if (typeof responseData === "string") return responseData;

  return (
    responseData?.url ||
    responseData?.data?.url ||
    responseData?.gameUrl ||
    responseData?.game_url ||
    responseData?.launchUrl ||
    responseData?.data?.launchUrl ||
    ""
  );
};

router.post("/playgame", requireAuth, async (req, res) => {
  try {
    const { gameID } = req.body || {};

    if (!gameID) {
      return res.status(400).json({
        success: false,
        message: "gameID is required",
      });
    }

    const user = await User.findById(req.user?.id).select(
      "username userId phone balance isActive currency",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    let balance = Number(user.balance ?? 0);

    if (!Number.isFinite(balance) || balance < 0) {
      balance = 0;
    }

    const ORACLE_API_KEY = getOracleKey();
    const DSTGAME_KEY = getDstGameKey();

    if (!ORACLE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "ORACLE_TOKEN missing in .env",
      });
    }

    if (!DSTGAME_KEY) {
      return res.status(500).json({
        success: false,
        message: "DSTGAME_KEY or DSTGAME_TOKEN missing in .env",
      });
    }

    const oracleGameId = String(gameID || "").trim();

    const oracleGameDetails = await fetchOracleGameDetailsById({
      oracleGameId,
      apiKey: ORACLE_API_KEY,
    });

    if (!oracleGameDetails) {
      return res.status(404).json({
        success: false,
        message: "Game not found from Oracle by-ids API",
      });
    }

    const { game_code, provider_code, game_type } = oracleGameDetails;

    if (!game_code) {
      return res.status(400).json({
        success: false,
        message: "game_code not found from Oracle by-ids API",
      });
    }

    if (!provider_code) {
      return res.status(400).json({
        success: false,
        message: "provider_code not found from Oracle by-ids API",
      });
    }

    if (!game_type) {
      return res.status(400).json({
        success: false,
        message: "game_type not found from Oracle by-ids API",
      });
    }

    const username = String(user.username || user.userId || user.phone || "")
      .trim()
      .replace(/\s+/g, "");

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "User username/userId missing",
      });
    }

    const payload = {
      username,
      money: Math.max(0, Math.floor(balance)),
      currency: String(user.currency || "BDT").trim() || "BDT",
      game_code,
      provider_code,
      game_type,
    };

    const PLAY_MODE = String(process.env.PLAY_GAME_MODE || "test")
      .trim()
      .toLowerCase();

    let responseData = null;

    console.log("Launching game payload:", payload);
    console.log("PLAY_MODE:", PLAY_MODE);

    if (PLAY_MODE === "test") {
      const response = await axios.post(TEST_LAUNCH_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-dstgame-key": DSTGAME_KEY,
        },
        timeout: 30000,
      });

      responseData = response.data;
    } else {
      const response = await axios.post(
        LIVE_LAUNCH_URL,
        qs.stringify(payload),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-dstgame-key": DSTGAME_KEY,
          },
          timeout: 30000,
        },
      );

      responseData = response.data;
    }

    const gameUrl = extractGameUrl(responseData);

    if (!gameUrl || typeof gameUrl !== "string") {
      return res.status(502).json({
        success: false,
        message: "No game URL received from launch API",
        error: responseData,
      });
    }

    return res.json({
      success: true,
      gameUrl,
      used: {
        mode: PLAY_MODE,
        oracle_game_id: oracleGameId,
        game_code,
        provider_code,
        game_type,
        gameName: oracleGameDetails.gameName,
      },
    });
  } catch (error) {
    console.error("PlayGame API Error:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to launch game",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
