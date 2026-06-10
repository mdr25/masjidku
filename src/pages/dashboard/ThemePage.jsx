import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaPalette, FaEdit } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import TEMPLATE_CATALOG from "../../data/templates";

// ─── Template catalog ──────────────────────────────────────────────────────────
const TEMPLATES = TEMPLATE_CATALOG;

// ─── localStorage helpers: baca & tulis langsung tanpa lapisan API ─────────────
// Setup menyimpan di: mock_mosques[slug].template_code
// Slug diambil dari mid_current_user.slug

const getActiveSlug = () => {
  try {
    const user = JSON.parse(localStorage.getItem("mid_current_user") || "{}");
    return user?.slug || user?.mosque_slug || "masjid-demo";
  } catch { return "masjid-demo"; }
};

const readTemplateFromStorage = () => {
  try {
    const slug   = getActiveSlug();
    const mosque = JSON.parse(localStorage.getItem("mock_mosques") || "{}")[slug] || {};
    // template_code disimpan oleh Setup (Step5Terms → onboardingService.updateProfile)
    if (mosque.template_code) return mosque.template_code;
  } catch { /* abaikan */ }
  return "template-1"; // fallback default
};

const writeTemplateToStorage = (templateId) => {
  try {
    const slug    = getActiveSlug();
    const mosques = JSON.parse(localStorage.getItem("mock_mosques") || "{}");
    if (!mosques[slug]) mosques[slug] = {};
    mosques[slug].template_code = templateId;
    localStorage.setItem("mock_mosques", JSON.stringify(mosques));
  } catch { /* abaikan */ }
};

