// routes/playGameRoutes.js
import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Game from "../models/Game.js";
import GameProvider from "../models/GameProvider.js";
import qs from "qs";

const router = express.Router();

/**
 * ✅ Inline requireAuth middleware
 * - expects header: Authorization: Bearer <token>
 * - sets req.user = { id: <userId> }
 */
const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    req.user = { id };
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

const isObjectIdLike = (val) => /^[0-9a-fA-F]{24}$/.test(String(val || ""));

/**
 * ✅ Oracle Single Game API
 * GET https://api.oraclegames.live/api/games/:oracleGameId
 *
 * From response we want:
 * - provider.gameType (preferred)  e.g. "CASINO"
 * - fallback: data.game_type       e.g. "SLOT"
 *
 * ✅ IMPORTANT:
 * This API requires header: x-api-key (NOT x-dstgame-key)
 */
const fetchOracleGameTypes = async ({ oracleGameId, apiKey }) => {
  const out = { providerGameType: "", gameType: "" };
  if (!oracleGameId) return out;

  const res = await axios.get(
    `https://api.oraclegames.live/api/games/${encodeURIComponent(
      String(oracleGameId),
    )}`,
    {
      headers: {
        "x-api-key": apiKey, // ✅ FIXED
        Accept: "application/json",
      },
      timeout: 30000,
    },
  );

  const data = res.data?.data || {};
  out.providerGameType = String(data?.provider?.gameType || "").trim(); // e.g. "CASINO"
  out.gameType = String(data?.game_type || "").trim(); // fallback "SLOT"
  return out;
};

/**
 * POST /api/play-game/playgame
 * body: { gameID }
 * auth: required
 *
 * ✅ gameID can be:
 *  - Game document _id (ObjectId string)
 *  - or oracle gameId stored in Game.gameId
 *
 * ✅ provider_code auto: Game.providerDbId -> GameProvider.providerId (e.g. "JILIS")
 * ✅ game_code: Game.gameUuid (e.g. "49")  (your rule)
 * ✅ game_type:
 *    1) providerDoc.gameType (if stored)
 *    2) else Oracle single-game api -> data.provider.gameType (preferred)
 *    3) else Oracle single-game api -> data.game_type (fallback)
 *
 * ✅ Oracle launch API requires header: x-api-key
 */
router.post("/playgame", requireAuth, async (req, res) => {
  try {
    const { gameID } = req.body;

    if (!gameID) {
      return res
        .status(400)
        .json({ success: false, message: "gameID is required" });
    }

    // ✅ user
    const userId = req.user?.id;
    const user = await User.findById(userId).select(
      "username balance isActive",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isActive !== true) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is not active" });
    }

    const balance = Number(user.balance || 0);
    if (!Number.isFinite(balance) || balance <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // ✅ api key
    const ORACLE_API_KEY = process.env.DSTGAME_TOKEN; // your key
    const ORACLE_LAUNCH_URL =
      process.env.ORACLE_LAUNCH_URL ||
      "https://api.oraclegames.live/api/admin/games/launch";

    if (!ORACLE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "DSTGAME_TOKEN missing in .env",
      });
    }

    // ✅ Find game doc
    let gameDoc = null;

    if (isObjectIdLike(gameID)) {
      gameDoc = await Game.findById(gameID);
    }
    if (!gameDoc) {
      gameDoc = await Game.findOne({ gameId: String(gameID) });
    }

    if (!gameDoc) {
      return res.status(404).json({
        success: false,
        message:
          "Game not found in DB (gameID must be Game._id or Game.gameId)",
      });
    }

    // ✅ Provider doc (provider_code from DB)
    const providerDoc = await GameProvider.findById(
      gameDoc.providerDbId,
    ).select("providerId providerName status gameType");

    if (!providerDoc) {
      return res.status(404).json({
        success: false,
        message: "Provider not found for this game",
      });
    }

    if (providerDoc.status && providerDoc.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Provider is inactive" });
    }

    const provider_code = String(providerDoc.providerId || "")
      .trim()
      .toUpperCase();

    if (!provider_code) {
      return res.status(400).json({
        success: false,
        message: "Provider providerId missing (provider_code cannot be built)",
      });
    }

    // ✅ your rule: gameUuid is game_code
    const game_code = String(gameDoc.gameUuid || "").trim();
    if (!game_code) {
      return res.status(400).json({
        success: false,
        message: "Game gameUuid missing (game_code cannot be built)",
      });
    }

    // ✅ game_type resolve
    let game_type = String(providerDoc.gameType || "")
      .trim()
      .toUpperCase();

    let oracleTypes = { providerGameType: "", gameType: "" };

    // If not in DB, fetch from Oracle Single Game API (requires x-api-key)
    if (!game_type) {
      oracleTypes = await fetchOracleGameTypes({
        oracleGameId: gameDoc.gameId, // must be oracle game _id
        apiKey: ORACLE_API_KEY,
      });

      game_type =
        String(oracleTypes.providerGameType || "")
          .trim()
          .toUpperCase() ||
        String(oracleTypes.gameType || "")
          .trim()
          .toUpperCase();
    }

    if (!game_type) {
      return res.status(400).json({
        success: false,
        message:
          "game_type not found. Add gameType to provider OR ensure Game.gameId is valid for oracle lookup.",
      });
    }

    // ✅ Launch payload (Oracle requires these fields)
    const payload = {
      username: user.username,
      money: parseInt(balance, 10),
      currency: "USD",
      game_code, // from DB gameUuid
      provider_code, // from provider.providerId
      game_type, // resolved from provider.gameType or oracle single game provider.gameType
    };

    console.log("Launching game with payload:", payload);

    // // ✅ IMPORTANT: launch requires x-api-key
    // const response = await axios.post("https://crazybet99.com/getgameurl/v2",
    //   qs.stringify(payload), {
    //   headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded',
    //     "x-dstgame-key": "bb10373906ea00faa6717f10f8049c61", // ✅ FIXED
    //   },
    //   timeout: 30000,
    // });

    const response = await axios.post(
      "https://crazybet99.com/getgameurl/v2",
      qs.stringify(payload), // encode as x-www-form-urlencoded
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-dstgame-key": "bb10373906ea00faa6717f10f8049c61",
        },
      },
    );

    const gameUrl =
      response.data ||
      response.data?.url ||
      response.data?.data?.url ||
      response.data?.gameUrl ||
      response.data?.game_url ||
      response.data?.launchUrl ||
      response.data?.data?.launchUrl;

    // if (!gameUrl || typeof gameUrl !== "string") {
    //   return res.status(502).json({
    //     success: false,
    //     message: "No game URL received from oracle launch API",
    //     error: response.data,
    //   });
    // }

    console.log("Game launched successfully. URL:", response);

    return res.json({
      success: true,
      gameUrl,
      used: {
        game_db_id: String(gameDoc._id),
        oracle_game_id: String(gameDoc.gameId),
        game_code,
        provider_code,
        game_type,
        oracle_debug: oracleTypes,
      },
    });
  } catch (error) {
    console.error("PlayGame API Error:", error.response?.data || error.message);
    const status = error.response?.status || 500;

    return res.status(status).json({
      success: false,
      message: "Failed to launch game",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
