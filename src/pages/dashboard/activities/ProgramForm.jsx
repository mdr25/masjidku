import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaSave, FaArrowLeft, FaImage, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { postService } from "../../../services/apiClient";

/* ── Field wrapper ── */
const Field = ({ label, required, hint, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#344054", marginBottom: 6 }}>
      {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
    </label>
    {hint && <p style={{ fontSize: "0.8125rem", color: "#9AA3AF", marginBottom: 6, marginTop: 0 }}>{hint}</p>}
    {children}
  </div>
);

/* ── Section heading ── */
const SectionHead = ({ emoji, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, paddingBottom: 12, borderBottom: "1.5px solid #F0F2F5" }}>
    <span>{emoji}</span>
    <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#0D3B2E" }}>{title}</span>
  </div>
);

const ProgramForm = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;

  const [form, setForm] = useState({
    title: "", content: "", image: "", link: "", is_published: false,
  });
  const [loading,  setLoading]  = useState(isEdit);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null); // { type: 'success'|'error', msg }
  const [imgError, setImgError] = useState(false);

  /* ── Load existing if edit ── */
  useEffect(() => {
    if (!isEdit) return;
    postService.getPost(id).then((res) => {
      const data = res.data?.data;
      if (data) setForm({ title: data.title || "", content: data.content || "", image: data.image || "", link: data.link || "", is_published: !!data.is_published });
    }).catch(console.error).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (name === "image") setImgError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await postService.updatePost(id, { ...form, type: "program" });
      } else {
        await postService.createPost({ ...form, type: "program" });
      }
      setToast({ type: "success", msg: isEdit ? "Program berhasil diperbarui!" : "Program berhasil dibuat!" });
      setTimeout(() => navigate("/app/activities/program"), 1200);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", msg: "Gagal menyimpan. Silakan coba lagi." });
      setSaving(false);
    }
  };

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .pf-page { font-family: 'Plus Jakarta Sans', sans-serif; }
    .pf-input {
      width: 100%; padding: 10px 14px;
      border: 1.5px solid #EAECF0; border-radius: 10px;
      font-size: 0.9375rem; color: #1a1a1a;
      background: #F7F8FA; outline: none;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .pf-input:focus { border-color: #1A5C45; background: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }
    .pf-textarea { resize: vertical; min-height: 140px; }
    .pf-section {
      background: #fff; border: 1px solid #EAECF0;
      border-radius: 16px; padding: 24px;
    }
    .pf-btn-save {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      color: #fff; border: none; border-radius: 10px;
      font-size: 0.9375rem; font-weight: 700; padding: 11px 28px;
      cursor: pointer; transition: all 0.2s; width: 100%; justify-content: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .pf-btn-save:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(13,59,46,0.3); transform: translateY(-1px); }
    .pf-btn-save:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    .pf-btn-back {
      display: inline-flex; align-items: center; gap: 7px;
      background: #fff; color: #344054;
      border: 1.5px solid #EAECF0; border-radius: 10px;
      font-size: 0.875rem; font-weight: 700; padding: 9px 18px;
      cursor: pointer; transition: all 0.2s; text-decoration: none;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .pf-btn-back:hover { border-color: #1A5C45; color: #1A5C45; background: rgba(26,92,69,0.03); }

    /* Toggle publish */
    .pf-toggle-wrap { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #F7F8FA; border-radius: 10px; border: 1.5px solid #EAECF0; cursor: pointer; transition: border-color 0.2s; }
    .pf-toggle-wrap:hover { border-color: #1A5C45; }
    .pf-toggle-wrap.on { border-color: rgba(26,92,69,0.3); background: rgba(26,92,69,0.04); }
    .pf-toggle { width: 40px; height: 22px; border-radius: 20px; position: relative; transition: background 0.2s; flex-shrink: 0; }
    .pf-toggle.on  { background: #1A5C45; }
    .pf-toggle.off { background: #D0D5DD; }
    .pf-toggle::after { content:''; position: absolute; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    .pf-toggle.on::after  { left: 21px; }
    .pf-toggle.off::after { left: 3px; }

    /* Image preview */
    .pf-img-preview { width: 100%; height: 180px; border-radius: 12px; overflow: hidden; background: #F5F6F8; display: flex; align-items: center; justify-content: center; border: 1.5px solid #EAECF0; margin-bottom: 12px; }
    .pf-img-preview img { width: 100%; height: 100%; object-fit: cover; }

    /* Toast */
    .pf-toast {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      display: flex; align-items: center; gap: 10px;
      padding: 13px 20px; border-radius: 12px; font-size: 0.875rem; font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      animation: pfUp 0.3s ease;
    }
    .pf-toast.success { background: #1A5C45; color: #fff; }
    .pf-toast.error   { background: #DC2626; color: #fff; }
    @keyframes pfUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    /* Skeleton */
    @keyframes pfShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .pf-skeleton { border-radius: 8px; background: linear-gradient(90deg,#F0F2F5 25%,#E8EAED 50%,#F0F2F5 75%); background-size: 800px; animation: pfShimmer 1.4s infinite; }
  `;

  if (loading) {
    return (
      <div className="pf-page">
        <style>{css}</style>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="pf-section">
              <div className="pf-skeleton" style={{ width: 160, height: 20, marginBottom: 24 }} />
              {[1,2,3].map(n => (
                <div key={n} style={{ marginBottom: 20 }}>
                  <div className="pf-skeleton" style={{ width: 100, height: 13, marginBottom: 8 }} />
                  <div className="pf-skeleton" style={{ width: "100%", height: n === 3 ? 120 : 42 }} />
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="pf-section">
              <div className="pf-skeleton" style={{ width: "100%", height: 180, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-page">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            {isEdit ? "Edit Program" : "Tambah Program"}
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            {isEdit ? "Perbarui informasi program masjid." : "Buat program baru untuk ditampilkan di website."}
          </p>
        </div>
        <Link to="/app/activities/program" className="pf-btn-back">
          <FaArrowLeft size={13} /> Kembali
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">

          {/* ── Kolom kiri: Informasi ── */}
          <div className="col-lg-8">
            <div className="pf-section">
              <SectionHead emoji="📋" title="Informasi Program" />

              <Field label="Nama Program" required>
                <input
                  className="pf-input"
                  type="text"
                  name="title"
                  placeholder="Contoh: Pesantren Kilat Ramadhan"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Deskripsi" hint="Jelaskan detail, tujuan, dan manfaat program.">
                <textarea
                  className="pf-input pf-textarea"
                  name="content"
                  placeholder="Tuliskan deskripsi program di sini..."
                  value={form.content}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Link URL" hint="Opsional. Tautan ke halaman pendaftaran atau info lebih lanjut.">
                <input
                  className="pf-input"
                  type="url"
                  name="link"
                  placeholder="https://..."
                  value={form.link}
                  onChange={handleChange}
                />
              </Field>
            </div>
          </div>

          {/* ── Kolom kanan: Media + Publish ── */}
          <div className="col-lg-4">

            {/* Publish toggle */}
            <div className="pf-section mb-4">
              <SectionHead emoji="🌐" title="Penayangan" />
              <div
                className={`pf-toggle-wrap ${form.is_published ? "on" : ""}`}
                onClick={() => setForm((p) => ({ ...p, is_published: !p.is_published }))}
              >
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1a1a" }}>
                    {form.is_published ? "Tayang di Website" : "Simpan sebagai Draft"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9AA3AF", marginTop: 2 }}>
                    {form.is_published ? "Program terlihat oleh pengunjung." : "Hanya terlihat oleh admin."}
                  </div>
                </div>
                <div className={`pf-toggle ${form.is_published ? "on" : "off"}`} />
              </div>
            </div>

            {/* Gambar */}
            <div className="pf-section mb-4">
              <SectionHead emoji="🖼️" title="Foto Program" />

              {/* Preview */}
              <div className="pf-img-preview">
                {form.image && !imgError ? (
                  <img
                    src={form.image}
                    alt="Preview"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#C0C7D0" }}>
                    <FaImage size={28} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: "0.8125rem" }}>Preview gambar</div>
                  </div>
                )}
              </div>

              <Field label="URL Gambar" hint="Tempel URL gambar dari internet.">
                <input
                  className="pf-input"
                  type="text"
                  name="image"
                  placeholder="https://..."
                  value={form.image}
                  onChange={handleChange}
                />
              </Field>
            </div>

            {/* Simpan */}
            <button
              type="submit"
              className="pf-btn-save"
              disabled={saving || !form.title.trim()}
            >
              <FaSave size={14} />
              {saving ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambahkan Program"}
            </button>
          </div>
        </div>
      </form>

      {/* ── Toast ── */}
      {toast && (
        <div className={`pf-toast ${toast.type}`}>
          {toast.type === "success"
            ? <FaCheckCircle size={14} />
            : <FaExclamationCircle size={14} />
          }
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ProgramForm;
