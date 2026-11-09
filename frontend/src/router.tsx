import React from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";
import { AppShell } from "./components/layout/AppShell.js";
import { Landing } from "./pages/Landing.js";
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { Dashboard } from "./pages/Dashboard.js";
import { Procure } from "./pages/Procure.js";
import { Cart } from "./pages/Cart.js";
import { Orders } from "./pages/Orders.js";
import { OrderDetail } from "./pages/OrderDetail.js";
import { Checkout } from "./pages/Checkout.js";
import { PaymentResult } from "./pages/PaymentResult.js";
import { Products } from "./pages/Products.js";
import { Suppliers } from "./pages/Suppliers.js";
import { Analytics } from "./pages/Analytics.js";
import { NotFound } from "./pages/NotFound.js";

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public Only Route Wrapper (redirects to dashboard if already logged in)
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  // Public Landing Page
  {
    path: "/",
    element: <Landing />,
  },
  // Auth Pages
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <Register />
      </PublicOnlyRoute>
    ),
  },
  // Authenticated App Shell & Workspace
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "procure",
        element: <Procure />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "orders/:id",
        element: <OrderDetail />,
      },
      {
        path: "orders/:id/checkout",
        element: <Checkout />,
      },
      {
        path: "orders/:id/payment-result",
        element: <PaymentResult />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "suppliers",
        element: <Suppliers />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  // Catch all remaining
  {
    path: "*",
    element: <NotFound />,
  },
]);
