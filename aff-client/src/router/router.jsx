import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Withdraw from "../pages/Withdraw/Withdraw";
import Deposit from "../pages/Deposit/Deposit";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import DashBoardLayout from "../RootLayout/DashBoardLayout";
import Dashboard from "../components/Dashboard/Dashboard";
import MyRefer from "../pages/MyRefer/MyRefer";
import Profile from "../pages/Profile/Profile";
import Commissions from "../pages/Commissions/Commissions";
import WithdrawHistory from "../pages/WithdrawHistory/WithdrawHistory";
import WithdrawHistoryDetails from "../pages/WithdrawHistoryDetails/WithdrawHistoryDetails";

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
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  {
    path: "dashboard",
    element: <DashBoardLayout />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "my-refer",
        element: (
          <PrivateRoute>
            <MyRefer />
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
        path: "withdraw-history",
        element: (
          <PrivateRoute>
            {" "}
            <WithdrawHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw-history/:id",
        element: (
          <PrivateRoute>
            {" "}
            <WithdrawHistoryDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "commissions",
        element: (
          <PrivateRoute>
            <Commissions />
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
    ],
  },
]);
