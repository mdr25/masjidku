import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SetupWizard from "./pages/setup/SetupWizard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import MosqueProfile from "./pages/dashboard/MosqueProfile";
import LandingPage from "./pages/public/LandingPage";
import TvDisplay from "./pages/public/TvDisplay";
import MosqueWebsitePage from "./pages/dashboard/MosqueWebsitePage";
import PrayerSchedule from "./pages/dashboard/activities/PrayerSchedule";
import KajianList from "./pages/dashboard/activities/KajianList";
import DKMList from "./pages/dashboard/admin/DKMList";
import JamaahList from "./pages/dashboard/admin/JamaahList";
import ProgramList from "./pages/dashboard/activities/ProgramList";

import ArticleList from "./pages/dashboard/info/ArticleList";
import GalleryList from "./pages/dashboard/info/GalleryList";
import HomeEditor from "./pages/dashboard/editor/HomeEditor";
import HeaderEditor from "./pages/dashboard/editor/HeaderEditor";
import HeroEditor from "./pages/dashboard/editor/HeroEditor";
import FooterEditor from "./pages/dashboard/editor/FooterEditor";
import ContentManager from "./pages/dashboard/ContentManager";
import ThemePage from "./pages/dashboard/ThemePage";

// Super Admin
import AdminDashboard from "./pages/superadmin/AdminDashboard";
import AdminVerificationDetail from "./pages/superadmin/AdminVerificationDetail";
import { authService } from "./services/apiClient";

// Guard: hanya user dengan role super_admin yang bisa akses
const SuperAdminRoute = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const user = authService.getCurrentUser();
  if (user?.role !== "super_admin") {
    return <Navigate to="/app/dashboard" replace />;
  }
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/verifications/:mosqueId" element={<AdminVerificationDetail />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/masjid/:slug" element={<MosqueWebsitePage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Setup Route */}
          <Route path="/setup" element={<SetupWizard />} />

          {/* Dashboard Routes */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="appearance" element={<ThemePage />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="profile" element={<MosqueProfile />} />

            {/* Admin Modules */}
            <Route path="admin/dkm" element={<DKMList />} />
            <Route path="admin/jamaah" element={<JamaahList />} />

            {/* Activities Modules */}
            <Route path="activities/prayer" element={<PrayerSchedule />} />
            <Route path="activities/kajian" element={<KajianList />} />
            <Route path="activities/program" element={<ProgramList />} />



            {/* Info Modules */}
            <Route path="info/articles" element={<ArticleList />} />
            <Route path="info/gallery" element={<GalleryList />} />

            {/* Website Editor */}
            <Route path="editor/home" element={<HomeEditor />} />
            <Route path="editor/home/header" element={<HeaderEditor />} />
            <Route path="editor/home/slider" element={<HeroEditor />} />
            <Route path="editor/home/footer" element={<FooterEditor />} />

            <Route path="preview" element={<MosqueWebsitePage />} />

            {/* Wildcard for app */}
            <Route path="*" element={<Navigate to="/app/dashboard" />} />
          </Route>
        </Route>

        {/* Super Admin Routes */}
        <Route path="/superadmin/*" element={<SuperAdminRoute />} />

        {/* Standalone Website Route */}
        <Route path="/website" element={<MosqueWebsitePage />} />
        <Route path="/tv" element={<TvDisplay />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
