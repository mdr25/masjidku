import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import {
  FaSave, FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaWhatsapp, FaTiktok, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCheckCircle, FaExclamationCircle, FaMosque, FaGlobe, FaArrowLeft
} from "react-icons/fa";


/* ── Storage key ── */
import { authService } from "../../../services/apiClient";

/* ── Social platforms config ── */
const PLATFORMS = [
  { key: "facebook",  label: "Facebook",  Icon: FaFacebook,  color: "#1877F2", placeholder: "https://facebook.com/nama-masjid" },
  { key: "instagram", label: "Instagram", Icon: FaInstagram, color: "#E1306C", placeholder: "https://instagram.com/nama-masjid" },
  { key: "youtube",   label: "YouTube",   Icon: FaYoutube,   color: "#FF0000", placeholder: "https://youtube.com/@nama-masjid" },
  { key: "twitter",   label: "X (Twitter)", Icon: FaTwitter, color: "#1DA1F2", placeholder: "https://twitter.com/nama-masjid" },
  { key: "whatsapp",  label: "WhatsApp",  Icon: FaWhatsapp,  color: "#25D366", placeholder: "https://wa.me/628xxxxxxxxxx" },
  { key: "tiktok",    label: "TikTok",    Icon: FaTiktok,    color: "#000000", placeholder: "https://tiktok.com/@nama-masjid" },
];

const DEFAULT_FOOTER = {
  social:    { facebook: "", instagram: "", youtube: "", twitter: "", whatsapp: "", tiktok: "" },
  contact:   { phone: "", email: "", address: "" },
  tagline:   "",
  copyrightText: "",
};

