import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave,
  FaCheckCircle, FaExclamationCircle, FaBook, FaEye, FaEyeSlash, FaImage, FaArrowLeft
} from "react-icons/fa";

import { postService } from "../../../services/apiClient";

/* ── Helpers ── */
const getJakartaNow = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return new Date(`${map.year}-${map.month.padStart(2, '0')}-${map.day.padStart(2, '0')}T${map.hour.padStart(2, '0')}:${map.minute.padStart(2, '0')}:${map.second.padStart(2, '0')}`);
};

const getKajianDate = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const time = timeStr ? timeStr : "23:59:59";
  return new Date(`${dateStr}T${time}`);
};

const isPast = (dateStr, timeStr) => {
  const eventDate = getKajianDate(dateStr, timeStr);
  if (!eventDate) return false;
  const nowJakarta = getJakartaNow();
  return eventDate < nowJakarta;
};

const fmtDate = (d) => {
  if (!d) return "-";
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
};
const fmtTime = (t) => {
  if (!t) return "-";
  return `${t} WIB`;
};

const EMPTY_FORM = {
  title: "", speaker: "", date: "", time: "", location: "", image: "", imageFile: null, is_published: true,
};


/* ── Main Component ── */
const KajianList = () => {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [panel, setPanel]       = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]       = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [imgDragging, setImgDragging] = useState(false);
  const [tick, setTick]         = useState(0);
  const titleRef = useRef(null);
  const fileRef  = useRef(null);

  // Interval to refresh lifecycle status every 1 minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);


  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postService.getPosts();
      const all = res.data?.data || [];
      setList(all.filter((p) => p.type === "pengumuman").sort((a, b) => {
        // Sort by date desc
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Toast helper ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Image upload helpers ── */
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) { showToast("error", "Ukuran gambar maksimal 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result;
      setImgPreview(b64);
      setForm((p) => ({ ...p, image: b64, imageFile: file }));
    };
    reader.readAsDataURL(file);
  };
  const handleFileChange = (e) => processImageFile(e.target.files[0]);
  const clearImage = () => {
    setImgPreview("");
    setForm((p) => ({ ...p, image: "", imageFile: null }));
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ── Open panel ── */

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setImgPreview("");
    setPanel(true);
    setTimeout(() => titleRef.current?.focus(), 120);
  };


  const openEdit = (item) => {
    setForm({
      title: item.title || "",
      speaker: item.speaker || "",
      date: item.event_date || item.date || "",
      time: item.event_time || item.time || "",
      location: item.location || "",
      image: item.image || "",
      imageFile: null,
      is_published: item.status ? item.status === "published" : (item.is_published !== false),
    });
    setImgPreview(item.image || "");
    setEditId(item.id);
    setPanel(true);
    setTimeout(() => titleRef.current?.focus(), 120);
  };

  const closePanel = () => {
    setPanel(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setImgPreview("");
  };


  /* ── Save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) return;
    setSaving(true);
    try {
      const { imageFile, date, time, speaker, location, ...saveData } = form;
      if (imageFile) saveData.cover_image = imageFile;
      
      const payload = {
        ...saveData,
        type: "pengumuman",
        event_date: date,
        event_time: time,
        speaker: speaker,
        location: location
      };

      if (editId) {
        await postService.updatePost(editId, payload);
      } else {
        await postService.createPost(payload);
      }
      
      await load();
      showToast("success", editId ? "Kajian berhasil diperbarui!" : "Kajian berhasil ditambahkan!");
      closePanel();
    } catch {
      showToast("error", "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };


  /* ── Delete ── */
  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;
    setDeleting(id);
    setConfirmDelete(null);
    try {
      await postService.deletePost(id);
      await load();
      showToast("success", "Kajian berhasil dihapus.");
    } catch (e) {
      const msg = e.response?.data?.message || "Gagal menghapus kajian.";
      showToast("error", msg);
    } finally {
      setDeleting(null);
    }
  };

  /* ── Toggle publish ── */
  const handleToggle = async (item) => {
    try {
      if (item.is_published) await postService.unpublishPost(item.id);
      else await postService.publishPost(item.id);
      await load();
      showToast("success", item.is_published ? "Kajian dijadikan draft." : "Kajian berhasil ditayangkan!");
    } catch {
      showToast("error", "Gagal mengubah status publikasi.");
    }
  };

  /* ── Filter ── */
  const filtered = list.filter((k) =>
    k.title?.toLowerCase().includes(search.toLowerCase()) ||
    k.speaker?.toLowerCase().includes(search.toLowerCase()) ||
    k.location?.toLowerCase().includes(search.toLowerCase())
  );
  const published = list.filter((k) => k.is_published).length;

  /* ── Apakah tanggal sudah lewat? ── */
  // Diserahkan sepenuhnya ke modul helper isPast(date, time)

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .kj-page { font-family: 'Plus Jakarta Sans', sans-serif; }
    
    /* Back btn */
    .kj-btn-back { display: inline-flex; align-items: center; gap: 8px; color: #6B7280; font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 8px; background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s; margin-bottom: 16px; }
    .kj-btn-back:hover { background: #EAECF0; color: #1a1a1a; }

    /* Stat */
    .kj-stat { background: #fff; border: 1px solid #EAECF0; border-radius: 14px; padding: 16px 20px; }

    /* Search */
    .kj-search-wrap { position: relative; }
    .kj-search-wrap .kj-si { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #9AA3AF; pointer-events: none; }
    .kj-search { border: 1.5px solid #EAECF0; border-radius: 10px; padding: 9px 13px 9px 37px; font-size: 0.875rem; width: 260px; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; }
    .kj-search:focus { border-color: #1A5C45; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }

    /* Table wrapper */
    .kj-wrap { background: #fff; border: 1px solid #EAECF0; border-radius: 16px; overflow: hidden; }
    .kj-table { width: 100%; border-collapse: collapse; }
    .kj-table thead th { background: #F9FAFB; font-size: 0.75rem; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.8px; padding: 11px 16px; border-bottom: 1px solid #EAECF0; white-space: nowrap; }
    .kj-table tbody tr { border-bottom: 1px solid #F5F6F8; transition: background 0.13s; }
    .kj-table tbody tr:last-child { border-bottom: none; }
    .kj-table tbody tr:hover { background: #FAFBFC; }
    .kj-table td { padding: 13px 16px; vertical-align: middle; }
    .kj-table td:first-child { padding-left: 20px; }
    .kj-table thead th:first-child { padding-left: 20px; }
    .kj-table td:last-child, .kj-table thead th:last-child { padding-right: 20px; text-align: right; }

    /* Title */
    .kj-title { font-size: 0.9375rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1px; }
    .kj-speaker { font-size: 0.8125rem; color: #6B7280; }
    .kj-past { opacity: 0.5; }

    /* Date pill */
    .kj-date { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 1px; }
    .kj-date-main { font-size: 0.875rem; font-weight: 700; color: #1a1a1a; }
    .kj-date-time { font-size: 0.75rem; color: #9AA3AF; }

    /* Location pill */
    .kj-loc { font-size: 0.8125rem; color: #344054; }

    /* Badge */
    .kj-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: 20px; padding: 3px 10px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
    .kj-badge.pub  { background: rgba(26,92,69,0.09);   color: #1A5C45; }
    .kj-badge.draft{ background: rgba(156,163,175,0.12); color: #6B7280; }
    .kj-badge.past { background: rgba(239,68,68,0.08);   color: #DC2626; }

    /* Action btn */
    .kj-btn { width: 33px; height: 33px; border-radius: 8px; border: 1.5px solid #EAECF0; background: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.18s; color: #6B7280; flex-shrink: 0; }
    .kj-btn:hover { border-color: #1A5C45; color: #1A5C45; background: rgba(26,92,69,0.04); }
    .kj-btn.danger:hover { border-color: #EF4444; color: #EF4444; background: rgba(239,68,68,0.04); }
    .kj-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Add btn */
    .kj-btn-add { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #0D3B2E, #1A5C45); color: #fff; border: none; border-radius: 10px; font-size: 0.875rem; font-weight: 700; padding: 10px 18px; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
    .kj-btn-add:hover { box-shadow: 0 4px 14px rgba(13,59,46,0.28); transform: translateY(-1px); }

    /* Empty */
    .kj-empty { text-align: center; padding: 52px 24px; }
    .kj-empty-icon { width: 60px; height: 60px; border-radius: 16px; background: #F5F6F8; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }

    /* Modal */
    .kj-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; width: 400px; max-width: 90vw; z-index: 1050; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); padding: 24px; animation: kjZoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; }
    @keyframes kjZoomIn { from{opacity:0;transform:translate(-50%, -45%) scale(0.95)} to{opacity:1;transform:translate(-50%, -50%) scale(1)} }
    .kj-modal-icon { width: 56px; height: 56px; border-radius: 50%; background: #FEE2E2; display: flex; align-items: center; justify-content: center; color: #EF4444; margin: 0 auto 16px; }
    .kj-modal-title { font-size: 1.125rem; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; }
    .kj-modal-desc { font-size: 0.9375rem; color: #6B7280; margin-bottom: 24px; line-height: 1.5; }
    .kj-modal-actions { display: flex; gap: 12px; }
    .kj-btn-cancel { flex: 1; padding: 10px 0; border-radius: 10px; background: #fff; border: 1.5px solid #EAECF0; color: #344054; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .kj-btn-cancel:hover { background: #F9FAFB; border-color: #D0D5DD; }
    .kj-btn-confirm { flex: 1; padding: 10px 0; border-radius: 10px; background: #EF4444; border: none; color: #fff; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .kj-btn-confirm:hover { background: #DC2626; box-shadow: 0 4px 12px rgba(239,68,68,0.2); }

    /* ── Slide-in Drawer ── */
    .kj-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1040; backdrop-filter: blur(2px); animation: kjFadeIn 0.2s ease; }
    @keyframes kjFadeIn { from{opacity:0} to{opacity:1} }
    .kj-drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 460px; max-width: 96vw;
      background: #fff; z-index: 1041;
      display: flex; flex-direction: column;
      box-shadow: -12px 0 40px rgba(0,0,0,0.1);
      animation: kjSlideIn 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes kjSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
    .kj-drawer-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid #F0F2F5; flex-shrink: 0;
    }
    .kj-drawer-title { font-size: 1.0625rem; font-weight: 800; color: #1a1a1a; }
    .kj-drawer-close { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid #EAECF0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6B7280; transition: all 0.15s; }
    .kj-drawer-close:hover { border-color: #EF4444; color: #EF4444; }
    .kj-drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
    .kj-drawer-foot { padding: 16px 24px; border-top: 1px solid #F0F2F5; display: flex; gap: 10px; flex-shrink: 0; }

    /* Form */
    .kj-label { display: block; font-size: 0.875rem; font-weight: 700; color: #344054; margin-bottom: 6px; }
    .kj-input { width: 100%; padding: 10px 13px; border: 1.5px solid #EAECF0; border-radius: 10px; font-size: 0.9375rem; color: #1a1a1a; background: #F7F8FA; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; box-sizing: border-box; }
    .kj-input:focus { border-color: #1A5C45; background: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }
    .kj-field { margin-bottom: 18px; }
    .kj-hint { font-size: 0.75rem; color: #9AA3AF; margin-top: 4px; }

    /* Img upload zone */
    .kj-upload-zone { border: 2px dashed #EAECF0; border-radius: 12px; padding: 18px; text-align: center; cursor: pointer; transition: all 0.2s; background: #FAFBFA; margin-bottom: 8px; }
    .kj-upload-zone:hover, .kj-upload-zone.drag { border-color: #1A5C45; background: rgba(26,92,69,0.04); }
    .kj-upload-zone.has-img { border-style: solid; border-color: #1A5C45; padding: 0; overflow: hidden; position: relative; border-width: 1.5px; }
    .kj-upload-preview { width: 100%; height: 150px; object-fit: cover; display: block; }
    .kj-upload-remove { position: absolute; top: 7px; right: 7px; width: 26px; height: 26px; border-radius: 99px; background: rgba(0,0,0,0.55); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
    .kj-upload-remove:hover { background: rgba(239,68,68,0.85); }

    /* Toggle */
    .kj-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 15px; background: #F7F8FA; border-radius: 10px; border: 1.5px solid #EAECF0; cursor: pointer; transition: border-color 0.18s; margin-bottom: 18px; }
    .kj-toggle-row:hover { border-color: #1A5C45; }
    .kj-toggle-row.on { border-color: rgba(26,92,69,0.3); background: rgba(26,92,69,0.04); }
    .kj-sw { width: 38px; height: 21px; border-radius: 20px; position: relative; transition: background 0.2s; flex-shrink: 0; }
    .kj-sw.on  { background: #1A5C45; }
    .kj-sw.off { background: #D0D5DD; }
    .kj-sw::after { content:''; position:absolute; top:3px; width:15px; height:15px; border-radius:50%; background:#fff; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
    .kj-sw.on::after  { left: 20px; }
    .kj-sw.off::after { left: 3px; }

    /* Save / Cancel btn */
    .kj-btn-save { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(135deg,#0D3B2E,#1A5C45); color:#fff; border:none; border-radius:10px; font-size:0.9375rem; font-weight:700; padding:11px; cursor:pointer; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; }
    .kj-btn-save:hover:not(:disabled) { box-shadow:0 4px 14px rgba(13,59,46,0.28); }
    .kj-btn-save:disabled { opacity:0.5; cursor:not-allowed; }
    .kj-btn-cancel { display:flex; align-items:center; justify-content:center; gap:6px; background:#fff; color:#344054; border:1.5px solid #EAECF0; border-radius:10px; font-size:0.875rem; font-weight:700; padding:11px 18px; cursor:pointer; transition:all 0.18s; font-family:'Plus Jakarta Sans',sans-serif; }
    .kj-btn-cancel:hover { border-color:#1A5C45; color:#1A5C45; }

    /* Toast */
    .kj-toast { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; align-items:center; gap:9px; padding:12px 20px; border-radius:12px; font-size:0.875rem; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.12); animation:kjToastUp 0.3s ease; font-family:'Plus Jakarta Sans',sans-serif; }
    .kj-toast.success { background:#1A5C45; color:#fff; }
    .kj-toast.error   { background:#DC2626; color:#fff; }
    @keyframes kjToastUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

    /* Skeleton */
    @keyframes kjShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .kj-sk { border-radius:6px; background:linear-gradient(90deg,#F0F2F5 25%,#E8EAED 50%,#F0F2F5 75%); background-size:800px; animation:kjShimmer 1.4s infinite; }
  `;

  return (
    <div className="kj-page">
      <style>{css}</style>

      <Link to="/app/content" className="kj-btn-back">
        <FaArrowLeft size={13} /> Kembali
      </Link>

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            Jadwal Kajian
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            Kelola jadwal kajian yang ditampilkan di website masjid.
          </p>
        </div>
        <button className="kj-btn-add" onClick={openAdd}>
          <FaPlus size={12} /> Tambah Kajian
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Kajian", value: loading ? "—" : list.length,     color: "#0D3B2E" },
          { label: "Tayang",       value: loading ? "—" : published,        color: "#1A5C45" },
          { label: "Akan Datang",  value: loading ? "—" : list.filter(k => !isPast(k.date)).length, color: "#C9A84C" },
        ].map((s) => (
          <div className="col-4" key={s.label}>
            <div className="kj-stat">
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9AA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="kj-search-wrap">
          <FaSearch size={12} className="kj-si" />
          <input
            className="kj-search"
            placeholder="Cari kajian, pemateri, lokasi…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: "0.8125rem", color: "#9AA3AF" }}>
          {!loading && `${filtered.length} kajian`}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="kj-wrap">
        <table className="kj-table">
          <thead>
            <tr>
              <th>Kajian</th>
              <th>Waktu</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map((n) => (
                <tr key={n}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="kj-sk" style={{ width: 160, height: 14, marginBottom: 6 }} />
                    <div className="kj-sk" style={{ width: 110, height: 11 }} />
                  </td>
                  <td><div className="kj-sk" style={{ width: 90, height: 13 }} /></td>
                  <td><div className="kj-sk" style={{ width: 80, height: 13 }} /></td>
                  <td><div className="kj-sk" style={{ width: 60, height: 22, borderRadius: 20 }} /></td>
                  <td />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="kj-empty">
                    <div className="kj-empty-icon">
                      <FaBook size={22} style={{ color: "#C0C7D0" }} />
                    </div>
                    <div style={{ fontWeight: 700, color: "#344054", marginBottom: 4, fontSize: "0.9375rem" }}>
                      {search ? "Kajian tidak ditemukan" : "Belum ada jadwal kajian"}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#9AA3AF" }}>
                      {search ? "Coba kata kunci lain." : "Tambahkan jadwal kajian pertama."}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const past = isPast(item.date, item.time);
                return (
                  <tr key={item.id} className={past ? "kj-past" : ""}>
                    <td>
                      <div className="kj-title">{item.title}</div>
                      {item.speaker && <div className="kj-speaker">👤 {item.speaker}</div>}
                    </td>
                    <td>
                      <div className="kj-date">
                        <span className="kj-date-main">{fmtDate(item.date)}</span>
                        {item.time && <span className="kj-date-time">🕐 {fmtTime(item.time)}</span>}
                      </div>
                    </td>
                    <td>
                      {item.location
                        ? <span className="kj-loc">📍 {item.location}</span>
                        : <span style={{ color: "#C0C7D0", fontSize: "0.8125rem" }}>—</span>
                      }
                    </td>
                    <td>
                      {past
                        ? <span className="kj-badge past">Selesai</span>
                        : item.is_published
                          ? <span className="kj-badge pub">Tayang</span>
                          : <span className="kj-badge draft">Draft</span>
                      }
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 justify-content-end">
                        {!past && (
                          <button className="kj-btn" title={item.is_published ? "Jadikan Draft" : "Tayangkan"} onClick={() => handleToggle(item)}>
                            {item.is_published ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                          </button>
                        )}
                        <button className="kj-btn" title="Edit" onClick={() => openEdit(item)}>
                          <FaEdit size={12} />
                        </button>
                        <button className="kj-btn danger" title="Hapus" onClick={() => handleDelete(item.id)} disabled={deleting === item.id}>
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Slide-in Drawer ── */}
      {panel && (
        <>
          <div className="kj-overlay" onClick={closePanel} />
          <div className="kj-drawer">

            {/* Head */}
            <div className="kj-drawer-head">
              <div>
                <div className="kj-drawer-title">{editId ? "Edit Kajian" : "Tambah Kajian Baru"}</div>
                <div style={{ fontSize: "0.8125rem", color: "#9AA3AF", marginTop: 2 }}>
                  {editId ? "Perbarui informasi jadwal kajian." : "Isi detail kajian yang akan ditampilkan."}
                </div>
              </div>
              <button className="kj-drawer-close" onClick={closePanel}><FaTimes size={14} /></button>
            </div>

            {/* Body */}
            <div className="kj-drawer-body">
              <form id="kajian-form" onSubmit={handleSave}>

                {/* Publish toggle */}
                <div
                  className={`kj-toggle-row ${form.is_published ? "on" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, is_published: !p.is_published }))}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1a1a" }}>
                      {form.is_published ? "🌐 Tayang di Website" : "📝 Simpan sebagai Draft"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9AA3AF", marginTop: 1 }}>
                      {form.is_published ? "Kajian terlihat oleh pengunjung." : "Hanya terlihat oleh admin."}
                    </div>
                  </div>
                  <div className={`kj-sw ${form.is_published ? "on" : "off"}`} />
                </div>

                {/* Judul */}
                <div className="kj-field">
                  <label className="kj-label">Judul / Tema Kajian <span style={{ color: "#EF4444" }}>*</span></label>
                  <input ref={titleRef} className="kj-input" type="text" placeholder="Contoh: Kajian Rutin Ahad Pagi"
                    value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>

                {/* Pemateri */}
                <div className="kj-field">
                  <label className="kj-label">Nama Pemateri</label>
                  <input className="kj-input" type="text" placeholder="Contoh: Ustadz Ahmad, Lc."
                    value={form.speaker} onChange={(e) => setForm((p) => ({ ...p, speaker: e.target.value }))} />
                </div>

                {/* Tanggal & Waktu */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                  <div>
                    <label className="kj-label">Tanggal <span style={{ color: "#EF4444" }}>*</span></label>
                    <input className="kj-input" type="date"
                      value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="kj-label">Waktu <span style={{ color: "#EF4444" }}>*</span></label>
                    <input className="kj-input" type="time"
                      value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} required />
                  </div>
                </div>

                {/* Lokasi */}
                <div className="kj-field">
                  <label className="kj-label">Lokasi</label>
                  <input className="kj-input" type="text" placeholder="Contoh: Aula Utama Masjid"
                    value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                </div>

                {/* Gambar */}
                <div className="kj-field">
                  <label className="kj-label">Foto Kajian</label>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                  {imgPreview ? (
                    <div className="kj-upload-zone has-img">
                      <img src={imgPreview} alt="preview" className="kj-upload-preview" />
                      <button className="kj-upload-remove" onClick={clearImage} type="button" title="Hapus gambar">
                        <FaTimes size={9} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`kj-upload-zone ${imgDragging ? "drag" : ""}`}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setImgDragging(true); }}
                      onDragLeave={() => setImgDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setImgDragging(false); processImageFile(e.dataTransfer.files[0]); }}
                    >
                      <FaImage size={20} style={{ color: "#C0C7D0", marginBottom: 7 }} />
                      <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#6B7280" }}>Klik atau seret gambar</div>
                      <div style={{ fontSize: "0.75rem", color: "#9AA3AF", marginTop: 3 }}>JPG, PNG, WEBP · Maks. 3 MB</div>
                    </div>
                  )}
                  <p className="kj-hint">Opsional. Thumbnail yang tampil di website.</p>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="kj-drawer-foot">
              <button className="kj-btn-cancel" type="button" onClick={closePanel}>
                Batal
              </button>
              <button className="kj-btn-save" type="submit" form="kajian-form" disabled={saving || !form.title.trim() || !form.date || !form.time}>
                <FaSave size={13} />
                {saving ? "Menyimpan…" : editId ? "Simpan Perubahan" : "Tambahkan Kajian"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      {confirmDelete && (
        <>
          <div className="kj-overlay" onClick={() => setConfirmDelete(null)} />
          <div className="kj-modal">
            <div className="kj-modal-icon">
              <FaTrash size={24} />
            </div>
            <div className="kj-modal-title">Hapus Kajian</div>
            <div className="kj-modal-desc">
              Apakah Anda yakin ingin menghapus jadwal kajian ini? Tindakan ini tidak dapat dibatalkan.
            </div>
            <div className="kj-modal-actions">
              <button className="kj-btn-cancel" onClick={() => setConfirmDelete(null)}>
                Batal
              </button>
              <button className="kj-btn-confirm" onClick={confirmDeleteAction}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`kj-toast ${toast.type}`}>
          {toast.type === "success" ? <FaCheckCircle size={13} /> : <FaExclamationCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default KajianList;
