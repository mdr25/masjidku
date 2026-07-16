import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaNewspaper,
  FaListAlt,
  FaBullhorn,
  FaClock,
  FaArrowRight,
  FaRocket,
  FaMosque,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaLayerGroup,
} from "react-icons/fa";
import { authService, dashboardService, postService } from "../../services/apiClient";
import TEMPLATE_CATALOG from "../../data/templates";

// Template code → human-readable name map
const getTemplateName = (code) => {
  const tpl = TEMPLATE_CATALOG.find((t) => t.template_code === code);
  return tpl ? tpl.name : code || "-";
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
};

// Geo API returns ALL CAPS (e.g. "JAWA BARAT") — convert to Title Case
const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className="mb-2 fw-semibold text-uppercase"
    style={{ fontSize: "0.8125rem", letterSpacing: "1.2px", color: "#9AA3AF" }}>
    {children}
  </p>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="d-flex align-items-start gap-2 mb-3">
    <div className="flex-shrink-0 mt-1" style={{ color: "#1A5C45", width: 16 }}>{icon}</div>
    <div className="lh-sm">
      <div style={{ fontSize: "0.8125rem", color: "#9AA3AF" }}>{label}</div>
      <div className="fw-semibold text-dark" style={{ fontSize: "0.9375rem" }}>
        {value || <span className="text-muted fw-normal fst-italic">Belum diisi</span>}
      </div>
    </div>
  </div>
);

