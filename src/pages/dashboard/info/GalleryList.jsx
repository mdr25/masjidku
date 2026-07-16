import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus, FaTrash, FaTimes, FaImage,
  FaCheckCircle, FaExclamationCircle, FaExpand,
  FaUpload, FaSave, FaArrowLeft,
} from "react-icons/fa";
import { postService } from "../../../services/apiClient";

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
const GalleryList = () => {
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const [lightbox,    setLightbox]    = useState(null); // url string
  const [deleteConfirm, setDeleteConfirm] = useState(null); // url string
  const [deleting,    setDeleting]    = useState(false);

  // Gallery Data
  const [galleryPostId, setGalleryPostId] = useState(null);
  const [gallery, setGallery] = useState([]); // array of strings (paths)

  // Foto upload state
  const [stagingPhotos, setStagingPhotos] = useState([]); // [{id, file, preview}]
  const [uploadDragging, setUploadDragging] = useState(false);
  const [saving,       setSaving]     = useState(false);

  const fileRef  = useRef(null);

  /* ── Fetch Initial Data ── */
  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postService.getPosts("gallery");
      const posts = res.data?.data || [];
      if (posts.length > 0) {
        const mainPost = posts[0];
        setGalleryPostId(mainPost.id);
        setGallery(mainPost.gallery_images || []);
      } else {
        // Auto create a gallery post if it doesn't exist
        try {
          const createRes = await postService.createPost({
            type: "gallery",
            title: "Galeri Masjid",
            is_published: 1,
          });
          const newId = createRes.data?.data?.id;
          if (newId) {
            setGalleryPostId(newId);
            setGallery([]);
          } else {
            console.error("Gallery post created but no ID returned", createRes);
            showToast("error", "Gagal membuat container galeri.");
          }
        } catch (createErr) {
          console.error("Failed to create gallery post", createErr);
          showToast("error", "Gagal membuat container galeri: " + (createErr.response?.data?.message || createErr.message));
        }
      }
    } catch (err) {
      console.error("Failed to load gallery", err);
      showToast("error", "Gagal memuat data galeri.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  /* ── Get Full URL ── */
  // Since backend returns "gallery/xxx.jpg", we prepend the storage URL
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("data:") || path.startsWith("blob:")) return path;
    
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
    const baseUrl = apiUrl.replace(/\/api$/, "");
    
    if (path.startsWith("http") && path.includes("/storage/")) {
      try {
        const storageIndex = path.indexOf("/storage/");
        path = path.substring(storageIndex);
      } catch (e) {}
    }
    
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
          { id: Date.now() + Math.random(), file, preview: e.target.result },
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

  const savePhotos = async () => {
    if (!stagingPhotos.length) return;
    if (!galleryPostId) {
      showToast("error", "Container galeri belum siap. Coba refresh halaman.");
      return;
    }
    setSaving(true);
    
    try {
      const fd = new FormData();
      stagingPhotos.forEach((s) => {
        fd.append("gallery_images[]", s.file);
      });

      await postService.addGalleryImages(galleryPostId, fd);
      await fetchGallery();
      setStagingPhotos([]);
      showToast("success", `${stagingPhotos.length} foto berhasil ditambahkan!`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Gagal mengunggah foto.";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  /* ════════════════════════════════
     DELETE
  ════════════════════════════════ */
  const handleDelete = async () => {
    if (!deleteConfirm || !galleryPostId) return;
    setDeleting(true);
    try {
      await postService.removeGalleryImage(galleryPostId, deleteConfirm);
      await fetchGallery();
      showToast("success", "Gambar berhasil dihapus.");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Gagal menghapus gambar.";
      showToast("error", msg);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  /* ════════════════════════════════ CSS */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .gl-page { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Back btn */
    .gl-btn-back { display: inline-flex; align-items: center; gap: 8px; color: #6B7280; font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 8px; background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s; margin-bottom: 16px; }
    .gl-btn-back:hover { background: #EAECF0; color: #1a1a1a; }

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
    .gl-item img { width: 100%; display: block; transition: transform 0.35s ease; border-radius: 12px; }
    .gl-item:hover img { transform: scale(1.03); }
    .gl-item-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%); opacity: 0; transition: opacity 0.25s; border-radius: 12px; display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; }
    .gl-item:hover .gl-item-overlay { opacity: 1; }
    .gl-item-actions { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 100%; }
    .gl-ico-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: rgba(255,255,255,0.25); backdrop-filter: blur(4px); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
    .gl-ico-btn:hover { background: rgba(255,255,255,0.4); }
    .gl-ico-btn.danger:hover { background: rgba(239,68,68,0.85); }

    /* Empty state */
    .gl-empty { text-align: center; padding: 64px 24px; color: #C0C7D0; }
    .gl-empty-title { font-weight: 700; color: #9AA3AF; font-size: 1rem; margin: 14px 0 6px; }
    .gl-empty-sub { font-size: 0.875rem; }

    /* Lightbox */
    .gl-lb { position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px; animation: glFadeIn 0.2s ease; }
    @keyframes glFadeIn { from{opacity:0} to{opacity:1} }
    .gl-lb-img { max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
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
            Kelola foto dokumentasi kegiatan masjid (tanpa caption).
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="gl-upload-btn"
            onClick={() => fileRef.current?.click()}
          >
            <FaUpload size={12} /> Upload Foto
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

      {/* ════════ STAGING AREA ════════ */}
      {stagingPhotos.length > 0 && (
        <div className="gl-staging">
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0D3B2E", marginBottom: 12 }}>
            📤 {stagingPhotos.length} foto siap diunggah:
          </div>
          <div className="gl-staging-grid">
            {stagingPhotos.map((s) => (
              <div key={s.id} className="gl-staging-item">
                <img src={s.preview} alt="" className="gl-staging-thumb" style={{ height: 120 }} />
                <button className="gl-staging-remove" onClick={() => removeStagingPhoto(s.id)}>
                  <FaTimes size={8} />
                </button>
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
      ) : gallery.length === 0 ? (
        <div className="gl-empty">
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
        </div>
      ) : (
        <>
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
          <div className="gl-grid">
            {gallery.map((path, idx) => {
              const fullUrl = getFullUrl(path);
              return (
                <div key={idx} className="gl-item" onClick={() => setLightbox(fullUrl)}>
                  <img src={fullUrl} alt="Gallery" onError={(e) => (e.target.style.opacity = 0.3)} />
                  <div className="gl-item-overlay" onClick={(e) => e.stopPropagation()}>
                    <div className="gl-item-actions">
                      <button className="gl-ico-btn" title="Lihat penuh" onClick={(e) => { e.stopPropagation(); setLightbox(fullUrl); }}>
                        <FaExpand size={16} />
                      </button>
                      <button className="gl-ico-btn danger" title="Hapus" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(path); }}>
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══════ LIGHTBOX ══════ */}
      {lightbox && (
        <div className="gl-lb" onClick={() => setLightbox(null)}>
          <button className="gl-lb-close" onClick={() => setLightbox(null)}><FaTimes /></button>
          <img
            src={lightbox}
            alt="Fullscreen"
            className="gl-lb-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ══════ DELETE CONFIRM ══════ */}
      {deleteConfirm && (
        <div className="gl-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="gl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gl-modal-icon">
              <FaTrash size={18} style={{ color: "#EF4444" }} />
            </div>
            <div className="gl-modal-title">Hapus Foto?</div>
            <div className="gl-modal-body">
              Foto ini akan dihapus secara permanen dari server.
            </div>
            <div className="gl-modal-actions">
              <button className="gl-modal-cancel" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="gl-modal-del" onClick={handleDelete} disabled={deleting}>
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
