// routes/liveGameGlobalRoutes.js
import express from "express";
import LiveGameGlobal from "../models/LiveGameGlobal.js";

const router = express.Router();

// GET global game uid
router.get("/live-games/global", async (req, res) => {
  try {
    let doc = await LiveGameGlobal.findOne();

    // auto create if not exists
    if (!doc) {
      doc = await LiveGameGlobal.create({
        gameUID: "69987ca39fa20f5dfecbdc95", // default
        isActive: true,
      });
    }

    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ message: "Failed", error: e.message });
  }
});

// UPDATE global game uid (admin)
router.put("/live-games/global", async (req, res) => {
  try {
    const { gameUID, isActive } = req.body;

    if (!gameUID) return res.status(400).json({ message: "gameUID required" });

    const updated = await LiveGameGlobal.findOneAndUpdate(
      {},
      { gameUID, isActive },
      { new: true, upsert: true },
    );

    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: "Update failed", error: e.message });
  }
});

export default router;
