// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import footerRoutes from "./routes/footerRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import bannerVideoRoutes from "./routes/bannerVideoRoutes.js";
import twoBannerRoutes from "./routes/twoBannerRoutes.js";
import singleBannerRoutes from "./routes/singleBannerRoutes.js";
import siteBrandingRoutes from "./routes/siteBrandingRoutes.js";
import floatingSocialRoutes from "./routes/floatingSocialRoutes.js";
import downloadHeaderRoutes from "./routes/downloadHeaderRoutes.js";
import promotionsRoutes from "./routes/promotionsRoutes.js";
import affFooterRoutes from "./routes/affFooterRoutes.js";
import affSliderRoutes from "./routes/affSliderRoutes.js";
import affWhyUsRoutes from "./routes/affWhyUsRoutes.js";
import affAgentRoutes from "./routes/affAgentRoutes.js";
import affNoticeRoutes from "./routes/affNoticeRoutes.js";
import affSiteMetaRoutes from "./routes/affSiteMetaRoutes.js";
import affFloatingSocialRoutes from "./routes/affFloatingSocialRoutes.js";
import affCommissionRoutes from "./routes/affCommissionRoutes.js";
import navbarColorRoutes from "./routes/navbarColorRoutes.js";
import menuItemsColorRoutes from "./routes/menuItemsColorRoutes.js";
import bottomNavbarColorRoutes from "./routes/bottomNavbarColorRoutes.js";
import footerColorRoutes from "./routes/footerColorRoutes.js";
import liveGamesColorRoutes from "./routes/liveGamesColorRoutes.js";
import gameCategoryColorRoutes from "./routes/gameCategoryColorRoutes.js";
import promotionsColorRoutes from "./routes/promotionsColorRoutes.js";
import downloadHeaderColorRoutes from "./routes/downloadHeaderColorRoutes.js";
import noticeColorRoutes from "./routes/noticeColorRoutes.js";
import hotGamesColorRoutes from "./routes/hotGamesColorRoutes.js";



dotenv.config();

// ✅ MongoDB connect
connectDB();

const app = express();

// ✅ middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// ✅ uploads folder static (image access করার জন্য)
app.use("/uploads", express.static("uploads"));

// ✅ test route
app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

// ✅ routes
app.use("/api/admin", adminRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api", footerRoutes);
app.use("/api", noticeRoutes);
app.use("/api", downloadRoutes);
app.use("/api", bannerVideoRoutes);
app.use("/api", twoBannerRoutes);
app.use("/api", singleBannerRoutes);
app.use("/api", siteBrandingRoutes);
app.use("/api", floatingSocialRoutes);
app.use("/api", downloadHeaderRoutes);
app.use("/api", promotionsRoutes);
app.use("/api", affFooterRoutes);
app.use("/api", affSliderRoutes);
app.use("/api", affWhyUsRoutes);
app.use("/api", affAgentRoutes);
app.use("/api", affNoticeRoutes);
app.use("/api", affSiteMetaRoutes);
app.use("/api", affFloatingSocialRoutes);
app.use("/api", affCommissionRoutes);
app.use("/api", navbarColorRoutes);
app.use("/api", menuItemsColorRoutes);
app.use("/api", bottomNavbarColorRoutes);
app.use("/api", footerColorRoutes);
app.use("/api", liveGamesColorRoutes);
app.use("/api", gameCategoryColorRoutes);
app.use("/api", promotionsColorRoutes);
app.use("/api", downloadHeaderColorRoutes);
app.use("/api", noticeColorRoutes);
app.use("/api", hotGamesColorRoutes);

// ✅ port
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
