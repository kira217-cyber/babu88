import React from "react";
import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
} from "../features/auth/authSelectors";
import { toast } from "react-toastify";


const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();

  const { loading } = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-orange-200 text-lg font-medium">
            যাচাই করা হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ role restriction (optional)
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const roleOk = allowedRoles.includes(user?.role);
    if (!roleOk) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // ✅ Affiliate special rule: must be approved
  // যদি এই route affiliate area protect করে এবং user aff-user হয়
  if (user?.role === "aff-user" && user?.isActive !== true) {
    // approved না হলে logout-like behavior (optional)
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    toast.error("Admin এখনো approve করেনি। Approve হলে আবার Login করুন।");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
