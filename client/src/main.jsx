import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { LanguageProvider } from "./Context/LanguageProvider";
import { routes } from "./router/router";
import { store } from "./app/store";
import { rehydrateAuth } from "./features/auth/authSlice";
import ReactPixel from 'react-facebook-pixel';

const queryClient = new QueryClient();

// 1. Meta Pixel Initialize Component
const MetaPixelInitializer = ({ children }) => {
  useEffect(() => {
    const options = {
      autoConfig: true, 
      debug: false, // Production-e false thakbe
    };

    // Client-er dewa Pixel ID init kora holo
    ReactPixel.init('2249150775835230', null, options);
    ReactPixel.pageView(); // Prothom bar page load-er PageView
  }, []);

  return children;
};

/** Context useEffect equivalent */
const BootstrapAuth = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          {/* Pixel Initializer wrap kore dewa holo */}
          <MetaPixelInitializer>
            <BootstrapAuth>
              <ToastContainer position="top-right" />
              <RouterProvider router={routes} />
            </BootstrapAuth>
          </MetaPixelInitializer>
        </LanguageProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);