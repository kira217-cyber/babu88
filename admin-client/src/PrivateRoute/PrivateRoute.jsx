// src/routes/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../features/auth/authSelectors";

const PrivateRoute = ({ children, motherOnly = false, permKey = null }) => {
  const location = useLocation();

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const loading = auth?.loading;
  const role = auth?.admin?.role; // "mother" | "sub"
  const permissions = auth?.admin?.permissions || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ mother সব access করবে
  if (role === "mother") {
    return children;
  }

  // ✅ sub admin: motherOnly page হলে deny
  if (motherOnly) {
    return <Navigate to="/" replace />;
  }

  // ✅ sub admin: permKey must be provided AND must be allowed
  if (!permKey) {
    return <Navigate to="/" replace />;
  }

  const ok = permissions.includes(permKey);
  if (!ok) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