const PostCard = ({ post }) => (
  <div className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: "1px solid #F0F0F0" }}>
    {post.image && (
      <img
        src={post.image}
        alt={post.title}
        className="rounded-2 flex-shrink-0"
        style={{ width: 48, height: 48, objectFit: "cover" }}
        onError={(e) => (e.target.style.display = "none")}
      />
    )}
    <div className="flex-grow-1 min-w-0">
      <div className="fw-semibold text-dark text-truncate" style={{ fontSize: "0.9375rem" }}>
        {post.title}
      </div>
      <div style={{ fontSize: "0.8125rem", color: "#9AA3AF" }}>
        {formatDate(post.created_at)}
      </div>
    </div>
    <Badge
      pill
      bg={post.is_published ? "success" : "secondary"}
      style={{ fontSize: "0.8125rem", opacity: 0.85 }}
    >
      {post.is_published ? "Tayang" : "Draft"}
    </Badge>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardHome = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        if (currentUser?.isSetupComplete) {
          // Fetch mosque profile (field mapping matches mock + real API)
          const profileRes = await dashboardService.getProfile();
          setProfile(profileRes.data?.data || null);

          // Fetch all posts (articles, programs, kajian)
          const postsRes = await postService.getPosts();
          setPosts(postsRes.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" style={{ color: "#0D3B2E", width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  // ── Empty State (Setup belum selesai) ──
  if (user && !user.isSetupComplete) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{ minHeight: "65vh" }}>
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(13,59,46,0.1); }
            50%       { box-shadow: 0 0 0 20px rgba(13,59,46,0); }
          }
          .empty-pulse { animation: pulse-glow 2.5s ease-in-out infinite; }
        `}</style>
        <div className="empty-pulse d-flex align-items-center justify-content-center rounded-circle mb-4"
          style={{ width: 96, height: 96, background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)" }}>
          <FaRocket size={34} style={{ color: "#0D3B2E" }} />
        </div>
        <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>Selamat Datang di MasjidKu!</h4>
        <p className="text-muted mb-4 mx-auto"
          style={{ maxWidth: "400px", fontSize: "0.9375rem", lineHeight: 1.7 }}>
          Website masjid Anda belum aktif. Selesaikan Setup untuk mulai mengelola
          konten dan mempublikasikan website.
        </p>
        <Button as={Link} to="/setup" className="border-0 fw-semibold px-4 py-2"
          style={{ background: "linear-gradient(135deg, #0D3B2E, #1A5C45)", borderRadius: 10, fontSize: "0.9375rem" }}>
          Mulai Setup Website <FaArrowRight className="ms-2" size={13} />
        </Button>
      </div>
    );
  }

  // ── Derived stats ──
  // Note: ArticleList saves type sebagai "berita"
  const articles = posts.filter((p) => p.type === "berita");
  const programs  = posts.filter((p) => p.type === "kegiatan");
  const kajian    = posts.filter((p) => p.type === "pengumuman");

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const websiteUrl = profile?.slug ? `${window.location.origin}/website` : null;

  // ── Full Dashboard ──
  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .db-page { font-family: 'Plus Jakarta Sans', sans-serif; }
        .db-card {
          background: #fff;
          border: 1px solid #EAECF0;
          border-radius: 14px;
          transition: all 0.2s ease;
        }
        .db-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
        .db-hero {
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          height: 240px;
        }
        .db-hero img { transition: transform 10s ease; }
        .db-hero:hover img { transform: scale(1.04); }
        .stat-item {
          border-right: 1px solid #EAECF0;
          padding: 0 20px;
        }
        .stat-item:last-child { border-right: none; }
      `}</style>

      <div className="db-page">

        {/* ── Hero Banner ── */}
        <div className="db-hero mb-4 shadow-sm">
          <img
            src={profile?.image || "https://images.unsplash.com/photo-1560626184-524744344bef?q=80&w=1233&auto=format&fit=crop"}
            alt={profile?.name}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
          <div className="position-absolute inset-0 w-100 h-100 top-0 start-0"
            style={{ background: "linear-gradient(to top, rgba(13,59,46,0.95) 0%, rgba(13,59,46,0.3) 55%, transparent 100%)" }}>
          </div>
          <div className="position-absolute bottom-0 start-0 w-100 p-4 d-flex align-items-end justify-content-between">
            <div>
              <p className="mb-1 fw-semibold text-uppercase"
                style={{ color: "#C9A84C", fontSize: "0.8125rem", letterSpacing: "1.2px" }}>
                Dashboard Pengurus
              </p>
              <h4 className="text-white fw-bold mb-1" style={{ letterSpacing: "-0.3px" }}>
                {profile?.name || "Nama Masjid"}
              </h4>
              <p className="mb-0" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}>
                {[profile?.address, profile?.kecamatan, profile?.kota]
                  .filter(Boolean).join(", ") || "Lokasi belum diisi"}
              </p>
            </div>
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noreferrer"
                className="d-flex align-items-center gap-2 text-white text-decoration-none fw-semibold"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: "0.9375rem",
                  backdropFilter: "blur(8px)",
                  flexShrink: 0,
                }}>
                <FaExternalLinkAlt size={11} /> Lihat Website
              </a>
            )}
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="db-card mb-4 p-0">
          <div className="d-flex align-items-stretch py-3">
            {[
              { icon: <FaNewspaper size={16} />, label: "Berita", value: articles.length, color: "#C62828" },
              { icon: <FaListAlt size={16} />, label: "Program", value: programs.length, color: "#E65100" },
              { icon: <FaBullhorn size={16} />, label: "Kajian", value: kajian.length, color: "#6A1B9A" },
              { icon: <FaClock size={16} />, label: "Terpublish", value: posts.filter(p => p.is_published).length, color: "#1A5C45" },
            ].map((s, i) => (
              <div key={i} className="stat-item d-flex align-items-center gap-3 flex-grow-1">
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{ width: 38, height: 38, background: `${s.color}14`, color: s.color }}>
                  {s.icon}
                </div>
                <div className="lh-sm">
                  <div className="fw-bold text-dark" style={{ fontSize: "1.25rem", lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#9AA3AF", marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <Row className="g-3">

          {/* Column Left (2/3) */}
          <Col lg={8}>

            {/* Profil Masjid Card */}
            <div className="db-card p-4 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <SectionLabel>Informasi Masjid</SectionLabel>
                <Link to="/app/profile" className="text-decoration-none"
                  style={{ fontSize: "0.9375rem", color: "#1A5C45", fontWeight: 600 }}>
                  Edit Profil <FaArrowRight size={10} className="ms-1" />
                </Link>
              </div>
              <Row>
                <Col md={6}>
                  <InfoRow icon={<FaMosque size={13} />} label="Nama Masjid" value={profile?.name} />
                  <InfoRow icon={<FaMapMarkerAlt size={13} />} label="Alamat" value={profile?.address} />
                  <InfoRow icon={<FaMapMarkerAlt size={13} />} label="Kecamatan" value={toTitleCase(profile?.district)} />
                  <InfoRow icon={<FaMapMarkerAlt size={13} />} label="Kelurahan" value={toTitleCase(profile?.sub_district)} />
                </Col>
                <Col md={6}>
                  <InfoRow icon={<FaMapMarkerAlt size={13} />} label="Kota / Kab." value={toTitleCase(profile?.city)} />
                  <InfoRow icon={<FaPhone size={13} />} label="Kontak" value={profile?.contact} />
                  <InfoRow icon={<FaEnvelope size={13} />} label="Email" value={profile?.email} />
                  <InfoRow icon={<FaGlobe size={13} />} label="Template" value={getTemplateName(profile?.template_code)} />
                </Col>
              </Row>
            </div>

            {/* Tentang Masjid — Step3Info saves as 'description' */}
            {profile?.description && (
              <div className="db-card p-4 mb-3">
                <SectionLabel>Tentang Masjid</SectionLabel>
                {profile?.description && (
                  <p className="text-dark mb-3" style={{ fontSize: "0.9375rem", lineHeight: 1.7 }}>
                    {profile.description.length > 300
                      ? profile.description.slice(0, 300) + "..."
                      : profile.description}
                  </p>
                )}
              </div>
            )}

            {/* Konten Terbaru */}
            <div className="db-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <SectionLabel>Konten Terbaru</SectionLabel>
                <Link to="/app/content" className="text-decoration-none"
                  style={{ fontSize: "0.9375rem", color: "#1A5C45", fontWeight: 600 }}>
                  Kelola Konten <FaArrowRight size={10} className="ms-1" />
                </Link>
              </div>
              {recentPosts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-2" style={{ fontSize: "0.9375rem" }}>Belum ada konten.</p>
                  <Link to="/app/content" className="text-decoration-none fw-semibold"
                    style={{ fontSize: "0.9375rem", color: "#1A5C45" }}>
                    + Tambah konten pertama Anda
                  </Link>
                </div>
              ) : (
                recentPosts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </Col>

          {/* Column Right (1/3) */}
          <Col lg={4}>

            {/* Status Kelengkapan */}
            <div className="db-card p-4 mb-3">
              <SectionLabel>Status Website</SectionLabel>
              {[
                { label: "Profil Masjid", done: !!(profile?.name && profile?.address) },
                { label: "Template Dipilih", done: !!profile?.template_code },
                { label: "Konten Ditambahkan", done: posts.length > 0 },
                { label: "Konten Dipublish", done: posts.some(p => p.is_published) },
              ].map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-2 mb-2">
                  {item.done
                    ? <FaCheckCircle size={14} style={{ color: "#1A5C45", flexShrink: 0 }} />
                    : <FaTimesCircle size={14} style={{ color: "#D0D5DD", flexShrink: 0 }} />}
                  <span style={{
                    fontSize: "0.9375rem",
                    color: item.done ? "#1a1a1a" : "#9AA3AF",
                    fontWeight: item.done ? 600 : 400,
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid #F0F0F0" }}>
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted" style={{ fontSize: "0.8125rem" }}>Kelengkapan</small>
                  <small className="fw-semibold" style={{ fontSize: "0.8125rem", color: "#1A5C45" }}>
                    {Math.round([
                      !!(profile?.name && profile?.address),
                      !!profile?.template_code,
                      posts.length > 0,
                      posts.some(p => p.is_published),
                    ].filter(Boolean).length / 4 * 100)}%
                  </small>
                </div>
                <div className="progress" style={{ height: 5, borderRadius: 10 }}>
                  <div className="progress-bar" role="progressbar"
                    style={{
                      width: `${[
                        !!(profile?.name && profile?.address),
                        !!profile?.template_code,
                        posts.length > 0,
                        posts.some(p => p.is_published),
                      ].filter(Boolean).length / 4 * 100}%`,
                      background: "linear-gradient(90deg, #0D3B2E, #1A5C45)",
                      borderRadius: 10,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="db-card p-4 mb-3">
              <SectionLabel>Aksi Cepat</SectionLabel>
              {[
                { label: "Edit Profil Masjid", to: "/app/profile", icon: <FaMosque size={13} /> },
                { label: "Tambah Berita", to: "/app/info/articles", icon: <FaNewspaper size={13} /> },
                { label: "Tambah Program", to: "/app/activities/program", icon: <FaListAlt size={13} /> },
                { label: "Tambah Kajian", to: "/app/activities/kajian", icon: <FaBullhorn size={13} /> },
              ].map((action, i) => (
                <Link key={i} to={action.to}
                  className="d-flex align-items-center gap-3 text-decoration-none py-2"
                  style={{ borderBottom: i < 3 ? "1px solid #F5F5F5" : "none" }}>
                  <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                    style={{ width: 30, height: 30, background: "#F0F7F4", color: "#1A5C45" }}>
                    {action.icon}
                  </div>
                  <span className="text-dark fw-semibold" style={{ fontSize: "0.9375rem" }}>{action.label}</span>
                  <FaArrowRight size={10} className="ms-auto" style={{ color: "#D0D5DD" }} />
                </Link>
              ))}
            </div>

            {/* Info Domain */}
            <div className="db-card p-4"
              style={{ background: "linear-gradient(135deg, #0D3B2E 0%, #1A5C45 100%)", border: "none" }}>
              <SectionLabel children={<span style={{ color: "rgba(201,168,76,0.8)" }}>Domain Website</span>} />
              <div className="text-white fw-bold mb-1" style={{ fontSize: "0.9375rem" }}>
                masjidku.id/<span style={{ color: "#C9A84C" }}>{profile?.slug || user?.slug || "-"}</span>
              </div>
              <p className="mb-3" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem" }}>
                Domain publik website masjid Anda.
              </p>
              {websiteUrl && (
                <a href={websiteUrl} target="_blank" rel="noreferrer"
                  className="d-flex align-items-center justify-content-center gap-2 text-decoration-none fw-semibold w-100"
                  style={{
                    background: "rgba(201,168,76,0.2)",
                    border: "1px solid rgba(201,168,76,0.4)",
                    borderRadius: 8,
                    padding: "8px 0",
                    color: "#C9A84C",
                    fontSize: "0.9375rem",
                  }}>
                  <FaExternalLinkAlt size={11} /> Buka Website
                </a>
              )}
            </div>

          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardHome;
