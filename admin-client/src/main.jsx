import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { LanguageProvider } from "./Context/LanguageProvider";
import { routes } from "./router/router";
import { store } from "./app/store";

import { rehydrateAuth } from "./features/auth/authSlice";
import { selectAuth } from "./features/auth/authSelectors";
import { setAuthToken } from "./api/axios";

const queryClient = new QueryClient();

const BootstrapAuth = ({ children }) => {
  const dispatch = useDispatch();
  const { token } = useSelector(selectAuth);

  // ✅ StrictMode এও একবারই রান হবে
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    dispatch(rehydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <BootstrapAuth>
            <ToastContainer position="top-right" autoClose={2000} />
            <RouterProvider router={routes} />
          </BootstrapAuth>
        </LanguageProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
