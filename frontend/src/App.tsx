import React from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient.js";
import { router } from "./router.js";

const paypalInitialOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture",
  components: "buttons",
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PayPalScriptProvider options={paypalInitialOptions}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" closeButton theme="system" />
      </PayPalScriptProvider>
    </QueryClientProvider>
  );
};
