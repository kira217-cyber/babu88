import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Withdraw from "../pages/Withdraw/Withdraw";
import Deposit from "../pages/Deposit/Deposit";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Profile from "../pages/Profile/Profile";
import SliderController from "../pages/SliderController/SliderController";
import FooterController from "../pages/FooterController/FooterController";
import NoticeController from "../pages/NoticeController/NoticeController";
import DownloadBannerController from "../pages/DownloadBannerController/DownloadBannerController";
import BannerController from "../pages/BannerController/BannerController";
import TwoBannerController from "../pages/TwoBannerController/TwoBannerController";
import SingleBannerController from "../pages/SingleBannerController/SingleBannerController";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        {" "}
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            {" "}
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw",
        element: (
          <PrivateRoute>
            {" "}
            <Withdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit",
        element: (
          <PrivateRoute>
            <Deposit />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "slider-controller",
        element: (
          <PrivateRoute>
            <SliderController />
          </PrivateRoute>
        ),
      },
      {
        path: "footer-controller",
        element: (
          <PrivateRoute>
            <FooterController />
          </PrivateRoute>
        ),
      },
      {
        path: "notice-controller",
        element: (
          <PrivateRoute>
            <NoticeController />
          </PrivateRoute>
        ),
      },
      {
        path: "download-banner-controller",
        element: (
          <PrivateRoute>
            <DownloadBannerController />
          </PrivateRoute>
        ),
      },
      {
        path: "banner-video-controller",
        element: (
          <PrivateRoute>
            <BannerController />
          </PrivateRoute>
        ),
      },
      {
        path: "two-banner-controller",
        element: (
          <PrivateRoute>
            <TwoBannerController />
          </PrivateRoute>
        ),
      },
      {
        path: "single-banner-controller",
        element: (
          <PrivateRoute>
            <SingleBannerController />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
]);
