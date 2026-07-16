import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave,
  FaCheckCircle, FaExclamationCircle, FaNewspaper, FaImage,
  FaEye, FaEyeSlash, FaUser, FaCalendarAlt, FaAlignLeft, FaArrowLeft,
} from "react-icons/fa";
import { postService } from "../../../services/apiClient";

/* ════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════ */

const EMPTY_FORM = {
  title: "", author: "", category: "", date: "", excerpt: "", content: "",
  image: "", imageFile: null, is_published: true,
};

/* ── helpers ── */
const fmtDate = (d) => {
  if (!d) return "-";
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
};

const truncate = (str, n = 90) =>
  str && str.length > n ? str.slice(0, n) + "…" : (str || "");

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
const ArticleList = () => {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");

  const [panel,      setPanel]      = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [toast,      setToast]      = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [imgPreview, setImgPreview] = useState("");
  const [imgDragging, setImgDragging] = useState(false);

  const titleRef    = useRef(null);
  const fileRef     = useRef(null);
  const panelRef    = useRef(null);

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postService.getPosts();
      const loaded = res.data?.data || [];
      setList(
        loaded
          .filter((p) => p.type === "berita")
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      );
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Close drawer on Escape ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && panel) closePanel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  /* ── Toast helper ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Panel ── */
  const openAdd = () => {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
    setEditId(null);
    setImgPreview("");
    setPanel(true);
    setTimeout(() => titleRef.current?.focus(), 150);
  };

  const openEdit = (item) => {
    setForm({
      title:       item.title      || "",
      author:      item.author     || "",
      category:    item.category   || "",
      date:        item.article_date || item.date || "",
      excerpt:     item.excerpt    || "",
      content:     item.content    || "",
      image:       item.image      || "",
      imageFile:   null,
      is_published: item.status ? item.status === "published" : (item.is_published !== false),
    });
    setImgPreview(item.image || "");
    setEditId(item.id);
    setPanel(true);
    setTimeout(() => titleRef.current?.focus(), 150);
  };

  const closePanel = () => {
    setPanel(false);
    setTimeout(() => { setForm(EMPTY_FORM); setEditId(null); setImgPreview(""); }, 300);
  };

  /* ── Image handling ── */
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast("error", "Ukuran gambar maksimal 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result;
      setImgPreview(b64);
      setForm((p) => ({ ...p, image: b64, imageFile: file }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processImageFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setImgDragging(false);
    processImageFile(e.dataTransfer.files[0]);
  };
  const clearImage = () => {
    setImgPreview("");
    setForm((p) => ({ ...p, image: "", imageFile: null }));
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast("error", "Judul tidak boleh kosong.");
      titleRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type:         "berita",
        title:        form.title.trim(),
        author:       form.author.trim(),
        category:     form.category.trim(),
        article_date: form.date,
        excerpt:      form.excerpt.trim(),
        content:      form.content.trim(),
        cover_image:  form.imageFile,
        is_published: form.is_published,
      };
      if (editId) {
        await postService.updatePost(editId, payload);
        showToast("success", "Berita berhasil diperbarui!");
      } else {
        await postService.createPost(payload);
        showToast("success", "Berita berhasil dibuat!");
      }
      closePanel();
      load();
    } catch (e) {
      console.error(e);
      showToast("error", "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const confirmDelete = (item) => setDeleteConfirm(item);
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(deleteConfirm.id);
    try {
      await postService.deletePost(deleteConfirm.id);
      setList((p) => p.filter((x) => x.id !== deleteConfirm.id));
      showToast("success", "Dihapus.");
    } catch (e) {
      showToast("error", "Gagal menghapus.");
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  /* ── Toggle publish ── */
  const togglePublish = async (item) => {
    const currentlyPublished = item.status === "published";
    try {
      await postService.updatePost(item.id, { is_published: !currentlyPublished });
      await load();
      showToast("success", currentlyPublished ? "Berita dijadikan draft." : "Berita berhasil ditayangkan!");
    } catch (e) {
      const msg = e.response?.data?.message || "Gagal mengubah status.";
      showToast("error", msg);
    }
  };

  /* ── Filtered list ── */
  const filtered = list.filter(
    (x) => x.type === "berita" &&
      (!search || x.title?.toLowerCase().includes(search.toLowerCase()) ||
        x.author?.toLowerCase().includes(search.toLowerCase()))
  );

  /* ════════════════════════════════════════════════ CSS */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .al-page { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Back btn */
    .al-btn-back { display: inline-flex; align-items: center; gap: 8px; color: #6B7280; font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 8px; background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s; margin-bottom: 16px; }
    .al-btn-back:hover { background: #EAECF0; color: #1a1a1a; }



    /* Search bar */
    .al-search-wrap { position: relative; flex: 1; max-width: 300px; }
    .al-search { width: 100%; padding: 9px 14px 9px 36px; border: 1.5px solid #EAECF0; border-radius: 10px; font-size: 0.875rem; color: #1a1a1a; background: #F7F8FA; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; }
    .al-search:focus { border-color: #1A5C45; background: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }
    .al-search-ico { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9AA3AF; pointer-events: none; }

    /* Add button */
    .al-add-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#0D3B2E,#1A5C45); color: #fff; border: none; border-radius: 10px; padding: 9px 20px; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap; }
    .al-add-btn:hover { box-shadow: 0 4px 14px rgba(13,59,46,0.3); transform: translateY(-1px); }

    /* Card grid */
    .al-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 16px; }
    .al-card { background: #fff; border: 1.5px solid #EAECF0; border-radius: 16px; overflow: hidden; transition: all 0.22s; display: flex; flex-direction: column; }
    .al-card:hover { border-color: #C9CDD4; box-shadow: 0 8px 28px rgba(0,0,0,0.07); transform: translateY(-2px); }
    .al-card-img { width: 100%; height: 160px; object-fit: cover; background: linear-gradient(135deg,#F0F7F4,#E8F5E9); }
    .al-card-img-placeholder { width: 100%; height: 160px; background: linear-gradient(135deg,#F7F8FA,#EAECF0); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 6px; color: #C0C7D0; }
    .al-card-body { padding: 14px 16px; flex: 1; display: flex; flex-direction: column; }
    .al-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .al-badge { font-size: 0.625rem; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; padding: 3px 8px; border-radius: 99px; }
    .al-badge.pub { background: rgba(26,92,69,0.1); color: #1A5C45; }
    .al-badge.draft { background: rgba(201,168,76,0.12); color: #A88330; }
    .al-card-date { font-size: 0.75rem; color: #9AA3AF; }
    .al-card-title { font-size: 0.9375rem; font-weight: 800; color: #1a1a1a; line-height: 1.4; margin-bottom: 6px; }
    .al-card-excerpt { font-size: 0.8125rem; color: #6B7280; line-height: 1.6; flex: 1; }
    .al-card-author { font-size: 0.75rem; color: #9AA3AF; margin-top: 10px; display: flex; align-items: center; gap: 5px; }
    .al-card-actions { display: flex; align-items: center; justify-content: flex-end; gap: 4px; padding: 10px 14px; border-top: 1px solid #F5F6F8; }
    .al-action-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #9AA3AF; cursor: pointer; transition: all 0.15s; }
    .al-action-btn:hover { background: #F7F8FA; color: #1a1a1a; }
    .al-action-btn.danger:hover { background: rgba(239,68,68,0.08); color: #EF4444; }
    .al-action-btn.pub-btn:hover { background: rgba(26,92,69,0.08); color: #1A5C45; }
    .al-action-btn.edit-btn:hover { background: rgba(201,168,76,0.1); color: #A88330; }

    /* Skeleton */
    @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
    .al-sk { border-radius: 10px; background: linear-gradient(90deg,#F0F2F5 25%,#E8EAED 50%,#F0F2F5 75%); background-size: 1200px; animation: shimmer 1.4s infinite; }

    /* Empty state */
    .al-empty { text-align: center; padding: 64px 24px; color: #C0C7D0; }
    .al-empty-title { font-weight: 700; color: #9AA3AF; font-size: 1rem; margin: 12px 0 6px; }
    .al-empty-sub { font-size: 0.875rem; }

    /* ── Slide-in Drawer ── */
    .al-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1040; opacity: 0; transition: opacity 0.25s; pointer-events: none; }
    .al-overlay.open { opacity: 1; pointer-events: all; }
    .al-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(580px, 100vw); background: #fff; box-shadow: -12px 0 40px rgba(0,0,0,0.12); z-index: 1041; transform: translateX(100%); transition: transform 0.3s cubic-bezier(.4,0,.2,1); display: flex; flex-direction: column; }
    .al-drawer.open { transform: translateX(0); }
    .al-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1.5px solid #F0F2F5; flex-shrink: 0; }
    .al-drawer-title { font-size: 1.0625rem; font-weight: 800; color: #0D3B2E; }
    .al-drawer-close { width: 34px; height: 34px; border-radius: 8px; border: none; background: #F7F8FA; color: #6B7280; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .al-drawer-close:hover { background: #EAECF0; color: #1a1a1a; }
    .al-drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
    .al-drawer-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 14px 24px; border-top: 1.5px solid #F0F2F5; flex-shrink: 0; }

    /* Form fields */
    .al-label { display: block; font-size: 0.875rem; font-weight: 700; color: #344054; margin-bottom: 6px; }
    .al-hint  { font-size: 0.75rem; color: #9AA3AF; margin-top: 4px; }
    .al-field { margin-bottom: 18px; }
    .al-input { width: 100%; padding: 10px 13px; border: 1.5px solid #EAECF0; border-radius: 10px; font-size: 0.9375rem; color: #1a1a1a; background: #F7F8FA; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; box-sizing: border-box; }
    .al-input:focus { border-color: #1A5C45; background: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }
    .al-input.error { border-color: #EF4444; }
    .al-textarea { resize: vertical; min-height: 90px; }
    .al-textarea-tall { min-height: 160px; }

    /* Image upload zone */
    .al-upload-zone { border: 2px dashed #EAECF0; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: #FAFBFA; }
    .al-upload-zone:hover, .al-upload-zone.drag { border-color: #1A5C45; background: rgba(26,92,69,0.04); }
    .al-upload-zone.has-img { border-style: solid; border-color: #1A5C45; padding: 0; overflow: hidden; position: relative; }
    .al-upload-preview { width: 100%; height: 180px; object-fit: cover; display: block; }
    .al-upload-remove { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 99px; background: rgba(0,0,0,0.55); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
    .al-upload-remove:hover { background: rgba(239,68,68,0.85); }

    /* Type toggle */
    .al-type-row { display: flex; gap: 8px; }
    .al-type-opt { flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #EAECF0; cursor: pointer; font-size: 0.875rem; font-weight: 700; color: #6B7280; transition: all 0.18s; }
    .al-type-opt.active { border-color: #1A5C45; background: rgba(26,92,69,0.06); color: #0D3B2E; }

    /* Publish toggle row — identik dengan KajianList/ProgramList */
    .al-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 15px; background: #F7F8FA; border-radius: 10px; border: 1.5px solid #EAECF0; cursor: pointer; transition: border-color 0.18s; margin-bottom: 18px; }
    .al-toggle-row:hover { border-color: #1A5C45; }
    .al-toggle-row.on { border-color: rgba(26,92,69,0.3); background: rgba(26,92,69,0.04); }
    .al-sw { width: 38px; height: 21px; border-radius: 20px; position: relative; transition: background 0.2s; flex-shrink: 0; }
    .al-sw.on  { background: #1A5C45; }
    .al-sw.off { background: #D0D5DD; }
    .al-sw::after { content:''; position:absolute; top:3px; width:15px; height:15px; border-radius:50%; background:#fff; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
    .al-sw.on::after  { left: 20px; }
    .al-sw.off::after { left: 3px; }

    /* Drawer save / cancel btns */
    .al-cancel-btn { padding: 9px 20px; border-radius: 10px; border: 1.5px solid #EAECF0; background: #fff; font-size: 0.875rem; font-weight: 700; color: #6B7280; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
    .al-cancel-btn:hover { background: #F7F8FA; }
    .al-save-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#0D3B2E,#1A5C45); color: #fff; border: none; border-radius: 10px; padding: 9px 24px; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
    .al-save-btn:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(13,59,46,0.28); }
    .al-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Delete confirm modal */
    .al-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1060; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .al-modal { background: #fff; border-radius: 16px; padding: 28px; max-width: 380px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.18); font-family: 'Plus Jakarta Sans', sans-serif; }
    .al-modal-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(239,68,68,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .al-modal-title { font-size: 1rem; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; }
    .al-modal-body { font-size: 0.875rem; color: #6B7280; line-height: 1.6; margin-bottom: 20px; }
    .al-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .al-modal-cancel { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #EAECF0; background: #fff; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; }
    .al-modal-del { padding: 9px 18px; border-radius: 10px; border: none; background: #EF4444; color: #fff; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.15s; }
    .al-modal-del:hover { background: #DC2626; }
    .al-modal-del:disabled { opacity: 0.5; }

    /* Toast */
    .al-toast { position: fixed; bottom: 28px; right: 28px; z-index: 9999; display: flex; align-items: center; gap: 9px; padding: 12px 20px; border-radius: 12px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: alUp 0.3s ease; font-family: 'Plus Jakarta Sans', sans-serif; }
    .al-toast.success { background: #1A5C45; color: #fff; }
    .al-toast.error   { background: #DC2626; color: #fff; }
    @keyframes alUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes spin  { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  `;

  return (
    <div className="al-page">
      <style>{css}</style>

      <Link to="/app/content" className="al-btn-back">
        <FaArrowLeft size={13} /> Kembali
      </Link>

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            Berita Masjid
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            Buat dan kelola berita terkini seputar masjid.
          </p>
        </div>
        <button className="al-add-btn" onClick={openAdd}>
          <FaPlus size={12} />
          Tulis Berita
        </button>
      </div>

      {/* ── Search ── */}
      <div className="d-flex align-items-center justify-content-end flex-wrap gap-3 mb-4">
        <div className="al-search-wrap">
          <FaSearch size={12} className="al-search-ico" />
          <input
            className="al-search"
            placeholder="Cari judul atau penulis…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="al-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: "#fff", border: "1.5px solid #EAECF0", borderRadius: 16, overflow: "hidden" }}>
              <div className="al-sk" style={{ height: 160 }} />
              <div style={{ padding: 16 }}>
                <div className="al-sk" style={{ height: 9, width: "40%", marginBottom: 10 }} />
                <div className="al-sk" style={{ height: 14, width: "85%", marginBottom: 8 }} />
                <div className="al-sk" style={{ height: 9, width: "70%", marginBottom: 16 }} />
                <div className="al-sk" style={{ height: 9, width: "45%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="al-empty">
          <FaNewspaper size={42} />
          <div className="al-empty-title">
            {search ? "Tidak ditemukan" : "Belum ada berita"}
          </div>
          <div className="al-empty-sub">
            {search
              ? `Tulis berita pertama Anda!`
              : `Klik "Tulis Berita" untuk mulai membuat konten baru.`}
          </div>
        </div>
      ) : (
        <div className="al-grid">
          {filtered.map((item) => (
            <div key={item.id} className="al-card">
              {item.image ? (
                <img src={item.image} alt={item.title} className="al-card-img" />
              ) : (
                <div className="al-card-img-placeholder">
                  <FaImage size={28} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Tidak ada gambar</span>
                </div>
              )}
              <div className="al-card-body">
                <div className="al-card-meta">
                  <span className={`al-badge ${item.status === "published" ? "pub" : "draft"}`}>
                    {item.status === "published" ? "✓ Tayang" : "○ Draft"}
                  </span>
                  {item.date && (
                    <span className="al-card-date">
                      <FaCalendarAlt size={9} style={{ marginRight: 4, verticalAlign: "middle" }} />
                      {fmtDate(item.date)}
                    </span>
                  )}
                </div>
                <div className="al-card-title">{item.title}</div>
                {item.excerpt && (
                  <div className="al-card-excerpt">{truncate(item.excerpt)}</div>
                )}
                {item.author && (
                  <div className="al-card-author">
                    <FaUser size={9} /> {item.author}
                  </div>
                )}
              </div>
              <div className="al-card-actions">
                <button
                  className="al-action-btn pub-btn"
                  title={item.status === "published" ? "Jadikan Draft" : "Tayangkan"}
                  onClick={() => togglePublish(item)}
                >
                  {item.status === "published" ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
                <button
                  className="al-action-btn edit-btn"
                  title="Edit"
                  onClick={() => openEdit(item)}
                >
                  <FaEdit size={13} />
                </button>
                <button
                  className="al-action-btn danger"
                  title="Hapus"
                  onClick={() => confirmDelete(item)}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════ SLIDE-IN DRAWER ══════════════════════ */}
      <div className={`al-overlay ${panel ? "open" : ""}`} onClick={closePanel} />
      <div ref={panelRef} className={`al-drawer ${panel ? "open" : ""}`}>

        {/* Header */}
        <div className="al-drawer-header">
          <div className="al-drawer-title">
            {editId ? "Edit" : "Tulis"} Berita
          </div>
          <button className="al-drawer-close" onClick={closePanel}><FaTimes size={14} /></button>
        </div>

        {/* Body */}
        <div className="al-drawer-body">



          {/* Judul */}
          <div className="al-field">
            <label className="al-label">
              Judul <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              ref={titleRef}
              className="al-input"
              type="text"
              placeholder="Masukkan judul yang menarik…"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          {/* Gambar */}
          <div className="al-field">
            <label className="al-label">Gambar Utama</label>
            <input
              ref={fileRef} type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {imgPreview ? (
              <div className="al-upload-zone has-img">
                <img src={imgPreview} alt="preview" className="al-upload-preview" />
                <button className="al-upload-remove" onClick={clearImage} title="Hapus gambar">
                  <FaTimes size={10} />
                </button>
              </div>
            ) : (
              <div
                className={`al-upload-zone ${imgDragging ? "drag" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setImgDragging(true); }}
                onDragLeave={() => setImgDragging(false)}
                onDrop={handleDrop}
              >
                <FaImage size={22} style={{ color: "#C0C7D0", marginBottom: 8 }} />
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#6B7280" }}>
                  Klik atau seret gambar ke sini
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9AA3AF", marginTop: 4 }}>
                  JPG, PNG, WEBP · Maks. 3 MB
                </div>
              </div>
            )}
            <p className="al-hint">Gambar tampil sebagai thumbnail di halaman website.</p>
          </div>

          {/* Row: Penulis, Kategori, Tanggal */}
          <div className="row g-3 mb-3">
            <div className="col-4">
              <label className="al-label">Penulis</label>
              <input
                className="al-input"
                type="text"
                placeholder="Nama penulis"
                value={form.author}
                onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
              />
            </div>
            <div className="col-4">
              <label className="al-label">Kategori</label>
              <input
                className="al-input"
                type="text"
                placeholder="Kategori berita"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              />
            </div>
            <div className="col-4">
              <label className="al-label">Tanggal</label>
              <input
                className="al-input"
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
          </div>

          {/* Ringkasan */}
          <div className="al-field">
            <label className="al-label">Ringkasan</label>
            <textarea
              className={`al-input al-textarea`}
              rows={3}
              placeholder="Tulis ringkasan singkat (2–3 kalimat) yang tampil di card website…"
              value={form.excerpt}
              onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
            />
            <p className="al-hint">Tampil sebagai deskripsi di card berita.</p>
          </div>

          {/* Isi Konten */}
          <div className="al-field">
            <label className="al-label">Isi Konten</label>
            <textarea
              className={`al-input al-textarea al-textarea-tall`}
              rows={8}
              placeholder="Tulis isi berita di sini…"
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            />
          </div>

          {/* Publish toggle — same style as KajianList/ProgramList */}
          <div
            className={`al-toggle-row ${form.is_published ? "on" : ""}`}
            onClick={() => setForm((p) => ({ ...p, is_published: !p.is_published }))}
          >
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1a1a" }}>
                {form.is_published ? "🌐 Tayang di Website" : "📝 Simpan sebagai Draft"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9AA3AF", marginTop: 1 }}>
                {form.is_published ? "Konten tampil di halaman publik." : "Hanya tersimpan, belum tampil di website."}
              </div>
            </div>
            <div className={`al-sw ${form.is_published ? "on" : "off"}`} />
          </div>

        </div>{/* end drawer-body */}

        {/* Footer */}
        <div className="al-drawer-footer">
          <button className="al-cancel-btn" onClick={closePanel}>Batal</button>
          <button className="al-save-btn" onClick={handleSave} disabled={saving}>
            {saving
              ? <><FaSave size={13} style={{ animation: "spin 1s linear infinite" }} /> Menyimpan…</>
              : <><FaSave size={13} /> {editId ? "Perbarui" : "Simpan"}</>}
          </button>
        </div>
      </div>

      {/* ══════════════════════ DELETE CONFIRM ══════════════════════ */}
      {deleteConfirm && (
        <div className="al-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="al-modal" onClick={(e) => e.stopPropagation()}>
            <div className="al-modal-icon">
              <FaTrash size={18} style={{ color: "#EF4444" }} />
            </div>
            <div className="al-modal-title">Hapus Berita?</div>
            <div className="al-modal-body">
              "<strong>{deleteConfirm.title}</strong>" akan dihapus secara permanen dan tidak bisa dikembalikan.
            </div>
            <div className="al-modal-actions">
              <button className="al-modal-cancel" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="al-modal-del" onClick={handleDelete} disabled={!!deleting}>
                {deleting ? "Menghapus…" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`al-toast ${toast.type}`}>
          {toast.type === "success"
            ? <FaCheckCircle size={13} />
            : <FaExclamationCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ArticleList;
