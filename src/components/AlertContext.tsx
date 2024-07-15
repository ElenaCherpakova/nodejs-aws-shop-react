import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert, Box } from "@mui/material";

type AlertType = {
  type: "success" | "error";
  text: string;
};

const AlertContext = createContext<(alert: AlertType | null) => void>(
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  () => {}
);

export const useAlert = () => useContext(AlertContext);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertType | null>(null);

  return (
    <AlertContext.Provider value={setAlert}>
      {alert && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
          }}
        >
          <Alert severity={alert.type} onClose={() => setAlert(null)}>
            {alert.text}
          </Alert>
        </Box>
      )}
      {children}
    </AlertContext.Provider>
  );
};
