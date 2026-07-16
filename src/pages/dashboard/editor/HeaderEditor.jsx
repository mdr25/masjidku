import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { authService, dashboardService } from "../../../services/apiClient";
import {
  FaArrowLeft, FaSave, FaEye, FaMosque, FaHeart, FaBars,
  FaToggleOn, FaToggleOff, FaCheck, FaUpload, FaTimes, FaCheckCircle, FaImage
} from "react-icons/fa";

// ─── HeaderEditor — Kelola Header & Navigasi Template ──────────────────────
const HeaderEditor = () => {
  const user = authService.getCurrentUser();
  const defaultName = user?.name || "Nama Masjid";
  const [allSettings, setAllSettings] = useState({});

  const defaultConfig = {
    logoText: "",
    logoImage: "",
    navbarStyle: "dark",
    sticky: true,
    menu: {
      beranda: "Beranda",
      profil: "Profil",
      program: "Program",
      kajian: "Kajian",
      artikel: "Berita",
      galeri: "Galeri",
      kontak: "Kontak",
    },
    menuVisible: {
      beranda: true, profil: true, program: true,
      kajian: true, artikel: true, galeri: true, kontak: true,
    },
    ctaButtons: [{ label: "Donasi", show: true }],
    donation: {
      description: "Mari salurkan infaq dan sedekah terbaik Anda untuk kemakmuran masjid.",
      bankName: "BSI (Bank Syariah Indonesia)",
      accountNumber: "",
      accountName: "DKM Masjid",
      qrisUrl: ""
    }
  };

  const [cfg, setCfg]       = useState(defaultConfig);
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load from Backend API
  useEffect(() => {
    const load = async () => {
      try {
        const settings = await dashboardService.getSiteSettings();
        setAllSettings(settings);

        if (settings.header) {
          setCfg({
            ...defaultConfig,
            ...settings.header,
            logoText: settings.header.logoText ?? "",
            menu:        { ...defaultConfig.menu, ...(settings.header.menu || {}) },
            menuVisible: { ...defaultConfig.menuVisible, ...(settings.header.menuVisible || {}) },
            ctaButtons:  settings.header.ctaButtons || defaultConfig.ctaButtons,
            donation:    { ...defaultConfig.donation, ...(settings.header.donation || {}) }
          });
        } else {
          setCfg(prev => ({ ...prev, logoText: "" }));
        }
      } catch (e) {
        console.warn("Failed to load header config", e);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  const update = useCallback((path, value) => {
    setIsDirty(true);
    setCfg(prev => {
      const next = { ...prev };
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  }, []);

  // ── Helper to format image URL ──
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("data:") || path.startsWith("blob:") || path.startsWith("data:")) return path;
    
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
    const baseUrl = apiUrl.replace(/\/api$/, "");
    
    if (path.startsWith("http")) {
      if (path.startsWith("http://localhost") || path.startsWith("http://127.0.0.1")) {
        try {
          const urlObj = new URL(path);
          path = urlObj.pathname;
        } catch (e) {
          return path;
        }
      } else {
        return path;
      }
    }
    
    let cleanPath = path;
    if (cleanPath.startsWith("/storage/")) {
      cleanPath = cleanPath.substring(9);
    } else if (cleanPath.startsWith("storage/")) {
      cleanPath = cleanPath.substring(8);
    } else if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }
    
    return `${baseUrl}/storage/${cleanPath}`;
  };

  // ── Image upload via ObjectURL ──
  const fileRef = useRef(null);
  const [logoImageFile, setLogoImageFile] = useState(null);

  // Revoke object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (logoImageFile && cfg.logoImage && cfg.logoImage.startsWith("blob:")) {
        URL.revokeObjectURL(cfg.logoImage);
      }
    };
  }, [logoImageFile, cfg.logoImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2 MB.");
      return;
    }
    
    // Revoke previous blob URL if exists
    if (cfg.logoImage && cfg.logoImage.startsWith("blob:")) {
      URL.revokeObjectURL(cfg.logoImage);
    }

    setLogoImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    update("logoImage", objectUrl);
    e.target.value = "";
  };

  const removeImage = () => {
    if (cfg.logoImage && cfg.logoImage.startsWith("blob:")) {
      URL.revokeObjectURL(cfg.logoImage);
    }
    setLogoImageFile(null);
    update("logoImage", "");
  };

  const handleQrisUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran QRIS maksimal 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const next = { ...(cfg.donation || defaultConfig.donation), qrisUrl: ev.target.result };
      update("donation", next);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalLogoUrl = cfg.logoImage;
      
      // 1. Upload logo if there is a new file
      if (logoImageFile) {
        const uploadRes = await dashboardService.uploadLogo(logoImageFile);
        // Extract URL or relative path from response
        const serverPath = uploadRes.data?.data?.logo_path || uploadRes.data?.data?.logo_url;
        if (serverPath) {
          finalLogoUrl = serverPath;
        }
      }

      const cfgToSave = { ...cfg, logoImage: finalLogoUrl };
      const updated = { ...allSettings, header: cfgToSave };
      
      await dashboardService.updateSiteSettings(updated);
      
      setAllSettings(updated);
      setCfg(cfgToSave);
      setLogoImageFile(null); // Clear staging file
      
      setSaved(true);
      setIsDirty(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save header config", e);
      alert("Gagal menyimpan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // ── Navbar theme colors for preview ──
  const themes = {
    dark:  { bg: "#0D3B2E",  text: "#fff",    muted: "rgba(255,255,255,0.55)", underline: "#C9A84C", ctaBg: "#C9A84C", ctaText: "#fff" },
    light: { bg: "#ffffff",  text: "#0D3B2E", muted: "#9AA3AF",               underline: "#1A5C45", ctaBg: "#1A5C45", ctaText: "#fff" },
    green: { bg: "#1A5C45",  text: "#fff",    muted: "rgba(255,255,255,0.55)", underline: "#C9A84C", ctaBg: "#C9A84C", ctaText: "#fff" },
  };
  const th = themes[cfg.navbarStyle] || themes.dark;

  const visMenu = Object.entries(cfg.menu).filter(([k]) => cfg.menuVisible[k] !== false);
  const displayLogoText = cfg.logoText || defaultName;

  /* ─────────────────────────────────────────── STYLE ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .he-page { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; background: #F5F6F8; }

    /* Split layout */
    .he-split { display: flex; gap: 0; height: calc(100vh - 70px); }
    .he-form  { width: 380px; flex-shrink: 0; overflow-y: auto; background: #fff; border-right: 1px solid #EAECF0; }
    .he-preview { flex: 1; overflow: hidden; background: #F0F2F5; display: flex; flex-direction: column; }

    /* Topbar */
    .he-topbar {
      background: #fff; border-bottom: 1px solid #EAECF0; padding: 0 24px;
      height: 70px; display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 10;
    }
    .he-btn-save {
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      color: #fff; border: none; border-radius: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.875rem; font-weight: 600;
      padding: 9px 20px; display: inline-flex; align-items: center; gap: 8px;
      cursor: pointer; transition: all 0.2s ease; opacity: 1;
    }
    .he-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
    .he-btn-save.saved { background: linear-gradient(135deg, #2E7D32, #388E3C); }
    .he-btn-back {
      display: inline-flex; align-items: center; gap: 8px;
      color: #6B7280; font-size: 0.875rem; font-weight: 600;
      text-decoration: none; padding: 8px 14px; border-radius: 8px;
      background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s;
    }
    .he-btn-back:hover { background: #EAECF0; color: #1a1a1a; }

    /* Form panel */
    .he-section {
      padding: 20px 20px 16px;
      border-bottom: 1px solid #F0F2F5;
    }
    .he-section-title {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: #9AA3AF; margin-bottom: 14px;
    }
    .he-input {
      background: #F7F8FA !important;
      border: 1.5px solid #EAECF0 !important;
      border-radius: 8px !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      font-size: 0.875rem !important;
      color: #1a1a1a !important;
      padding: 9px 12px !important;
      box-shadow: none !important;
      transition: border-color 0.2s !important;
    }
    .he-input:focus {
      border-color: #1A5C45 !important;
      background: #fff !important;
    }
    .he-label {
      font-size: 0.8125rem; font-weight: 600; color: #344054; margin-bottom: 5px; display: block;
    }
    .he-menu-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }
    .he-menu-row input { flex: 1; }
    .he-toggle {
      background: none; border: none; padding: 0; cursor: pointer;
      font-size: 1.4rem; line-height: 1; transition: color 0.2s; flex-shrink: 0;
    }
    .he-toggle.on  { color: #1A5C45; }
    .he-toggle.off { color: #D0D5DD; }

    /* Style radio cards */
    .he-style-cards { display: flex; gap: 8px; flex-wrap: wrap; }
    .he-style-card {
      flex: 1; min-width: 80px; border: 2px solid #EAECF0; border-radius: 10px;
      padding: 10px 8px; text-align: center; cursor: pointer; transition: all 0.2s;
    }
    .he-style-card:hover   { border-color: #A0D4B8; }
    .he-style-card.active  { border-color: #1A5C45; background: #F0F7F4; }
    .he-style-dot { width: 28px; height: 28px; border-radius: 6px; margin: 0 auto 6px; }
    .he-style-name { font-size: 0.75rem; font-weight: 600; color: #344054; }

    /* Preview panel */
    .he-preview-label {
      padding: 10px 16px; background: #fff; border-bottom: 1px solid #EAECF0;
      font-size: 0.75rem; font-weight: 600; color: #9AA3AF; letter-spacing: 1px;
      text-transform: uppercase; display: flex; align-items: center; gap: 8px;
    }
    .he-preview-frame {
      flex: 1; overflow-y: auto; padding: 0;
    }

    /* Mini Navbar Preview */
    .he-mini-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 62px; position: sticky; top: 0; z-index: 5;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .he-nav-link-prev {
      font-size: 0.6875rem; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; text-decoration: none; padding: 4px 0;
      border-bottom: 2px solid transparent; transition: all 0.2s;
    }
    .he-nav-link-prev:hover { border-bottom-color: ${th.underline}; }
    .he-preview-body { padding: 32px 24px; }
    .he-preview-hero-mock {
      border-radius: 14px; overflow: hidden;
      background: linear-gradient(135deg, #FFF8E7 0%, #FFF3D0 100%);
      padding: 32px;
      margin-top: 20px;
    }

    /* Toast */
    .he-toast {
      position: fixed; bottom: 40px; right: 28px; z-index: 9999;
      display: flex; align-items: center; gap: 9px;
      padding: 12px 20px; border-radius: 12px;
      font-size: 0.875rem; font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      animation: heToastUp 0.3s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
      white-space: nowrap;
      background: #1A5C45; color: #fff;
    }
    @keyframes heToastUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
  `;

  return (
    <div className="he-page">
      <style>{css}</style>

      {/* ── Topbar ── */}
      <div className="he-topbar">
        <div className="d-flex align-items-center gap-3">
          <Link to="/app/content" className="he-btn-back">
            <FaArrowLeft size={13} /> Kembali
          </Link>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#1a1a1a" }}>Header & Navigasi</div>
            <div style={{ fontSize: "0.75rem", color: "#9AA3AF" }}>Kelola tampilan navbar website Anda</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">

          <button
            className={`he-btn-save ${saved ? "saved" : ""}`}
            onClick={handleSave}
            disabled={saving || (!isDirty && !saved)}
          >
            {saving ? (
              <><Spinner size="sm" animation="border" /> Menyimpan...</>
            ) : saved ? (
              <><FaCheck size={12} /> Tersimpan!</>
            ) : (
              <><FaSave size={12} /> Simpan</>
            )}
          </button>
        </div>
      </div>

      {/* ── Split Layout ── */}
      <div className="he-split">

        {/* ═══════ FORM PANEL (kiri) ═══════ */}
        <div className="he-form">

          {/* Logo & Brand */}
          <div className="he-section">
            <div className="he-section-title">Logo & Brand</div>

            <div className="mb-4">
              <label className="he-label">Logo Gambar</label>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {cfg.logoImage ? (
                    <>
                      <img src={getFullUrl(cfg.logoImage)} alt="Logo" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 12, border: "1.5px solid #EAECF0", display: "block" }} />
                      <button type="button" onClick={removeImage} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>
                        <FaTimes size={8} />
                      </button>
                    </>
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: 12, border: "1.5px dashed #C9CDD4", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", color: "#9AA3AF" }}>
                      <FaMosque size={20} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                  <button type="button" onClick={() => fileRef.current?.click()} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F0F7F4", color: "#1A5C45", border: "1px solid #C8E6D9", borderRadius: 8, padding: "6px 12px", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", marginBottom: 6 }}>
                    <FaUpload size={10} /> Upload Logo
                  </button>
                  <div style={{ fontSize: "0.75rem", color: "#9AA3AF", lineHeight: 1.4 }}>Format JPG/PNG/WEBP, max 2MB.<br/>Akan tampil di navbar jika diisi.</div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="he-label">Teks Logo</label>
              <input
                className="form-control he-input"
                value={cfg.logoText}
                onChange={e => update("logoText", e.target.value)}
                placeholder={`Otomatis: ${defaultName}`}
              />
              <div style={{ fontSize: "0.75rem", color: "#9AA3AF", marginTop: 4 }}>
                Kosongkan untuk otomatis pakai nama dari Profil Masjid
              </div>
            </div>
          </div>

          {/* Menu Navigasi */}
          <div className="he-section">
            <div className="he-section-title">Menu Navigasi</div>
            <div style={{ fontSize: "0.75rem", color: "#9AA3AF", marginBottom: 12 }}>
              Ubah label menu. Klik ikon untuk sembunyikan/tampilkan.
            </div>
            {Object.entries(cfg.menu).map(([key, label]) => (
              <div key={key} className="he-menu-row">
                <button
                  className={`he-toggle ${cfg.menuVisible[key] !== false ? "on" : "off"}`}
                  onClick={() => update(`menuVisible.${key}`, cfg.menuVisible[key] === false ? true : false)}
                  title={cfg.menuVisible[key] !== false ? "Sembunyikan" : "Tampilkan"}
                >
                  {cfg.menuVisible[key] !== false ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <input
                  className="form-control he-input"
                  value={label}
                  onChange={e => update(`menu.${key}`, e.target.value)}
                  disabled={cfg.menuVisible[key] === false}
                  style={{ opacity: cfg.menuVisible[key] === false ? 0.4 : 1 }}
                />
              </div>
            ))}
          </div>

          {/* Tombol CTA */}
          <div className="he-section">
            <div className="he-section-title">Tombol CTA</div>
            {cfg.ctaButtons.map((btn, i) => (
              <div key={i} className="he-menu-row mb-2">
                <button
                  className={`he-toggle ${btn.show !== false ? "on" : "off"}`}
                  onClick={() => {
                    const next = [...cfg.ctaButtons];
                    next[i] = { ...next[i], show: next[i].show === false ? true : false };
                    update("ctaButtons", next);
                  }}
                >
                  {btn.show !== false ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <input
                  className="form-control he-input"
                  value={btn.label}
                  onChange={e => {
                    const next = [...cfg.ctaButtons];
                    next[i] = { ...next[i], label: e.target.value };
                    update("ctaButtons", next);
                  }}
                  placeholder="Label tombol..."
                  disabled={btn.show === false}
                  style={{ opacity: btn.show === false ? 0.4 : 1 }}
                />
              </div>
            ))}
          </div>

          {/* Pengaturan Donasi */}
          <div className="he-section" style={{ backgroundColor: "#F9FAFB" }}>
            <div className="he-section-title d-flex justify-content-between align-items-center">
              <span>Pengaturan Donasi</span>
              <span className="badge bg-success" style={{ fontSize: "0.65rem" }}>Tampil di CTA Modal</span>
            </div>
            
            <div className="mb-3">
              <label className="he-label">Pesan / Deskripsi Donasi</label>
              <textarea
                className="form-control he-input"
                rows="2"
                value={cfg.donation?.description || ""}
                onChange={e => update("donation", { ...cfg.donation, description: e.target.value })}
                placeholder="Contoh: Mari salurkan infaq terbaik Anda..."
              />
            </div>

            <div className="mb-3">
              <label className="he-label">Nama Bank / E-Wallet</label>
              <input
                className="form-control he-input"
                value={cfg.donation?.bankName || ""}
                onChange={e => update("donation", { ...cfg.donation, bankName: e.target.value })}
                placeholder="Contoh: BSI (Bank Syariah Indonesia)"
              />
            </div>

            <div className="mb-3">
              <label className="he-label">Nomor Rekening</label>
              <input
                className="form-control he-input"
                value={cfg.donation?.accountNumber || ""}
                onChange={e => update("donation", { ...cfg.donation, accountNumber: e.target.value })}
                placeholder="Contoh: 7123456789"
              />
            </div>

            <div className="mb-3">
              <label className="he-label">Atas Nama</label>
              <input
                className="form-control he-input"
                value={cfg.donation?.accountName || ""}
                onChange={e => update("donation", { ...cfg.donation, accountName: e.target.value })}
                placeholder="Contoh: DKM MasjidKu"
              />
            </div>

            <div>
              <label className="he-label">Gambar QRIS (Opsional)</label>
              {cfg.donation?.qrisUrl ? (
                <div className="position-relative d-inline-block border rounded p-1 mb-2 bg-white">
                  <img src={cfg.donation.qrisUrl} alt="QRIS" style={{ height: 100, objectFit: "contain" }} />
                  <button
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                    onClick={() => update("donation", { ...cfg.donation, qrisUrl: "" })}
                    style={{ padding: "2px 6px" }}
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ) : (
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 w-100 justify-content-center" style={{ borderStyle: "dashed" }}>
                    <FaImage /> Upload QRIS
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrisUpload}
                    style={{ position: "absolute", top: 0, left: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Gaya Navbar */}
          <div className="he-section">
            <div className="he-section-title">Gaya Navbar</div>
            <div className="he-style-cards">
              {[
                { key: "dark",  label: "Hijau Tua", color: "#0D3B2E" },
                { key: "green", label: "Hijau",     color: "#1A5C45" },
                { key: "light", label: "Putih",     color: "#ffffff" },
              ].map(s => (
                <div
                  key={s.key}
                  className={`he-style-card ${cfg.navbarStyle === s.key ? "active" : ""}`}
                  onClick={() => update("navbarStyle", s.key)}
                >
                  <div className="he-style-dot" style={{ background: s.color, border: "2px solid #EAECF0" }} />
                  <div className="he-style-name">{s.label}</div>
                  {cfg.navbarStyle === s.key && (
                    <FaCheck size={10} style={{ color: "#1A5C45", marginTop: 4 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sticky */}
          <div className="he-section">
            <div className="he-section-title">Opsi</div>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#344054" }}>Navbar Sticky</div>
                <div style={{ fontSize: "0.75rem", color: "#9AA3AF" }}>Navbar tetap terlihat saat scroll</div>
              </div>
              <button
                className={`he-toggle ${cfg.sticky ? "on" : "off"}`}
                style={{ fontSize: "1.7rem" }}
                onClick={() => update("sticky", !cfg.sticky)}
              >
                {cfg.sticky ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>
          </div>

        </div>

        {/* ═══════ PREVIEW PANEL (kanan) ═══════ */}
        <div className="he-preview">
          <div className="he-preview-label">
            <FaEye size={12} />
            Preview Live — berubah saat Anda mengedit
          </div>

          <div className="he-preview-frame">
            {/* ── Mini Navbar Preview ── */}
            <div
              className="he-mini-nav"
              style={{ background: th.bg }}
            >
              {/* Logo */}
              <div className="d-flex align-items-center" style={{ gap: 10 }}>
                {cfg.logoImage ? (
                  <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 8, padding: 4, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", flexShrink: 0 }}>
                    <img src={getFullUrl(cfg.logoImage)} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: "rgba(201,168,76,0.18)", border: "1px solid rgba(201,168,76,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <FaMosque size={16} style={{ color: "#C9A84C" }} />
                  </div>
                )}
                <div style={{ fontWeight: 800, fontSize: "0.875rem", color: th.text, letterSpacing: "-0.2px" }}>
                  {displayLogoText}
                </div>
              </div>

              {/* Nav links (desktop sim) */}
              <div className="d-none d-md-flex align-items-center" style={{ gap: 20 }}>
                {visMenu.slice(0, 5).map(([key, label]) => (
                  <span key={key}
                    className="he-nav-link-prev"
                    style={{ color: th.muted, fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="d-flex align-items-center gap-2">
                {cfg.ctaButtons.filter(b => b.show !== false).map((btn, i) => (
                  <span key={i} style={{
                    background: th.ctaBg, color: th.ctaText,
                    fontSize: "0.75rem", fontWeight: 700,
                    padding: "7px 14px", borderRadius: 7,
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}>
                    <FaHeart size={9} /> {btn.label}
                  </span>
                ))}
                <FaBars size={16} style={{ color: th.muted, display: "block" }} className="d-md-none" />
              </div>
            </div>

            {/* ── Hero mock ── */}
            <div className="he-preview-body">
              <div style={{ fontSize: "0.75rem", color: "#9AA3AF", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
                ↑ Tampilan Navbar di Website
              </div>

              {/* Theme info card */}
              <div style={{
                background: "#fff", border: "1px solid #EAECF0", borderRadius: 12,
                padding: "16px 20px", marginBottom: 16,
              }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#344054", marginBottom: 8 }}>
                  Konfigurasi Aktif
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <span style={{ background: "#F0F7F4", color: "#1A5C45", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
                    Gaya: {cfg.navbarStyle === "dark" ? "Hijau Tua" : cfg.navbarStyle === "light" ? "Putih" : "Hijau"}
                  </span>
                  <span style={{ background: "#F0F7F4", color: "#1A5C45", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
                    {cfg.sticky ? "✓ Sticky" : "× Non-sticky"}
                  </span>
                  <span style={{ background: "#F0F7F4", color: "#1A5C45", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
                    {visMenu.length} menu aktif
                  </span>
                </div>
              </div>

              {/* Visible menu list */}
              <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#344054", marginBottom: 10 }}>
                  Menu yang Tampil
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {visMenu.map(([key, label]) => (
                    <span key={key} style={{ background: "#F0F7F4", color: "#0D3B2E", borderRadius: 20, padding: "5px 12px", fontSize: "0.8125rem", fontWeight: 600 }}>
                      {label}
                    </span>
                  ))}
                  {visMenu.length === 0 && (
                    <span style={{ color: "#9AA3AF", fontSize: "0.875rem" }}>Tidak ada menu yang aktif</span>
                  )}
                </div>
              </div>

              {/* CTA button preview */}
              {cfg.ctaButtons.some(b => b.show !== false) && (
                <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#344054", marginBottom: 10 }}>
                    Tombol CTA
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {cfg.ctaButtons.filter(b => b.show !== false).map((btn, i) => (
                      <span key={i} style={{
                        background: "linear-gradient(135deg,#C9A84C,#B8941F)", color: "#fff",
                        borderRadius: 8, padding: "9px 18px", fontSize: "0.875rem", fontWeight: 700,
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}>
                        <FaHeart size={11} /> {btn.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {saved && (
        <div className="he-toast">
          <FaCheckCircle size={13} />
          Berhasil disimpan!
        </div>
      )}
    </div>
  );
};

export default HeaderEditor;
