import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import Metadata from "./pages/Metadata";
import MetadataGuide from "./pages/MetadataGuide";
import Results from "./pages/Results";
import History from "./pages/History";
import CompleteProfile from "./pages/CompleteProfile";

import MainLayout from "./layouts/MainLayout";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a spinner

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has no name, they must complete profile
  // Allow access to /complete-profile even if name is missing
  if (!user.name && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // If user has name and tries to go to complete-profile, send to dashboard
  if (user.name && location.pathname === "/complete-profile") {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/metadata-guide" element={<MetadataGuide />} />

      {/* Auth Required */}
      <Route element={<ProtectedRoute />}>
        <Route path="/complete-profile" element={<CompleteProfile />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/predict">
            <Route index element={<Predict />} />
            <Route path="metadata" element={<Metadata />} />
            <Route path="results" element={<Results />} />
          </Route>

          <Route path="/history" element={<History />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
