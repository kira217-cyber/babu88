// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
} from "../features/auth/authSelectors";

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();

  const loading = useSelector(selectAuthLoading);
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

  // ✅ not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ active check (optional but recommended)
  if (user?.isActive !== true) {
    // user disabled হলে login এ পাঠাও (বা আলাদা page দিলে সেখানে)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ role-based guard (optional)
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const roleOk = allowedRoles.includes(user?.role);
    if (!roleOk) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
