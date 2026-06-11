import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/apiClient";
import { FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import BrandLogo from "../../components/common/BrandLogo";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ mosqueName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { mosqueName, email, password } = formData;
      await authService.register({ name: mosqueName, email, password });
      await authService.login(email, password);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-vh-100 d-flex flex-lg-row-reverse">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .auth-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Left Panel (right on register — flipped) */
        .auth-panel-left {
          background: linear-gradient(160deg, #0D3B2E 0%, #1A5C45 50%, #0D3B2E 100%);
          position: relative;
          overflow: hidden;
        }
        .auth-panel-left::before {
          content: '';
          position: absolute;
          top: -80px;
          left: -80px;
          width: 340px;
          height: 340px;
          background: rgba(201,168,76,0.06);
          border-radius: 50%;
        }
        .auth-panel-left::after {
          content: '';
          position: absolute;
          bottom: -100px;
          right: -60px;
          width: 280px;
          height: 280px;
          background: rgba(201,168,76,0.04);
          border-radius: 50%;
        }
        .auth-panel-left .mosque-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1542385151-ef28badca83c?q=80&w=1500&auto=format&fit=crop') center/cover no-repeat;
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
        .auth-stat-pill {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 6px 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
        }
        .auth-stat-pill strong { color: #fff; }

        /* Form Panel */
        .auth-panel-right { background: #fff; }
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
        .steps-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .step-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 12px 14px;
        }
        .step-number {
          width: 24px;
          height: 24px;
          background: rgba(201,168,76,0.25);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: #C9A84C;
          margin-bottom: 6px;
        }
      `}</style>

      {/* Right Panel (register image is on right, flipped via flex-lg-row-reverse) */}
      <div className="auth-panel-left d-none d-lg-flex flex-column justify-content-between p-5" style={{ width: "46%", flexShrink: 0 }}>
        <div className="mosque-bg"></div>
        <div className="position-relative">
          {/* Brand */}
          <BrandLogo size="md" dark={true} subtitle="Platform Digital Masjid" className="mb-5" />

          {/* Headline */}
          <h1 className="text-white fw-bold mb-3" style={{ fontSize: "2.4rem", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
            Digitalisasi<br />
            <span style={{ color: "#C9A84C" }}>Masjid Anda.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: "340px" }} className="mb-5">
            Bergabunglah dengan pengurus masjid lainnya dan hadirkan website profesional hanya dalam beberapa langkah.
          </p>

          {/* Stats */}
          <div className="d-flex gap-2 flex-wrap mb-5">
            <span className="auth-stat-pill">🕌 <strong>Gratis</strong> untuk semua masjid</span>
            <span className="auth-stat-pill">⚡ Setup <strong>5 menit</strong></span>
          </div>
        </div>

        {/* Steps */}
        <div className="position-relative">
          <p className="text-white fw-semibold mb-3" style={{ fontSize: "0.82rem", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.5 }}>Alur Pendaftaran</p>
          <div className="steps-grid">
            {[
              { n: "01", t: "Daftar Akun", d: "Buat akun dengan email" },
              { n: "02", t: "Setup Website", d: "Pilih template & domain" },
              { n: "03", t: "Isi Profil", d: "Lengkapi data masjid" },
              { n: "04", t: "Publish!", d: "Website langsung aktif" },
            ].map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <div className="text-white fw-semibold" style={{ fontSize: "0.8rem" }}>{s.t}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.73rem" }}>{s.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textDecoration: "none" }}>
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>

      {/* Left Panel (Form) */}
      <div className="auth-panel-right flex-grow-1 d-flex align-items-center justify-content-center p-4 p-lg-5">
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Mobile brand */}
          <div className="d-flex d-lg-none mb-5">
            <BrandLogo size="sm" dark={false} subtitle="Platform Digital Masjid" />
          </div>

          <div className="mb-4">
            <h3 className="fw-bold mb-1" style={{ color: "#1a1a1a", letterSpacing: "-0.3px" }}>Buat Akun</h3>
            <p className="text-muted mb-0" style={{ fontSize: "0.87rem" }}>Daftarkan masjid Anda untuk mulai menggunakan platform.</p>
          </div>

          {error && (
            <Alert variant="danger" className="border-0 rounded-3 mb-4" style={{ fontSize: "0.85rem", background: "#FFF0F0" }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.83rem" }}>Nama Masjid</Form.Label>
              <Form.Control
                type="text"
                name="mosqueName"
                placeholder="Contoh: Masjid Al-Furqon"
                value={formData.mosqueName}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.83rem" }}>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="contoh@masjid.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.83rem" }}>Password</Form.Label>
              <div className="input-group auth-input-group">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
                <button type="button" className="input-group-btn border-0" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: "0.76rem" }}>
                Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.
              </div>
            </Form.Group>

            <Button type="submit" disabled={loading} className="auth-btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
              {loading ? (
                <><span className="spinner-border spinner-border-sm" /> Memproses...</>
              ) : (
                <>Daftar Sekarang <FaArrowRight size={14} /></>
              )}
            </Button>

            <p className="text-center mt-4 mb-0" style={{ fontSize: "0.85rem", color: "#666" }}>
              Sudah punya akun?{" "}
              <Link to="/login" className="auth-link-gold">Masuk di sini</Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
