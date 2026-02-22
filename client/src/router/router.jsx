import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Withdraw from "../pages/Withdraw/Withdraw";
import Deposit from "../pages/Deposit/Deposit";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Promotions from "../pages/Promotions/Promotions";
import LiveGamesPlay from "../pages/LiveGamesPlay/LiveGamesPlay";
import Referral from "../pages/Referral/Referral";
import ProfileLayout from "../RootLayout/ProfileLayout";
import History from "../pages/History/History";
import GameCategory from "../pages/GameCategory/GameCategory";
import GameCategoryMobile from "../pages/GameCategory/GameCategoryMobile";
import PlayGame from "../pages/PlayGame/PlayGame";
import Profile from "../components/Profile/Profile";
import AutoDeposit from "../pages/AutoDeposit/AutoDeposit";
import Reward from "../pages/Reward/Reward";
import VIP from "../pages/VIP/VIP";
import Inbox from "../pages/Inbox/Inbox";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },

      {
        path: "promotions",
        element: <Promotions />,
      },
      {
        path: "games/:categoryId",
        element: <GameCategory />,
      },
      {
        path: "games-mobile/:categoryId",
        element: <GameCategoryMobile />,
      },
      {
        path:"/playgame/:gameId",
        element: (
          <PrivateRoute>
            <PlayGame />
          </PrivateRoute>
        ),
      },

      // 🔽 Profile Nested Routes
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <ProfileLayout />
          </PrivateRoute>
        ),
        children: [
          {
            path: "referral",
            element: <Referral />,
          },
          {
            path: "deposit",
            element: <Deposit />,
          },
           {
            path: "auto-deposit",
            element: <AutoDeposit />,
          },
           {
            path: "reward",
            element: <Reward />,
          },
          {
            path: "vip",
            element: <VIP />,
          },
          {
            path: "inbox",
            element: <Inbox />,
          },
          {
            path: "withdraw",
            element: <Withdraw />,
          },
          {
            path: "history",
            element: <History />,
          },
          {
            path: "me",
            element: <Profile />,
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
      },

      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);
