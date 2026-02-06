import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../features/auth/authSelectors";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { loading } = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ⛔ loading থাকলে কিছুই render করবে না
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // ⛔ loading শেষ হওয়ার পরেই redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
