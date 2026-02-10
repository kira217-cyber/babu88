// routes/noticeRoutes.js
import express from "express";
import Notice from "../models/Notice.js";

const router = express.Router();

/**
 * ✅ GET /api/notice
 * - DB তে না থাকলে প্রথমবার default create করবে (Footer এর মতো)
 */
router.get("/notice", async (req, res) => {
  try {
    let notice = await Notice.findOne();

    if (!notice) {
      const defaultData = Notice.getDefault();
      notice = new Notice(defaultData);
      await notice.save();
      console.log("Default notice created successfully");
    }

    res.json(notice);
  } catch (err) {
    console.error("Notice GET error:", err);
    res.status(500).json({ error: "Server error while fetching notice" });
  }
});

/**
 * ✅ PUT /api/notice
 * - Admin থেকে update/upsert
 */
router.put("/notice", async (req, res) => {
  try {
    const { noticeBn, noticeEn, isActive } = req.body;

    // basic validation
    if (typeof noticeBn !== "string" || typeof noticeEn !== "string") {
      return res.status(400).json({ error: "noticeBn and noticeEn must be string" });
    }

    let notice = await Notice.findOne();

    if (!notice) {
      notice = new Notice(Notice.getDefault());
    }

    notice.noticeBn = noticeBn.trim();
    notice.noticeEn = noticeEn.trim();
    if (typeof isActive === "boolean") notice.isActive = isActive;

    await notice.save();
    res.json({ message: "Notice updated successfully", notice });
  } catch (err) {
    console.error("Notice PUT error:", err);
    res.status(500).json({ error: "Server error while updating notice" });
  }
});

export default router;
