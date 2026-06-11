import React, { useState, useEffect } from "react";
import {
  Outlet, Link, useLocation, useNavigate
} from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import {
  FaHome, FaMosque, FaCog, FaSignOutAlt, FaUserCircle,
  FaDesktop, FaThLarge, FaChevronLeft, FaBars, FaPaintBrush,
} from "react-icons/fa";
import BrandLogo from "../common/BrandLogo";
import { authService } from "../../services/apiClient";

const SIDEBAR_W = 240;
const SIDEBAR_COLLAPSED_W = 64;

const DashboardLayout = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const userName = user?.name || "Admin Masjid";
  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const [collapsed, setCollapsed] = useState(false);

  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem(`mid_welcome_seen_${user?.id}`);
  });

  const handleCloseWelcome = () => {
    localStorage.setItem(`mid_welcome_seen_${user?.id}`, "true");
    setShowWelcome(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/app/dashboard") return location.pathname === "/app/dashboard";
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { path: "/app/dashboard", icon: <FaHome size={18} />,        label: "Dashboard" },
    { path: "/app/profile",   icon: <FaMosque size={18} />,     label: "Profil Masjid" },
    { path: "/app/content",   icon: <FaThLarge size={18} />,    label: "Kelola Konten" },
    { path: "/app/appearance", icon: <FaPaintBrush size={16} />, label: "Tampilan" },
    { path: "/app/settings",  icon: <FaCog size={18} />,        label: "Pengaturan" },
  ];

  const sw = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_W;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    /* ── Sidebar ── */
    .db-sidebar {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(180deg, #0D3B2E 0%, #1A5C45 100%);
      /* width managed via inline style for smooth CSS transition */
      height: 100vh;
      position: fixed;
      left: 0; top: 0;
      overflow: hidden;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      padding: 0;
      transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
    }

    /* ── Nav links ── */
    .db-sidebar .nav-link {
      color: rgba(255,255,255,0.6);
      border-radius: 10px;
      padding: 11px 16px;
      margin-bottom: 4px;
      font-size: 0.9375rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-decoration: none;
      position: relative;
      flex-shrink: 0;
    }
    .db-sidebar .nav-link:hover {
      color: rgba(255,255,255,0.95);
      background: rgba(255,255,255,0.08);
    }
    .db-sidebar .nav-link.active {
      color: #fff;
      background: rgba(255,255,255,0.13);
      font-weight: 600;
    }
    .db-sidebar .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0; top: 50%;
      transform: translateY(-50%);
      width: 3px; height: 24px;
      background: #C9A84C;
      border-radius: 0 4px 4px 0;
    }
    .db-nav-label {
      opacity: 1;
      max-width: 180px;          /* shrinks to 0 on collapse */
      overflow: hidden;
      white-space: nowrap;
      transition: opacity 0.2s ease, max-width 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .db-sidebar.collapsed .db-nav-label {
      opacity: 0;
      max-width: 0;
      pointer-events: none;
    }

    /* ── Sidebar divider ── */
    .db-divider {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 10px 14px;
    }

    /* ── Toggle button ── */
    .db-toggle-btn {
      background: rgba(255,255,255,0.08);
      border: none;
      color: rgba(255,255,255,0.6);
      border-radius: 8px;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .db-toggle-btn:hover { background: rgba(255,255,255,0.16); color: #fff; }
    .db-toggle-icon {
      transition: transform 0.28s;
      display: flex;
    }
    .db-sidebar.collapsed .db-toggle-icon { transform: rotate(180deg); }

    /* ── Logo area ── */
    .db-logo-area {
      padding: 14px 16px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 64px;
      flex-shrink: 0;
      transition: padding 0.3s;
    }
    .db-sidebar.collapsed .db-logo-area {
      justify-content: center;
      padding: 14px 0 8px;
    }
    .db-logo-inner {
      overflow: hidden;
      flex: 1;
      transition: opacity 0.18s, width 0.28s;
      min-width: 0;
    }
    .db-sidebar.collapsed .db-logo-inner { opacity: 0; width: 0; pointer-events: none; }

    /* ── View website button ── */
    .btn-view-website {
      background: linear-gradient(135deg, #C9A84C 0%, #B8941F 100%);
      border: none; color: #fff; font-weight: 600;
      font-size: 0.875rem; border-radius: 10px;
      transition: all 0.2s; display: flex;
      align-items: center; justify-content: center;
      gap: 8px; width: 100%; padding: 10px 14px;
      text-decoration: none; white-space: nowrap;
      overflow: hidden;
    }
    .btn-view-website:hover {
      background: linear-gradient(135deg, #D4B55A 0%, #C9A84C 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(201,168,76,0.3);
      color: #fff;
    }
    .db-sidebar.collapsed .btn-view-website-label { display: none; }

    /* ── Logout ── */
    .db-logout {
      color: rgba(255,255,255,0.45);
      border-radius: 10px;
      padding: 11px 16px;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
      white-space: nowrap;
      overflow: hidden;
      margin-bottom: 8px;
      flex-shrink: 0;
    }
    .db-logout:hover { color: #ff6b6b; background: rgba(255,107,107,0.08); }

    /* ── Topbar ── */
    .db-topbar {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #fff;
      border-bottom: 1px solid #EAECF0;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 0 #EAECF0;
    }

    /* ── Setup banner ── */
    .db-setup-banner {
      background: linear-gradient(135deg, #FFF3CD 0%, #FFE69C 100%);
      border-bottom: 1px solid #FFDA6A;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .db-main { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Collapsed state — center icons, collapse labels */
    .db-sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 11px;
      gap: 0;                    /* removes space between icon & zero-width label */
    }
    .db-sidebar.collapsed .db-logout {
      justify-content: center;
      padding: 11px;
      gap: 0;
    }
    .db-sidebar.collapsed .btn-view-website {
      padding: 10px;
      justify-content: center;
      gap: 0;
    }
  `;

  useEffect(() => {
    document.title = "Panel Pengurus - MasjidKu";
  }, []);

  return (
    <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
      <style>{css}</style>

      {/* ════════════ SIDEBAR ════════════ */}
      <div
        className={"db-sidebar" + (collapsed ? " collapsed" : "")}
        style={{ width: collapsed ? SIDEBAR_COLLAPSED_W + "px" : SIDEBAR_W + "px" }}
      >

        {/* Logo + collapse toggle */}
        <div className="db-logo-area">
          {/* Logo — hidden when collapsed */}
          <div className="db-logo-inner" style={{ overflow: "hidden", flex: collapsed ? 0 : 1, opacity: collapsed ? 0 : 1, width: collapsed ? 0 : undefined, transition: "opacity 0.2s, flex 0.3s, width 0.3s", minWidth: 0 }}>
            <BrandLogo size="md" dark={true} subtitle="Panel Pengurus" />
          </div>
          <button
            className="db-toggle-btn"
            style={{ marginLeft: collapsed ? 0 : 8, flexShrink: 0 }}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          >
            <span className="db-toggle-icon">
              <FaChevronLeft size={13} />
            </span>
          </button>
        </div>

        <hr className="db-divider" style={{ marginTop: 4 }} />

        {/* Lihat Website */}
        {user?.isSetupComplete && (
          <div style={{ padding: "0 12px 10px" }}>
            <Link to="/website" target="_blank" className="btn-view-website">
              <FaDesktop size={15} />
              <span className="btn-view-website-label">Lihat Website</span>
            </Link>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 12px", scrollbarWidth: "none" }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={"nav-link" + (isActive(item.path) ? " active" : "")}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <span className="db-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <hr className="db-divider" />

        {/* Logout */}
        <div className="db-logout" onClick={handleLogout} title={collapsed ? "Keluar" : undefined}>
          <span style={{ flexShrink: 0 }}><FaSignOutAlt size={18} /></span>
          <span className="db-nav-label">Keluar</span>
        </div>
      </div>

      {/* ════════════ MAIN CONTENT ════════════ */}
      <div
        className="db-main"
        style={{
          marginLeft: sw + "px",
          minHeight: "100vh",
          flex: 1,
          backgroundColor: "#F5F6F8",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Topbar */}
        <div className="db-topbar">
          <div className="d-flex align-items-center gap-3">
            <div className="text-end lh-sm">
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#1a1a1a" }}>
                {userName}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9AA3AF" }}>Pengurus Masjid</div>
            </div>
            <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
              style={{ width: 38, height: 38, background: "linear-gradient(135deg, #0D3B2E, #1A5C45)", color: "#fff", fontSize: "0.9rem" }}>
              {initials}
            </div>
          </div>
        </div>

        {/* Setup Warning */}
        {user && !user.isSetupComplete && (
          <div className="db-setup-banner px-4 py-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: "1.1rem" }}>⚠️</span>
              <div>
                <strong style={{ fontSize: "0.875rem" }}>Setup Belum Lengkap</strong>
                <span className="text-muted ms-2" style={{ fontSize: "0.8125rem" }}>— Website masjid Anda belum dapat diakses publik.</span>
              </div>
            </div>
            <Link to="/setup" style={{ background: "linear-gradient(135deg,#0D3B2E,#1A5C45)", color: "#fff", borderRadius: 8, padding: "7px 16px", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
              Lengkapi Setup
            </Link>
          </div>
        )}

        {/* Page content */}
        <div style={{ flex: 1, padding: "24px" }}>
          <Outlet />
        </div>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #EAECF0", background: "#fff", padding: "12px 24px", textAlign: "center" }}>
          <small style={{ color: "#9AA3AF", fontSize: "0.75rem" }}>© 2026 MasjidKu — Platform Website Masjid Indonesia</small>
        </footer>
      </div>

      {/* ════════════ WELCOME MODAL (React Bootstrap) ════════════ */}
      <Modal show={showWelcome} onHide={handleCloseWelcome} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div
            style={{
              width: 80, height: 80, background: "rgba(201,168,76,0.12)", color: "#C9A84C",
              borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px"
            }}
          >
            <FaMosque size={36} />
          </div>
          <h3 className="fw-bold mb-3" style={{ color: "#1a1a1a", letterSpacing: "-0.5px" }}>
            Selamat Datang di MasjidKu
          </h3>
          <p className="text-muted mb-4" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
            Mari kita mulai tur singkat untuk mengenali fitur-fitur di panel pengurus ini. Anda akan mempelajari cara mengatur informasi, jadwal sholat, hingga konten website masjid.
          </p>
          <div className="d-grid gap-2">
            <Button
              onClick={handleCloseWelcome}
              className="border-0 fw-bold py-2"
              style={{ background: "linear-gradient(135deg, #0D3B2E, #1A5C45)", borderRadius: 12, fontSize: "0.95rem" }}
            >
              Mulai Tour Dashboard
            </Button>
            <Button
              variant="link"
              onClick={handleCloseWelcome}
              className="text-decoration-none fw-semibold"
              style={{ color: "#9AA3AF", fontSize: "0.9rem" }}
            >
              Mungkin Nanti, Lewati
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardLayout;
