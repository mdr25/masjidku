import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { authService, dashboardService } from "../../../services/apiClient";
import {
  FaArrowLeft, FaSave, FaEye, FaCheck, FaImage,
  FaMosque, FaArrowRight, FaHeart, FaTimesCircle, FaCheckCircle
} from "react-icons/fa";

// ─── HeroEditor — Kelola Hero / Banner Template ─────────────────────────────
const HeroEditor = () => {
  const user = authService.getCurrentUser();
  const [allSettings, setAllSettings] = useState({});

  const defaultHero = {
    title: "Bersama Makmur dan Memakmurkan Masjid",
    subtitle: "Selamat datang di website resmi masjid kami. Temukan informasi kegiatan, jadwal sholat, dan program-program kami.",
    image: "https://images.unsplash.com/photo-1560626184-524744344bef?q=80&w=1233&auto=format&fit=crop",
    ctaLabel: "Lihat Program",
    ctaSecondary: "Tentang Kami",
    showPrayerBar: true,
    layout: "image-right",  // "image-right" | "image-left" | "full-bg"
  };

  const [hero, setHero]       = useState(defaultHero);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [profileName, setProfileName] = useState("Masjid Al-Iman");
  const [headerCfg, setHeaderCfg] = useState({});

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

  useEffect(() => {
    const load = async () => {
      try {
        const defaultName = user?.name || "Masjid Al-Iman";
        setProfileName(defaultName);

        const settings = await dashboardService.getSiteSettings();
        setAllSettings(settings);

        if (settings.hero)    setHero({ ...defaultHero, ...settings.hero });
        if (settings.header)  setHeaderCfg(settings.header);
      } catch (e) { console.warn("Failed to load hero config", e); }
    };
    load();
  }, []);

  const update = useCallback((key, value) => {
    setIsDirty(true);
    setHero(prev => ({ ...prev, [key]: value }));
    if (key === "image") setImgError(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = { ...allSettings, hero };
      await dashboardService.updateSiteSettings(updated);
      setAllSettings(updated);
      setSaved(true);
      setIsDirty(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save hero config", e);
      alert("Gagal menyimpan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const quickImages = [
    { label: "Harmoni", url: "https://images.unsplash.com/photo-1560626184-524744344bef?q=80&w=1233&auto=format&fit=crop" },
    { label: "Megah",  url: "https://images.unsplash.com/photo-1619729239841-d7354ebf9bb3?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { label: "Elegan", url: "https://images.unsplash.com/photo-1711202675843-ccdb194d2b7d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { label: "Klasik", url: "https://images.unsplash.com/photo-1605795733251-a0b6c96d9dea?q=80&w=1059&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { label: "Modern", url: "https://images.unsplash.com/photo-1531213203257-16afb0eac95e?q=80&w=1145&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  ];

  /* ─── CSS ─── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    .he2-page { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; background: #F5F6F8; }

    .he2-topbar {
      background: #fff; border-bottom: 1px solid #EAECF0;
      padding: 0 24px; height: 70px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 10;
    }
    .he2-btn-back {
      display: inline-flex; align-items: center; gap: 8px;
      color: #6B7280; font-size: 0.875rem; font-weight: 600;
      text-decoration: none; padding: 8px 14px; border-radius: 8px;
      background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s;
    }
    .he2-btn-back:hover { background: #EAECF0; color: #1a1a1a; }
    .he2-btn-save {
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      color: #fff; border: none; border-radius: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.875rem; font-weight: 600;
      padding: 9px 20px; display: inline-flex; align-items: center; gap: 8px;
      cursor: pointer; transition: all 0.2s;
    }
    .he2-btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
    .he2-btn-save.saved { background: linear-gradient(135deg, #2E7D32, #388E3C); }

    .he2-split { display: flex; height: calc(100vh - 70px); }
    .he2-form {
      width: 380px; flex-shrink: 0;
      overflow-y: auto; background: #fff;
      border-right: 1px solid #EAECF0;
    }
    .he2-preview { flex: 1; overflow-y: auto; background: #F0F2F5; }

    .he2-section {
      padding: 18px 20px 14px;
      border-bottom: 1px solid #F0F2F5;
    }
    .he2-section-title {
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.2px;
      color: #9AA3AF; margin-bottom: 12px;
    }
    .he2-label {
      font-size: 0.8125rem; font-weight: 600;
      color: #344054; margin-bottom: 5px; display: block;
    }
    .he2-input {
      width: 100%;
      background: #F7F8FA;
      border: 1.5px solid #EAECF0;
      border-radius: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.875rem;
      color: #1a1a1a;
      padding: 9px 12px;
      outline: none;
      transition: border-color 0.2s;
      resize: vertical;
    }
    .he2-input:focus { border-color: #1A5C45; background: #fff; }
    .he2-hint { font-size: 0.75rem; color: #9AA3AF; margin-top: 4px; }

    /* Img error */
    .he2-img-error {
      display: flex; align-items: center; gap: 8px;
      background: #FFF0F0; border: 1px solid #FCA5A5;
      border-radius: 8px; padding: 8px 12px;
      font-size: 0.8125rem; color: #991B1B; margin-top: 6px;
    }

    /* Quick image selector */
    .he2-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .he2-quick-item {
      border-radius: 8px; overflow: hidden; cursor: pointer;
      border: 2px solid transparent; transition: all 0.2s;
      position: relative; aspect-ratio: 16/9;
    }
    .he2-quick-item:hover { border-color: #A0D4B8; transform: scale(1.02); }
    .he2-quick-item.active { border-color: #1A5C45; box-shadow: 0 0 0 3px rgba(26,92,69,0.15); }
    .he2-quick-item img { width: 100%; height: 100%; object-fit: cover; }
    .he2-quick-label {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 4px 6px; background: rgba(0,0,0,0.5);
      font-size: 0.6875rem; color: #fff; font-weight: 600; text-align: center;
    }

    /* Layout cards */
    .he2-layout-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .he2-layout-card {
      border: 2px solid #EAECF0; border-radius: 10px; padding: 10px;
      cursor: pointer; transition: all 0.2s; text-align: center;
    }
    .he2-layout-card:hover  { border-color: #A0D4B8; }
    .he2-layout-card.active { border-color: #1A5C45; background: #F0F7F4; }
    .he2-layout-thumb {
      height: 40px; border-radius: 6px; margin-bottom: 6px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .he2-layout-name { font-size: 0.75rem; font-weight: 600; color: #344054; }

    /* Toggle */
    .he2-toggle {
      background: none; border: none; padding: 0; cursor: pointer;
      font-size: 1.6rem; line-height: 1; transition: color 0.2s;
    }
    .he2-toggle.on  { color: #1A5C45; }
    .he2-toggle.off { color: #D0D5DD; }

    /* Preview */
    .he2-preview-label {
      padding: 10px 16px; background: #fff; border-bottom: 1px solid #EAECF0;
      font-size: 0.75rem; font-weight: 600; color: #9AA3AF;
      letter-spacing: 1px; text-transform: uppercase;
      display: flex; align-items: center; gap: 8px;
      position: sticky; top: 0; z-index: 5;
    }

    /* Mini Hero Preview */
    .he2-hero-preview {
      background: #FFF8E7;
      padding: 0;
      position: relative;
      overflow: hidden;
    }
    .he2-hero-img-side {
      height: 280px;
      object-fit: cover;
      width: 100%;
    }
    .he2-section-chip {
      display: inline-block;
      font-size: 0.75rem; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      color: #C9A84C;
      background: rgba(201,168,76,0.1);
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: 20px; padding: 4px 14px;
      margin-bottom: 10px;
    }
    .he2-mock-navbar {
      background: #0D3B2E; padding: 0 20px;
      height: 50px; display: flex; align-items: center;
      justify-content: space-between;
      position: sticky; top: 0; z-index: 4;
    }
    .he2-cta-pill {
      display: inline-flex; align-items: center; gap: 5px;
      background: linear-gradient(135deg,#C9A84C,#B8941F);
      color: #fff; border-radius: 7px; padding: 6px 14px;
      font-size: 0.8125rem; font-weight: 700;
    }
  `;

  return (
    <div className="he2-page">
      <style>{css}</style>

      {/* ── Topbar ── */}
      <div className="he2-topbar">
        <div className="d-flex align-items-center gap-3">
          <Link to="/app/content" className="he2-btn-back">
            <FaArrowLeft size={13} /> Kembali
          </Link>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#1a1a1a" }}>Hero / Banner</div>
            <div style={{ fontSize: "0.75rem", color: "#9AA3AF" }}>Atur gambar utama dan teks penyambut website</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">

          <button
            className={`he2-btn-save ${saved ? "saved" : ""}`}
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
      <div className="he2-split">

        {/* ════════ FORM (kiri) ════════ */}
        <div className="he2-form">

          {/* Judul */}
          <div className="he2-section">
            <div className="he2-section-title">Teks Hero</div>

            <div className="mb-3">
              <label className="he2-label">Judul Utama (H1)</label>
              <textarea
                className="he2-input"
                rows={3}
                value={hero.title}
                onChange={e => update("title", e.target.value)}
                placeholder="Bersama Makmur dan Memakmurkan Masjid"
              />
              <div className="he2-hint">{hero.title.length}/100 karakter</div>
            </div>

            <div className="mb-3">
              <label className="he2-label">Subtitle / Deskripsi Singkat</label>
              <textarea
                className="he2-input"
                rows={3}
                value={hero.subtitle}
                onChange={e => update("subtitle", e.target.value)}
                placeholder="Cerita singkat tentang masjid Anda..."
              />
            </div>

            <div className="d-flex gap-2 mb-3">
              <div style={{ flex: 1 }}>
                <label className="he2-label">Teks Tombol Utama</label>
                <input
                  className="he2-input"
                  value={hero.ctaLabel}
                  onChange={e => update("ctaLabel", e.target.value)}
                  placeholder="Lihat Program"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="he2-label">Teks Tombol Sekunder</label>
                <input
                  className="he2-input"
                  value={hero.ctaSecondary}
                  onChange={e => update("ctaSecondary", e.target.value)}
                  placeholder="Tentang Kami"
                />
              </div>
            </div>

            {/* CTA Destinations */}
            <div className="d-flex gap-2">
              <div style={{ flex: 1 }}>
                <label className="he2-label">Arahkan Ke (Tombol Utama)</label>
                <select
                  className="he2-input"
                  value={hero.ctaPrimaryDest || "program"}
                  onChange={e => update("ctaPrimaryDest", e.target.value)}
                >
                  <option value="beranda">Beranda (Atas)</option>
                  <option value="profil">Profil Masjid</option>
                  <option value="program">Program</option>
                  <option value="kajian">Kajian</option>
                  <option value="artikel">Berita</option>
                  <option value="galeri">Galeri</option>
                  <option value="kontak">Kontak / Footer</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="he2-label">Arahkan Ke (Tombol Sekunder)</label>
                <select
                  className="he2-input"
                  value={hero.ctaSecondaryDest || "profil"}
                  onChange={e => update("ctaSecondaryDest", e.target.value)}
                >
                  <option value="beranda">Beranda (Atas)</option>
                  <option value="profil">Profil Masjid</option>
                  <option value="program">Program</option>
                  <option value="kajian">Kajian</option>
                  <option value="artikel">Berita</option>
                  <option value="galeri">Galeri</option>
                  <option value="kontak">Kontak / Footer</option>
                </select>
              </div>
            </div>
          </div>


          {/* Gambar */}
          <div className="he2-section">
            <div className="he2-section-title">Gambar Hero</div>

            <div className="mb-3">
              <label className="he2-label">URL Gambar</label>
              <div style={{ position: "relative" }}>
                <input
                  className="he2-input"
                  value={hero.image}
                  onChange={e => update("image", e.target.value)}
                  placeholder="https://..."
                  style={{ paddingRight: 36 }}
                />
              </div>
              <div className="he2-hint">Tempel URL gambar JPG/PNG/WebP dari internet</div>
              {imgError && (
                <div className="he2-img-error">
                  <FaTimesCircle size={13} /> URL gambar tidak valid atau tidak bisa dimuat
                </div>
              )}
            </div>

            {/* Preview gambar */}
            {hero.image && (
              <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 14, height: 140, background: "#F0F2F5" }}>
                <img
                  src={hero.image}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgError(true)}
                  onLoad={() => setImgError(false)}
                />
              </div>
            )}

            {/* Quick pick */}
            <label className="he2-label">Pilih Cepat</label>
            <div className="he2-quick-grid">
              {quickImages.map((img, i) => (
                <div
                  key={i}
                  className={`he2-quick-item ${hero.image === img.url ? "active" : ""}`}
                  onClick={() => update("image", img.url)}
                >
                  <img src={img.url} alt={img.label} loading="lazy" />
                  <div className="he2-quick-label">{img.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="he2-section">
            <div className="he2-section-title">Tata Letak</div>
            <div className="he2-layout-cards">
              {[
                { key: "image-right", label: "Gambar Kanan",
                  thumb: <div style={{ display: "flex", gap: 4, width: "100%", height: "100%" }}>
                    <div style={{ flex: 1, background: "#EAECF0", borderRadius: 4 }} />
                    <div style={{ flex: 1, background: "#C8E6D9", borderRadius: 4 }} />
                  </div>
                },
                { key: "image-left",  label: "Gambar Kiri",
                  thumb: <div style={{ display: "flex", gap: 4, width: "100%", height: "100%" }}>
                    <div style={{ flex: 1, background: "#C8E6D9", borderRadius: 4 }} />
                    <div style={{ flex: 1, background: "#EAECF0", borderRadius: 4 }} />
                  </div>
                },
                { key: "full-bg",     label: "Latar Penuh",
                  thumb: <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1A5C45,#0D3B2E)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaImage size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                  </div>
                },
                { key: "centered",    label: "Teks Tengah",
                  thumb: <div style={{ width: "100%", height: "100%", background: "#FFF8E7", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 3 }}>
                    <div style={{ width: "60%", height: 4, background: "#1A5C45", borderRadius: 2 }} />
                    <div style={{ width: "40%", height: 3, background: "#EAECF0", borderRadius: 2 }} />
                  </div>
                },
              ].map(l => (
                <div
                  key={l.key}
                  className={`he2-layout-card ${hero.layout === l.key ? "active" : ""}`}
                  onClick={() => update("layout", l.key)}
                >
                  <div className="he2-layout-thumb">{l.thumb}</div>
                  <div className="he2-layout-name">{l.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Opsi */}
          <div className="he2-section">
            <div className="he2-section-title">Opsi</div>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#344054" }}>Tampilkan Bar Jadwal Sholat</div>
                <div style={{ fontSize: "0.75rem", color: "#9AA3AF" }}>Bar waktu sholat di bawah hero</div>
              </div>
              <button
                className={`he2-toggle ${hero.showPrayerBar ? "on" : "off"}`}
                onClick={() => update("showPrayerBar", !hero.showPrayerBar)}
              >
                {hero.showPrayerBar ? "🟢" : "⚪"}
              </button>
            </div>
          </div>
        </div>

        {/* ════════ PREVIEW (kanan) ════════ */}
        <div className="he2-preview">
          <div className="he2-preview-label">
            <FaEye size={12} /> Preview Live — berubah saat Anda mengedit
          </div>

          {/* Mock Navbar */}
          <div className="he2-mock-navbar">
            <div className="d-flex align-items-center" style={{ gap: 10 }}>
              {headerCfg.logoImage ? (
                <div style={{ width: 32, height: 32, background: "#fff", borderRadius: 8, padding: 3, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", flexShrink: 0 }}>
                  <img src={getFullUrl(headerCfg.logoImage)} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,168,76,0.18)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaMosque size={14} style={{ color: "#C9A84C" }} />
                </div>
              )}
              <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.875rem" }}>
                {headerCfg.logoText || profileName}
              </span>
            </div>
            <div className="he2-cta-pill"><FaHeart size={9} /> Donasi</div>
          </div>

          {/* Hero Preview */}
          <div className="he2-hero-preview">
            {(hero.layout === "image-right" || hero.layout === "image-left") && (
              <div style={{ display: "flex", flexDirection: hero.layout === "image-left" ? "row-reverse" : "row", minHeight: 260 }}>
                {/* Text side */}
                <div style={{ flex: 1, padding: "32px 28px", background: "#FFF8E7", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div className="he2-section-chip">Masjid Digital</div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "#1a1a1a", lineHeight: 1.25, marginBottom: 10, letterSpacing: "-0.3px" }}>
                    {hero.title || "Judul Hero"}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.65, marginBottom: 16 }}>
                    {hero.subtitle || "Subtitle hero..."}
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <span style={{ background: "linear-gradient(135deg,#C9A84C,#B8941F)", color: "#fff", borderRadius: 7, padding: "7px 14px", fontSize: "0.8125rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      {hero.ctaLabel || "Lihat Program"} <FaArrowRight size={10} />
                    </span>
                    <span style={{ color: "#1A5C45", fontSize: "0.8125rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 0" }}>
                      {hero.ctaSecondary || "Tentang Kami"} <FaArrowRight size={10} />
                    </span>
                  </div>
                </div>
                {/* Image side */}
                <div style={{ flex: 1, overflow: "hidden", maxHeight: 280 }}>
                  {hero.image ? (
                    <img src={hero.image} alt="Hero" className="he2-hero-img-side" onError={() => setImgError(true)} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", minHeight: 200, background: "#E0E0E0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaImage size={32} style={{ color: "#9AA3AF" }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {hero.layout === "full-bg" && (
              <div style={{ position: "relative", minHeight: 260, overflow: "hidden" }}>
                {hero.image && <img src={hero.image} alt="Hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }} />}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(13,59,46,0.85), rgba(26,92,69,0.7))" }} />
                <div style={{ position: "relative", padding: "40px 28px", textAlign: "center" }}>
                  <div className="he2-section-chip">Masjid Digital</div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#fff", lineHeight: 1.25, marginBottom: 10 }}>
                    {hero.title || "Judul Hero"}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginBottom: 20, lineHeight: 1.6 }}>
                    {hero.subtitle}
                  </p>
                  <span style={{ background: "linear-gradient(135deg,#C9A84C,#B8941F)", color: "#fff", borderRadius: 8, padding: "9px 20px", fontSize: "0.875rem", fontWeight: 700 }}>
                    {hero.ctaLabel} <FaArrowRight size={11} style={{ marginLeft: 5 }} />
                  </span>
                </div>
              </div>
            )}

            {hero.layout === "centered" && (
              <div style={{ background: "#FFF8E7", padding: "48px 28px", textAlign: "center", minHeight: 220 }}>
                {hero.image && (
                  <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", margin: "0 auto 16px", border: "3px solid rgba(201,168,76,0.3)" }}>
                    <img src={hero.image} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div className="he2-section-chip">Masjid Digital</div>
                <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#1a1a1a", marginBottom: 10 }}>{hero.title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "#6B7280", maxWidth: 340, margin: "0 auto 18px" }}>{hero.subtitle}</p>
                <span style={{ background: "linear-gradient(135deg,#C9A84C,#B8941F)", color: "#fff", borderRadius: 8, padding: "9px 20px", fontSize: "0.875rem", fontWeight: 700 }}>
                  {hero.ctaLabel}
                </span>
              </div>
            )}

            {/* Prayer Bar Preview */}
            {hero.showPrayerBar && (
              <div style={{ background: "#fff", borderTop: "1px solid #EAECF0", padding: "12px 20px", display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
                <div style={{ paddingRight: 16, borderRight: "1px solid #EAECF0", marginRight: 16, flexShrink: 0 }}>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#9AA3AF" }}>Imam</div>
                  <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#1a1a1a" }}>Ust. Fulan</div>
                </div>
                {[["Subuh","04:30"],["Dzuhur","12:00"],["Ashar","15:15"],["Maghrib","18:00"],["Isya","19:15"]].map(([n, t]) => (
                  <div key={n} style={{ flex: 1, textAlign: "center", minWidth: 55 }}>
                    <div style={{ fontSize: "0.5625rem", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#9AA3AF", marginBottom: 2 }}>{n}</div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#1A5C45" }}>{t}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info card */}
          <div style={{ padding: "16px 16px 24px" }}>
            <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#344054", marginBottom: 8 }}>Konfigurasi Aktif</div>
              <div className="d-flex flex-wrap gap-2">
                {[
                  { label: hero.layout === "image-right" ? "Gambar Kanan" : hero.layout === "image-left" ? "Gambar Kiri" : hero.layout === "full-bg" ? "Latar Penuh" : "Teks Tengah" },
                  { label: hero.showPrayerBar ? "✓ Bar Sholat" : "× Bar Sholat" },
                  { label: hero.image ? "✓ Gambar diatur" : "× Belum ada gambar" },
                ].map((tag, i) => (
                  <span key={i} style={{ background: "#F0F7F4", color: "#1A5C45", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10 }}>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                💡 <strong>Tips:</strong> Untuk foto masjid terbaik, gunakan foto landscape (horizontal) beresolusi tinggi. Minimal lebar 1200px untuk tampilan optimal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {saved && (
        <div className="he2-toast">
          <FaCheckCircle size={13} />
          Berhasil disimpan!
        </div>
      )}
    </div>
  );
};

export default HeroEditor;
