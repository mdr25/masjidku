import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaMosque, FaSearch,
  FaFilter, FaEye, FaChevronLeft, FaChevronRight, FaSignOutAlt,
  FaShieldAlt, FaExclamationTriangle,
} from "react-icons/fa";
import { adminService, authService } from "../../services/apiClient";

/* ══════════════════════════════════════
   Super Admin – Verifikasi Masjid
   ══════════════════════════════════════ */

const STATUS_MAP = {
  submitted: { label: "Menunggu", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: FaClock },
  verified:  { label: "Disetujui", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: FaCheckCircle },
  rejected:  { label: "Ditolak", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: FaTimesCircle },
  draft:     { label: "Draft", color: "#6b7280", bg: "rgba(107,114,128,0.12)", icon: FaClock },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ lastPage: 1, total: 0 });

  // Load dashboard stats
  useEffect(() => {
    adminService.getDashboard()
      .then((res) => setStats(res.data?.data || {}))
      .catch((err) => console.error("Dashboard stats error:", err));
  }, []);

  // Load verifications list
  const loadVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 12 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminService.getVerifications(params);
      const data = res.data?.data;
      setVerifications(data?.data || []);
      setPagination({ lastPage: data?.last_page || 1, total: data?.total || 0 });
    } catch (err) {
      console.error("Verifications load error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { loadVerifications(); }, [loadVerifications]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const user = authService.getCurrentUser();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .sa-page {
          font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
          min-height: 100vh;
          background: #F8F9FA;
          color: #344054;
        }

        /* ── Topbar ── */
        .sa-topbar {
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
        .sa-topbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
        }
        .sa-topbar-brand svg {
          color: #C9A84C;
        }
        .sa-topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .sa-topbar-user {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.75);
        }
        .sa-topbar-user strong {
          color: #C9A84C;
        }
        .sa-logout-btn {
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
          transition: all 0.2s;
        }
        .sa-logout-btn:hover {
          background: rgba(255,255,255,0.25);
          border-color: #fff;
        }

        /* ── Stats Cards ── */
        .sa-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 24px 32px 0;
        }
        .sa-stat-card {
          background: #ffffff;
          border: 1px solid #EAECF0;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease-in-out;
        }
        .sa-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(13, 59, 46, 0.06);
          border-color: #D0D5DD;
        }
        .sa-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .sa-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .sa-stat-label {
          font-size: 0.8125rem;
          color: #667085;
          font-weight: 600;
          margin-top: 2px;
        }

        /* ── Toolbar ── */
        .sa-toolbar {
          padding: 24px 32px 0;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }
        .sa-search-form {
          display: flex;
          gap: 0;
          flex: 1;
          min-width: 240px;
          max-width: 420px;
        }
        .sa-search-input {
          flex: 1;
          background: #ffffff;
          border: 1.5px solid #EAECF0;
          border-right: none;
          border-radius: 10px 0 0 10px;
          padding: 10px 16px;
          color: #1D2939;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }
        .sa-search-input::placeholder { color: #98A2B3; }
        .sa-search-input:focus { border-color: #1A5C45; box-shadow: 0 0 0 3px rgba(26, 92, 69, 0.08); }
        .sa-search-btn {
          background: linear-gradient(135deg, #0D3B2E, #1A5C45);
          border: none;
          border-radius: 0 10px 10px 0;
          padding: 0 20px;
          color: #fff;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .sa-search-btn:hover {
          background: #0D3B2E;
        }
        .sa-filter-btns {
          display: flex;
          gap: 8px;
        }
        .sa-filter-btn {
          padding: 8px 18px;
          border-radius: 10px;
          border: 1.5px solid #EAECF0;
          background: #ffffff;
          color: #667085;
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .sa-filter-btn:hover { background: #F9FAFB; color: #1D2939; }
        .sa-filter-btn.active {
          background: rgba(26, 92, 69, 0.06);
          border-color: #1A5C45;
          color: #0D3B2E;
        }

        /* ── Table ── */
        .sa-table-wrap {
          padding: 16px 32px 32px;
        }
        .sa-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #ffffff;
          border: 1.5px solid #EAECF0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        .sa-table thead th {
          background: #F9FAFB;
          padding: 14px 20px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          border-bottom: 1.5px solid #EAECF0;
        }
        .sa-table tbody tr {
          transition: background 0.15s;
        }
        .sa-table tbody tr:hover {
          background: #F9FAFB;
        }
        .sa-table td {
          padding: 16px 20px;
          font-size: 0.875rem;
          border-bottom: 1px solid #EAECF0;
          color: #344054;
          vertical-align: middle;
        }
        .sa-table tbody tr:last-child td { border-bottom: none; }
        .sa-mosque-name {
          font-weight: 700;
          color: #1D2939;
          font-size: 0.9375rem;
        }
        .sa-mosque-slug {
          font-size: 0.75rem;
          color: #667085;
          font-weight: 500;
          margin-top: 2px;
        }
        .sa-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .sa-view-btn {
          background: #ffffff;
          border: 1.5px solid #EAECF0;
          color: #0D3B2E;
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: inherit;
          transition: all 0.2s;
        }
        .sa-view-btn:hover {
          background: #F9FAFB;
          border-color: #D0D5DD;
          transform: translateY(-1px);
        }

        /* ── Pagination ── */
        .sa-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-top: 1.5px solid #EAECF0;
          background: #F9FAFB;
        }
        .sa-pagination-info {
          font-size: 0.8125rem;
          color: #667085;
          font-weight: 600;
        }
        .sa-pagination-btns {
          display: flex;
          gap: 8px;
        }
        .sa-page-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1.5px solid #EAECF0;
          background: #ffffff;
          color: #344054;
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .sa-page-btn:hover:not(:disabled) { background: #F9FAFB; color: #1D2939; }
        .sa-page-btn:disabled { opacity: 0.45; cursor: default; }

        /* ── Empty state ── */
        .sa-empty {
          text-align: center;
          padding: 60px 20px;
          color: #98A2B3;
          background: #ffffff;
          border: 1.5px solid #EAECF0;
          border-radius: 16px;
        }
        .sa-empty svg { font-size: 3rem; margin-bottom: 16px; color: #D0D5DD; }

        /* ── Loading ── */
        .sa-loading {
          text-align: center;
          padding: 60px;
          background: #ffffff;
          border: 1.5px solid #EAECF0;
          border-radius: 16px;
        }
        .sa-spinner {
          width: 40px; height: 40px;
          border: 3px solid #E5E7EB;
          border-top-color: #1A5C45;
          border-radius: 50%;
          animation: sa-spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes sa-spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .sa-stats { grid-template-columns: repeat(2, 1fr); padding: 16px; }
          .sa-toolbar { padding: 16px; }
          .sa-table-wrap { padding: 0 16px 16px; }
          .sa-topbar { padding: 12px 16px; }
          .sa-table { display: block; overflow-x: auto; }
        }
      `}</style>

      <div className="sa-page">
        {/* ── Topbar ── */}
        <div className="sa-topbar">
          <div className="sa-topbar-brand">
            <FaShieldAlt size={24} />
            <span>MasjidKu Admin</span>
          </div>
          <div className="sa-topbar-right">
            <div className="sa-topbar-user">
              Masuk sebagai <strong>{user?.name || "Super Admin"}</strong>
            </div>
            <button className="sa-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt size={14} /> Keluar
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="sa-stats">
          {[
            { key: "total",    label: "Total Pengajuan", color: "#6366f1", icon: FaMosque },
            { key: "pending",  label: "Menunggu Verifikasi", color: "#f59e0b", icon: FaClock },
            { key: "verified", label: "Disetujui", color: "#10b981", icon: FaCheckCircle },
            { key: "rejected", label: "Ditolak", color: "#ef4444", icon: FaTimesCircle },
          ].map((s) => (
            <div className="sa-stat-card" key={s.key}>
              <div className="sa-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
                <s.icon />
              </div>
              <div>
                <div className="sa-stat-value" style={{ color: s.color }}>{stats[s.key] ?? 0}</div>
                <div className="sa-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="sa-toolbar">
          <form className="sa-search-form" onSubmit={handleSearch}>
            <input
              className="sa-search-input"
              placeholder="Cari nama masjid atau slug..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="sa-search-btn" type="submit"><FaSearch /></button>
          </form>
          <div className="sa-filter-btns">
            {[
              { val: "all", label: "Semua" },
              { val: "submitted", label: "Menunggu" },
              { val: "verified", label: "Disetujui" },
              { val: "rejected", label: "Ditolak" },
            ].map((f) => (
              <button
                key={f.val}
                className={`sa-filter-btn ${statusFilter === f.val ? "active" : ""}`}
                onClick={() => { setStatusFilter(f.val); setPage(1); }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="sa-table-wrap">
          {loading ? (
            <div className="sa-loading">
              <div className="sa-spinner" />
              <div style={{ color: "#667085", fontWeight: 500 }}>Memuat data...</div>
            </div>
          ) : verifications.length === 0 ? (
            <div className="sa-empty">
              <FaExclamationTriangle />
              <div>Tidak ada pengajuan ditemukan.</div>
            </div>
          ) : (
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Masjid</th>
                  <th>Lokasi</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((m) => {
                  const st = STATUS_MAP[m.verification_status] || STATUS_MAP.draft;
                  const Icon = st.icon;
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="sa-mosque-name">{m.name || "Tanpa Nama"}</div>
                        <div className="sa-mosque-slug">{m.slug}</div>
                      </td>
                      <td style={{ color: "#475569" }}>
                        {[m.city, m.province].filter(Boolean).join(", ") || "-"}
                      </td>
                      <td style={{ color: "#667085", fontSize: "0.8125rem", fontWeight: 500 }}>
                        {m.verification_submitted_at
                          ? new Date(m.verification_submitted_at).toLocaleDateString("id-ID", {
                              day: "numeric", month: "long", year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td>
                        <span className="sa-badge" style={{ background: st.bg, color: st.color }}>
                          <Icon size={12} /> {st.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="sa-view-btn"
                          onClick={() => navigate(`/superadmin/verifications/${m.id}`)}
                        >
                          <FaEye size={13} /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Pagination */}
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <div className="sa-pagination">
                      <div className="sa-pagination-info">
                        Halaman {page} dari {pagination.lastPage} · Total {pagination.total} data
                      </div>
                      <div className="sa-pagination-btns">
                        <button className="sa-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                          <FaChevronLeft size={12} /> Prev
                        </button>
                        <button className="sa-page-btn" disabled={page >= pagination.lastPage} onClick={() => setPage(page + 1)}>
                          Next <FaChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
