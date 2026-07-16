import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaMosque, FaBars, FaTimes, FaArrowRight, FaCheck,
  FaLayerGroup, FaCalendarAlt, FaNewspaper, FaImages,
  FaMapMarkerAlt, FaPhoneAlt, FaShieldAlt, FaRocket,
  FaUsers, FaGlobe, FaClock, FaChevronDown,
  FaWhatsapp, FaInstagram, FaYoutube,
} from "react-icons/fa";
import { authService } from "../../services/apiClient";
import BrandLogo from "../../components/common/BrandLogo";

/* ─────────────────────────────────────────────────────── ANIMATION HOOK */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const Fade = ({ children, delay = 0, direction = "up", className = "" }) => {
  const [ref, inView] = useInView();
  const transform = {
    up: "translateY(32px)",
    down: "translateY(-32px)",
    left: "translateX(40px)",
    right: "translateX(-40px)",
    none: "none",
  }[direction];
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : transform,
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────── COUNTER */
const Counter = ({ to, suffix = "" }) => {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); } else { setVal(Math.floor(start)); }
    }, 16);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString("id-ID")}{suffix}</span>;
};

/* ─────────────────────────────────────────────────────── MAIN */
const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const currentUser = authService.getCurrentUser();
  const isLoggedIn = authService.isAuthenticated() && currentUser;
  const isSuperAdmin = currentUser?.role === "super_admin";
  const dashboardUrl = isSuperAdmin ? "/superadmin" : "/app/dashboard";

  useEffect(() => {
    document.title = "MasjidKu - Platform Digital Masjid Indonesia";
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ── FEATURES ── */
  const features = [
    {
      icon: <FaLayerGroup size={22} />,
      title: "Website Masjid Instan",
      desc: "Pilih dari berbagai tema premium dan publikasikan website masjid Anda dalam hitungan menit tanpa keahlian coding.",
    },
    {
      icon: <FaCalendarAlt size={22} />,
      title: "Jadwal Sholat Otomatis",
      desc: "Waktu sholat akurat berdasarkan lokasi GPS masjid, selalu sinkron setiap hari tanpa input manual.",
    },
    {
      icon: <FaNewspaper size={22} />,
      title: "Manajemen Konten",
      desc: "Kelola berita, program kegiatan, kajian, dan pengumuman langsung dari panel yang mudah digunakan.",
    },
    {
      icon: <FaImages size={22} />,
      title: "Galeri & Media",
      desc: "Upload foto dan video kegiatan masjid untuk diabadikan dan dibagikan kepada jamaah secara online.",
    },
    {
      icon: <FaMapMarkerAlt size={22} />,
      title: "Profil Masjid Lengkap",
      desc: "Tampilkan sejarah, struktur kepengurusan, dan informasi kontak masjid Anda.",
    },
    {
      icon: <FaShieldAlt size={22} />,
      title: "Aman & Terpercaya",
      desc: "Data masjid Anda aman dengan sistem keamanan berlapis dan backup otomatis setiap hari.",
    },
  ];

  /* ── STATS ── */
  const stats = [
    { value: 500, suffix: "+", label: "Masjid Bergabung" },
    { value: 34, suffix: " Provinsi", label: "Jangkauan Nasional" },
    { value: 205, suffix: " Juta", label: "Pengguna Internet RI" },
    { value: 99, suffix: "%", label: "Uptime Layanan" },
  ];

  /* ── TESTIMONIALS ── */
  const testimonials = [
    {
      name: "H. Ahmad Fauzi",
      role: "Ketua Takmir Masjid Al-Ikhlas, Bandung",
      quote: "Alhamdulillah, website masjid kami kini bisa diakses jamaah kapan saja. Jadwal sholat dan kajian langsung tampil rapi. Sangat membantu sekali!",
      initial: "A",
    },
    {
      name: "Ustadz Ridwan, S.Ag",
      role: "Pengurus Masjid Nurul Huda, Surabaya",
      quote: "Sistem ini luar biasa memudahkan kami mengumumkan kegiatan. Jamaah tidak perlu lagi mengandalkan grup WhatsApp saja.",
      initial: "R",
    },
    {
      name: "Bapak Suherman",
      role: "Sekretaris DKM Masjid Al-Falah, Jakarta",
      quote: "Tampilan websitenya profesional sekali. Banyak jamaah dari luar kota yang akhirnya bisa mengetahui kegiatan masjid kami.",
      initial: "S",
    },
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    .lp-root {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #1a1a1a;
      overflow-x: hidden;
    }

    /* ── NAV ── */
    .lp-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      padding: 0 0;
      transition: background 0.3s, box-shadow 0.3s, padding 0.3s;
    }
    .lp-nav.scrolled {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(16px);
      box-shadow: 0 2px 24px rgba(0,0,0,0.07);
    }
    .lp-nav-inner {
      max-width: 1160px;
      margin: 0 auto;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .lp-nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      list-style: none;
      margin: 0; padding: 0;
    }
    .lp-nav-links a {
      font-size: 0.875rem;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      padding: 8px 14px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .lp-nav.scrolled .lp-nav-links a { color: #374151; }
    .lp-nav-links a:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .lp-nav.scrolled .lp-nav-links a:hover { background: #F3F4F6; color: #0D3B2E; }

    .lp-btn-ghost {
      font-size: 0.875rem;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      border: 1.5px solid rgba(255,255,255,0.3);
      background: transparent;
      padding: 9px 20px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .lp-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.5); }
    .lp-nav.scrolled .lp-btn-ghost { color: #374151; border-color: #D1D5DB; }
    .lp-nav.scrolled .lp-btn-ghost:hover { background: #F3F4F6; color: #0D3B2E; border-color: #9CA3AF; }

    .lp-btn-cta {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0D3B2E;
      background: #C9A84C;
      border: none;
      padding: 10px 22px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .lp-btn-cta:hover { background: #b8941e; color: #0D3B2E; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.35); }

    .lp-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      color: #fff;
      border: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }
    .lp-btn-primary:hover { background: linear-gradient(135deg, #0a2e23, #155039); box-shadow: 0 8px 28px rgba(13,59,46,0.35); transform: translateY(-2px); color: #fff; }

    .lp-btn-outline-white {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: 1.5px solid rgba(255,255,255,0.3);
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }
    .lp-btn-outline-white:hover { background: rgba(255,255,255,0.18); color: #fff; border-color: rgba(255,255,255,0.5); }

    .lp-hamburger {
      display: none;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 4px;
    }
    .lp-nav.scrolled .lp-hamburger { color: #374151; }

    /* ── HERO ── */
    .lp-hero {
      min-height: 100vh;
      background: linear-gradient(160deg, #051f15 0%, #0D3B2E 40%, #1A5C45 100%);
      position: relative;
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .lp-hero-noise {
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.4;
    }
    .lp-hero-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(201,168,76,0.06);
      border: 1px solid rgba(201,168,76,0.1);
    }
    .lp-hero-grid {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .lp-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(201,168,76,0.12);
      border: 1px solid rgba(201,168,76,0.3);
      color: #C9A84C;
      padding: 6px 16px;
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 28px;
    }
    .lp-hero-title {
      font-size: clamp(2.5rem, 5.5vw, 4.2rem);
      font-weight: 900;
      line-height: 1.08;
      color: #fff;
      letter-spacing: -1.5px;
      margin-bottom: 24px;
    }
    .lp-hero-title .gold { color: #C9A84C; }
    .lp-hero-sub {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.65);
      line-height: 1.75;
      max-width: 560px;
      margin-bottom: 40px;
    }

    /* User chip on navbar */
    .lp-user-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 99px;
      padding: 6px 14px 6px 8px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #fff;
      text-decoration: none;
      transition: all 0.2s;
    }
    .lp-user-chip:hover { background: rgba(255,255,255,0.18); color: #fff; }
    .lp-nav.scrolled .lp-user-chip { background: #F3F4F6; border-color: #E5E7EB; color: #0D3B2E; }
    .lp-user-avatar {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, #C9A84C, #b8941e);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }

    /* ── HERO CARDS ── */
    .lp-hero-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      backdrop-filter: blur(12px);
      padding: 28px;
      transition: all 0.3s;
    }
    .lp-hero-card:hover { background: rgba(255,255,255,0.1); transform: translateY(-4px); }
    .lp-hero-card-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      background: rgba(201,168,76,0.15);
      border: 1px solid rgba(201,168,76,0.25);
      display: flex; align-items: center; justify-content: center;
      color: #C9A84C;
      margin-bottom: 16px;
    }

    /* ── SECTION ── */
    .lp-section { padding: 100px 0; }
    .lp-section-sm { padding: 72px 0; }
    .lp-section-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(13,59,46,0.07);
      color: #0D3B2E;
      border: 1px solid rgba(13,59,46,0.12);
      padding: 5px 14px;
      border-radius: 99px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .lp-section-title {
      font-size: clamp(1.8rem, 3.5vw, 2.6rem);
      font-weight: 800;
      color: #0D3B2E;
      letter-spacing: -0.8px;
      line-height: 1.15;
      margin-bottom: 16px;
    }
    .lp-section-sub {
      font-size: 1rem;
      color: #6B7280;
      line-height: 1.7;
      max-width: 560px;
    }

    /* ── STATS ── */
    .lp-stats-bar {
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      border-radius: 24px;
      padding: 52px 40px;
      position: relative;
      overflow: hidden;
    }
    .lp-stats-bar::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 240px; height: 240px;
      background: rgba(201,168,76,0.08);
      border-radius: 50%;
    }
    .lp-stat-val {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 900;
      color: #fff;
      letter-spacing: -1px;
      line-height: 1;
      margin-bottom: 6px;
    }
    .lp-stat-label {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.55);
      font-weight: 500;
    }
    .lp-stat-divider {
      width: 1px;
      background: rgba(255,255,255,0.12);
    }

    /* ── FEATURE CARDS ── */
    .lp-feat-card {
      background: #fff;
      border: 1px solid #F0F2F5;
      border-radius: 20px;
      padding: 32px;
      height: 100%;
      transition: all 0.3s;
    }
    .lp-feat-card:hover {
      border-color: rgba(13,59,46,0.15);
      box-shadow: 0 16px 48px rgba(13,59,46,0.08);
      transform: translateY(-4px);
    }
    .lp-feat-icon {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(13,59,46,0.07), rgba(26,92,69,0.04));
      border: 1px solid rgba(13,59,46,0.1);
      display: flex; align-items: center; justify-content: center;
      color: #0D3B2E;
      margin-bottom: 20px;
      transition: all 0.3s;
    }
    .lp-feat-card:hover .lp-feat-icon {
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      color: #C9A84C;
      border-color: transparent;
    }

    /* ── TESTIMONIALS ── */
    .lp-testi-card {
      background: #fff;
      border: 1px solid #F0F2F5;
      border-radius: 20px;
      padding: 32px;
      height: 100%;
      transition: all 0.3s;
    }
    .lp-testi-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.07); transform: translateY(-3px); }
    .lp-testi-avatar {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      color: #C9A84C;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .lp-stars { color: #C9A84C; font-size: 0.85rem; letter-spacing: 1px; }

    /* ── CTA ── */
    .lp-cta {
      background: linear-gradient(145deg, #051f15, #0D3B2E 50%, #1A5C45);
      border-radius: 32px;
      padding: 80px 60px;
      position: relative;
      overflow: hidden;
    }
    .lp-cta::before {
      content: '';
      position: absolute;
      bottom: -80px; right: -80px;
      width: 320px; height: 320px;
      background: rgba(201,168,76,0.08);
      border-radius: 50%;
    }
    .lp-cta::after {
      content: '';
      position: absolute;
      top: -60px; left: 30%;
      width: 200px; height: 200px;
      background: rgba(201,168,76,0.04);
      border-radius: 50%;
    }

    /* ── FOOTER ── */
    .lp-footer { background: #0D3B2E; padding: 72px 0 0; }
    .lp-footer-link {
      color: rgba(255,255,255,0.45);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s;
      display: block;
      margin-bottom: 10px;
    }
    .lp-footer-link:hover { color: #C9A84C; }
    .lp-footer-heading {
      font-size: 0.78rem;
      font-weight: 700;
      color: rgba(255,255,255,0.3);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .lp-social-btn {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.5);
      transition: all 0.2s;
      text-decoration: none;
    }
    .lp-social-btn:hover { background: rgba(201,168,76,0.15); border-color: rgba(201,168,76,0.3); color: #C9A84C; }

    /* ── MOBILE MENU ── */
    .lp-mobile-menu {
      position: fixed;
      inset: 0;
      background: #0D3B2E;
      z-index: 999;
      display: flex;
      flex-direction: column;
      padding: 32px 24px;
      transform: translateX(-100%);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .lp-mobile-menu.open { transform: none; }
    .lp-mobile-link {
      display: block;
      font-size: 1.3rem;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      transition: color 0.2s;
    }
    .lp-mobile-link:hover { color: #C9A84C; }

    /* ── SCROLL HINT ── */
    .lp-scroll-hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: rgba(255,255,255,0.35);
      font-size: 0.75rem;
      font-weight: 500;
      animation: bounce 2s ease infinite;
    }
    @keyframes bounce {
      0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)}
    }

    @media (max-width: 991px) {
      .lp-nav-links, .lp-nav-actions { display: none !important; }
      .lp-hamburger { display: block !important; }
      .lp-stats-bar { padding: 36px 24px; }
      .lp-cta { padding: 48px 28px; }
    }
    @media (max-width: 575px) {
      .lp-hero-title { letter-spacing: -0.5px; }
      .lp-section { padding: 72px 0; }
    }
  `;

  const userInitial = currentUser?.name?.charAt(0).toUpperCase() || "?";
  const userName = currentUser?.name?.split(" ")[0] || "";

  return (
    <div className="lp-root">
      <style>{css}</style>

      {/* ─────────────────────── NAVBAR */}
      <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <BrandLogo size="md" dark={!scrolled} subtitle="Platform Digital Masjid" />

          <ul className="lp-nav-links">
            {["Fitur", "Mengapa Kami", "Testimoni"].map((item) => (
              <li key={item}>
                <a href="#" onClick={(e) => { e.preventDefault(); scrollTo(item.toLowerCase().replace(" ", "-")); }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <div className="lp-nav-actions d-flex align-items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to={dashboardUrl} className="lp-user-chip">
                  <div className="lp-user-avatar">{userInitial}</div>
                  {userName}
                </Link>
                <Link to={dashboardUrl} className="lp-btn-cta">
                  Dashboard <FaArrowRight size={12} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="lp-btn-ghost">Masuk</Link>
                <Link to="/register" className="lp-btn-cta">Mulai Gratis <FaArrowRight size={12} /></Link>
              </>
            )}
          </div>

          <button className="lp-hamburger" onClick={() => setMenuOpen(true)}>
            <FaBars size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lp-mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <BrandLogo size="md" dark={true} subtitle="Platform Digital Masjid" />
          <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }} onClick={() => setMenuOpen(false)}>
            <FaTimes size={22} />
          </button>
        </div>
        {["Fitur", "Mengapa Kami", "Testimoni"].map((item) => (
          <a key={item} href="#" className="lp-mobile-link" onClick={(e) => { e.preventDefault(); scrollTo(item.toLowerCase().replace(" ", "-")); }}>
            {item}
          </a>
        ))}
        <div className="mt-auto d-flex flex-column gap-3 pt-5">
          {isLoggedIn ? (
            <Link to={dashboardUrl} className="lp-btn-primary w-100 justify-content-center" onClick={() => setMenuOpen(false)}>
              Buka Dashboard <FaArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="lp-btn-outline-white w-100 justify-content-center" onClick={() => setMenuOpen(false)}>
                Masuk
              </Link>
              <Link to="/register" className="lp-btn-primary w-100 justify-content-center" onClick={() => setMenuOpen(false)}>
                Mulai Gratis <FaArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ─────────────────────── HERO */}
      <section id="beranda" className="lp-hero">
        <div className="lp-hero-noise" />
        <div className="lp-hero-grid" />
        <div className="lp-hero-circle" style={{ width: 600, height: 600, top: -200, right: -200 }} />
        <div className="lp-hero-circle" style={{ width: 350, height: 350, bottom: -100, left: -100 }} />

        <Container style={{ position: "relative", zIndex: 1, paddingTop: "80px", paddingBottom: "80px" }}>
          <Row className="align-items-center g-5">
            <Col lg={7}>
              <div>
                {isLoggedIn ? (
                  <div className="lp-badge mb-4">
                    <div className="lp-user-avatar" style={{ width: 20, height: 20, fontSize: "0.65rem" }}>{userInitial}</div>
                    Selamat datang kembali, {userName}!
                  </div>
                ) : (
                  <div className="lp-badge">
                    <FaRocket size={11} /> Platform Masjid Digital #1 Indonesia
                  </div>
                )}

                <h1 className="lp-hero-title">
                  Website Masjid<br />
                  <span className="gold">Profesional,</span><br />
                  Dalam Hitungan Menit.
                </h1>
                <p className="lp-hero-sub">
                  Berdayakan masjid Anda dengan teknologi digital. Kelola jadwal sholat, konten, program kajian, dan lebih banyak lagi — dari satu panel yang mudah digunakan.
                </p>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  {isLoggedIn ? (
                    <Link to={dashboardUrl} className="lp-btn-primary" style={{ background: "#C9A84C", color: "#0D3B2E" }}>
                      Buka Dashboard <FaArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link to="/register" className="lp-btn-primary" style={{ background: "#C9A84C", color: "#0D3B2E" }}>
                      Daftar Gratis <FaArrowRight size={14} />
                    </Link>
                  )}
                  <button
                    className="lp-btn-outline-white"
                    onClick={() => scrollTo("fitur")}
                    style={{ fontSize: "0.9rem", padding: "13px 26px" }}
                  >
                    Lihat Fitur <FaChevronDown size={12} />
                  </button>
                </div>

                <div className="d-flex align-items-center gap-5 mt-5 flex-wrap">
                  {[["500+", "Masjid Aktif"], ["34", "Provinsi"], ["99%", "Uptime"]].map(([val, label]) => (
                    <div key={label}>
                      <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{val}</div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col lg={5}>
              <div className="d-flex flex-column gap-3">
                {[
                  { icon: <FaCalendarAlt size={18} />, title: "Jadwal Sholat Otomatis", desc: "Sinkron berdasarkan lokasi GPS masjid." },
                  { icon: <FaLayerGroup size={18} />, title: "5 Tema Premium", desc: "Pilih tampilan yang sesuai karakter masjid." },
                  { icon: <FaShieldAlt size={18} />, title: "Aman & Terpercaya", desc: "Data Anda terlindungi dengan enkripsi penuh." },
                ].map((card, i) => (
                  <div key={i} className="lp-hero-card" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="lp-hero-card-icon">{card.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem", marginBottom: 2 }}>{card.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>{card.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          <div className="text-center mt-5 pt-3">
            <div className="lp-scroll-hint">
              <FaChevronDown size={14} />
              <span>Gulir untuk melihat fitur</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────── STATS */}
      <section className="lp-section-sm" style={{ background: "#F9FAFB" }}>
        <Container>
          <Fade>
            <div className="lp-stats-bar">
              <Row className="align-items-center">
                {stats.map((s, i) => (
                  <React.Fragment key={i}>
                    <Col>
                      <div className="lp-stat-val">
                        <Counter to={s.value} suffix={s.suffix} />
                      </div>
                      <div className="lp-stat-label">{s.label}</div>
                    </Col>
                    {i < stats.length - 1 && (
                      <div className="lp-stat-divider d-none d-lg-block" style={{ height: 60 }} />
                    )}
                  </React.Fragment>
                ))}
              </Row>
            </div>
          </Fade>
        </Container>
      </section>

      {/* ─────────────────────── FITUR */}
      <section id="fitur" className="lp-section" style={{ background: "#fff" }}>
        <Container>
          <Fade>
            <div className="text-center mb-5">
              <div className="lp-section-chip"><FaRocket size={11} /> Fitur Unggulan</div>
              <h2 className="lp-section-title">Semua yang Masjid Anda Butuhkan</h2>
              <p className="lp-section-sub mx-auto">
                Dari jadwal sholat hingga galeri kegiatan — satu platform untuk memakmurkan masjid di era digital.
              </p>
            </div>
          </Fade>
          <Row className="g-4">
            {features.map((f, i) => (
              <Col lg={4} md={6} key={i}>
                <Fade delay={i * 0.08} direction="up">
                  <div className="lp-feat-card">
                    <div className="lp-feat-icon">{f.icon}</div>
                    <h5 style={{ fontWeight: 700, color: "#0D3B2E", fontSize: "1rem", marginBottom: 10 }}>{f.title}</h5>
                    <p style={{ color: "#6B7280", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                  </div>
                </Fade>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ─────────────────────── WHY US */}
      <section id="mengapa-kami" className="lp-section" style={{ background: "#F9FAFB" }}>
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <Fade direction="right">
                <div className="lp-section-chip"><FaGlobe size={11} /> Mengapa MasjidKu?</div>
                <h2 className="lp-section-title">Platform Terpercaya untuk Masjid Modern</h2>
                <p style={{ color: "#6B7280", lineHeight: 1.8, marginBottom: 32 }}>
                  MasjidKu dirancang khusus oleh tim yang memahami kebutuhan masjid Indonesia. Bukan sekadar website biasa, tapi ekosistem digital lengkap yang menghubungkan pengurus dengan jamaah.
                </p>
                <div className="d-flex flex-column gap-3">
                  {[
                    "Setup cepat, tanpa keahlian teknis apapun",
                    "Jadwal sholat akurat dari sumber resmi",
                    "Desain responsif — tampil sempurna di HP & komputer",
                    "Panel admin yang sederhana dan intuitif",
                    "Dukungan pelanggan siap membantu",
                  ].map((item, i) => (
                    <div key={i} className="d-flex align-items-start gap-3">
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(13,59,46,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <FaCheck size={10} color="#0D3B2E" />
                      </div>
                      <span style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 500 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </Fade>
            </Col>
            <Col lg={6}>
              <Fade direction="left">
                <div
                  style={{
                    borderRadius: 28,
                    overflow: "hidden",
                    position: "relative",
                    background: "linear-gradient(145deg, #0D3B2E, #1A5C45)",
                    padding: 32,
                    boxShadow: "0 32px 80px rgba(13,59,46,0.2)",
                  }}
                >
                  <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(201,168,76,0.08)" }} />
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontWeight: 800, color: "#C9A84C", fontSize: "0.8rem", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Cuplikan Dashboard</div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "1.1rem" }}>Panel Pengurus Masjid</div>
                  </div>
                  {[
                    { icon: <FaUsers size={14} />, label: "Total Jamaah Terdaftar", val: "1.240" },
                    { icon: <FaCalendarAlt size={14} />, label: "Program Bulan Ini", val: "8 Kajian" },
                    { icon: <FaNewspaper size={14} />, label: "Berita Terbit", val: "24 Berita" },
                    { icon: <FaClock size={14} />, label: "Jadwal Sholat Hari Ini", val: "Sudah Sinkron ✓" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div className="d-flex align-items-center gap-2" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: "#C9A84C", fontSize: "0.85rem" }}>{item.val}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>Ini hanya ilustrasi. Data Anda akan tampil di sini.</span>
                  </div>
                </div>
              </Fade>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ─────────────────────── TESTIMONIALS */}
      <section id="testimoni" className="lp-section" style={{ background: "#fff" }}>
        <Container>
          <Fade>
            <div className="text-center mb-5">
              <div className="lp-section-chip"><FaUsers size={11} /> Testimoni</div>
              <h2 className="lp-section-title">Dipercaya Pengurus Masjid<br />di Seluruh Indonesia</h2>
            </div>
          </Fade>
          <Row className="g-4">
            {testimonials.map((t, i) => (
              <Col lg={4} key={i}>
                <Fade delay={i * 0.1}>
                  <div className="lp-testi-card">
                    <div className="lp-stars mb-3">★★★★★</div>
                    <p style={{ color: "#374151", lineHeight: 1.75, fontSize: "0.9rem", marginBottom: 24, fontStyle: "italic" }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="d-flex align-items-center gap-3">
                      <div className="lp-testi-avatar">{t.initial}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0D3B2E" }}>{t.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </Fade>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ─────────────────────── CTA */}
      <section className="lp-section-sm" style={{ background: "#F9FAFB" }}>
        <Container>
          <Fade>
            <div className="lp-cta text-center">
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="lp-badge mx-auto mb-4" style={{ justifyContent: "center" }}>
                  <FaRocket size={11} /> Mulai Hari Ini — Gratis!
                </div>
                <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
                  Waktunya Masjid Anda<br />
                  <span style={{ color: "#C9A84C" }}>Go Digital.</span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7, fontSize: "1rem" }}>
                  Bergabunglah dengan ratusan masjid yang sudah memanfaatkan MasjidKu untuk mendekatkan diri dengan jamaah.
                </p>
                {isLoggedIn ? (
                  <Link to={dashboardUrl} className="lp-btn-primary" style={{ background: "#C9A84C", color: "#0D3B2E", fontSize: "1rem", padding: "14px 36px" }}>
                    Buka Dashboard Saya <FaArrowRight size={14} />
                  </Link>
                ) : (
                  <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                    <Link to="/register" className="lp-btn-primary" style={{ background: "#C9A84C", color: "#0D3B2E", fontSize: "1rem", padding: "14px 36px" }}>
                      Daftar Sekarang — Gratis <FaArrowRight size={14} />
                    </Link>
                    <Link to="/login" className="lp-btn-outline-white" style={{ fontSize: "0.9rem", padding: "13px 28px" }}>
                      Sudah punya akun?
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Fade>
        </Container>
      </section>

      {/* ─────────────────────── FOOTER */}
      <footer className="lp-footer">
        <Container>
          <Row className="g-5 pb-5">
            <Col lg={4}>
              <BrandLogo size="lg" dark={true} subtitle="Platform Digital Masjid" className="mb-4" />
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", lineHeight: 1.75, maxWidth: 300 }}>
                Platform SaaS untuk mewujudkan ekosistem masjid yang modern, informatif, dan terhubung dengan jamaah di mana saja.
              </p>
              <div className="d-flex gap-2 mt-4">
                <a href="#ig" className="lp-social-btn"><FaInstagram size={16} /></a>
                <a href="#wa" className="lp-social-btn"><FaWhatsapp size={16} /></a>
                <a href="#yt" className="lp-social-btn"><FaYoutube size={16} /></a>
              </div>
            </Col>
            <Col lg={2} md={4}>
              <div className="lp-footer-heading">Platform</div>
              <a href="#fitur" onClick={(e) => { e.preventDefault(); scrollTo("fitur"); }} className="lp-footer-link">Fitur</a>
              <a href="#mengapa-kami" onClick={(e) => { e.preventDefault(); scrollTo("mengapa-kami"); }} className="lp-footer-link">Mengapa Kami</a>
              <a href="#testimoni" onClick={(e) => { e.preventDefault(); scrollTo("testimoni"); }} className="lp-footer-link">Testimoni</a>
            </Col>
            <Col lg={2} md={4}>
              <div className="lp-footer-heading">Akun</div>
              <Link to="/login" className="lp-footer-link">Masuk</Link>
              <Link to="/register" className="lp-footer-link">Daftar Gratis</Link>
              {isLoggedIn && <Link to={dashboardUrl} className="lp-footer-link">Dashboard</Link>}
            </Col>
            <Col lg={4} md={4}>
              <div className="lp-footer-heading">Kontak</div>
              <div className="d-flex align-items-center gap-2 mb-2" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>
                <FaPhoneAlt size={12} /> <span>+62 812 3456 7890</span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-4" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>
                <FaMapMarkerAlt size={12} /> <span>Indonesia</span>
              </div>
              {!isLoggedIn && (
                <Link to="/register" className="lp-btn-cta" style={{ fontSize: "0.85rem", padding: "10px 20px" }}>
                  Mulai Gratis <FaArrowRight size={11} />
                </Link>
              )}
            </Col>
          </Row>
        </Container>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", textAlign: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} MasjidKu. Hak cipta dilindungi undang-undang.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
