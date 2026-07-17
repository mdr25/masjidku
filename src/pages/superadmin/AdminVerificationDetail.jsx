import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock, FaMosque,
  FaUser, FaEnvelope, FaMapMarkerAlt, FaFileAlt, FaExternalLinkAlt,
  FaShieldAlt, FaSignOutAlt, FaExclamationTriangle, FaPhone,
} from "react-icons/fa";
import { adminService, authService } from "../../services/apiClient";

const STATUS_MAP = {
  submitted: { label: "Menunggu Verifikasi", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: FaClock },
  verified:  { label: "Disetujui", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: FaCheckCircle },
  rejected:  { label: "Ditolak", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: FaTimesCircle },
  draft:     { label: "Draft", color: "#6b7280", bg: "rgba(107,114,128,0.12)", icon: FaClock },
};

const AdminVerificationDetail = () => {
  const { mosqueId } = useParams();
  const navigate = useNavigate();
  const [mosque, setMosque] = useState(null);
  const [takmirs, setTakmirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminService.getVerificationDetail(mosqueId)
      .then((res) => {
        const d = res.data?.data;
        setMosque(d?.mosque || null);
        setTakmirs(d?.takmirs || []);
      })
      .catch((err) => {
        console.error("Detail load error:", err);
        setToast({ type: "error", msg: "Gagal memuat detail pengajuan." });
      })
      .finally(() => setLoading(false));
  }, [mosqueId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await adminService.approveVerification(mosqueId, { verification_note: note || null });
      setMosque(res.data?.data?.mosque || mosque);
      setToast({ type: "success", msg: "Masjid berhasil diverifikasi!" });
      setShowApproveModal(false);
      setNote("");
    } catch (err) {
      setToast({ type: "error", msg: err.response?.data?.message || "Gagal approve." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setToast({ type: "error", msg: "Alasan penolakan wajib diisi." });
      return;
    }
    setActionLoading(true);
    try {
      const res = await adminService.rejectVerification(mosqueId, { verification_note: rejectReason });
      setMosque(res.data?.data?.mosque || mosque);
      setToast({ type: "success", msg: "Pengajuan verifikasi ditolak." });
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) {
      setToast({ type: "error", msg: err.response?.data?.message || "Gagal reject." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const st = STATUS_MAP[mosque?.verification_status] || STATUS_MAP.draft;
  const StIcon = st.icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .sd-page {
          font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
          min-height: 100vh;
          background: #F8F9FA;
          color: #344054;
        }
        .sd-topbar {
          background: linear-gradient(135deg, #0D3B2E 0%, #1A5C45 100%);
          box-shadow: 0 4px 20px rgba(13, 59, 46, 0.15);
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .sd-topbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
        }
        .sd-topbar-brand svg { color: #C9A84C; }
        .sd-back-btn {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          transition: all 0.2s;
        }
        .sd-back-btn:hover { background: rgba(255,255,255,0.25); border-color: #fff; }
        .sd-logout-btn {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          transition: all 0.2s;
        }
        .sd-logout-btn:hover { background: rgba(255,255,255,0.25); border-color: #fff; }

        .sd-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px;
        }

        /* ── Header ── */
        .sd-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .sd-mosque-name {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1D2939;
          margin: 0 0 4px;
        }
        .sd-mosque-slug {
          font-size: 0.875rem;
          color: #667085;
          font-weight: 500;
        }
        .sd-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: 24px;
          font-size: 0.875rem;
          font-weight: 700;
        }

        /* ── Cards ── */
        .sd-card {
          background: #ffffff;
          border: 1px solid #EAECF0;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        .sd-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1D2939;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sd-card-title svg { color: #1A5C45; }

        .sd-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .sd-info-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .sd-info-item svg {
          color: #98A2B3;
          margin-top: 3px;
          flex-shrink: 0;
        }
        .sd-info-label {
          font-size: 0.75rem;
          color: #667085;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
          font-weight: 600;
        }
        .sd-info-value {
          font-size: 0.9375rem;
          color: #1D2939;
          font-weight: 600;
        }

        /* ── Documents ── */
        .sd-doc-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          background: rgba(26, 92, 69, 0.06);
          border: 1.5px solid rgba(26, 92, 69, 0.15);
          color: #0D3B2E;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          margin-right: 12px;
          margin-bottom: 8px;
        }
        .sd-doc-link:hover {
          background: rgba(26, 92, 69, 0.12);
          border-color: #1A5C45;
          transform: translateY(-1px);
          color: #0D3B2E;
        }
        .sd-no-doc {
          color: #98A2B3;
          font-style: italic;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* ── Takmir list ── */
        .sd-takmir-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #F9FAFB;
          border: 1px solid #EAECF0;
          border-radius: 10px;
          margin-bottom: 8px;
        }
        .sd-takmir-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(26, 92, 69, 0.1);
          color: #1A5C45;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }
        .sd-takmir-name { font-weight: 700; color: #1D2939; }
        .sd-takmir-email { font-size: 0.8125rem; color: #667085; font-weight: 500; }

        /* ── Action Section ── */
        .sd-action-section {
          background: #ffffff;
          border: 1px solid #EAECF0;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        .sd-note-input {
          width: 100%;
          background: #ffffff;
          border: 1.5px solid #EAECF0;
          border-radius: 10px;
          padding: 12px 16px;
          color: #1D2939;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          resize: vertical;
          min-height: 80px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        .sd-note-input::placeholder { color: #98A2B3; }
        .sd-note-input:focus { border-color: #1A5C45; box-shadow: 0 0 0 3px rgba(26, 92, 69, 0.08); }
        .sd-action-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .sd-approve-btn {
          background: linear-gradient(135deg, #0D3B2E, #1A5C45);
          border: none;
          color: #fff;
          border-radius: 10px;
          padding: 12px 28px;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
          transition: all 0.2s;
        }
        .sd-approve-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13, 59, 46, 0.2); }
        .sd-approve-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .sd-reject-btn {
          background: #FFF0F0;
          border: 1.5px solid #FCA5A5;
          color: #DC2626;
          border-radius: 10px;
          padding: 12px 28px;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
          transition: all 0.2s;
        }
        .sd-reject-btn:hover { background: #FEE2E2; }
        .sd-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Verification Note ── */
        .sd-verification-note {
          background: #FFFBEB;
          border: 1.5px solid #FDE68A;
          border-radius: 12px;
          padding: 16px 20px;
          margin-top: 20px;
        }
        .sd-verification-note.rejected {
          background: #FEF2F2;
          border-color: #FECACA;
        }
        .sd-verification-note.verified {
          background: #F0FDF4;
          border-color: #BBF7D0;
        }
        .sd-vn-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #667085;
          margin-bottom: 6px;
        }
        .sd-vn-text {
          font-size: 0.9375rem;
          color: #344054;
          font-weight: 500;
        }
        .sd-vn-meta {
          font-size: 0.75rem;
          color: #98A2B3;
          margin-top: 8px;
          font-weight: 500;
        }

        /* ── Modal ── */
        .sd-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(13, 59, 46, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }
        .sd-modal {
          background: #ffffff;
          border: 1px solid #EAECF0;
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 480px;
          margin: 20px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.12);
        }
        .sd-modal-title {
          font-size: 1.125rem;
          font-weight: 800;
          color: #1D2939;
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sd-modal-title svg { color: #ef4444; }
        .sd-modal-desc {
          font-size: 0.875rem;
          color: #667085;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .sd-modal-btns {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .sd-modal-cancel {
          background: #ffffff;
          border: 1.5px solid #EAECF0;
          color: #344054;
          border-radius: 8px;
          padding: 10px 20px;
          font-family: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .sd-modal-cancel:hover {
          background: #F9FAFB;
        }

        /* ── Toast ── */
        .sd-toast {
          position: fixed;
          top: 80px;
          right: 32px;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
          z-index: 1000;
          animation: sd-slide-in 0.3s ease;
          box-shadow: 0 10px 24px rgba(0,0,0,0.08);
        }
        .sd-toast.success {
          background: #E8F5E9;
          border: 1.5px solid #A5D6A7;
          color: #1B5E20;
        }
        .sd-toast.error {
          background: #FFEBEE;
          border: 1.5px solid #EF9A9A;
          color: #B71C1C;
        }
        @keyframes sd-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* ── Loading ── */
        .sd-loading {
          text-align: center;
          padding: 100px 20px;
        }
        .sd-spinner {
          width: 44px; height: 44px;
          border: 3px solid #E5E7EB;
          border-top-color: #1A5C45;
          border-radius: 50%;
          animation: sd-spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes sd-spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .sd-content { padding: 20px 16px; }
          .sd-header { flex-direction: column; }
        }
      `}</style>

      <div className="sd-page">
        {/* Toast */}
        {toast && (
          <div className={`sd-toast ${toast.type}`}>{toast.msg}</div>
        )}

        {/* ── Topbar ── */}
        <div className="sd-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="sd-back-btn" onClick={() => navigate("/superadmin")}>
              <FaArrowLeft size={13} /> Kembali
            </button>
            <div className="sd-topbar-brand">
              <FaShieldAlt size={22} />
              <span>Detail Verifikasi</span>
            </div>
          </div>
          <button className="sd-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt size={14} /> Keluar
          </button>
        </div>

        {loading ? (
          <div className="sd-loading">
            <div className="sd-spinner" />
            <div style={{ color: "#667085", fontWeight: 500 }}>Memuat detail...</div>
          </div>
        ) : !mosque ? (
          <div className="sd-content" style={{ textAlign: "center", paddingTop: 80 }}>
            <FaExclamationTriangle size={48} style={{ color: "#D0D5DD", marginBottom: 16 }} />
            <div style={{ color: "#667085", fontWeight: 500 }}>Masjid tidak ditemukan.</div>
          </div>
        ) : (
          <div className="sd-content">
            {/* ── Header ── */}
            <div className="sd-header">
              <div>
                <h1 className="sd-mosque-name">{mosque.name || "Tanpa Nama"}</h1>
                <div className="sd-mosque-slug">/{mosque.slug}</div>
              </div>
              <span className="sd-status-badge" style={{ background: st.bg, color: st.color }}>
                <StIcon size={16} /> {st.label}
              </span>
            </div>

            {/* ── Info Masjid ── */}
            <div className="sd-card">
              <h3 className="sd-card-title"><FaMosque /> Informasi Masjid</h3>
              <div className="sd-info-grid">
                <div className="sd-info-item">
                  <FaMapMarkerAlt size={14} />
                  <div>
                    <div className="sd-info-label">Alamat</div>
                    <div className="sd-info-value">{mosque.address || "-"}</div>
                  </div>
                </div>
                <div className="sd-info-item">
                  <FaMapMarkerAlt size={14} />
                  <div>
                    <div className="sd-info-label">Wilayah</div>
                    <div className="sd-info-value">
                      {[mosque.sub_district, mosque.district, mosque.city, mosque.province]
                        .filter(Boolean).join(", ") || "-"}
                    </div>
                  </div>
                </div>
                <div className="sd-info-item">
                  <FaPhone size={14} />
                  <div>
                    <div className="sd-info-label">Kontak</div>
                    <div className="sd-info-value">{mosque.contact || "-"}</div>
                  </div>
                </div>
                <div className="sd-info-item">
                  <FaEnvelope size={14} />
                  <div>
                    <div className="sd-info-label">Email</div>
                    <div className="sd-info-value">{mosque.email || "-"}</div>
                  </div>
                </div>
              </div>
              {mosque.description && (
                <div style={{ marginTop: 16 }}>
                  <div className="sd-info-label">Deskripsi</div>
                  <div className="sd-info-value" style={{ fontWeight: 400, lineHeight: 1.6 }}>{mosque.description}</div>
                </div>
              )}
            </div>

            {/* ── Dokumen Verifikasi ── */}
            <div className="sd-card">
              <h3 className="sd-card-title"><FaFileAlt /> Dokumen Verifikasi</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {mosque.waqf_imb_document_url ? (
                  <a href={mosque.waqf_imb_document_url} target="_blank" rel="noopener noreferrer" className="sd-doc-link">
                    <FaFileAlt size={14} /> Akta Wakaf / IMB / Surat Keterangan <FaExternalLinkAlt size={10} />
                  </a>
                ) : (
                  <span className="sd-no-doc">Akta Wakaf / IMB / Surat Keterangan (tidak diunggah)</span>
                )}
                {mosque.management_decree_document_url ? (
                  <a href={mosque.management_decree_document_url} target="_blank" rel="noopener noreferrer" className="sd-doc-link">
                    <FaFileAlt size={14} /> SK Kepengurusan <FaExternalLinkAlt size={10} />
                  </a>
                ) : (
                  <span className="sd-no-doc">Belum ada SK Kepengurusan</span>
                )}
              </div>
            </div>

            {/* ── Takmir / Pengurus ── */}
            <div className="sd-card">
              <h3 className="sd-card-title"><FaUser /> Takmir / Pengurus</h3>
              {takmirs.length === 0 ? (
                <div className="sd-no-doc">Tidak ada data takmir.</div>
              ) : (
                takmirs.map((t) => (
                  <div className="sd-takmir-item" key={t.id}>
                    <div className="sd-takmir-avatar">
                      {(t.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="sd-takmir-name">{t.name}</div>
                      <div className="sd-takmir-email">{t.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Catatan Verifikasi (jika sudah ada) ── */}
            {mosque.verification_note && (
              <div className={`sd-verification-note ${mosque.verification_status}`}>
                <div className="sd-vn-title">Catatan Verifikasi</div>
                <div className="sd-vn-text">{mosque.verification_note}</div>
                {mosque.verified_at && (
                  <div className="sd-vn-meta">
                    {mosque.verification_status === "verified" ? "Disetujui" : "Ditolak"} pada{" "}
                    {new Date(mosque.verified_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                    {mosque.verified_by_admin && ` oleh ${mosque.verified_by_admin.name}`}
                  </div>
                )}
              </div>
            )}

            {/* ── Action Buttons (hanya jika status submitted) ── */}
            {mosque.verification_status === "submitted" && (
              <div className="sd-action-section">
                <h3 className="sd-card-title" style={{ marginBottom: 12 }}>
                  <FaShieldAlt style={{ color: "#f59e0b" }} /> Tindakan Verifikasi
                </h3>
                <textarea
                  className="sd-note-input"
                  placeholder="Catatan untuk takmir (opsional untuk approve, wajib untuk tolak)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="sd-action-btns">
                  <button className="sd-approve-btn" onClick={() => setShowApproveModal(true)} disabled={actionLoading}>
                    <FaCheckCircle size={16} /> {actionLoading ? "Memproses..." : "Setujui Verifikasi"}
                  </button>
                  <button className="sd-reject-btn" onClick={() => { setRejectReason(note); setShowRejectModal(true); }} disabled={actionLoading}>
                    <FaTimesCircle size={16} /> Tolak
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Reject Modal ── */}
        {showRejectModal && (
          <div className="sd-modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="sd-modal-title">
                <FaExclamationTriangle /> Tolak Verifikasi
              </h3>
              <p className="sd-modal-desc">
                Berikan alasan penolakan agar pengurus masjid tahu apa yang perlu diperbaiki.
              </p>
              <textarea
                className="sd-note-input"
                placeholder="Alasan penolakan (wajib diisi)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ minHeight: 100 }}
              />
              <div className="sd-modal-btns">
                <button className="sd-modal-cancel" onClick={() => setShowRejectModal(false)}>Batal</button>
                <button className="sd-reject-btn" onClick={handleReject} disabled={actionLoading} style={{ fontSize: "0.875rem", padding: "10px 20px" }}>
                  <FaTimesCircle size={14} /> {actionLoading ? "Memproses..." : "Tolak Verifikasi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Approve Modal ── */}
        {showApproveModal && (
          <div className="sd-modal-overlay" onClick={() => setShowApproveModal(false)}>
            <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="sd-modal-title" style={{ color: "#10b981" }}>
                <FaCheckCircle style={{ color: "#10b981" }} /> Setujui Verifikasi
              </h3>
              <p className="sd-modal-desc">
                Yakin ingin menyetujui verifikasi masjid ini? Website masjid akan langsung aktif setelah disetujui.
              </p>
              <div className="sd-modal-btns">
                <button className="sd-modal-cancel" onClick={() => setShowApproveModal(false)}>Batal</button>
                <button className="sd-approve-btn" onClick={handleApprove} disabled={actionLoading} style={{ fontSize: "0.875rem", padding: "10px 20px" }}>
                  <FaCheckCircle size={14} /> {actionLoading ? "Memproses..." : "Ya, Setujui"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminVerificationDetail;
