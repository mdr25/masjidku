import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaWhatsapp,
  FaTiktok,
  FaArrowRight,
  FaMosque,
  FaBars,
  FaTimes,
  FaHeart,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaClock,
  FaPlay,
} from "react-icons/fa";

// ─── Template 2 — "Sapphire Harmony" ─────────────────────────────────────────
const Template2 = ({ data }) => {
  const profile = data?.profile || {
    name: "Masjid Al-Iman",
    address: "Indonesia",
  };

  const prayer = data?.prayer || {
    fajr: "04:30",
    dhuhr: "12:00",
    asr: "15:15",
    maghrib: "18:00",
    isha: "19:15",
  };

  // ── Header config ──
  const hdr = data?.header || {};
  const logoText = hdr.logoText || profile.name;
  const navStyle = hdr.navbarStyle || "dark";
  const isSticky = hdr.sticky !== false;
  const ctaButtons = hdr.ctaButtons || [{ label: "Donasi", show: true }];

  const allMenu = hdr.menu || {
    beranda: "Beranda",
    profil: "Profil",
    program: "Program",
    kajian: "Kajian",
    artikel: "Berita",
    galeri: "Galeri",
    kontak: "Kontak",
  };
  const menuVis = hdr.menuVisible || {};
  const visMenu = Object.entries(allMenu).filter(([k]) => menuVis[k] !== false);

  // ── Hero config ──
  const h = data?.hero || {};
  const heroTitle = h.title || "Bersama Makmur dan Memakmurkan Masjid";
  const heroSubtitle =
    h.subtitle ||
    "Selamat datang di website resmi " +
      profile.name +
      ". Temukan informasi kegiatan, jadwal sholat, dan program masjid kami.";
  const heroImage =
    h.image ||
    "https://images.unsplash.com/photo-1560626184-524744344bef?q=80&w=1233&auto=format&fit=crop";
  const ctaLabel = h.ctaLabel || "Lihat Program";
  const ctaSecondary = h.ctaSecondary || "Tentang Kami";
  const ctaPrimaryDest = h.ctaPrimaryDest || "program";
  const ctaSecondaryDest = h.ctaSecondaryDest || "profil";
  // For Template 2, we will mostly enforce a centered or split layout
  // to differentiate heavily from Template 1.
  const heroLayout = h.layout || "image-right";
  const showPrayer = h.showPrayerBar !== false;

  // ── Scroll ──
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("beranda");
  const [activePrayer, setActivePrayer] = useState(null);

  // ── Donation Modal ──
  const [showDonationModal, setShowDonationModal] = useState(false);
  const donationConfig = hdr.donation || null;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const checkPrayer = () => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();

      const prayerTimes = Object.entries(prayer)
        .map(([key, val]) => {
          const [hh, mm] = (val || "00:00").split(":").map(Number);
          return { key, totalMins: hh * 60 + (mm || 0) };
        })
        .sort((a, b) => a.totalMins - b.totalMins);

      let active = null;
      for (let i = prayerTimes.length - 1; i >= 0; i--) {
        if (prayerTimes[i].totalMins <= nowMins) {
          active = prayerTimes[i].key;
          break;
        }
      }
      if (!active && prayerTimes.length > 0) {
        active = prayerTimes[prayerTimes.length - 1].key;
      }
      setActivePrayer(active);
    };
    checkPrayer();
    const t = setInterval(checkPrayer, 30000);
    return () => clearInterval(t);
  }, [prayer]);

  // ── Color themes (Sapphire Harmony) ──
  const T = {
    dark: {
      navBg: scrolled ? "rgba(27, 58, 107, 0.95)" : "transparent",
      text: "#fff",
      muted: "rgba(255,255,255,0.7)",
      border: "rgba(255,255,255,0.1)",
      ctaBg: "#2563EB",
      heroBg: "#1B3A6B",
    },
    light: {
      navBg: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
      text: scrolled ? "#1B3A6B" : "#fff",
      muted: scrolled ? "#64748B" : "rgba(255,255,255,0.8)",
      border: scrolled ? "#E2E8F0" : "rgba(255,255,255,0.2)",
      ctaBg: "#2563EB",
      heroBg: "#1B3A6B",
    },
    green: {
      navBg: scrolled ? "rgba(37, 99, 235, 0.95)" : "transparent",
      text: "#fff",
      muted: "rgba(255,255,255,0.8)",
      border: "rgba(255,255,255,0.15)",
      ctaBg: "#1B3A6B",
      heroBg: "#2563EB",
    },
  };
  const th = T[navStyle] || T.dark;

  const HeroTextBlock = ({ align = "center" }) => (
    <div className={align === "center" ? "mx-auto text-center" : "text-start"} style={{ maxWidth: 800 }}>
      <div className={`mb-4 d-inline-flex align-items-center gap-2 ${align === "center" ? "mx-auto" : ""}`} style={{ background: "rgba(255,255,255,0.1)", padding: "8px 20px", borderRadius: 99, backdropFilter: "blur(10px)" }}>
        <FaMosque size={14} color="#93C5FD" />
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#DBEAFE", letterSpacing: 1 }}>SELAMAT DATANG</span>
      </div>
      <h1 className="t2-hero-title">{heroTitle}</h1>
      <p className={`t2-hero-subtitle ${align === "center" ? "mx-auto" : ""}`}>{heroSubtitle}</p>
      <div className={`d-flex align-items-center gap-3 flex-wrap ${align === "center" ? "justify-content-center" : ""}`}>
        <a href={`#${ctaPrimaryDest}`} className="t2-btn-cta" style={{ padding: "14px 32px", fontSize: "1rem" }}>
          {ctaLabel}
        </a>
        <a href={`#${ctaSecondaryDest}`} className="t2-btn-cta" style={{ background: "rgba(255,255,255,0.1)", boxShadow: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
          {ctaSecondary}
        </a>
      </div>
    </div>
  );

  // ── Mock content ──
  const articles =
    data?.articles?.length > 0
      ? data.articles
      : [
          {
            id: 1,
            title: "Menyambut Ramadhan 1444 H, Tinggal 30 Hari!",
            summary: "Persiapan menyambut bulan suci penuh berkah.",
            date: "30 Mar 2023",
            image: "https://images.unsplash.com/photo-1561314945-0562f5b6d2c6?q=80&w=1171&auto=format&fit=crop",
          },
          {
            id: 2,
            title: "Kajian Fiqih Muamalah bersama Ustadz Ahmad",
            summary: "Pembahasan hukum ekonomi Islam kontemporer.",
            date: "15 Apr 2023",
            image: "https://images.unsplash.com/photo-1636985418926-6752c84bf50a?q=80&w=1171&auto=format&fit=crop",
          },
        ];

  const programs = data?.programs || [];

  const kajian =
    data?.kajian?.length > 0
      ? data.kajian
      : [
          {
            id: 1,
            title: "Kajian Rutin Ahad Pagi",
            speaker: "Ustadz Ahmad Fauzi, Lc.",
            date: "2026-06-15",
            time: "07:00",
            location: "Aula Utama",
          },
          {
            id: 2,
            title: "Halaqah Quran Mingguan",
            speaker: "Ustadz Hasan Basri",
            date: "2026-06-18",
            time: "19:30",
            location: "Masjid Utama",
          },
        ];

  const gallery =
    data?.gallery?.length > 0
      ? data.gallery
      : [
          "https://images.unsplash.com/photo-1577985051167-0d49eec21977?q=80&w=1170&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=1170&auto=format&fit=crop",
        ];

  const prayerLabels = {
    fajr: "Subuh",
    dhuhr: "Dzuhur",
    asr: "Ashar",
    maghrib: "Maghrib",
    isha: "Isya",
  };

  // ─── STYLES (Sapphire Harmony) ───
  const getYTThumb = (url) => {
    const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    html { scroll-behavior: smooth; }
    .t2-root {
      font-family: 'Inter', sans-serif;
      background: #F8FAFC;
      color: #1E293B;
      overflow-x: hidden;
    }

    /* Navbar */
    .t2-navbar {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: ${scrolled ? 'blur(12px)' : 'none'};
      padding: ${scrolled ? '12px 0' : '24px 0'};
    }
    .t2-nav-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: inherit;
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s;
      position: relative;
    }
    .t2-nav-link::after {
      content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
      width: 0; height: 2px; background: #2563EB; transition: width 0.3s;
    }
    .t2-nav-link:hover::after, .t2-nav-link.active::after { width: 80%; }
    
    .t2-btn-cta {
      background: #2563EB;
      color: #fff;
      padding: 10px 24px;
      border-radius: 99px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 4px 14px rgba(37,99,235,0.3);
    }
    .t2-btn-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); color: #fff; }

    .t2-btn-outline {
      background: #fff;
      color: #2563EB;
      border: 1.5px solid #E2E8F0;
      padding: 10px 24px;
      border-radius: 99px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.3s;
    }
    .t2-btn-outline:hover { background: #F8FAFC; color: #1D4ED8; border-color: #CBD5E1; }

    /* Hero */
    .t2-hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding-top: 80px;
      background: ${th.heroBg};
      overflow: hidden;
    }
    .t2-hero-img {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      opacity: 0.25;
      mix-blend-mode: overlay;
    }
    .t2-hero-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to bottom, rgba(27,58,107,0.4), rgba(27,58,107,1));
    }
    .t2-hero-content {
      position: relative;
      z-index: 2;
      color: #fff;
    }
    .t2-hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 24px;
      letter-spacing: -1px;
    }
    .t2-hero-subtitle {
      font-size: 1.125rem;
      color: #E2E8F0;
      max-width: 600px;
      line-height: 1.6;
      margin-bottom: 40px;
    }

    /* Prayer Times (Vertical Cards) */
    .t2-prayer-wrapper {
      margin-top: -80px;
      position: relative;
      z-index: 10;
      margin-bottom: 80px;
    }
    .t2-prayer-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
    }
    @media(max-width: 991px) {
      .t2-prayer-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media(max-width: 575px) {
      .t2-prayer-grid { grid-template-columns: repeat(2, 1fr); }
    }
    .t2-prayer-card {
      background: #fff;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border: 1px solid #F1F5F9;
      transition: all 0.3s;
    }
    .t2-prayer-card.active {
      background: #1B3A6B;
      color: #fff;
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(27,58,107,0.2);
      border-color: #1B3A6B;
    }
    .t2-prayer-card:hover { transform: translateY(-5px); }
    
    /* Sections */
    .t2-section { padding: 100px 0; }
    .t2-section-gray { background: #F8FAFC; }
    .t2-section-white { background: #fff; }
    
    .t2-section-badge {
      display: inline-block;
      padding: 6px 16px;
      background: rgba(37,99,235,0.1);
      color: #2563EB;
      border-radius: 99px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    .t2-section-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    /* Cards */
    .t2-card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      border: 1px solid #F1F5F9;
      transition: all 0.3s ease;
      height: 100%;
    }
    .t2-card:hover {
      box-shadow: 0 12px 32px rgba(0,0,0,0.08);
      transform: translateY(-4px);
    }
    .t2-card-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
    }

    /* Kajian Card */
    .t2-kajian-card {
      display: flex;
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      gap: 20px;
      border: 1px solid #E2E8F0;
      transition: all 0.3s;
      align-items: center;
    }
    .t2-kajian-card:hover { border-color: #2563EB; box-shadow: 0 10px 30px rgba(37,99,235,0.08); }
    .t2-kajian-date {
      min-width: 80px;
      text-align: center;
      padding-right: 20px;
      border-right: 2px solid #F1F5F9;
    }

    /* Footer */
    .t2-footer {
      background: #0F172A;
      color: #94A3B8;
      padding: 80px 0 40px;
    }
    .t2-footer-title { color: #fff; font-weight: 700; margin-bottom: 24px; font-size: 1.125rem; }
    .t2-footer-link { color: #94A3B8; text-decoration: none; display: block; margin-bottom: 12px; transition: color 0.2s; }
    .t2-footer-link:hover { color: #3B82F6; }

    /* Mobile Menu */
    .t2-mobile-menu {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15,23,42,0.98); z-index: 2000;
      display: flex; flex-direction: column; padding: 24px;
      transform: translateX(100%); transition: transform 0.3s;
    }
    .t2-mobile-menu.open { transform: translateX(0); }
  `;

  return (
    <div className="t2-root">
      <style>{css}</style>

      {/* ══════════════════════════════════════════ NAVBAR ════ */}
      <nav
        className="t2-navbar"
        style={{
          position: isSticky ? "fixed" : "absolute",
          top: 0,
          left: 0,
          right: 0,
          background: th.navBg,
          borderBottom: `1px solid ${th.border}`,
          zIndex: 1000,
        }}
      >
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            {/* Brand */}
            <a href="#beranda" className="d-flex align-items-center text-decoration-none gap-2">
              {hdr.logoImage ? (
                <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 12, padding: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <img src={hdr.logoImage} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaMosque size={20} color={th.text} />
                </div>
              )}
              <span style={{ fontWeight: 800, fontSize: "1.125rem", color: th.text, letterSpacing: "-0.5px" }}>
                {logoText}
              </span>
            </a>

            {/* Desktop Menu */}
            <div className="d-none d-lg-flex align-items-center gap-4">
              {visMenu.map(([key, label]) => (
                <a
                  key={key}
                  href={`#${key}`}
                  className={`t2-nav-link ${activeLink === key ? "active" : ""}`}
                  style={{ color: th.text }}
                  onClick={() => setActiveLink(key)}
                >
                  {label}
                </a>
              ))}
              {ctaButtons.filter((b) => b.show !== false).map((btn, i) => {
                const isDonasi = btn.label.toLowerCase().includes("donasi");
                return (
                  <a 
                    key={i} 
                    href={`#${i === 0 ? ctaPrimaryDest : ctaSecondaryDest}`} 
                    className="t2-btn-cta"
                    onClick={(e) => {
                      if (isDonasi) {
                        e.preventDefault();
                        setShowDonationModal(true);
                      }
                    }}
                  >
                    {btn.label}
                  </a>
                );
              })}
            </div>

            {/* Mobile Toggle */}
            <button className="d-lg-none btn btn-link p-0" onClick={() => setMobileOpen(true)} style={{ color: th.text }}>
              <FaBars size={24} />
            </button>
          </div>
        </Container>
      </nav>

      {/* ── Mobile Menu ── */}
      <div className={`t2-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div className="d-flex justify-content-end mb-5">
          <button className="btn btn-link p-0 text-white" onClick={() => setMobileOpen(false)}>
            <FaTimes size={32} />
          </button>
        </div>
        <div className="d-flex flex-column gap-4 text-center">
          {visMenu.map(([key, label]) => (
            <a key={key} href={`#${key}`} className="text-white text-decoration-none fs-3 fw-bold" onClick={() => setMobileOpen(false)}>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════ HERO ════ */}
      <header className="t2-hero" id="beranda">
        {(heroLayout === "full-bg" || heroLayout === "centered") && (
          <>
            {heroImage && <img src={heroImage} alt="Hero" className="t2-hero-img" />}
            <div className="t2-hero-overlay" />
            <Container className="t2-hero-content text-center">
              <HeroTextBlock align="center" />
            </Container>
          </>
        )}

        {(heroLayout === "image-right" || heroLayout === "image-left") && (
          <Container className="t2-hero-content">
            <Row className="align-items-center g-5">
              {heroLayout === "image-left" && (
                <Col lg={6}>
                  <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
                    {heroImage && <img src={heroImage} alt="Hero" style={{ width: "100%", height: 500, objectFit: "cover" }} />}
                  </div>
                </Col>
              )}
              <Col lg={6}>
                <HeroTextBlock align="left" />
              </Col>
              {heroLayout === "image-right" && (
                <Col lg={6}>
                  <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
                    {heroImage && <img src={heroImage} alt="Hero" style={{ width: "100%", height: 500, objectFit: "cover" }} />}
                  </div>
                </Col>
              )}
            </Row>
          </Container>
        )}
      </header>

      {/* ══════════════════════════════════════════ PRAYER ════ */}
      {showPrayer && (
        <div className="t2-prayer-wrapper">
          <Container>
            <div className="t2-prayer-grid">
              {Object.entries(prayer).map(([key, time]) => (
                <div key={key} className={`t2-prayer-card ${activePrayer === key ? "active" : ""}`}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: activePrayer === key ? "#93C5FD" : "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    {prayerLabels[key]}
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: -1 }}>
                    {time}
                  </div>
                  {activePrayer === key && (
                    <div style={{ fontSize: "0.75rem", marginTop: 8, background: "rgba(255,255,255,0.2)", padding: "4px 0", borderRadius: 4 }}>
                      WAKTU SAAT INI
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* ══════════════════════════════════════════ PROFIL ════ */}
      {menuVis.profil !== false && (
        <section className="t2-section t2-section-white" id="profil">
          <Container>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <div style={{ position: "relative" }}>
                  <img src={profile.image || "https://images.unsplash.com/flagged/photo-1554398912-87ad6a73dbb6?q=80&w=1074&auto=format&fit=crop"} alt="Profil" style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }} />
                  <div style={{ position: "absolute", bottom: -20, right: -20, background: "#2563EB", color: "#fff", padding: 24, borderRadius: 20, boxShadow: "0 10px 30px rgba(37,99,235,0.3)" }}>
                    <FaHeart size={32} />
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <div className="t2-section-badge">Profil Masjid</div>
                <h2 className="t2-section-title">Tentang {profile.name}</h2>
                <p style={{ fontSize: "1.125rem", color: "#475569", lineHeight: 1.8, marginBottom: 24 }}>
                  {profile.description ||
                    `${profile.name} adalah pusat kegiatan ibadah dan sosial kemasyarakatan. Kami berkomitmen untuk membangun generasi umat yang tangguh, berakhlak mulia, dan berwawasan luas.`}
                </p>
                
                <div className="d-flex flex-column gap-3 mt-4">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}><FaMapMarkerAlt /></div>
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" }}>Lokasi</div>
                      <div style={{ fontWeight: 500, color: "#1E293B" }}>{profile.address}</div>
                    </div>
                  </div>
                  {profile.contact && (
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}><FaWhatsapp /></div>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" }}>Kontak</div>
                        <div style={{ fontWeight: 500, color: "#1E293B" }}>{profile.contact}</div>
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════ PROGRAM ════ */}
      {menuVis.program !== false && (
        <section className="t2-section t2-section-gray" id="program">
          <Container>
            <div className="text-center mb-5">
              <div className="t2-section-badge">Program Kami</div>
              <h2 className="t2-section-title">Layanan & Fasilitas</h2>
            </div>
            <Row className="g-4">
              {programs.length > 0 ? (
                programs.map((p) => (
                  <Col md={6} lg={3} key={p.id}>
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noreferrer" className="t2-card text-decoration-none d-block">
                        <img src={p.image || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=800"} alt={p.title} className="t2-card-img" style={{ height: 180 }} />
                        <div style={{ padding: 20 }}>
                          <h4 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>{p.title}</h4>
                        </div>
                      </a>
                    ) : (
                      <div className="t2-card">
                        <img src={p.image || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=800"} alt={p.title} className="t2-card-img" style={{ height: 180 }} />
                        <div style={{ padding: 20 }}>
                          <h4 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#0F172A" }}>{p.title}</h4>
                        </div>
                      </div>
                    )}
                  </Col>
                ))
              ) : (
                <Col md={12}>
                  <div style={{ padding: "60px 20px", textAlign: "center", background: "#fff", borderRadius: 24, border: "1px solid #E2E8F0" }}>
                    <FaMosque size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                    <h5 style={{ color: "#1E293B", fontWeight: 700 }}>Belum Ada Program</h5>
                    <p style={{ color: "#64748B", fontSize: "0.9375rem" }}>Nantikan berbagai program dan kegiatan menarik dari masjid kami.</p>
                  </div>
                </Col>
              )}
            </Row>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════ KAJIAN ════ */}
      {menuVis.kajian !== false && (
        <section className="t2-section t2-section-white" id="kajian">
          <Container>
            <Row className="g-5">
              <Col lg={4}>
                <div className="t2-section-badge">Jadwal Kajian</div>
                <h2 className="t2-section-title">Majelis Ilmu</h2>
                <p style={{ color: "#64748B", marginBottom: 32, fontSize: "1.0625rem" }}>
                  Ikuti kajian rutin kami untuk memperdalam ilmu agama dan mempererat ukhuwah Islamiyah.
                </p>
                <a href="#" className="t2-btn-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Lihat Semua <FaArrowRight size={12} />
                </a>
              </Col>
              <Col lg={8}>
                <div className="d-flex flex-column gap-3">
                  {kajian.map((k) => {
                    const d = new Date(k.date ? k.date + "T00:00:00" : null);
                    return (
                      <div key={k.id} className="t2-kajian-card">
                        <div className="t2-kajian-date">
                          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>
                            {d.getDate() || "15"}
                          </div>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>
                            {d.toLocaleDateString("id-ID", { month: "short" }) || "Jun"}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{k.title}</h4>
                          <div style={{ fontWeight: 500, color: "#3B82F6", marginBottom: 8 }}>{k.speaker}</div>
                          <div className="d-flex align-items-center gap-4 text-muted" style={{ fontSize: "0.875rem" }}>
                            <span className="d-flex align-items-center gap-2"><FaClock color="#94A3B8" /> {k.time} WIB</span>
                            <span className="d-flex align-items-center gap-2"><FaMapMarkerAlt color="#94A3B8" /> {k.location}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════ ARTIKEL ════ */}
      {menuVis.artikel !== false && (
        <section className="t2-section t2-section-gray" id="artikel">
          <Container>
            <div className="d-flex align-items-end justify-content-between mb-5 flex-wrap gap-3">
              <div>
                <div className="t2-section-badge">Berita</div>
                <h2 className="t2-section-title mb-0">Informasi Terbaru</h2>
              </div>
              <a href="#" className="t2-btn-outline">Semua Berita</a>
            </div>
            <Row className="g-4">
              {articles.map((a) => (
                <Col md={6} key={a.id}>
                  <div className="t2-card d-flex flex-column flex-sm-row">
                    <img src={a.image} alt={a.title} style={{ width: "100%", sm: { width: 200 }, height: 220, objectFit: "cover" }} className="d-sm-none" />
                    <img src={a.image} alt={a.title} style={{ width: 220, height: "auto", objectFit: "cover" }} className="d-none d-sm-block" />
                    <div style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#2563EB", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <FaRegCalendarAlt /> {a.date}
                      </div>
                      <h4 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0F172A", marginBottom: 12, lineHeight: 1.4 }}>{a.title}</h4>
                      <p style={{ color: "#64748B", fontSize: "0.9375rem", marginBottom: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {a.summary}
                      </p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════ GALERI ════ */}
      {menuVis.galeri !== false && (
        <section className="t2-section t2-section-white" id="galeri">
          <Container>
            <div className="text-center mb-5">
              <div className="t2-section-badge">Galeri</div>
              <h2 className="t2-section-title">Dokumentasi Kegiatan</h2>
            </div>
            <Row className="g-3">
              {gallery.map((g, idx) => (
                <Col md={6} lg={4} key={idx}>
                  <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", group: true, aspectRatio: "4/3" }}>
                    <img src={g} alt="Galeri" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} className="t2-gallery-img" />
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════ FOOTER ════ */}
      <footer className="t2-footer" id="kontak">
        <Container>
          <Row className="g-5">
            <Col lg={4}>
              <div className="d-flex align-items-center gap-3 mb-4">
                {hdr.logoImage ? (
                  <img src={hdr.logoImage} alt="logo" style={{ width: 48, height: 48, objectFit: "contain", background: "#fff", borderRadius: 12, padding: 4 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaMosque size={24} color="#fff" />
                  </div>
                )}
                <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.5px" }}>
                  {logoText}
                </span>
              </div>
              <p style={{ color: "#94A3B8", lineHeight: 1.8, marginBottom: 24 }}>
                {data?.footer?.tagline || "Sistem SAAS Website Masjid modern. Menghubungkan umat, memakmurkan masjid, dan menebarkan kebaikan."}
              </p>
              <div className="d-flex gap-3">
                {data?.footer?.social?.facebook && (
                  <a href={data.footer.social.facebook} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.3s" }}><FaFacebook /></a>
                )}
                {data?.footer?.social?.instagram && (
                  <a href={data.footer.social.instagram} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.3s" }}><FaInstagram /></a>
                )}
                {data?.footer?.social?.youtube && (
                  <a href={data.footer.social.youtube} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.3s" }}><FaYoutube /></a>
                )}
                {data?.footer?.social?.twitter && (
                  <a href={data.footer.social.twitter} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.3s" }}><FaTwitter /></a>
                )}
                {data?.footer?.social?.whatsapp && (
                  <a href={data.footer.social.whatsapp} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.3s" }}><FaWhatsapp /></a>
                )}
                {data?.footer?.social?.tiktok && (
                  <a href={data.footer.social.tiktok} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.3s" }}><FaTiktok /></a>
                )}
              </div>
            </Col>
            
            <Col lg={2} md={4}>
              <h5 className="t2-footer-title">Tautan</h5>
              {visMenu.slice(0,5).map(([k, l]) => (
                <a key={k} href={`#${k}`} className="t2-footer-link">{l}</a>
              ))}
            </Col>

            <Col lg={3} md={4}>
              <h5 className="t2-footer-title">Kontak</h5>
              <div className="d-flex align-items-start gap-3 mb-3">
                <FaMapMarkerAlt color="#3B82F6" className="mt-1" />
                <span style={{ color: "#94A3B8", lineHeight: 1.6 }}>{data?.footer?.contact?.address || profile.address || "Jl. Raya Masjid No. 1"}</span>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <FaPhone color="#3B82F6" />
                <span style={{ color: "#94A3B8" }}>{data?.footer?.contact?.phone || profile.contact || "0812-3456-7890"}</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <FaEnvelope color="#3B82F6" />
                <span style={{ color: "#94A3B8" }}>{data?.footer?.contact?.email || profile.email || "info@masjid.com"}</span>
              </div>
            </Col>

            <Col lg={3} md={4}>
              <h5 className="t2-footer-title">Dukungan</h5>
              <p style={{ color: "#94A3B8", marginBottom: 16 }}>Dukung operasional masjid dan program dakwah kami.</p>
              <button 
                className="t2-btn-cta border-0" 
                style={{ display: "inline-block" }}
                onClick={(e) => { e.preventDefault(); setShowDonationModal(true); }}
              >
                Donasi Sekarang
              </button>
            </Col>
          </Row>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 60, paddingTop: 24, textAlign: "center", color: "#64748B", fontSize: "0.875rem" }}>
            &copy; {new Date().getFullYear()} {logoText}. All rights reserved. Powered by MasjidKu.
          </div>
        </Container>
      </footer>

      {/* ── Donation Modal ── */}
      <Modal show={showDonationModal} onHide={() => setShowDonationModal(false)} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: "#0F172A" }}>
            Donasi & Infaq
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center px-4 pb-4">
          <p className="text-muted mb-4">
            {donationConfig?.description || "Mari salurkan infaq dan sedekah terbaik Anda untuk kemakmuran masjid."}
          </p>
          
          <div className="bg-light p-3 rounded-4 mb-4" style={{ border: "2px dashed #3B82F6" }}>
            <h6 className="fw-bold text-dark mb-3">Scan QRIS</h6>
            <img 
              src={donationConfig?.qrisUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"} 
              alt="QRIS Donasi" 
              style={{ maxWidth: "100%", height: "auto", maxHeight: "250px", borderRadius: "12px" }} 
            />
          </div>

          <h6 className="fw-bold text-dark mb-3">Atau Transfer Melalui Bank</h6>
          <div className="text-start bg-light p-3 rounded-4">
            <div className="mb-2">
              <small className="text-muted d-block">Bank</small>
              <strong style={{ fontSize: "1.1rem" }}>{donationConfig?.bankName || "BSI (Bank Syariah Indonesia)"}</strong>
            </div>
            <div className="mb-2">
              <small className="text-muted d-block">Nomor Rekening</small>
              <strong style={{ fontSize: "1.2rem", letterSpacing: "1px", color: "#3B82F6" }}>
                {donationConfig?.accountNumber || "7123456789"}
              </strong>
            </div>
            <div>
              <small className="text-muted d-block">Atas Nama</small>
              <strong>{donationConfig?.accountName || "DKM MasjidKu"}</strong>
            </div>
          </div>
          
          <Button variant="primary" className="w-100 mt-4 fw-semibold py-2" onClick={() => setShowDonationModal(false)} style={{ backgroundColor: "#2563EB", border: "none" }}>
            Tutup
          </Button>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default Template2;
