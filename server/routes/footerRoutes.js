// routes/footerRoutes.js
import express from 'express';
import Footer from '../models/Footer.js';
import upload from '../config/multer.js'; // your multer config file

const router = express.Router();

// Upload image and return URL
router.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const url = `/uploads/${req.file.filename}`; // Assuming you serve /uploads statically
  res.json({ url });
});

// Get footer data (create default if not exists)
// routes/footerRoutes.js
router.get('/footer', async (req, res) => {
  try {
    let footer = await Footer.findOne();

    if (!footer) {
      // Default data তৈরি করা হবে শুধু প্রথমবার
      const defaultData = Footer.getDefault();  // static method call
      footer = new Footer(defaultData);
      await footer.save();
      console.log("Default footer created successfully"); // debug করার জন্য
    }

    res.json(footer);
  } catch (err) {
    console.error("Footer GET error:", err);
    res.status(500).json({ error: "Server error while fetching footer" });
  }
});

// Update footer data (send full data object)
router.put('/footer', async (req, res) => {
  try {
    const data = req.body;
    const footer = await Footer.findOneAndUpdate({}, data, { upsert: true, new: true });
    res.json(footer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;