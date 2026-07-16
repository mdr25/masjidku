import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/apiClient";
import { FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import BrandLogo from "../../components/common/BrandLogo";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(email, password);
      const user = authService.getCurrentUser();
      if (user?.role === "super_admin") {
        navigate("/superadmin");
      } else {
        navigate("/app/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal masuk. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-vh-100 d-flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .auth-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Left Panel */
        .auth-panel-left {
          background: linear-gradient(160deg, #0D3B2E 0%, #1A5C45 50%, #0D3B2E 100%);
          position: relative;
          overflow: hidden;
        }
        .auth-panel-left::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 340px;
          height: 340px;
          background: rgba(201,168,76,0.06);
          border-radius: 50%;
        }
        .auth-panel-left::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -60px;
          width: 280px;
          height: 280px;
          background: rgba(201,168,76,0.04);
          border-radius: 50%;
        }
        .auth-panel-left .mosque-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1564769625905-50e93615e958?q=80&w=1500&auto=format&fit=crop') center/cover no-repeat;
          opacity: 0.07;
        }
        .auth-brand-logo {
          width: 48px;
          height: 48px;
          background: rgba(201,168,76,0.2);
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-feature-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .auth-feature-dot {
          width: 8px;
          height: 8px;
          background: #C9A84C;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        /* Right Panel (Form) */
        .auth-panel-right {
          background: #fff;
        }
        .auth-input {
          height: 50px;
          background: #F7F8FA !important;
          border: 1.5px solid #EAECF0 !important;
          border-radius: 10px !important;
          font-size: 0.9rem;
          padding-left: 16px !important;
          color: #1a1a1a;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: none !important;
        }
        .auth-input:focus {
          border-color: #1A5C45 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(26,92,69,0.08) !important;
        }
        .auth-input-group .auth-input {
          border-radius: 10px 0 0 10px !important;
        }
        .auth-input-group .input-group-btn {
          background: #F7F8FA;
          border: 1.5px solid #EAECF0;
          border-left: none;
          border-radius: 0 10px 10px 0;
          padding: 0 14px;
          cursor: pointer;
          color: #999;
          transition: color 0.2s;
        }
        .auth-input-group .input-group-btn:hover { color: #1A5C45; }
        .auth-input-group:focus-within .auth-input {
          border-color: #1A5C45 !important;
          box-shadow: none !important;
        }
        .auth-input-group:focus-within .input-group-btn {
          border-color: #1A5C45;
          box-shadow: none;
        }
        .auth-btn-primary {
          height: 50px;
          background: linear-gradient(135deg, #0D3B2E 0%, #1A5C45 100%);
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.2px;
          color: #fff;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(13,59,46,0.2);
        }
        .auth-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #0a2e23 0%, #155039 100%);
          box-shadow: 0 4px 14px rgba(13,59,46,0.3);
          transform: translateY(-1px);
          color: #fff;
        }
        .auth-btn-primary:disabled { opacity: 0.7; }
        .auth-link-gold {
          color: #B8941F;
          font-weight: 600;
          text-decoration: none;
        }
        .auth-link-gold:hover { color: #C9A84C; text-decoration: underline; }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ccc;
          font-size: 0.8rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #EAECF0;
        }
      `}</style>

      {/* Left Panel */}
      <div className="auth-panel-left d-none d-lg-flex flex-column justify-content-between p-5" style={{ width: "46%", flexShrink: 0 }}>
        <div className="mosque-bg"></div>
        <div className="position-relative">
          {/* Brand */}
          <BrandLogo size="md" dark={true} subtitle="Platform Digital Masjid" className="mb-5" />

          {/* Headline */}
          <h1 className="text-white fw-bold mb-3" style={{ fontSize: "2.4rem", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
            Selamat Datang<br />
            <span style={{ color: "#C9A84C" }}>Kembali.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: "360px" }}>
            Masuk ke panel pengurus untuk mengelola konten, program, dan interaksi jamaah masjid Anda.
          </p>
        </div>

        {/* Feature list */}
        <div className="position-relative d-flex flex-column gap-3">
          {[
            { title: "Kelola Konten Website", desc: "Header, hero, berita, galeri dalam satu tempat." },
            { title: "Jadwal & Program Masjid", desc: "Publikasikan kajian dan kegiatan dengan mudah." },
            { title: "Profil Masjid Lengkap", desc: "Sejarah, alamat, dan foto masjid Anda." },
          ].map((f, i) => (
            <div key={i} className="auth-feature-card">
              <div className="auth-feature-dot mt-1"></div>
              <div>
                <div className="text-white fw-semibold" style={{ fontSize: "0.85rem" }}>{f.title}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>{f.desc}</div>
              </div>
            </div>
          ))}
          <div className="mt-2">
            <Link to="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textDecoration: "none" }}>
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-panel-right flex-grow-1 d-flex align-items-center justify-content-center p-4 p-lg-5">
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Mobile brand */}
          <div className="d-flex d-lg-none mb-5">
            <BrandLogo size="sm" dark={false} subtitle="Platform Digital Masjid" />
          </div>

          <div className="mb-4">
            <h3 className="fw-bold mb-1" style={{ color: "#1a1a1a", letterSpacing: "-0.3px" }}>Masuk Akun</h3>
            <p className="text-muted mb-0" style={{ fontSize: "0.87rem" }}>Masukkan email & password untuk melanjutkan.</p>
          </div>

          {error && (
            <Alert variant="danger" className="border-0 rounded-3 mb-4" style={{ fontSize: "0.85rem", background: "#FFF0F0" }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.83rem" }}>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="contoh@masjid.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <Form.Label className="fw-semibold text-dark mb-0" style={{ fontSize: "0.83rem" }}>Password</Form.Label>
                <a href="#" className="auth-link-gold" style={{ fontSize: "0.8rem" }}>Lupa password?</a>
              </div>
              <div className="input-group auth-input-group">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                />
                <button type="button" className="input-group-btn border-0" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </Form.Group>

            <Button type="submit" disabled={loading} className="auth-btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
              {loading ? (
                <><span className="spinner-border spinner-border-sm" /> Memproses...</>
              ) : (
                <>Masuk Sekarang <FaArrowRight size={14} /></>
              )}
            </Button>

            <p className="text-center mt-4 mb-0" style={{ fontSize: "0.85rem", color: "#666" }}>
              Belum punya akun?{" "}
              <Link to="/register" className="auth-link-gold">Daftar di sini</Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
