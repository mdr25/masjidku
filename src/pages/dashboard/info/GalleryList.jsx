import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus, FaTrash, FaTimes, FaImage, FaPlay,
  FaCheckCircle, FaExclamationCircle, FaExpand,
  FaYoutube, FaUpload, FaSave, FaArrowLeft,
} from "react-icons/fa";
import { authService } from "../../../services/apiClient";

/* ════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════ */
const getStorageKey = () => {
  const user = authService.getCurrentUser();
  const userSlug = user?.slug || user?.mosque_slug || "demo";
  return `mid_gallery_${userSlug}`;
};

const TABS = [
  { key: "foto",  label: "Foto",  emoji: "📷" },
  { key: "video", label: "Video", emoji: "🎬" },
];

/* ── YouTube thumbnail helper ── */
const getYTId = (url) => {
  const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return m ? m[1] : null;
};
const getYTThumb = (url) => {
  const id = getYTId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
const GalleryList = () => {
  const [activeTab,   setActiveTab]   = useState("foto");
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const [lightbox,    setLightbox]    = useState(null); // { url, caption }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting,    setDeleting]    = useState(null);

  // Foto upload state
  const [stagingPhotos, setStagingPhotos] = useState([]); // [{file, preview, caption}]
  const [uploadDragging, setUploadDragging] = useState(false);
  const [saving,       setSaving]     = useState(false);

  // Video add state
  const [videoPanel,   setVideoPanel]  = useState(false);
  const [videoForm,    setVideoForm]   = useState({ url: "", caption: "" });
  const [savingVideo,  setSavingVideo] = useState(false);

  const fileRef  = useRef(null);
  const panelRef = useRef(null);

  /* ── Load from localStorage ── */
  const [gallery, setGallery] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey()) || "[]");
    } catch { return []; }
  });
  useEffect(() => {
    setLoading(false);
  }, []);

  const persist = (updated) => {
    setGallery(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  };

  /* ── Toast ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Keyboard: Escape ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setLightbox(null);
        setVideoPanel(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ════════════════════════════════
     FOTO UPLOAD
  ════════════════════════════════ */
  const processFiles = useCallback((files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    const tooBig = arr.filter((f) => f.size > 5 * 1024 * 1024);
    if (tooBig.length) {
      showToast("error", `${tooBig.length} file melebihi 5 MB dan dilewati.`);
    }
    const valid = arr.filter((f) => f.size <= 5 * 1024 * 1024);
    if (!valid.length) return;

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setStagingPhotos((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), file, preview: e.target.result, caption: "" },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = (e) => { processFiles(e.target.files); e.target.value = ""; };
  const handleDrop = (e) => {
    e.preventDefault(); setUploadDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeStagingPhoto = (id) => setStagingPhotos((p) => p.filter((x) => x.id !== id));
  const updateStagingCaption = (id, cap) =>
    setStagingPhotos((p) => p.map((x) => x.id === id ? { ...x, caption: cap } : x));

  const savePhotos = async () => {
    if (!stagingPhotos.length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300)); // simulate
    const newItems = stagingPhotos.map((s) => ({
      id: Date.now() + Math.random(),
      type: "foto",
      url: s.preview,
      caption: s.caption,
      date: new Date().toISOString(),
    }));
    const updated = [...gallery, ...newItems];
    persist(updated);
    setStagingPhotos([]);
    setSaving(false);
    showToast("success", `${newItems.length} foto berhasil ditambahkan!`);
  };

  /* ════════════════════════════════
     VIDEO ADD
  ════════════════════════════════ */
  const saveVideo = async () => {
    if (!videoForm.url.trim()) return;
    if (!getYTId(videoForm.url)) {
      showToast("error", "Link tidak valid. Gunakan URL YouTube.");
      return;
    }
    setSavingVideo(true);
    await new Promise((r) => setTimeout(r, 300));
    const newItem = {
      id: Date.now(),
      type: "video",
      url: videoForm.url.trim(),
      caption: videoForm.caption.trim(),
      date: new Date().toISOString(),
    };
    const updated = [...gallery, newItem];
    persist(updated);
    setVideoPanel(false);
    setVideoForm({ url: "", caption: "" });
    setSavingVideo(false);
    showToast("success", "Video berhasil ditambahkan!");
  };

  /* ════════════════════════════════
     DELETE
  ════════════════════════════════ */
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(deleteConfirm.id);
    await new Promise((r) => setTimeout(r, 300));
    const updated = gallery.filter((x) => x.id !== deleteConfirm.id);
    persist(updated);
    setDeleting(null);
    setDeleteConfirm(null);
    showToast("success", "Dihapus.");
  };

  /* ── Filtered ── */
  const filtered = gallery.filter((x) => x.type === activeTab);
  const fotoCount  = gallery.filter((x) => x.type === "foto").length;
  const videoCount = gallery.filter((x) => x.type === "video").length;

  /* ════════════════════════════════ CSS */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .gl-page { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Back btn */
    .gl-btn-back { display: inline-flex; align-items: center; gap: 8px; color: #6B7280; font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 8px; background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s; margin-bottom: 16px; }
    .gl-btn-back:hover { background: #EAECF0; color: #1a1a1a; }

    /* Tabs */
    .gl-tabs { display: flex; gap: 6px; }
    .gl-tab { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 10px; font-size: 0.875rem; font-weight: 700; border: 1.5px solid #EAECF0; background: #fff; color: #6B7280; cursor: pointer; transition: all 0.18s; }
    .gl-tab.active { background: linear-gradient(135deg,#0D3B2E,#1A5C45); border-color: transparent; color: #fff; box-shadow: 0 4px 12px rgba(13,59,46,0.25); }
    .gl-tab-count { background: rgba(255,255,255,0.25); border-radius: 99px; font-size: 0.6875rem; padding: 1px 7px; font-weight: 800; }
    .gl-tab:not(.active) .gl-tab-count { background: #F0F2F5; color: #9AA3AF; }

    /* Upload zone */
    .gl-upload-zone { border: 2px dashed #EAECF0; border-radius: 16px; padding: 28px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: #FAFBFA; }
    .gl-upload-zone:hover, .gl-upload-zone.drag { border-color: #1A5C45; background: rgba(26,92,69,0.04); }
    .gl-upload-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#0D3B2E,#1A5C45); color: #fff; border: none; border-radius: 10px; padding: 9px 20px; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap; margin-top: 10px; }
    .gl-upload-btn:hover { box-shadow: 0 4px 14px rgba(13,59,46,0.3); transform: translateY(-1px); }
    .gl-upload-btn.secondary { background: #fff; color: #1A5C45; border: 1.5px solid #1A5C45; box-shadow: none; }
    .gl-upload-btn.secondary:hover { background: rgba(26,92,69,0.05); transform: none; }

    /* Staging batch */
    .gl-staging { border: 1.5px solid #E8F5E9; border-radius: 16px; background: #FAFFFE; padding: 16px; margin-bottom: 20px; }
    .gl-staging-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 14px; }
    .gl-staging-item { position: relative; border-radius: 10px; overflow: hidden; border: 1.5px solid #EAECF0; background: #F7F8FA; }
    .gl-staging-thumb { width: 100%; height: 100px; object-fit: cover; display: block; }
    .gl-staging-remove { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 99px; background: rgba(0,0,0,0.6); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
    .gl-staging-remove:hover { background: rgba(239,68,68,0.85); }
    .gl-staging-caption { width: 100%; padding: 5px 8px; border: none; background: #F0F2F5; font-size: 0.75rem; font-family: 'Plus Jakarta Sans', sans-serif; color: #344054; border-radius: 0 0 8px 8px; outline: none; }
    .gl-staging-caption:focus { background: #E8F5E9; }
    .gl-staging-actions { display: flex; align-items: center; justify-content: space-between; }
    .gl-save-all { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#0D3B2E,#1A5C45); color: #fff; border: none; border-radius: 10px; padding: 9px 20px; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
    .gl-save-all:disabled { opacity: 0.5; cursor: not-allowed; }
    .gl-save-all:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(13,59,46,0.25); }
    .gl-clear-all { background: none; border: none; color: #9AA3AF; font-size: 0.8125rem; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
    .gl-clear-all:hover { color: #EF4444; }

    /* Masonry grid */
    .gl-grid { columns: 4; column-gap: 12px; }
    @media (max-width: 1100px) { .gl-grid { columns: 3; } }
    @media (max-width: 768px)  { .gl-grid { columns: 2; } }
    .gl-item { break-inside: avoid; margin-bottom: 12px; border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; display: block; }
    .gl-item img, .gl-item .gl-vid-thumb { width: 100%; display: block; transition: transform 0.35s ease; border-radius: 12px; }
    .gl-item:hover img, .gl-item:hover .gl-vid-thumb { transform: scale(1.03); }
    .gl-item-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%); opacity: 0; transition: opacity 0.25s; border-radius: 12px; display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; }
    .gl-item:hover .gl-item-overlay { opacity: 1; }
    .gl-item-caption { color: #fff; font-size: 0.8125rem; font-weight: 600; line-height: 1.35; flex: 1; }
    .gl-item-actions { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
    .gl-ico-btn { width: 30px; height: 30px; border-radius: 8px; border: none; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
    .gl-ico-btn:hover { background: rgba(255,255,255,0.35); }
    .gl-ico-btn.danger:hover { background: rgba(239,68,68,0.75); }
    .gl-vid-thumb { position: relative; background: #0D3B2E; }
    .gl-play-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 44px; height: 44px; border-radius: 50%; background: rgba(201,168,76,0.9); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .gl-yt-badge { position: absolute; bottom: 6px; left: 6px; background: rgba(255,0,0,0.85); border-radius: 4px; padding: 1px 5px; font-size: 0.6rem; font-weight: 800; color: #fff; letter-spacing: 0.5px; }

    /* Empty state */
    .gl-empty { text-align: center; padding: 64px 24px; color: #C0C7D0; }
    .gl-empty-title { font-weight: 700; color: #9AA3AF; font-size: 1rem; margin: 14px 0 6px; }
    .gl-empty-sub { font-size: 0.875rem; }

    /* Video panel overlay */
    .gl-vp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1040; opacity: 0; transition: opacity 0.25s; pointer-events: none; }
    .gl-vp-overlay.open { opacity: 1; pointer-events: all; }
    .gl-vp-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(460px,100vw); background: #fff; z-index: 1041; transform: translateX(100%); transition: transform 0.3s cubic-bezier(.4,0,.2,1); display: flex; flex-direction: column; box-shadow: -12px 0 40px rgba(0,0,0,0.12); }
    .gl-vp-drawer.open { transform: translateX(0); }
    .gl-vp-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1.5px solid #F0F2F5; }
    .gl-vp-title { font-size: 1rem; font-weight: 800; color: #0D3B2E; }
    .gl-vp-close { width: 34px; height: 34px; border-radius: 8px; border: none; background: #F7F8FA; color: #6B7280; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .gl-vp-close:hover { background: #EAECF0; }
    .gl-vp-body { flex: 1; overflow-y: auto; padding: 22px 24px; }
    .gl-vp-foot { display: flex; gap: 10px; padding: 14px 24px; border-top: 1.5px solid #F0F2F5; }
    .gl-label { display: block; font-size: 0.875rem; font-weight: 700; color: #344054; margin-bottom: 6px; }
    .gl-hint  { font-size: 0.75rem; color: #9AA3AF; margin-top: 4px; }
    .gl-input { width: 100%; padding: 10px 13px; border: 1.5px solid #EAECF0; border-radius: 10px; font-size: 0.9375rem; color: #1a1a1a; background: #F7F8FA; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; box-sizing: border-box; }
    .gl-input:focus { border-color: #1A5C45; background: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }
    .gl-field { margin-bottom: 18px; }
    .gl-yt-preview { width: 100%; height: 160px; object-fit: cover; border-radius: 10px; display: block; margin-bottom: 8px; border: 1.5px solid #EAECF0; }
    .gl-cancel-btn { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #EAECF0; background: #fff; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
    .gl-vp-save { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg,#0D3B2E,#1A5C45); color: #fff; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 700; padding: 11px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
    .gl-vp-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .gl-vp-save:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(13,59,46,0.28); }

    /* Lightbox */
    .gl-lb { position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px; animation: glFadeIn 0.2s ease; }
    @keyframes glFadeIn { from{opacity:0} to{opacity:1} }
    .gl-lb-img { max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    .gl-lb-cap { color: rgba(255,255,255,0.75); font-size: 0.9rem; margin-top: 16px; text-align: center; max-width: 600px; font-family: 'Plus Jakarta Sans', sans-serif; }
    .gl-lb-close { position: fixed; top: 20px; right: 20px; width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.1); border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: background 0.15s; }
    .gl-lb-close:hover { background: rgba(255,255,255,0.2); }

    /* Delete modal */
    .gl-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 9100; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .gl-modal { background: #fff; border-radius: 16px; padding: 28px; max-width: 360px; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,0.18); }
    .gl-modal-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(239,68,68,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
    .gl-modal-title { font-size: 1rem; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; }
    .gl-modal-body { font-size: 0.875rem; color: #6B7280; margin-bottom: 20px; }
    .gl-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .gl-modal-cancel { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #EAECF0; background: #fff; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; }
    .gl-modal-del { padding: 9px 18px; border-radius: 10px; border: none; background: #EF4444; color: #fff; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; }
    .gl-modal-del:hover { background: #DC2626; }
    .gl-modal-del:disabled { opacity: 0.5; }

    /* Toast */
    .gl-toast { position: fixed; bottom: 28px; right: 28px; z-index: 9999; display: flex; align-items: center; gap: 9px; padding: 12px 20px; border-radius: 12px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: glUp 0.3s ease; font-family: 'Plus Jakarta Sans', sans-serif; }
    .gl-toast.success { background: #1A5C45; color: #fff; }
    .gl-toast.error   { background: #DC2626; color: #fff; }
    @keyframes glUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes glSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  `;

  const ytThumb = videoForm.url ? getYTThumb(videoForm.url) : null;

  return (
    <div className="gl-page">
      <style>{css}</style>

      <Link to="/app/content" className="gl-btn-back">
        <FaArrowLeft size={13} /> Kembali
      </Link>

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            Galeri Media
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            Kelola foto dan video dokumentasi kegiatan masjid.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="gl-upload-btn"
            onClick={() => fileRef.current?.click()}
          >
            <FaUpload size={12} /> Upload Foto
          </button>
          <button
            className="gl-upload-btn secondary"
            onClick={() => setVideoPanel(true)}
          >
            <FaYoutube size={12} /> Tambah Video
          </button>
        </div>
      </div>

      {/* Hidden file input — multi select */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ── Tabs ── */}
      <div className="gl-tabs mb-4">
        {TABS.map(({ key, label, emoji }) => {
          const count = key === "foto" ? fotoCount : videoCount;
          return (
            <button
              key={key}
              className={`gl-tab ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {emoji} {label}
              <span className="gl-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ════════ STAGING AREA (foto hanya) ════════ */}
      {stagingPhotos.length > 0 && activeTab === "foto" && (
        <div className="gl-staging">
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0D3B2E", marginBottom: 12 }}>
            📤 {stagingPhotos.length} foto siap diunggah — tambahkan keterangan (opsional):
          </div>
          <div className="gl-staging-grid">
            {stagingPhotos.map((s) => (
              <div key={s.id} className="gl-staging-item">
                <img src={s.preview} alt="" className="gl-staging-thumb" />
                <button className="gl-staging-remove" onClick={() => removeStagingPhoto(s.id)}>
                  <FaTimes size={8} />
                </button>
                <input
                  className="gl-staging-caption"
                  placeholder="Keterangan foto…"
                  value={s.caption}
                  onChange={(e) => updateStagingCaption(s.id, e.target.value)}
                  maxLength={80}
                />
              </div>
            ))}
          </div>
          <div className="gl-staging-actions">
            <button className="gl-clear-all" onClick={() => setStagingPhotos([])}>
              Batalkan semua
            </button>
            <div className="d-flex align-items-center gap-2">
              <button
                className="gl-upload-btn secondary"
                style={{ marginTop: 0, fontSize: "0.8125rem", padding: "7px 14px" }}
                onClick={() => fileRef.current?.click()}
              >
                <FaPlus size={10} /> Tambah Lagi
              </button>
              <button className="gl-save-all" onClick={savePhotos} disabled={saving}>
                {saving
                  ? <><FaSave size={12} style={{ animation: "glSpin 1s linear infinite" }} /> Menyimpan…</>
                  : <><FaSave size={12} /> Simpan {stagingPhotos.length} Foto</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ GALLERY GRID ════════ */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ borderRadius: 12, height: i % 3 === 0 ? 200 : 150, background: "linear-gradient(90deg,#F0F2F5 25%,#E8EAED 50%,#F0F2F5 75%)", backgroundSize: "1200px", animation: "glUp 1.4s infinite" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="gl-empty">
          {activeTab === "foto" ? (
            <div
              className={`gl-upload-zone ${uploadDragging ? "drag" : ""}`}
              style={{ maxWidth: 480, margin: "0 auto" }}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setUploadDragging(true); }}
              onDragLeave={() => setUploadDragging(false)}
              onDrop={handleDrop}
            >
              <FaImage size={36} style={{ color: "#C0C7D0", marginBottom: 12 }} />
              <div className="gl-empty-title">Belum ada foto</div>
              <div className="gl-empty-sub">Klik atau seret foto ke sini untuk mengunggah</div>
              <div style={{ fontSize: "0.75rem", color: "#B8BFCA", marginTop: 6 }}>JPG, PNG, WEBP · Maks. 5 MB per file</div>
              <button className="gl-upload-btn">
                <FaUpload size={11} /> Pilih Foto
              </button>
            </div>
          ) : (
            <div className="gl-empty">
              <FaYoutube size={42} />
              <div className="gl-empty-title">Belum ada video</div>
              <div className="gl-empty-sub">Tambahkan link YouTube untuk menampilkan video di website.</div>
              <button className="gl-upload-btn" style={{ marginTop: 14 }} onClick={() => setVideoPanel(true)}>
                <FaYoutube size={12} /> Tambah Video
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Drop zone hint for foto tab (above grid) */}
          {activeTab === "foto" && (
            <div
              className={`gl-upload-zone ${uploadDragging ? "drag" : ""}`}
              style={{ marginBottom: 16, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setUploadDragging(true); }}
              onDragLeave={() => setUploadDragging(false)}
              onDrop={handleDrop}
            >
              <FaUpload size={16} style={{ color: "#9AA3AF", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#6B7280" }}>Seret foto ke sini atau klik untuk memilih</div>
                <div style={{ fontSize: "0.75rem", color: "#9AA3AF" }}>JPG, PNG, WEBP · Bisa pilih lebih dari satu · Maks. 5 MB per file</div>
              </div>
            </div>
          )}
          <div className="gl-grid">
            {filtered.map((item) => {
              const isVideo = item.type === "video";
              const thumb = isVideo ? getYTThumb(item.url) : item.url;
              return (
                <div key={item.id} className="gl-item" onClick={() => setLightbox(item)}>
                  <img src={thumb} alt={item.caption || ""} onError={(e) => (e.target.style.opacity = 0.3)} />
                  {isVideo && (
                    <>
                      <div className="gl-play-badge"><FaPlay size={16} /></div>
                      <div className="gl-yt-badge">YT</div>
                    </>
                  )}
                  <div className="gl-item-overlay" onClick={(e) => e.stopPropagation()}>
                    {item.caption && <div className="gl-item-caption">{item.caption}</div>}
                    <div className="gl-item-actions">
                      <button className="gl-ico-btn" title="Lihat penuh" onClick={(e) => { e.stopPropagation(); setLightbox(item); }}>
                        <FaExpand size={11} />
                      </button>
                      <button className="gl-ico-btn danger" title="Hapus" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }}>
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══════ VIDEO DRAWER ══════ */}
      <div className={`gl-vp-overlay ${videoPanel ? "open" : ""}`} onClick={() => setVideoPanel(false)} />
      <div className={`gl-vp-drawer ${videoPanel ? "open" : ""}`}>
        <div className="gl-vp-head">
          <div className="gl-vp-title">🎬 Tambah Video YouTube</div>
          <button className="gl-vp-close" onClick={() => setVideoPanel(false)}><FaTimes size={13} /></button>
        </div>
        <div className="gl-vp-body">
          <div className="gl-field">
            <label className="gl-label">Link YouTube <span style={{ color: "#EF4444" }}>*</span></label>
            <input
              className="gl-input"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoForm.url}
              onChange={(e) => setVideoForm((p) => ({ ...p, url: e.target.value }))}
            />
            <p className="gl-hint">Tempel link YouTube, Shorts, atau Embed link.</p>
          </div>
          {ytThumb && (
            <div className="gl-field">
              <img src={ytThumb} alt="yt preview" className="gl-yt-preview" />
            </div>
          )}
          <div className="gl-field">
            <label className="gl-label">Keterangan / Caption</label>
            <input
              className="gl-input"
              type="text"
              placeholder="Contoh: Khutbah Idul Fitri 1446 H"
              value={videoForm.caption}
              onChange={(e) => setVideoForm((p) => ({ ...p, caption: e.target.value }))}
              maxLength={100}
            />
          </div>
          {/* Info */}
          <div style={{ background: "rgba(26,92,69,0.05)", border: "1px solid rgba(26,92,69,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: "0.8125rem", color: "#1A5C45", fontWeight: 600 }}>
            📌 Video akan tampil sebagai thumbnail di website dengan ikon play di tengah.
          </div>
        </div>
        <div className="gl-vp-foot">
          <button className="gl-cancel-btn" onClick={() => setVideoPanel(false)}>Batal</button>
          <button className="gl-vp-save" onClick={saveVideo} disabled={savingVideo || !videoForm.url.trim()}>
            {savingVideo ? "Menyimpan…" : <><FaSave size={13} /> Simpan Video</>}
          </button>
        </div>
      </div>

      {/* ══════ LIGHTBOX ══════ */}
      {lightbox && (
        <div className="gl-lb" onClick={() => setLightbox(null)}>
          <button className="gl-lb-close" onClick={() => setLightbox(null)}><FaTimes /></button>
          {lightbox.type === "video" ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYTId(lightbox.url)}?autoplay=1`}
              style={{ width: "min(900px, 90vw)", height: "min(506px, 55vh)", borderRadius: 10, border: "none" }}
              allow="autoplay; fullscreen"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightbox.url}
              alt={lightbox.caption}
              className="gl-lb-img"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {lightbox.caption && <div className="gl-lb-cap">{lightbox.caption}</div>}
        </div>
      )}

      {/* ══════ DELETE CONFIRM ══════ */}
      {deleteConfirm && (
        <div className="gl-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="gl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gl-modal-icon">
              <FaTrash size={18} style={{ color: "#EF4444" }} />
            </div>
            <div className="gl-modal-title">Hapus {deleteConfirm.type === "video" ? "Video" : "Foto"}?</div>
            <div className="gl-modal-body">
              {deleteConfirm.caption
                ? `"${deleteConfirm.caption}" akan dihapus secara permanen.`
                : "Item ini akan dihapus secara permanen."}
            </div>
            <div className="gl-modal-actions">
              <button className="gl-modal-cancel" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="gl-modal-del" onClick={handleDelete} disabled={!!deleting}>
                {deleting ? "Menghapus…" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`gl-toast ${toast.type}`}>
          {toast.type === "success" ? <FaCheckCircle size={13} /> : <FaExclamationCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default GalleryList;
