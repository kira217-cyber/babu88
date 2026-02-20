import express from "express";
import axios from "axios";
import qs from "qs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ adjust according to your token payload
    // common payloads: { id }, { _id }, { userId }, { user: { _id } }
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
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * POST /api/play-game/playgame
 * body: { gameID }
 * auth: required
 */
router.post("/playgame", requireAuth, async (req, res) => {
  try {
    const { gameID } = req.body;

    if (!gameID) {
      return res.status(400).json({
        success: false,
        message: "gameID is required",
      });
    }

    // ✅ Now this will work because requireAuth sets req.user
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select(
      "username balance isActive",
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

    const balance = Number(user.balance || 0);
    if (balance <= 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // ✅ External provider payload
    const token = process.env.DSTGAME_TOKEN; // provider key
    const homeUrl = process.env.GAME_HOME_URL || "https://1winzo.com";
    const providerUrl =
      process.env.GAME_PROVIDER_URL || "https://crazybet99.com/getgameurl";

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "DSTGAME_TOKEN missing in .env",
      });
    }

    const postData = {
      home_url: homeUrl,
      token,
      username: `${user.username}45`,
      money: balance,
      gameid: gameID,
    };

    const response = await axios.post(providerUrl, qs.stringify(postData), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-dstgame-key": token,
      },
      timeout: 15000,
    });

    const gameUrl =
      response.data?.url || response.data?.game_url || response.data;

    if (!gameUrl || typeof gameUrl !== "string") {
      return res.status(502).json({
        success: false,
        message: "No game URL received from provider",
        error: response.data,
      });
    }

    return res.json({
      success: true,
      gameUrl,
    });
  } catch (error) {
    console.error("PlayGame API Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to launch game",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
