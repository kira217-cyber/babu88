// src/features/auth/authSelectors.js

export const selectAuth = (state) => state.auth;

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;

export const selectIsAuthenticated = (state) => {
  const { user, token } = state.auth;

  // ✅ minimal + safe check (no password/email checks)
  return !!token && !!user && !!user._id;
};

export const selectIsActiveUser = (state) => {
  const { user, token } = state.auth;
  return !!token && !!user && !!user._id && user.isActive === true;
};

export const selectRole = (state) => state.auth.user?.role || null;