// ─── Component ────────────────────────────────────────────────────────────────
const ThemePage = () => {
  // Inisialisasi langsung dari localStorage — tidak ada async, tidak ada loading state
  const [active, setActive] = useState(() => readTemplateFromStorage());
  const [saving, setSaving] = useState(null);
  const [saved,  setSaved]  = useState(false);

  // Re-baca jika user berubah (misal setelah login ulang)
  useEffect(() => {
    setActive(readTemplateFromStorage());
  }, []);

  const handleActivate = (templateId) => {
    if (templateId === active || saving) return;
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl?.ready) return;

    setSaving(templateId);

    // Simulasi delay proses untuk feedback UX yang lebih baik
    setTimeout(() => {
      writeTemplateToStorage(templateId);
      setActive(templateId);
      setSaving(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .tp-page { font-family: 'Plus Jakarta Sans', sans-serif; }

    .tp-card {
      background: #fff; border-radius: 16px;
      border: 2px solid #EAECF0; overflow: hidden;
      transition: all 0.22s ease; cursor: pointer; position: relative;
    }
    .tp-card:hover { border-color: #1A5C45; box-shadow: 0 8px 28px rgba(26,92,69,0.1); transform: translateY(-2px); }
    .tp-card.active-card { border-color: #1A5C45; box-shadow: 0 0 0 3px rgba(26,92,69,0.12); }
    .tp-card.inactive { opacity: 0.65; cursor: not-allowed; }
    .tp-card.inactive:hover { transform: none; border-color: #EAECF0; box-shadow: none; }

    .tp-thumb { width: 100%; height: 180px; object-fit: cover; display: block; transition: transform 0.35s ease; }
    .tp-card:not(.inactive):hover .tp-thumb { transform: scale(1.04); }
    .tp-thumb-wrap { overflow: hidden; position: relative; }

    .tp-active-badge {
      position: absolute; top: 12px; right: 12px;
      background: #1A5C45; color: #fff; border-radius: 20px; padding: 4px 12px;
      font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
      display: flex; align-items: center; gap: 5px;
      box-shadow: 0 2px 8px rgba(13,59,46,0.25);
    }
    .tp-coming-badge {
      position: absolute; top: 12px; right: 12px;
      background: rgba(0,0,0,0.52); color: #fff; border-radius: 20px; padding: 4px 12px;
      font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
      backdrop-filter: blur(6px);
    }

    .tp-card-body { padding: 16px 18px 18px; }
    .tp-card-name { font-size: 1rem; font-weight: 800; color: #1a1a1a; margin-bottom: 4px; }
    .tp-card-desc { font-size: 0.8125rem; color: #6B7280; line-height: 1.5; margin-bottom: 12px; }

    .tp-palette { display: flex; gap: 6px; margin-bottom: 14px; }
    .tp-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.07); flex-shrink: 0; }

    .tp-tag {
      display: inline-block; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.5px;
      border-radius: 6px; padding: 3px 9px; margin-right: 5px;
      background: rgba(26,92,69,0.08); color: #1A5C45;
    }

    .tp-btn-activate {
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      color: #fff; border: none; border-radius: 8px;
      font-size: 0.875rem; font-weight: 700; padding: 9px 18px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 7px;
      transition: all 0.2s; width: 100%; justify-content: center;
    }
    .tp-btn-activate:hover { box-shadow: 0 4px 14px rgba(13,59,46,0.3); transform: translateY(-1px); }
    .tp-btn-activate:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

    .tp-btn-active {
      background: rgba(26,92,69,0.08); color: #1A5C45;
      border: 1.5px solid rgba(26,92,69,0.25); border-radius: 8px;
      font-size: 0.875rem; font-weight: 700; padding: 9px 18px;
      display: inline-flex; align-items: center; gap: 7px;
      width: 100%; justify-content: center;
    }
    .tp-btn-coming {
      background: #F5F6F8; color: #9AA3AF;
      border: 1.5px solid #EAECF0; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; padding: 9px 18px; cursor: not-allowed;
      display: inline-flex; align-items: center; gap: 7px;
      width: 100%; justify-content: center;
    }

    .tp-toast {
      position: fixed; bottom: 28px; right: 28px;
      background: #1A5C45; color: #fff; border-radius: 12px; padding: 12px 20px;
      font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 9px;
      box-shadow: 0 8px 24px rgba(13,59,46,0.28); z-index: 9999;
      animation: tpSlideUp 0.3s ease;
    }
    @keyframes tpSlideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
  `;

  const activeTemplate = TEMPLATES.find(t => t.id === active);

  return (
    <div className="tp-page">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="mb-4">
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
          Tampilan Website
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
          Template aktif: <strong style={{ color: "#1A5C45" }}>{activeTemplate?.name || active}</strong>
        </p>
      </div>

      {/* ── Info bar template aktif ── */}
      <div style={{ background: "linear-gradient(135deg, #0D3B2E, #1A5C45)", borderRadius: 14, padding: "16px 22px", marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,168,76,0.2)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FaPalette size={17} style={{ color: "#C9A84C" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700 }}>Template Aktif</div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#fff" }}>
            {activeTemplate?.name || active}
          </div>
        </div>
        <Link
          to="/app/content"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(201,168,76,0.18)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 9, padding: "8px 16px", color: "#C9A84C", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          <FaEdit size={12} /> Edit Konten
        </Link>
      </div>

      {/* ── Template grid ── */}
      <div className="row g-4">
        {TEMPLATES.map((tpl) => {
          const isActive = tpl.id === active;
          return (
            <div className="col-md-6 col-lg-4" key={tpl.id}>
              <div
                className={`tp-card${isActive ? " active-card" : ""}${!tpl.ready ? " inactive" : ""}`}
                onClick={() => tpl.ready && !isActive && handleActivate(tpl.id)}
              >
                {/* Thumbnail */}
                <div className="tp-thumb-wrap">
                  <img src={tpl.preview} alt={tpl.name} className="tp-thumb" />
                  {isActive && (
                    <div className="tp-active-badge"><FaCheck size={9} /> Aktif</div>
                  )}
                  {!tpl.ready && (
                    <div className="tp-coming-badge">Segera Hadir</div>
                  )}
                </div>

                {/* Body */}
                <div className="tp-card-body">
                  <div className="tp-card-name">{tpl.name}</div>
                  <div className="tp-card-desc">{tpl.desc}</div>

                  <div className="tp-palette">
                    {tpl.palette.map((c, i) => (
                      <div key={i} className="tp-dot" style={{ background: c }} title={c} />
                    ))}
                  </div>

                  <div className="mb-3">
                    {tpl.tags.map((tag, i) => (
                      <span key={i} className="tp-tag">{tag}</span>
                    ))}
                  </div>

                  {/* Action */}
                  {isActive ? (
                    <div className="tp-btn-active">
                      <FaCheck size={13} /> Sedang Digunakan
                    </div>
                  ) : tpl.ready ? (
                    <button
                      className="tp-btn-activate"
                      onClick={(e) => { e.stopPropagation(); handleActivate(tpl.id); }}
                      disabled={saving !== null}
                    >
                      {saving === tpl.id ? (
                        <><Spinner size="sm" animation="border" style={{ marginRight: 6 }} /> Mengaktifkan…</>
                      ) : (
                        "Aktifkan Template"
                      )}
                    </button>
                  ) : (
                    <div className="tp-btn-coming">Segera Hadir</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toast ── */}
      {saved && (
        <div className="tp-toast">
          <FaCheck size={14} /> Template berhasil diaktifkan!
        </div>
      )}
    </div>
  );
};

export default ThemePage;
