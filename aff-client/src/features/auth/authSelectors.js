export const selectAuth = (state) => state.auth;

export const selectIsAuthenticated = (state) => {
  const { user, token } = state.auth || {};
  return !!token && !!user && !!user._id; // ✅ safest check
};

export const selectUser = (state) => state.auth?.user || null;

export const selectToken = (state) => state.auth?.token || null;
