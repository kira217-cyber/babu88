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
            path: "withdraw",
            element: <Withdraw />,
          },
          {
            path: "history",
            element: <History />,
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
