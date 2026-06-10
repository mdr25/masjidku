import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave,
  FaCheckCircle, FaExclamationCircle, FaImage, FaEye, FaEyeSlash,
} from "react-icons/fa";
import { postService } from "../../../services/apiClient";

/* ── Helpers ── */
const fmtDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const EMPTY_FORM = { title: "", content: "", image: "", imageFile: null, link: "", is_published: true };


/* ── Main Component ── */
const ProgramList = () => {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [panel, setPanel]       = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]       = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [imgDragging, setImgDragging] = useState(false);
  const titleRef = useRef(null);
  const fileRef  = useRef(null);


  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postService.getPosts();
      const all = res.data?.data || [];
      setList(all.filter((p) => p.type === "program"));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Toast ── */
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
      setForm((p) => ({ ...p, image: b64 }));
    };
    reader.readAsDataURL(file);
  };
  const handleFileChange = (e) => processImageFile(e.target.files[0]);
  const clearImage = () => {
    setImgPreview("");
    setForm((p) => ({ ...p, image: "", imageFile: null }));
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ── Drawer open/close ── */
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setImgPreview("");
    setPanel(true);
    setTimeout(() => titleRef.current?.focus(), 120);
  };

  const openEdit = (item) => {
    setForm({
      title:        item.title        || "",
      content:      item.content      || "",
      image:        item.image        || "",
      imageFile:    null,
      link:         item.link         || "",
      is_published: !!item.is_published,
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
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const { imageFile, ...saveData } = form;
      if (editId) {
        await postService.updatePost(editId, { ...saveData, type: "program" });
        setList((prev) => prev.map((p) => p.id === editId ? { ...p, ...saveData } : p));
      } else {
        const res = await postService.createPost({ ...saveData, type: "program" });
        const created = res.data?.data || { ...saveData, id: Date.now(), type: "program" };
        setList((prev) => [created, ...prev]);
      }
      showToast("success", editId ? "Program berhasil diperbarui!" : "Program berhasil ditambahkan!");
      closePanel();
    } catch {
      showToast("error", "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };


  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus program ini?")) return;
    setDeleting(id);
    try {
      await postService.deletePost(id);
      setList((prev) => prev.filter((p) => p.id !== id));
      showToast("success", "Program dihapus.");
    } catch {
      showToast("error", "Gagal menghapus.");
    } finally {
      setDeleting(null);
    }
  };

  /* ── Toggle publish ── */
  const handleToggle = async (item) => {
    try {
      if (item.is_published) await postService.unpublishPost(item.id);
      else await postService.publishPost(item.id);
      setList((prev) => prev.map((p) => p.id === item.id ? { ...p, is_published: !p.is_published } : p));
    } catch { /* abaikan */ }
  };

  /* ── Filter ── */
  const filtered = list.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.content?.toLowerCase().includes(search.toLowerCase())
  );
  const published = list.filter((p) => p.is_published).length;

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .pg-page { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Stat */
    .pg-stat { background: #fff; border: 1px solid #EAECF0; border-radius: 14px; padding: 16px 20px; }

    /* Search */
    .pg-search-wrap { position: relative; }
    .pg-search-wrap .pg-si { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #9AA3AF; pointer-events: none; }
    .pg-search { border: 1.5px solid #EAECF0; border-radius: 10px; padding: 9px 13px 9px 37px; font-size: 0.875rem; width: 260px; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; }
    .pg-search:focus { border-color: #1A5C45; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }

    /* Table wrapper */
    .pg-wrap { background: #fff; border: 1px solid #EAECF0; border-radius: 16px; overflow: hidden; }
    .pg-table { width: 100%; border-collapse: collapse; }
    .pg-table thead th { background: #F9FAFB; font-size: 0.75rem; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.8px; padding: 11px 16px; border-bottom: 1px solid #EAECF0; white-space: nowrap; }
    .pg-table tbody tr { border-bottom: 1px solid #F5F6F8; transition: background 0.13s; }
    .pg-table tbody tr:last-child { border-bottom: none; }
    .pg-table tbody tr:hover { background: #FAFBFC; }
    .pg-table td { padding: 13px 16px; vertical-align: middle; }
    .pg-table td:first-child { padding-left: 20px; }
    .pg-table thead th:first-child { padding-left: 20px; }
    .pg-table td:last-child, .pg-table thead th:last-child { padding-right: 20px; text-align: right; }

    /* Thumb */
    .pg-thumb { width: 46px; height: 46px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
    .pg-thumb-ph { width: 46px; height: 46px; border-radius: 10px; background: #F0F2F5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #C0C7D0; }

    /* Text */
    .pg-title { font-size: 0.9375rem; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
    .pg-desc  { font-size: 0.8125rem; color: #9AA3AF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }

    /* Badge */
    .pg-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: 20px; padding: 3px 10px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
    .pg-badge.pub   { background: rgba(26,92,69,0.09);   color: #1A5C45; }
    .pg-badge.draft { background: rgba(156,163,175,0.12); color: #6B7280; }

    /* Action btn */
    .pg-btn { width: 33px; height: 33px; border-radius: 8px; border: 1.5px solid #EAECF0; background: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.18s; color: #6B7280; flex-shrink: 0; }
    .pg-btn:hover { border-color: #1A5C45; color: #1A5C45; background: rgba(26,92,69,0.04); }
    .pg-btn.danger:hover { border-color: #EF4444; color: #EF4444; background: rgba(239,68,68,0.04); }
    .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Add btn */
    .pg-btn-add { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #0D3B2E, #1A5C45); color: #fff; border: none; border-radius: 10px; font-size: 0.875rem; font-weight: 700; padding: 10px 18px; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
    .pg-btn-add:hover { box-shadow: 0 4px 14px rgba(13,59,46,0.28); transform: translateY(-1px); }

    /* Empty */
    .pg-empty { text-align: center; padding: 52px 24px; }
    .pg-empty-icon { width: 60px; height: 60px; border-radius: 16px; background: #F5F6F8; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }

    /* ── Drawer ── */
    .pg-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1040; backdrop-filter: blur(2px); animation: pgFadeIn 0.2s ease; }
    @keyframes pgFadeIn { from{opacity:0} to{opacity:1} }
    .pg-drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 480px; max-width: 96vw;
      background: #fff; z-index: 1041;
      display: flex; flex-direction: column;
      box-shadow: -12px 0 40px rgba(0,0,0,0.1);
      animation: pgSlideIn 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes pgSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
    .pg-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #F0F2F5; flex-shrink: 0; }
    .pg-drawer-title { font-size: 1.0625rem; font-weight: 800; color: #1a1a1a; }
    .pg-drawer-close { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid #EAECF0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6B7280; transition: all 0.15s; }
    .pg-drawer-close:hover { border-color: #EF4444; color: #EF4444; }
    .pg-drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
    .pg-drawer-foot { padding: 16px 24px; border-top: 1px solid #F0F2F5; display: flex; gap: 10px; flex-shrink: 0; }

    /* Form */
    .pg-label { display: block; font-size: 0.875rem; font-weight: 700; color: #344054; margin-bottom: 6px; }
    .pg-input { width: 100%; padding: 10px 13px; border: 1.5px solid #EAECF0; border-radius: 10px; font-size: 0.9375rem; color: #1a1a1a; background: #F7F8FA; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; box-sizing: border-box; }
    .pg-input:focus { border-color: #1A5C45; background: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }
    .pg-textarea { resize: vertical; min-height: 120px; }
    .pg-field { margin-bottom: 18px; }
    .pg-hint { font-size: 0.75rem; color: #9AA3AF; margin-top: 4px; }

    /* Img upload zone */
    .pg-upload-zone { border: 2px dashed #EAECF0; border-radius: 12px; padding: 18px; text-align: center; cursor: pointer; transition: all 0.2s; background: #FAFBFA; margin-bottom: 8px; }
    .pg-upload-zone:hover, .pg-upload-zone.drag { border-color: #1A5C45; background: rgba(26,92,69,0.04); }
    .pg-upload-zone.has-img { border-style: solid; border-color: #1A5C45; padding: 0; overflow: hidden; position: relative; border-width: 1.5px; }
    .pg-upload-preview { width: 100%; height: 150px; object-fit: cover; display: block; }
    .pg-upload-remove { position: absolute; top: 7px; right: 7px; width: 26px; height: 26px; border-radius: 99px; background: rgba(0,0,0,0.55); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
    .pg-upload-remove:hover { background: rgba(239,68,68,0.85); }

    /* Toggle */
    .pg-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 15px; background: #F7F8FA; border-radius: 10px; border: 1.5px solid #EAECF0; cursor: pointer; transition: border-color 0.18s; margin-bottom: 18px; }
    .pg-toggle-row:hover { border-color: #1A5C45; }
    .pg-toggle-row.on { border-color: rgba(26,92,69,0.3); background: rgba(26,92,69,0.04); }
    .pg-sw { width: 38px; height: 21px; border-radius: 20px; position: relative; transition: background 0.2s; flex-shrink: 0; }
    .pg-sw.on  { background: #1A5C45; }
    .pg-sw.off { background: #D0D5DD; }
    .pg-sw::after { content:''; position:absolute; top:3px; width:15px; height:15px; border-radius:50%; background:#fff; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
    .pg-sw.on::after  { left: 20px; }
    .pg-sw.off::after { left: 3px; }

    /* Buttons */
    .pg-btn-save { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(135deg,#0D3B2E,#1A5C45); color:#fff; border:none; border-radius:10px; font-size:0.9375rem; font-weight:700; padding:11px; cursor:pointer; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; }
    .pg-btn-save:hover:not(:disabled) { box-shadow:0 4px 14px rgba(13,59,46,0.28); }
    .pg-btn-save:disabled { opacity:0.5; cursor:not-allowed; }
    .pg-btn-cancel { display:flex; align-items:center; justify-content:center; gap:6px; background:#fff; color:#344054; border:1.5px solid #EAECF0; border-radius:10px; font-size:0.875rem; font-weight:700; padding:11px 18px; cursor:pointer; transition:all 0.18s; font-family:'Plus Jakarta Sans',sans-serif; }
    .pg-btn-cancel:hover { border-color:#1A5C45; color:#1A5C45; }

    /* Toast */
    .pg-toast { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; align-items:center; gap:9px; padding:12px 20px; border-radius:12px; font-size:0.875rem; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.12); animation:pgToastUp 0.3s ease; font-family:'Plus Jakarta Sans',sans-serif; }
    .pg-toast.success { background:#1A5C45; color:#fff; }
    .pg-toast.error   { background:#DC2626; color:#fff; }
    @keyframes pgToastUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

    /* Skeleton */
    @keyframes pgShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .pg-sk { border-radius:6px; background:linear-gradient(90deg,#F0F2F5 25%,#E8EAED 50%,#F0F2F5 75%); background-size:800px; animation:pgShimmer 1.4s infinite; }
  `;

  return (
    <div className="pg-page">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            Program Masjid
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            Kelola program dan kegiatan yang ditampilkan di website.
          </p>
        </div>
        <button className="pg-btn-add" onClick={openAdd}>
          <FaPlus size={12} /> Tambah Program
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Program", value: loading ? "—" : list.length,     color: "#0D3B2E" },
          { label: "Tayang",        value: loading ? "—" : published,        color: "#1A5C45" },
          { label: "Draft",         value: loading ? "—" : list.length - published, color: "#9AA3AF" },
        ].map((s) => (
          <div className="col-4" key={s.label}>
            <div className="pg-stat">
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9AA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="pg-search-wrap">
          <FaSearch size={12} className="pg-si" />
          <input
            className="pg-search"
            placeholder="Cari program…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: "0.8125rem", color: "#9AA3AF" }}>
          {!loading && `${filtered.length} program`}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="pg-wrap">
        <table className="pg-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Dibuat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map((n) => (
                <tr key={n}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="pg-sk" style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0 }} />
                      <div>
                        <div className="pg-sk" style={{ width: 150, height: 14, marginBottom: 6 }} />
                        <div className="pg-sk" style={{ width: 100, height: 11 }} />
                      </div>
                    </div>
                  </td>
                  <td><div className="pg-sk" style={{ width: 80, height: 12 }} /></td>
                  <td><div className="pg-sk" style={{ width: 60, height: 22, borderRadius: 20 }} /></td>
                  <td />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="pg-empty">
                    <div className="pg-empty-icon">
                      <FaImage size={22} style={{ color: "#C0C7D0" }} />
                    </div>
                    <div style={{ fontWeight: 700, color: "#344054", marginBottom: 4, fontSize: "0.9375rem" }}>
                      {search ? "Program tidak ditemukan" : "Belum ada program"}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#9AA3AF" }}>
                      {search ? "Coba kata kunci lain." : "Tambahkan program pertama Anda."}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="pg-thumb" onError={(e) => (e.target.style.display = "none")} />
                        : <div className="pg-thumb-ph"><FaImage size={18} /></div>
                      }
                      <div style={{ minWidth: 0 }}>
                        <div className="pg-title">{item.title}</div>
                        <div className="pg-desc">{item.content || "Tidak ada deskripsi"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {fmtDate(item.created_at)}
                  </td>
                  <td>
                    <span className={`pg-badge ${item.is_published ? "pub" : "draft"}`}>
                      {item.is_published ? "Tayang" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2 justify-content-end">
                      <button className="pg-btn" title={item.is_published ? "Jadikan Draft" : "Tayangkan"} onClick={() => handleToggle(item)}>
                        {item.is_published ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                      </button>
                      <button className="pg-btn" title="Edit" onClick={() => openEdit(item)}>
                        <FaEdit size={12} />
                      </button>
                      <button className="pg-btn danger" title="Hapus" onClick={() => handleDelete(item.id)} disabled={deleting === item.id}>
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Slide-in Drawer ── */}
      {panel && (
        <>
          <div className="pg-overlay" onClick={closePanel} />
          <div className="pg-drawer">

            {/* Head */}
            <div className="pg-drawer-head">
              <div>
                <div className="pg-drawer-title">{editId ? "Edit Program" : "Tambah Program Baru"}</div>
                <div style={{ fontSize: "0.8125rem", color: "#9AA3AF", marginTop: 2 }}>
                  {editId ? "Perbarui informasi program." : "Isi detail program yang akan ditampilkan."}
                </div>
              </div>
              <button className="pg-drawer-close" onClick={closePanel}><FaTimes size={14} /></button>
            </div>

            {/* Body */}
            <div className="pg-drawer-body">
              <form id="program-form" onSubmit={handleSave}>

                {/* Publish toggle */}
                <div
                  className={`pg-toggle-row ${form.is_published ? "on" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, is_published: !p.is_published }))}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1a1a" }}>
                      {form.is_published ? "🌐 Tayang di Website" : "📝 Simpan sebagai Draft"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9AA3AF", marginTop: 1 }}>
                      {form.is_published ? "Program terlihat oleh pengunjung." : "Hanya terlihat oleh admin."}
                    </div>
                  </div>
                  <div className={`pg-sw ${form.is_published ? "on" : "off"}`} />
                </div>

                {/* Nama */}
                <div className="pg-field">
                  <label className="pg-label">Nama Program <span style={{ color: "#EF4444" }}>*</span></label>
                  <input ref={titleRef} className="pg-input" type="text" placeholder="Contoh: Pesantren Kilat Ramadhan"
                    value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>

                {/* Deskripsi */}
                <div className="pg-field">
                  <label className="pg-label">Deskripsi</label>
                  <textarea className="pg-input pg-textarea" placeholder="Jelaskan detail, tujuan, dan manfaat program..."
                    value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
                </div>

                {/* Link */}
                <div className="pg-field">
                  <label className="pg-label">Link URL</label>
                  <input className="pg-input" type="url" placeholder="https://..."
                    value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} />
                  <p className="pg-hint">Opsional. Tautan ke halaman pendaftaran atau info lebih lanjut.</p>
                </div>

                {/* Gambar */}
                <div className="pg-field">
                  <label className="pg-label">Foto Program</label>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                  {imgPreview ? (
                    <div className="pg-upload-zone has-img">
                      <img src={imgPreview} alt="preview" className="pg-upload-preview" />
                      <button className="pg-upload-remove" onClick={clearImage} type="button" title="Hapus gambar">
                        <FaTimes size={9} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`pg-upload-zone ${imgDragging ? "drag" : ""}`}
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
                  <p className="pg-hint">Opsional. Thumbnail yang tampil di website.</p>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="pg-drawer-foot">
              <button className="pg-btn-cancel" type="button" onClick={closePanel}>Batal</button>
              <button className="pg-btn-save" type="submit" form="program-form" disabled={saving || !form.title.trim()}>
                <FaSave size={13} />
                {saving ? "Menyimpan…" : editId ? "Simpan Perubahan" : "Tambahkan Program"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`pg-toast ${toast.type}`}>
          {toast.type === "success" ? <FaCheckCircle size={13} /> : <FaExclamationCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ProgramList;
