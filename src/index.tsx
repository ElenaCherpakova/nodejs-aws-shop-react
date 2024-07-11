import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "~/components/App/App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { theme } from "~/theme";
import { AlertProvider, useAlert } from "./components/AlertContext";
import axios from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
});

if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  worker.start({ onUnhandledRequest: "bypass" });
}

const AppWrapper: React.FC = () => {
  const setAlert = useAlert();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log("Interceptor caught an error:", (error as Error).message);
        if (axios.isAxiosError(error) && error.response) {
          const { status } = error.response;
          setAlert(
            status === 401
              ? {
                  type: "error",
                  text: "Unauthorized: Please check your credentials.",
                }
              : status === 403
              ? {
                  type: "error",
                  text: "Forbidden: You do not have permission to perform this action.",
                }
              : { type: "error", text: "Upload failed" }
          );
        } else {
          setAlert({ type: "error", text: "An unexpected error occurred" });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [setAlert]);

  return <App />;
};

const container = document.getElementById("app");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AlertProvider>
            <AppWrapper />
          </AlertProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
