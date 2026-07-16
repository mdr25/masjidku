import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import templateRegistry from "../../templates/registry";
import { authService } from "../../services/apiClient";
import { useMosqueWebsiteData } from "../../hooks/useMosqueWebsiteData";

const MosqueWebsitePage = () => {
  const { slug: urlSlug } = useParams();
  const isAdminPreview = !urlSlug; // Jika tidak ada parameter slug di URL, berarti ini mode /website (preview admin)
  
  // Ambil slug, prioritaskan urlSlug, baru fallback ke current user (untuk admin preview)
  const user = authService.getCurrentUser();
  const slug = urlSlug || user?.slug || user?.mosque_slug;

  const { config, loading, error, statusError } = useMosqueWebsiteData(slug);

  // Set page title dynamically based on mosque name
  useEffect(() => {
    if (config?.profile?.name) {
      document.title = `${config.profile.name} - Website Masjid`;
    }
  }, [config?.profile?.name]);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8f9fa" }}>
        <h3 style={{ color: "#0D3B2E", fontWeight: 600 }}>Memuat Website Masjid...</h3>
      </div>
    );
  }

  // --- Handling Errors ---
  if (!slug) {
    return (
      <div style={errorContainerStyle}>
        <h1>Error</h1>
        <p>Slug masjid tidak valid.</p>
        <Link to="/" style={btnStyle}>Kembali ke Beranda</Link>
      </div>
    );
  }

  if (statusError === "not_found") {
    return (
      <div style={errorContainerStyle}>
        <h1 style={{ fontSize: "4rem", marginBottom: 16 }}>404</h1>
        <h2>Masjid Tidak Ditemukan</h2>
        <p>Maaf, website masjid dengan alamat <strong>{slug}</strong> tidak ditemukan.</p>
        <Link to="/" style={btnStyle}>Kembali ke Beranda</Link>
      </div>
    );
  }

  // Jika ini halaman publik (bukan preview), blokir akses jika belum diverifikasi.
  // Jika backend kelak melempar 403, akan tertangkap di sini juga (karena hook mengembalikan statusError='not_verified').
  if (!isAdminPreview && statusError === "not_verified") {
    return (
      <div style={errorContainerStyle}>
        <h1 style={{ fontSize: "4rem", marginBottom: 16 }}>403</h1>
        <h2>Menunggu Verifikasi</h2>
        <p>Website masjid ini sedang dalam proses peninjauan oleh tim admin kami dan belum dapat diakses oleh publik.</p>
        <p style={{ marginTop: 10, fontSize: "0.9rem", color: "#666" }}>Mohon kembali lagi nanti.</p>
        <Link to="/" style={btnStyle}>Kembali ke Beranda</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorContainerStyle}>
        <h2>Terjadi Kesalahan</h2>
        <p>{error}</p>
        <Link to="/" style={btnStyle}>Kembali ke Beranda</Link>
      </div>
    );
  }

  const templateCode = config?.templateId || "TEMPLATE_A";
  const TemplateComponent = templateRegistry[templateCode]?.component || templateRegistry["TEMPLATE_A"].component;

  return (
    <div>
      {/* Banner Preview Khusus Admin */}
      {isAdminPreview && (
        <div style={{ background: "#C9A84C", color: "#fff", textAlign: "center", padding: "8px 16px", fontSize: "0.875rem", fontWeight: 600 }}>
          Ini adalah mode Preview. Website publik Anda dapat diakses di <Link to={`/masjid/${slug}`} style={{color: "#1A5C45", textDecoration: "underline"}}>/masjid/{slug}</Link>
        </div>
      )}
      {TemplateComponent ? (
        <TemplateComponent data={config} />
      ) : (
        <div style={{ padding: "50px", textAlign: "center" }}>Template not found</div>
      )}
    </div>
  );
};

const errorContainerStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "#f8f9fa",
  color: "#333",
  textAlign: "center",
  padding: 24,
};

const btnStyle = {
  marginTop: 24,
  padding: "10px 20px",
  background: "#0D3B2E",
  color: "#fff",
  textDecoration: "none",
  borderRadius: 8,
  fontWeight: 600,
};

export default MosqueWebsitePage;