/* ════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════ */
const FooterEditor = () => {
  const user = authService.getCurrentUser();
  const userSlug = user?.slug || user?.mosque_slug || "demo";
  const STORAGE_KEY = `mid_site_config_${userSlug}`;

  const [form,     setForm]     = useState(DEFAULT_FOOTER);
  const [original, setOriginal] = useState(DEFAULT_FOOTER);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);
  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  // Derive mosque name from profile for preview
  const [mosqueName, setMosqueName] = useState("Masjid Al-Iman");

  /* ── Load ── */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const saved = parsed.footer || {};
      const merged = {
        social:   { ...DEFAULT_FOOTER.social,   ...(saved.social   || {}) },
        contact:  { ...DEFAULT_FOOTER.contact,  ...(saved.contact  || {}) },
        tagline:  saved.tagline   || "",
        copyrightText: saved.copyrightText || "",
      };
      setForm(merged);
      setOriginal(merged);

      // Profile name for preview
      if (parsed.profile?.name) setMosqueName(parsed.profile.name);
    }
    // Also try mock_mosques
    try {
      const user = JSON.parse(localStorage.getItem("mid_user") || "{}");
      const slug = user.slug || "";
      if (slug) {
        const mosques = JSON.parse(localStorage.getItem("mock_mosques") || "{}");
        if (mosques[slug]?.name) setMosqueName(mosques[slug].name);
      }
    } catch { /* ignore */ }
  }, []);

  /* ── Toast ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── Setters ── */
  const setSocial  = (key, val) => setForm(p => ({ ...p, social:  { ...p.social,  [key]: val } }));
  const setContact = (key, val) => setForm(p => ({ ...p, contact: { ...p.contact, [key]: val } }));

  /* ── Save ── */
  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 350));
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const updated  = { ...existing, footer: form };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setOriginal(form);
      showToast("success", "Footer & Sosmed berhasil disimpan!");
    } catch {
      showToast("error", "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const activeSocials = PLATFORMS.filter(p => form.social[p.key]?.trim());
  const year = new Date().getFullYear();
  const copyright = form.copyrightText?.trim() || `© ${year} ${mosqueName}. Dibuat dengan MasjidKu.`;

  /* ════════════ CSS */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .fe-page { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Back btn */
    .fe-btn-back { display: inline-flex; align-items: center; gap: 8px; color: #6B7280; font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 8px; background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s; margin-bottom: 16px; }
    .fe-btn-back:hover { background: #EAECF0; color: #1a1a1a; }

    .fe-section { background: #fff; border: 1px solid #EAECF0; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    .fe-section-title { font-size: 0.9375rem; font-weight: 800; color: #0D3B2E; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .fe-section-sub { font-size: 0.8125rem; color: #9AA3AF; margin-bottom: 20px; }

    /* Field */
    .fe-label { display: block; font-size: 0.875rem; font-weight: 700; color: #344054; margin-bottom: 6px; }
    .fe-hint  { font-size: 0.75rem; color: #9AA3AF; margin-top: 4px; }
    .fe-input { width: 100%; padding: 10px 13px; border: 1.5px solid #EAECF0; border-radius: 10px; font-size: 0.9375rem; color: #1a1a1a; background: #F7F8FA; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; box-sizing: border-box; }
    .fe-input:focus { border-color: #1A5C45; background: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }
    .fe-field { margin-bottom: 18px; }

    /* Platform row */
    .fe-platform { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1.5px solid #EAECF0; background: #FAFBFA; margin-bottom: 10px; transition: border-color 0.18s; }
    .fe-platform.active { border-color: rgba(26,92,69,0.3); background: rgba(26,92,69,0.03); }
    .fe-platform-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
    .fe-platform-name { font-size: 0.8125rem; font-weight: 700; color: #344054; min-width: 90px; }
    .fe-platform-input { flex: 1; padding: 8px 12px; border: 1.5px solid #EAECF0; border-radius: 9px; font-size: 0.8125rem; font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; outline: none; color: #1a1a1a; transition: all 0.18s; }
    .fe-platform-input:focus { border-color: #1A5C45; box-shadow: 0 0 0 2px rgba(26,92,69,0.07); }
    .fe-platform-input::placeholder { color: #B8BFCA; }
    .fe-platform-check { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
    .fe-platform-check.filled { background: rgba(26,92,69,0.12); color: #1A5C45; }
    .fe-platform-check.empty  { background: #F0F2F5; color: #C0C7D0; }

    /* Contact row */
    .fe-contact-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .fe-contact-icon { width: 36px; height: 36px; border-radius: 9px; background: rgba(26,92,69,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #1A5C45; }

    /* Floating Save Bar — matches MosqueProfile */
    .fe-floating-bar {
      position: fixed;
      bottom: 0;
      left: 260px;
      right: 0;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid #EAECF0;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 14px;
      z-index: 500;
    }
    .fe-floating-hint { font-size: 0.8rem; color: #6B7280; }
    .fe-floating-btn {
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.88rem;
      padding: 10px 24px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 12px rgba(13,59,46,0.25);
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .fe-floating-btn:hover:not(:disabled) {
      box-shadow: 0 4px 20px rgba(13,59,46,0.35);
      transform: translateY(-1px);
      color: #fff;
    }
    .fe-floating-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      background: #9AA3AF;
      box-shadow: none;
    }

    .fe-preview { background: #0D3B2E; border-radius: 16px; overflow: hidden; }
    .fe-preview-inner { padding: 28px 24px; text-align: center; }
    .fe-preview-label { font-size: 0.6875rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px; }
    .fe-preview-mosque-icon { width: 44px; height: 44px; border-radius: 11px; background: rgba(201,168,76,0.18); border: 1px solid rgba(201,168,76,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
    .fe-preview-name { font-weight: 800; color: #fff; font-size: 1.0625rem; margin-bottom: 4px; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fe-preview-tagline { color: rgba(255,255,255,0.45); font-size: 0.8125rem; margin-bottom: 16px; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 18px; }
    .fe-preview-contact { color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-bottom: 4px; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 5px; }
    .fe-preview-socials { display: flex; justify-content: center; gap: 8px; margin: 14px 0; flex-wrap: wrap; }
    .fe-preview-social { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: #fff; }
    .fe-preview-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 12px 0; }
    .fe-preview-copyright { color: rgba(255,255,255,0.25); font-size: 0.6875rem; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fe-preview-badge { background: rgba(26,92,69,0.5); border-top: 1px solid rgba(255,255,255,0.06); padding: 8px 20px; text-align: center; font-size: 0.6875rem; color: rgba(255,255,255,0.3); font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Toast — appears above fixed save bar */
    .fe-toast { position: fixed; bottom: 72px; right: 28px; z-index: 9999; display: flex; align-items: center; gap: 9px; padding: 12px 20px; border-radius: 12px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: feUp 0.3s ease; font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap; }
    .fe-toast.success { background: #1A5C45; color: #fff; }
    .fe-toast.error   { background: #DC2626; color: #fff; }
    @keyframes feUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
  `;

  return (
    <div className="fe-page" style={{ paddingBottom: 80 }}>
      <style>{css}</style>

      <Link to="/app/content" className="fe-btn-back">
        <FaArrowLeft size={13} /> Kembali
      </Link>

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            Footer & Sosial Media
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            Kelola informasi kontak, akun sosial media, dan teks yang tampil di bagian bawah website.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* ═══ LEFT COLUMN: Forms ═══ */}
        <div className="col-lg-7">

          {/* ── Sosial Media ── */}
          <div className="fe-section">
            <div className="fe-section-title">🌐 Sosial Media</div>
            <div className="fe-section-sub">Tambahkan link akun sosial media masjid. Kosongkan untuk menyembunyikan ikon.</div>
            {PLATFORMS.map(({ key, label, Icon, color, placeholder }) => {
              const val = form.social[key] || "";
              const isFilled = val.trim().length > 0;
              return (
                <div key={key} className={`fe-platform ${isFilled ? "active" : ""}`}>
                  <div className="fe-platform-icon" style={{ background: color }}>
                    <Icon size={16} />
                  </div>
                  <div className="fe-platform-name">{label}</div>
                  <input
                    className="fe-platform-input"
                    type="url"
                    placeholder={placeholder}
                    value={val}
                    onChange={(e) => setSocial(key, e.target.value)}
                  />
                  <div className={`fe-platform-check ${isFilled ? "filled" : "empty"}`}>
                    <FaGlobe size={9} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Informasi Kontak ── */}
          <div className="fe-section">
            <div className="fe-section-title">📞 Informasi Kontak</div>
            <div className="fe-section-sub">Tampil di footer website sebagai informasi bagi pengunjung.</div>

            <div className="fe-contact-row">
              <div className="fe-contact-icon"><FaPhone size={14} /></div>
              <input
                className="fe-input"
                type="tel"
                placeholder="Contoh: (021) 1234-5678 atau +62 812-3456-7890"
                value={form.contact.phone}
                onChange={(e) => setContact("phone", e.target.value)}
                style={{ margin: 0 }}
              />
            </div>

            <div className="fe-contact-row">
              <div className="fe-contact-icon"><FaEnvelope size={14} /></div>
              <input
                className="fe-input"
                type="email"
                placeholder="Contoh: info@masjid-aliman.or.id"
                value={form.contact.email}
                onChange={(e) => setContact("email", e.target.value)}
                style={{ margin: 0 }}
              />
            </div>

            <div className="fe-contact-row" style={{ alignItems: "flex-start" }}>
              <div className="fe-contact-icon" style={{ marginTop: 2 }}><FaMapMarkerAlt size={14} /></div>
              <textarea
                className="fe-input"
                placeholder="Contoh: Jl. Masjid Raya No.1, Kelurahan Sejahtera, Kota Bandung, Jawa Barat 40123"
                value={form.contact.address}
                onChange={(e) => setContact("address", e.target.value)}
                rows={2}
                style={{ margin: 0, resize: "vertical" }}
              />
            </div>
          </div>

          {/* ── Tagline & Copyright ── */}
          <div className="fe-section">
            <div className="fe-section-title">✏️ Teks Footer</div>
            <div className="fe-section-sub">Teks pendek yang memperkuat identitas masjid di footer website.</div>

            <div className="fe-field">
              <label className="fe-label">Tagline Masjid</label>
              <input
                className="fe-input"
                type="text"
                placeholder="Contoh: Makmurkan Masjid, Makmurkan Umat"
                value={form.tagline}
                onChange={(e) => setForm(p => ({ ...p, tagline: e.target.value }))}
                maxLength={80}
              />
              <p className="fe-hint">Kalimat singkat yang muncul di bawah nama masjid. Maks. 80 karakter.</p>
            </div>

            <div className="fe-field">
              <label className="fe-label">Teks Hak Cipta</label>
              <input
                className="fe-input"
                type="text"
                placeholder={`© ${year} ${mosqueName}. Dibuat dengan MasjidKu.`}
                value={form.copyrightText}
                onChange={(e) => setForm(p => ({ ...p, copyrightText: e.target.value }))}
                maxLength={120}
              />
              <p className="fe-hint">Kosongkan untuk menggunakan teks default otomatis.</p>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN: Live Preview ═══ */}
        <div className="col-lg-5">
          <div className="fe-preview">
            <div className="fe-preview-inner">
              <div className="fe-preview-label">Preview Footer Website</div>

              {/* Mosque logo */}
              <div className="fe-preview-mosque-icon">
                <FaMosque size={20} style={{ color: "#C9A84C" }} />
              </div>

              <div className="fe-preview-name">{mosqueName}</div>
              <div className="fe-preview-tagline">
                {form.tagline?.trim() || "Tagline masjid Anda"}
              </div>

              {/* Contact info */}
              {(form.contact.phone || form.contact.email || form.contact.address) && (
                <div style={{ marginBottom: 12 }}>
                  {form.contact.phone && (
                    <div className="fe-preview-contact">
                      <FaPhone size={9} /> {form.contact.phone}
                    </div>
                  )}
                  {form.contact.email && (
                    <div className="fe-preview-contact">
                      <FaEnvelope size={9} /> {form.contact.email}
                    </div>
                  )}
                  {form.contact.address && (
                    <div className="fe-preview-contact" style={{ maxWidth: 240, margin: "3px auto" }}>
                      <FaMapMarkerAlt size={9} style={{ flexShrink: 0 }} />
                      <span style={{ lineHeight: 1.4 }}>{form.contact.address}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Socials */}
              {activeSocials.length > 0 && (
                <div className="fe-preview-socials">
                  {activeSocials.map(({ key, Icon, color }) => (
                    <div key={key} className="fe-preview-social" style={{ background: color + "33" }} title={key}>
                      <Icon size={14} style={{ color }} />
                    </div>
                  ))}
                </div>
              )}

              {activeSocials.length === 0 && (
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", marginBottom: 14 }}>
                  Ikon sosmed tampil di sini
                </div>
              )}

              <hr className="fe-preview-divider" />
              <div className="fe-preview-copyright">{copyright}</div>
            </div>
            <div className="fe-preview-badge">
              Preview — tampilan nyata mungkin sedikit berbeda
            </div>
            </div>{/* /fe-preview */}
        </div>{/* /col-lg-5 */}
      </div>{/* /row */}

      {/* ── Floating Save Bar — matches MosqueProfile ── */}
      <div className="fe-floating-bar">
        {isDirty && (
          <span className="fe-floating-hint">Ada perubahan yang belum disimpan</span>
        )}
        <button
          className="fe-floating-btn"
          onClick={handleSave}
          disabled={saving || !isDirty}
          title={!isDirty ? "Tidak ada perubahan" : "Simpan perubahan"}
        >
          {saving
            ? <><Spinner size="sm" animation="border" /> Menyimpan...</>
            : <><FaSave size={14} /> Simpan Perubahan</>}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fe-toast ${toast.type}`}>
          {toast.type === "success" ? <FaCheckCircle size={13} /> : <FaExclamationCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default FooterEditor;
