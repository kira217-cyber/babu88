import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
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
import FavIconAndLogoController from "../pages/FavIconAndLogoController/FavIconAndLogoController";
import FloatingSocialController from "../pages/FloatingSocialController/FloatingSocialController";
import DownloadHeaderController from "../pages/DownloadHeaderController/DownloadHeaderController";

import AllUser from "../pages/AllUser/AllUser";
import AddPromotion from "../pages/AddPromotion/AddPromotion";
import CreateAdmin from "../pages/CreateAdmin/CreateAdmin";
import AffFooterController from "../pages/AffFooterController/AffFooterController";
import AffSliderController from "../pages/AffSliderController/AffSliderController";
import AffWhyUsController from "../pages/AffWhyUsController/AffWhyUsController";
import AffAgentController from "../pages/AffAgentController/AffAgentController";
import AffNoticeController from "../pages/AffNoticeController/AffNoticeController";
import AffFavAndTitleController from "../pages/AffFavAndTitleController/AffFavAndTitleController";
import AffFloatingSocialController from "../pages/AffFloatingSocialController/AffFloatingSocialController";
import AffCommissionController from "../pages/AffCommissionController/AffCommissionController";
import ColorControllerClient from "../pages/ColorControllerClient/ColorControllerClient";
import ColorControllerAffiliate from "../pages/ColorControllerAffiliate/ColorControllerAffiliate";
import LiveGameController from "../pages/LiveGameController/LiveGameController";
import AllAffiliateUser from "../pages/AllAffiliateUser/AllAffiliateUser";
import AffiliateUserDetails from "../pages/AffiliateUserDetails/AffiliateUserDetails";
import UserDetails from "../pages/UserDetials/UserDetails";
import AddDeposit from "../pages/AddDeposit/AddDeposit";
import AddGameCategory from "../pages/AddGameCategory/AddGameCategory";
import AddProvider from "../pages/AddProvider/AddProvider";
import AddGame from "../pages/AddGame/AddGame";
import AddWithdraw from "../pages/AddWithdraw/AddWithdraw";
import DepositRequestDetails from "../pages/DepositRequestDetails/DepositRequestDetails";
import DepositRequest from "../pages/DepositRequest/DepositRequest";
import WithdrawRequest from "../pages/WithdrawRequest/WithdrawRequest";
import WithdrawRequestDetails from "../pages/WithdrawRequestDetails/WithdrawRequestDetails";
import AddAutoDeposit from "../pages/AddAutoDeposit/AddAutoDeposit";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import AffiliateBrige from "../pages/AffiliateBrige/AffiliateBrige";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      // ✅ RootLayout access = dashboard permission (mother always allow)
      <PrivateRoute permKey="dashboard">
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute permKey="dashboard">
            <Home />
          </PrivateRoute>
        ),
      },

      // ✅ Withdraw & Deposit group permissions
      {
        path: "withdraw",
        element: (
          <PrivateRoute permKey="withdraw">
            <Withdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit",
        element: (
          <PrivateRoute permKey="deposit">
            <Deposit />
          </PrivateRoute>
        ),
      },

      // ✅ Profile (you can decide key, I kept "dashboard" so logged user can access)
      {
        path: "profile",
        element: (
          <PrivateRoute permKey="dashboard">
            <Profile />
          </PrivateRoute>
        ),
      },

      // ✅ Client Site Controller (all these pages share: client-controller)
      {
        path: "slider-controller",
        element: (
          <PrivateRoute permKey="slider-controller">
            <SliderController />
          </PrivateRoute>
        ),
      },
      {
        path: "footer-controller",
        element: (
          <PrivateRoute permKey="footer-controller">
            <FooterController />
          </PrivateRoute>
        ),
      },
      {
        path: "notice-controller",
        element: (
          <PrivateRoute permKey="notice-controller">
            <NoticeController />
          </PrivateRoute>
        ),
      },
      {
        path: "download-banner-controller",
        element: (
          <PrivateRoute permKey="download-banner-controller">
            <DownloadBannerController />
          </PrivateRoute>
        ),
      },
      {
        path: "banner-video-controller",
        element: (
          <PrivateRoute permKey="banner-video-controller">
            <BannerController />
          </PrivateRoute>
        ),
      },
      {
        path: "two-banner-controller",
        element: (
          <PrivateRoute permKey="two-banner-controller">
            <TwoBannerController />
          </PrivateRoute>
        ),
      },
      {
        path: "single-banner-controller",
        element: (
          <PrivateRoute permKey="single-banner-controller">
            <SingleBannerController />
          </PrivateRoute>
        ),
      },
      {
        path: "fav-icon-and-logo-controller",
        element: (
          <PrivateRoute permKey="fav-icon-and-logo-controller">
            <FavIconAndLogoController />
          </PrivateRoute>
        ),
      },
      {
        path: "floating-social-controller",
        element: (
          <PrivateRoute permKey="floating-social-controller">
            <FloatingSocialController />
          </PrivateRoute>
        ),
      },
      {
        path: "download-header-controller",
        element: (
          <PrivateRoute permKey="download-header-controller">
            <DownloadHeaderController />
          </PrivateRoute>
        ),
      },

      // ✅ Users
      {
        path: "all-user",
        element: (
          <PrivateRoute permKey="all-user">
            <AllUser />
          </PrivateRoute>
        ),
      },
      {
        path: "all-affiliate-user",
        element: (
          <PrivateRoute permKey="all-affiliate-user">
            <AllAffiliateUser />
          </PrivateRoute>
        ),
      },
       {
        path: "affiliate-user-brige",
        element: (
          <PrivateRoute permKey="affiliate-user-brige">
            <AffiliateBrige />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-users/:id",
        element: (
          <PrivateRoute permKey="affiliate-user-details">
            <AffiliateUserDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/users/:id",
        element: (
          <PrivateRoute permKey="user-details">
            <UserDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit",
        element: (
          <PrivateRoute permKey="add-deposit">
            <AddDeposit />
          </PrivateRoute>
        ),
      },
       {
        path: "add-auto-deposit",
        element: (
          <PrivateRoute permKey="add-auto-deposit">
            <AddAutoDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "auto-deposit-history",
        element: (
          <PrivateRoute permKey="auto-deposit-history">
            <AutoDepositHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-request",
        element: (
          <PrivateRoute permKey="deposit-request">
            <DepositRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "/deposit-request/:id",
        element: (
          <PrivateRoute permKey="deposit-request-details">
            <DepositRequestDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "add-withdraw",
        element: (
          <PrivateRoute permKey="add-withdraw">
            <AddWithdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw-request",
        element: (
          <PrivateRoute permKey="withdraw-request">
            <WithdrawRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "/withdraw-request/:id",
        element: (
          <PrivateRoute permKey="withdraw-request-details">
            <WithdrawRequestDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "add-game-category",
        element: (
          <PrivateRoute permKey="add-game-category">
            <AddGameCategory />
          </PrivateRoute>
        ),
      },
      {
        path: "add-provider",
        element: (
          <PrivateRoute permKey="add-provider">
            <AddProvider />
          </PrivateRoute>
        ),
      },
      {
        path: "add-game",
        element: (
          <PrivateRoute permKey="add-game">
            <AddGame />
          </PrivateRoute>
        ),
      },
      // ✅ Promotions
      {
        path: "add-promotion",
        element: (
          <PrivateRoute permKey="add-promotion">
            <AddPromotion />
          </PrivateRoute>
        ),
      },

      // ✅ Create Admin (mother only)
      {
        path: "create-admin",
        element: (
          <PrivateRoute motherOnly>
            <CreateAdmin />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-footer-controller",
        element: (
          <PrivateRoute permKey="aff-footer-controller">
            <AffFooterController />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-slider-controller",
        element: (
          <PrivateRoute permKey="aff-slider-controller">
            <AffSliderController />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-whyus-controller",
        element: (
          <PrivateRoute permKey="aff-whyus-controller">
            <AffWhyUsController />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-agent-controller",
        element: (
          <PrivateRoute permKey="aff-agent-controller">
            <AffAgentController />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-notice-controller",
        element: (
          <PrivateRoute permKey="aff-notice-controller">
            <AffNoticeController />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-fav-and-title-controller",
        element: (
          <PrivateRoute permKey="aff-fav-and-title-controller">
            <AffFavAndTitleController />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-floating-social-controller",
        element: (
          <PrivateRoute permKey="aff-floating-social-controller">
            <AffFloatingSocialController />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-commission-controller",
        element: (
          <PrivateRoute permKey="aff-commission-controller">
            <AffCommissionController />
          </PrivateRoute>
        ),
      },
      {
        path: "color-controller-client",
        element: (
          <PrivateRoute permKey="color-controller-client">
            <ColorControllerClient />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-color-controller-client",
        element: (
          <PrivateRoute permKey="aff-color-controller-client">
            <ColorControllerAffiliate />
          </PrivateRoute>
        ),
      },
      {
        path: "live-controller",
        element: (
          <PrivateRoute permKey="live-controller">
            <LiveGameController />
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
