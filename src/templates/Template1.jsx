import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal } from "react-bootstrap";
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
} from "react-icons/fa";

// ─── Template 1 — "Earthy Modern" ──────────────────────────────────────────
const Template1 = ({ data }) => {
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
    artikel: "Artikel & Berita",
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
  // CTA destinations (1 = Beranda/top, then section anchors)
  const ctaPrimaryDest = h.ctaPrimaryDest || "program";
  const ctaSecondaryDest = h.ctaSecondaryDest || "profil";
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
          setScrolled((prev) => {
            const isScrolled = window.scrollY > 40;
            return prev !== isScrolled ? isScrolled : prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Jadwal sholat aktif = sholat terakhir yang sudah lewat,
  // tetap nyala sampai sholat berikutnya tiba.
  useEffect(() => {
    const checkPrayer = () => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();

      // Urutkan waktu sholat ascending
      const prayerTimes = Object.entries(prayer)
        .map(([key, val]) => {
          const [hh, mm] = (val || "00:00").split(":").map(Number);
          return { key, totalMins: hh * 60 + (mm || 0) };
        })
        .sort((a, b) => a.totalMins - b.totalMins);

      // Cari sholat terakhir yang sudah lewat atau tepat sekarang
      let active = null;
      for (let i = prayerTimes.length - 1; i >= 0; i--) {
        if (prayerTimes[i].totalMins <= nowMins) {
          active = prayerTimes[i].key;
          break;
        }
      }
      // Sebelum Subuh → tampilkan Isya (sholat terakhir hari sebelumnya)
      if (!active && prayerTimes.length > 0) {
        active = prayerTimes[prayerTimes.length - 1].key;
      }
      setActivePrayer(active);
    };
    checkPrayer();
    const t = setInterval(checkPrayer, 30000);
    return () => clearInterval(t);
  }, [prayer]);

  // ── Color themes ──
  const T = {
    dark: {
      navBg: scrolled ? "rgba(13,59,46,0.97)" : "#0D3B2E",
      text: "#fff",
      muted: "rgba(255,255,255,0.6)",
      border: "rgba(255,255,255,0.08)",
      underline: "#C9A84C",
      ctaBg: "linear-gradient(135deg,#C9A84C,#B8941F)",
      ctaText: "#fff",
    },
    light: {
      navBg: scrolled ? "rgba(255,255,255,0.96)" : "#fff",
      text: "#0D3B2E",
      muted: "#6B7280",
      border: "#EAECF0",
      underline: "#1A5C45",
      ctaBg: "linear-gradient(135deg,#1A5C45,#0D3B2E)",
      ctaText: "#fff",
    },
    green: {
      navBg: scrolled ? "rgba(26,92,69,0.97)" : "#1A5C45",
      text: "#fff",
      muted: "rgba(255,255,255,0.6)",
      border: "rgba(255,255,255,0.1)",
      underline: "#C9A84C",
      ctaBg: "linear-gradient(135deg,#C9A84C,#B8941F)",
      ctaText: "#fff",
    },
  };
  const th = T[navStyle] || T.dark;

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
            image:
              "https://images.unsplash.com/photo-1561314945-0562f5b6d2c6?q=80&w=1171&auto=format&fit=crop",
          },
          {
            id: 2,
            title: "Kajian Fiqih Muamalah bersama Ustadz Ahmad",
            summary: "Pembahasan hukum ekonomi Islam kontemporer.",
            date: "15 Apr 2023",
            image:
              "https://images.unsplash.com/photo-1636985418926-6752c84bf50a?q=80&w=1171&auto=format&fit=crop",
          },
        ];

  const programs = data?.programs || [];

  // kajian: gunakan data dari dashboard, fallback ke contoh statis
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
          {
            id: 3,
            title: "Kajian Fiqih Muamalah",
            speaker: "Ustadz Dr. Mahmud",
            date: "2026-06-22",
            time: "16:00",
            location: "Ruang Serbaguna",
          },
        ];

  const colors = {
    primary: "#1A5C45",
    secondary: "#C9A84C",
    bgCream: "#FFF8E7",
  };

  /* ══════════════════════════════════════════════════════ CSS ══════════════ */
  const css = React.useMemo(
    () => `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    .t1-root { font-family: 'Plus Jakarta Sans', sans-serif; scroll-behavior: smooth; }

    /* ── Navbar ── */
    .t1-nav { transition: background 0.4s, box-shadow 0.4s; }
    .t1-nav.scrolled { box-shadow: 0 4px 28px rgba(0,0,0,0.14); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .t1-nav-link {
      position: relative; font-size: 0.75rem; font-weight: 700;
      letter-spacing: 1.2px; text-transform: uppercase;
      color: ${th.muted} !important; text-decoration: none !important;
      padding: 4px 0; transition: color 0.2s; white-space: nowrap;
    }
    .t1-nav-link::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:2px; background:${th.underline}; border-radius:2px; transition:width 0.25s ease; }
    .t1-nav-link:hover, .t1-nav-link.active { color:${th.text} !important; }
    .t1-nav-link:hover::after, .t1-nav-link.active::after { width:100%; }
    .t1-cta { font-size:0.8125rem; font-weight:700; padding:9px 18px; border-radius:8px; border:none; background:${th.ctaBg}; color:${th.ctaText}; display:inline-flex; align-items:center; gap:6px; cursor:pointer; transition:all 0.2s; }
    .t1-cta:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,0,0,0.18); }
    .t1-logo-ring { width:40px; height:40px; border-radius:10px; background:rgba(201,168,76,0.16); border:1px solid rgba(201,168,76,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }

    /* ── Mobile panel ── */
    .t1-mobile-panel { position:fixed; inset:0; z-index:9999; background:#0D3B2E; transform:translateX(100%); transition:transform 0.32s cubic-bezier(0.4,0,0.2,1); padding:28px 24px; overflow-y:auto; }
    .t1-mobile-panel.open { transform:translateX(0); }
    .t1-mob-link { display:block; font-size:1.1rem; font-weight:700; color:rgba(255,255,255,0.65); text-decoration:none; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.07); transition:color 0.2s, padding-left 0.2s; }
    .t1-mob-link:hover { color:#C9A84C; padding-left:8px; }

    /* ── Hero: shared ── */
    .t1-hero { background:${colors.bgCream}; }
    .t1-section-chip { display:inline-block; width:fit-content; align-self:flex-start; font-size:0.75rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:${colors.secondary}; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.25); border-radius:20px; padding:4px 14px; margin-bottom:12px; }
    .t1-gold-btn { background:linear-gradient(135deg,#C9A84C,#B8941F); color:#fff; border:none; border-radius:8px; font-weight:700; font-size:0.9375rem; padding:11px 28px; display:inline-flex; align-items:center; gap:8px; cursor:pointer; transition:all 0.2s; text-decoration:none; }
    .t1-gold-btn:hover { box-shadow:0 6px 16px rgba(201,168,76,0.4); transform:translateY(-1px); color:#fff; }
    .t1-ghost-btn { background:transparent; color:${colors.primary}; border:none; padding:11px 0; display:inline-flex; align-items:center; gap:8px; cursor:pointer; font-size:0.9375rem; font-weight:700; text-decoration:none; transition:gap 0.2s; }
    .t1-ghost-btn:hover { gap:12px; color:${colors.secondary}; }
    .t1-ghost-btn-white { background:transparent; color:rgba(255,255,255,0.85); border:none; padding:11px 0; display:inline-flex; align-items:center; gap:8px; cursor:pointer; font-size:0.9375rem; font-weight:700; text-decoration:none; transition:gap 0.2s, color 0.2s; }
    .t1-ghost-btn-white:hover { gap:12px; color:#fff; }

    /* ══ Islamic ornamental offset border ══ */
    .t1-arch-outer {
      position: relative;
      /* Extra space around for the offset ornament layers */
      padding: 0 18px 22px 0;
    }
    /* Layer 1 — outermost: gold dots ring (dashed SVG overlay – handled inline) */
    /* Layer 2 — gold filled arch, offset bottom-right */
    .t1-arch-deco-gold {
      position: absolute;
      bottom: 0; right: 0;
      width: calc(100% - 18px);
      height: calc(100% - 22px);
      background: linear-gradient(160deg, #C9A84C 0%, #B8941F 55%, rgba(201,168,76,0.45) 100%);
      clip-path: url(#mihrabClip);
      z-index: 0;
    }
    /* Layer 3 — cream gap ring (slightly smaller, sits between gold and image) */
    .t1-arch-deco-gap {
      position: absolute;
      bottom: 6px; right: 6px;
      width: calc(100% - 24px);
      height: calc(100% - 28px);
      background: #FFF8E7;
      clip-path: url(#mihrabClip);
      z-index: 1;
    }
    /* The actual image — top-left, z above gap */
    .t1-arch-img-wrap {
      position: relative;
      width: calc(100% - 18px);
      /* shift up-left so gold+cream show at bottom-right */
      z-index: 2;
      clip-path: url(#mihrabClip);
      overflow: hidden;
    }
    .t1-arch-img-wrap img {
      width: 100%;
      height: 460px;
      object-fit: cover;
      display: block;
      animation: t1KenBurns 14s ease-in-out infinite alternate;
      transform-origin: 50% 40%;
    }
    @keyframes t1KenBurns {
      0%   { transform: scale(1.04) translate(0px,   0px); }
      50%  { transform: scale(1.09) translate(-8px,  -5px); }
      100% { transform: scale(1.04) translate(6px,   4px); }
    }
    /* Subtle green vignette inside arch */
    .t1-arch-img-wrap::after {
      content: ''; position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(to bottom, transparent 55%, rgba(13,59,46,0.22) 100%);
      pointer-events: none;
    }
    /* Dashed gold ornament arch on top of image (SVG overlay) — rendered inline */
    .t1-arch-ornament-svg {
      position: absolute;
      top: 0; left: 0;
      width: calc(100% - 18px);
      height: calc(100% - 22px);
      z-index: 3;
      pointer-events: none;
      overflow: visible;
    }

    /* ── Full-bg hero ── */
    .t1-fullbg-hero { position:relative; overflow:hidden; }
    .t1-fullbg-hero .bg-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; animation:t1KenBurns 18s ease-in-out infinite alternate; }
    .t1-fullbg-overlay { position:absolute; inset:0; background:linear-gradient(135deg, rgba(13,59,46,0.87), rgba(26,92,69,0.72)); }

    /* ── Prayer bar ── */
    .t1-prayer-bar { background:#fff; border-radius:16px; box-shadow:0 4px 28px rgba(0,0,0,0.07); overflow:hidden; }
    .t1-prayer-item { text-align:center; padding:18px 8px; position:relative; transition:background 0.3s; }
    .t1-prayer-item.t1-prayer-active {
      background: linear-gradient(135deg, rgba(13,59,46,0.06), rgba(201,168,76,0.08));
    }
    .t1-prayer-name { font-size:0.6875rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#9AA3AF; margin-bottom:4px; }
    .t1-prayer-item.t1-prayer-active .t1-prayer-name { color:#C9A84C; }
    .t1-prayer-time { font-size:1.1rem; font-weight:800; color:#1A5C45; }
    .t1-prayer-item.t1-prayer-active .t1-prayer-time { color:#0D3B2E; }
    /* Glowing dot for active prayer */
    .t1-prayer-glow {
      width: 6px; height: 6px; border-radius: 50%; background: #C9A84C;
      margin: 4px auto 0; animation: t1Pulse 2s ease infinite;
      box-shadow: 0 0 0 3px rgba(201,168,76,0.2);
    }

    /* ── Section headings ── */
    .t1-prog-card { border-radius:16px; overflow:hidden; height:220px; position:relative; cursor:pointer; }
    .t1-prog-card img { width:100%; height:100%; object-fit:cover; transition:transform 0.45s ease; filter:brightness(0.75); }
    .t1-prog-card:hover img { transform:scale(1.05); filter:brightness(0.6); }
    .t1-prog-card .label { position:absolute; bottom:0; left:0; right:0; padding:16px 20px; background:linear-gradient(to top,rgba(0,0,0,0.72),transparent); }
    .t1-prog-card .label h5 { font-weight:800; color:#fff; margin:0; font-size:1rem; }

    .t1-art-card { border-radius:16px; overflow:hidden; border:1px solid #EAECF0; transition:all 0.25s ease; }
    .t1-art-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.08); border-color:transparent; }
    .t1-art-card img { width:100%; height:200px; object-fit:cover; }
    .t1-art-body { padding:20px; }
    .t1-art-body h5 { font-weight:800; color:#1a1a1a; font-size:1rem; line-height:1.35; margin-bottom:8px; }
    .t1-art-body p  { font-size:0.875rem; color:#6B7280; line-height:1.65; margin-bottom:14px; }
    .t1-read-more { font-size:0.8125rem; font-weight:700; color:${colors.primary}; display:inline-flex; align-items:center; gap:6px; text-decoration:none; letter-spacing:0.3px; transition:gap 0.2s, color 0.2s; }
    .t1-read-more:hover { gap:10px; color:${colors.secondary}; }

    .t1-gallery-img { width:100%; height:220px; object-fit:cover; border-radius:14px; transition:transform 0.35s ease, box-shadow 0.35s ease; display:block; }
    .t1-gallery-img:hover { transform:scale(1.03); box-shadow:0 12px 32px rgba(0,0,0,0.12); }

    .t1-footer { background:#0D3B2E; }
  `,
    [
      th.muted,
      th.underline,
      th.text,
      th.ctaBg,
      th.ctaText,
      colors.primary,
      colors.secondary,
      colors.bgCream,
    ],
  );

  // ── Shared sub-components ──
  // Map template prayer keys (fajr/dhuhr/...) to display info
  const PRAYER_DISPLAY = [
    { tKey: "fajr", label: "Subuh", apiKey: "subuh" },
    { tKey: "dhuhr", label: "Dzuhur", apiKey: "dzuhur" },
    { tKey: "asr", label: "Ashar", apiKey: "ashar" },
    { tKey: "maghrib", label: "Maghrib", apiKey: "maghrib" },
    { tKey: "isha", label: "Isya", apiKey: "isya" },
  ];

  const prayerConfig = data?.prayerConfig || {};
  const iqamahCfg = prayerConfig.iqamah || {};

  // Handle both old format (imam: "Nama") and new batch format (imam: {subuh:"",..})
  const rawImam = prayerConfig.imam;
  const imamMap = (() => {
    if (!rawImam) return {};
    if (typeof rawImam === "string") {
      // Old single-string format: apply to all prayers
      const name = rawImam.trim();
      return name
        ? { fajr: name, dhuhr: name, asr: name, maghrib: name, isha: name }
        : {};
    }
    // New batch format: map API keys to template keys
    return {
      fajr: rawImam.subuh || "",
      dhuhr: rawImam.dzuhur || "",
      asr: rawImam.ashar || "",
      maghrib: rawImam.maghrib || "",
      isha: rawImam.isya || "",
    };
  })();

  const PrayerBar = () => (
    <Container className="mt-4 mb-2">
      <div className="t1-prayer-bar">
        <div
          className="d-flex align-items-stretch"
          style={{ overflowX: "auto" }}
        >
          {PRAYER_DISPLAY.map(({ tKey, label, apiKey }) => {
            const isActive = activePrayer === tKey;
            const adzan = prayer[tKey];
            const imamName = imamMap[tKey] || "";

            // Compute iqamah time
            let iqDisplay = null;
            const iqOff = iqamahCfg[apiKey] || iqamahCfg[tKey] || 0;
            if (adzan && iqOff > 0) {
              const [h, m] = adzan.split(":").map(Number);
              const total = h * 60 + m + iqOff;
              iqDisplay = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
            }

            return (
              <div
                key={tKey}
                className={
                  "t1-prayer-item" + (isActive ? " t1-prayer-active" : "")
                }
                style={{ flex: 1, minWidth: 80 }}
              >
                <div className="t1-prayer-name">{label}</div>
                <div className="t1-prayer-time">{adzan || "--:--"}</div>
                {imamName && (
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: isActive ? "#C9A84C" : "#9AA3AF",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 90,
                      margin: "2px auto 0",
                    }}
                  >
                    {imamName}
                  </div>
                )}
                {iqDisplay && (
                  <div
                    style={{
                      fontSize: "0.625rem",
                      color: isActive ? "#C9A84C" : "#B8BFCA",
                      marginTop: 1,
                    }}
                  >
                    Iqamah {iqDisplay}
                  </div>
                )}
                {isActive && <div className="t1-prayer-glow" />}
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );

  const HeroTextBlock = ({ dark = false, center = false }) => (
    <div
      style={{
        textAlign: center ? "center" : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: center ? "center" : undefined,
        justifyContent: "center",
      }}
    >
      <div className="t1-section-chip">Masjid Digital</div>
      <h1
        className="mb-4"
        style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          color: dark ? "#fff" : "#1a1a1a",
          lineHeight: 1.1,
          letterSpacing: "-0.5px",
        }}
      >
        {heroTitle}
      </h1>
      <p
        style={{
          fontSize: "1rem",
          color: dark ? "rgba(255,255,255,0.75)" : "#6B7280",
          lineHeight: 1.75,
          marginBottom: 32,
        }}
      >
        {heroSubtitle}
      </p>
      <div
        className="d-flex gap-3 flex-wrap"
        style={{ justifyContent: center ? "center" : undefined }}
      >
        <a href={"#" + ctaPrimaryDest} className="t1-gold-btn">
          {ctaLabel} <FaArrowRight size={13} />
        </a>
        <a
          href={"#" + ctaSecondaryDest}
          className={dark ? "t1-ghost-btn-white" : "t1-ghost-btn"}
        >
          {ctaSecondary} <FaArrowRight size={12} />
        </a>
      </div>
    </div>
  );

  // Inline SVG clipPath — pointed Islamic arch (mihrab)
  // clipPathUnits=objectBoundingBox makes it fully responsive
  const ArchSVG = () => (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute", overflow: "hidden" }}
    >
      <defs>
        {/* Pointed arch: straight sides + cubic-bezier peak at top */}
        <clipPath id="mihrabClip" clipPathUnits="objectBoundingBox">
          <path
            d="
            M 0,1
            L 0,0.46
            C 0,0.14  0.18,0  0.5,0
            C 0.82,0  1,0.14  1,0.46
            L 1,1
            Z
          "
          />
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <div className="t1-root" style={{ backgroundColor: "#fff" }}>
      <ArchSVG />
      <style>{css}</style>

      {/* ══════════════════════════════════════════ NAVBAR ═══ */}
      <nav
        className={"t1-nav" + (scrolled ? " scrolled" : "")}
        style={{
          background: th.navBg,
          borderBottom: "1px solid " + th.border,
          position: isSticky ? "sticky" : "relative",
          top: 0,
          zIndex: 1000,
        }}
      >
        <Container>
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ height: 70 }}
          >
            <a
              href="#beranda"
              className="d-flex align-items-center text-decoration-none"
              style={{ gap: 12 }}
            >
              {hdr.logoImage ? (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: "#fff",
                    borderRadius: 10,
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={hdr.logoImage}
                    alt="logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                <div className="t1-logo-ring">
                  <FaMosque size={18} style={{ color: "#C9A84C" }} />
                </div>
              )}
              <div style={{ lineHeight: 1.2 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "0.9375rem",
                    color: th.text,
                    letterSpacing: "-0.2px",
                  }}
                >
                  {logoText}
                </div>
                {profile.city && (
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      color: th.muted,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {profile.city}
                  </div>
                )}
              </div>
            </a>
            <div
              className="d-none d-lg-flex align-items-center"
              style={{ gap: 28 }}
            >
              {visMenu.map(([key, label]) => (
                <a
                  key={key}
                  href={"#" + key}
                  className={
                    "t1-nav-link" + (activeLink === key ? " active" : "")
                  }
                  onClick={() => setActiveLink(key)}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-lg-flex gap-2">
                {ctaButtons
                  .filter((b) => b.show !== false)
                  .map((btn, i) => (
                    <button
                      key={i}
                      className="t1-cta"
                      onClick={(e) => {
                        if (btn.label.toLowerCase().includes("donasi")) {
                          e.preventDefault();
                          setShowDonationModal(true);
                        }
                      }}
                    >
                      <FaHeart size={10} /> {btn.label}
                    </button>
                  ))}
              </div>
              <button
                className="d-lg-none border-0 bg-transparent p-1"
                style={{ color: th.text, fontSize: "1.25rem", lineHeight: 1 }}
                onClick={() => setMobileOpen(true)}
              >
                <FaBars />
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* ══════════════════════════════════════ MOBILE MENU ═══ */}
      <div className={"t1-mobile-panel" + (mobileOpen ? " open" : "")}>
        <div className="d-flex align-items-center justify-content-between mb-5">
          <div className="d-flex align-items-center" style={{ gap: 10 }}>
            <div className="t1-logo-ring">
              <FaMosque size={18} style={{ color: "#C9A84C" }} />
            </div>
            <span style={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>
              {logoText}
            </span>
          </div>
          <button
            className="border-0 bg-transparent p-0"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.5rem" }}
            onClick={() => setMobileOpen(false)}
          >
            <FaTimes />
          </button>
        </div>
        {visMenu.map(([key, label]) => (
          <a
            key={key}
            href={"#" + key}
            className="t1-mob-link"
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </a>
        ))}
        <div className="mt-5 d-flex flex-column gap-2">
          {ctaButtons
            .filter((b) => b.show !== false)
            .map((btn, i) => (
              <button
                key={i}
                className="t1-cta w-100 justify-content-center"
                onClick={(e) => {
                  if (btn.label.toLowerCase().includes("donasi")) {
                    e.preventDefault();
                    setMobileOpen(false);
                    setShowDonationModal(true);
                  }
                }}
              >
                <FaHeart size={10} /> {btn.label}
              </button>
            ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════ HERO ══════ */}

      {/* image-right (default) */}
      {(heroLayout === "image-right" ||
        !["full-bg", "centered", "image-left"].includes(heroLayout)) && (
        <header
          id="beranda"
          className="t1-hero"
          style={{ paddingTop: 80, paddingBottom: 40 }}
        >
          <Container>
            <Row className="align-items-center g-5">
              <Col md={6}>
                <HeroTextBlock />
              </Col>
              <Col md={6}>
                <div className="t1-arch-outer">
                  {/* Layer 1 — gold offset fill */}
                  <div className="t1-arch-deco-gold" />
                  {/* Layer 2 — cream gap ring */}
                  <div className="t1-arch-deco-gap" />
                  {/* Layer 3 — image */}
                  <div className="t1-arch-img-wrap">
                    <img src={heroImage} alt="Masjid" />
                    {/* Dashed gold ornament line on arch edge */}
                    <svg
                      className="t1-arch-ornament-svg"
                      viewBox="0 0 100 115"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 2,115 L 2,53 C 2,17 18,2 50,2 C 82,2 98,17 98,53 L 98,115"
                        fill="none"
                        stroke="rgba(201,168,76,0.55)"
                        strokeWidth="1.5"
                        strokeDasharray="5 3"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
          {showPrayer && <PrayerBar />}
        </header>
      )}

      {/* image-left */}
      {heroLayout === "image-left" && (
        <header
          id="beranda"
          className="t1-hero"
          style={{ paddingTop: 80, paddingBottom: 40 }}
        >
          <Container>
            <Row className="align-items-center g-5">
              <Col md={6}>
                <div className="t1-arch-outer">
                  <div className="t1-arch-deco-gold" />
                  <div className="t1-arch-deco-gap" />
                  <div className="t1-arch-img-wrap">
                    <img src={heroImage} alt="Masjid" />
                    <svg
                      className="t1-arch-ornament-svg"
                      viewBox="0 0 100 115"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 2,115 L 2,53 C 2,17 18,2 50,2 C 82,2 98,17 98,53 L 98,115"
                        fill="none"
                        stroke="rgba(201,168,76,0.55)"
                        strokeWidth="1.5"
                        strokeDasharray="5 3"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <HeroTextBlock />
              </Col>
            </Row>
          </Container>
          {showPrayer && <PrayerBar />}
        </header>
      )}

      {/* full-bg */}
      {heroLayout === "full-bg" && (
        <header
          id="beranda"
          className="t1-fullbg-hero"
          style={{
            minHeight: 560,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 60,
            paddingBottom: 60,
          }}
        >
          <img src={heroImage} alt="bg" className="bg-img" />
          <div className="t1-fullbg-overlay" />
          <Container style={{ position: "relative", zIndex: 1 }}>
            <Row className="justify-content-center text-center">
              <Col md={8}>
                <HeroTextBlock dark center />
              </Col>
            </Row>
          </Container>
          {showPrayer && (
            <div style={{ position: "relative", zIndex: 1 }}>
              <PrayerBar />
            </div>
          )}
        </header>
      )}

      {/* centered */}
      {heroLayout === "centered" && (
        <header
          id="beranda"
          className="t1-hero"
          style={{ paddingTop: 80, paddingBottom: 60 }}
        >
          <Container>
            <Row className="justify-content-center">
              <Col md={7}>
                {heroImage && (
                  <div
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: "50%",
                      overflow: "hidden",
                      margin: "0 auto 28px",
                      boxShadow:
                        "0 0 0 6px rgba(201,168,76,0.2), 0 12px 32px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={heroImage}
                      alt="Masjid"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <HeroTextBlock center />
              </Col>
            </Row>
          </Container>
          {showPrayer && <PrayerBar />}
        </header>
      )}

      {/* ═══════════════════════════════════════════ PROFIL ═══ */}
      {menuVis.profil !== false && (
        <section id="profil" className="py-5 bg-white">
          <Container className="py-5">
            <Row className="align-items-center g-5">
              <Col md={6}>
                <img
                  src={
                    data?.profile?.image ||
                    "https://images.unsplash.com/flagged/photo-1554398912-87ad6a73dbb6?q=80&w=1074&auto=format&fit=crop"
                  }
                  style={{
                    width: "100%",
                    height: 420,
                    objectFit: "cover",
                    borderRadius: 20,
                  }}
                  alt="Profil Masjid"
                />
              </Col>
              <Col md={6}>
                <div className="t1-section-chip">Tentang Kami</div>
                <h2 className="fw-bold mb-4">Profil {profile.name}</h2>
                <div
                  style={{
                    color: "#6B7280",
                    lineHeight: 1.8,
                    fontSize: "0.9375rem",
                    marginBottom: 24,
                  }}
                >
                  {data?.profile?.description || data?.profile?.about ? (
                    (data.profile.description || data.profile.about)
                      .split("\n")
                      .map((p, i) => <p key={i}>{p}</p>)
                  ) : (
                    <p>
                      Masjid {profile.name} adalah pusat peribadatan dan kegiatan
                      umat Islam yang berkomitmen melayani jamaah dengan
                      sebaik-baiknya.
                    </p>
                  )}
                </div>
                {data?.profile?.visiMisi && (
                  <>
                    <h5 className="fw-bold mb-2" style={{ color: "#0D3B2E" }}>
                      Visi &amp; Misi
                    </h5>
                    <div
                      style={{
                        color: "#6B7280",
                        lineHeight: 1.8,
                        fontSize: "0.875rem",
                        marginBottom: 24,
                      }}
                    >
                      {data.profile.visiMisi.split("\n").map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </>
                )}
                <button className="t1-gold-btn">
                  Selengkapnya <FaArrowRight size={13} />
                </button>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════ PROGRAM ═══ */}
      {menuVis.program !== false && (
        <section
          id="program"
          style={{ background: "#F9FAF8", padding: "80px 0" }}
        >
          <Container>
            <div className="text-center mb-5">
              <div className="t1-section-chip">Kegiatan</div>
              <h2 className="fw-bold" style={{ color: "#1a1a1a" }}>
                Program Masjid
              </h2>
            </div>
            <Row className="g-3">
              {programs.length > 0 ? (
                programs.map((prog, i) => (
                  <Col md={6} key={i}>
                    {prog.link ? (
                      <a
                        href={prog.link}
                        target="_blank"
                        rel="noreferrer"
                        className="t1-prog-card d-block text-decoration-none"
                      >
                        <img
                          src={
                            prog.image ||
                            "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=800"
                          }
                          alt={prog.title}
                          onError={(e) => (e.target.style.opacity = 0.4)}
                        />
                        <div className="label">
                          <h5>{prog.title}</h5>
                        </div>
                      </a>
                    ) : (
                      <div className="t1-prog-card">
                        <img
                          src={
                            prog.image ||
                            "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=800"
                          }
                          alt={prog.title}
                          onError={(e) => (e.target.style.opacity = 0.4)}
                        />
                        <div className="label">
                          <h5>{prog.title}</h5>
                        </div>
                      </div>
                    )}
                  </Col>
                ))
              ) : (
                <Col md={12}>
                  <div style={{ padding: "60px 20px", textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid #EAECF0" }}>
                    <FaMosque size={48} color="#D0D5DD" style={{ marginBottom: 16 }} />
                    <h5 style={{ color: "#344054", fontWeight: 700 }}>Belum Ada Program</h5>
                    <p style={{ color: "#667085", fontSize: "0.9375rem" }}>Nantikan berbagai program dan kegiatan menarik dari masjid kami.</p>
                  </div>
                </Col>
              )}
            </Row>
            <div className="text-center mt-4">
              <button className="t1-gold-btn">
                Lihat Semua Program <FaArrowRight size={13} />
              </button>
            </div>
          </Container>
        </section>
      )}
      {/* ══════════════════════════════════════════ KAJIAN ══════ */}
      {menuVis.kajian !== false && (
        <section id="kajian" className="py-5 bg-white">
          <Container className="py-4">
            <div className="text-center mb-5">
              <div className="t1-section-chip">Kajian Islam</div>
              <h2
                className="fw-bold"
                style={{ color: "#1a1a1a", marginBottom: 8 }}
              >
                Jadwal Kajian
              </h2>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: "0.9375rem",
                  maxWidth: 480,
                  margin: "0 auto",
                }}
              >
                Ikuti kajian rutin bersama para ustadz pilihan di masjid kami.
              </p>
            </div>
            <Row className="g-4">
              {kajian.map((item, i) => {
                // Format tanggal
                const dateStr = item.date
                  ? new Date(item.date + "T00:00:00").toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : null;
                return (
                  <Col md={6} lg={4} key={item.id || i}>
                    <div
                      style={{
                        background: "#FAFBFA",
                        border: "1px solid #EAECF0",
                        borderRadius: 16,
                        overflow: "hidden",
                        transition: "all 0.25s ease",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 32px rgba(13,59,46,0.1)";
                        e.currentTarget.style.borderColor = "rgba(26,92,69,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "";
                        e.currentTarget.style.boxShadow = "";
                        e.currentTarget.style.borderColor = "#EAECF0";
                      }}
                    >
                      {/* Color bar top */}
                      <div
                        style={{
                          height: 4,
                          background: "linear-gradient(90deg, #1A5C45, #C9A84C)",
                        }}
                      />

                      {/* Foto jika ada */}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: 160,
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}

                      <div
                        style={{
                          padding: "20px",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <h5
                          style={{
                            fontWeight: 800,
                            color: "#1a1a1a",
                            fontSize: "1rem",
                            lineHeight: 1.35,
                            marginBottom: 12,
                          }}
                        >
                          {item.title}
                        </h5>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 7,
                            marginBottom: 16,
                            flex: 1,
                          }}
                        >
                          {item.speaker && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 6,
                                  background: "rgba(26,92,69,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  fontSize: "0.75rem",
                                }}
                              >
                                👤
                              </span>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#344054",
                                  fontWeight: 600,
                                }}
                              >
                                {item.speaker}
                              </span>
                            </div>
                          )}
                          {dateStr && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 6,
                                  background: "rgba(201,168,76,0.12)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  fontSize: "0.75rem",
                                }}
                              >
                                📅
                              </span>
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "#6B7280",
                                }}
                              >
                                {dateStr}
                                {item.time ? " · " + item.time + " WIB" : ""}
                              </span>
                            </div>
                          )}
                          {item.location && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 6,
                                  background: "rgba(26,92,69,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  fontSize: "0.75rem",
                                }}
                              >
                                📍
                              </span>
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "#6B7280",
                                }}
                              >
                                {item.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Container>
        </section>
      )}

      {menuVis.artikel !== false && (
        <section id="artikel" className="py-5 bg-white">
          <Container className="py-4">
            <div className="text-center mb-5">
              <div className="t1-section-chip">Informasi</div>
              <h2 className="fw-bold" style={{ color: "#1a1a1a" }}>
                Artikel &amp; Berita
              </h2>
            </div>
            <Row className="g-4">
              {articles.map((item, i) => {
                const articleDate = item.date
                  ? new Date(item.date + "T00:00:00").toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "long", year: "numeric" },
                    )
                  : item.created_at
                    ? new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "";
                const summary = item.excerpt || item.summary || "";
                const typeLabel = item.type === "berita" ? "Berita" : "Artikel";
                return (
                  <Col lg={6} key={item.id || i}>
                    <div
                      className="t1-art-card"
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 200,
                            background:
                              "linear-gradient(135deg, #F0F7F4, #E8F5E9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#C9CDD4",
                            fontSize: "2rem",
                          }}
                        >
                          Copy
                        </div>
                      )}
                      <div
                        className="t1-art-body"
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: 800,
                              letterSpacing: "0.6px",
                              textTransform: "uppercase",
                              background: "rgba(26,92,69,0.1)",
                              color: "#1A5C45",
                              borderRadius: 20,
                              padding: "2px 8px",
                            }}
                          >
                            {typeLabel}
                          </span>
                          {articleDate && (
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#9AA3AF",
                                fontWeight: 600,
                                margin: 0,
                              }}
                            >
                              {articleDate}
                            </p>
                          )}
                        </div>
                        <h5>{item.title}</h5>
                        {summary && <p style={{ flex: 1 }}>{summary}</p>}
                        {item.author && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#9AA3AF",
                              marginBottom: 8,
                            }}
                          >
                            Oleh: {item.author}
                          </p>
                        )}
                        <a href="#artikel" className="t1-read-more">
                          Baca Selengkapnya <FaArrowRight size={11} />
                        </a>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>

            <div className="text-center mt-5">
              <button className="t1-gold-btn">
                Lihat Semua Artikel <FaArrowRight size={13} />
              </button>
            </div>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════ GALERI ═══ */}
      {menuVis.galeri !== false && (() => {
        const photos =
          data?.gallery?.length > 0
            ? data.gallery.map((url, i) => ({ id: i, url, caption: "Dokumentasi Kegiatan" }))
            : [
                {
                  id: 1,
                  url: "https://images.unsplash.com/photo-1683828936769-92c51298885c?q=80&w=1172&auto=format&fit=crop",
                  caption: "Kegiatan Masjid",
                },
                {
                  id: 2,
                  url: "https://images.unsplash.com/photo-1684502843929-14da5854c60d?q=80&w=1631&auto=format&fit=crop",
                  caption: "Kajian Rutin",
                },
                {
                  id: 3,
                  url: "https://images.unsplash.com/photo-1711202675990-815384b2f1fd?q=80&w=1170&auto=format&fit=crop",
                  caption: "Sholat Berjamaah",
                },
                {
                  id: 4,
                  url: "https://images.unsplash.com/photo-1651293478838-1f51675131c5?q=80&w=1175&auto=format&fit=crop",
                  caption: "Dokumentasi",
                },
              ];
        return (
          <section
            id="galeri"
            style={{ background: "#F9FAF8", padding: "80px 0" }}
          >
            <Container>
              <div className="text-center mb-5">
                <div className="t1-section-chip">Galeri</div>
                <h2 className="fw-bold" style={{ color: "#1a1a1a" }}>
                  Dokumentasi Kegiatan
                </h2>
              </div>
              <Row className="g-3">
                {photos.slice(0, 6).map((item, i) => (
                  <Col md={6} lg={4} key={item.id || i}>
                    <div
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 14,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        const overlay = e.currentTarget.querySelector(".gl-cap-overlay");
                        if (overlay) overlay.style.opacity = 1;
                      }}
                      onMouseLeave={(e) => {
                        const overlay = e.currentTarget.querySelector(".gl-cap-overlay");
                        if (overlay) overlay.style.opacity = 0;
                      }}
                    >
                      <img
                        src={item.url}
                        className="t1-gallery-img"
                        alt={item.caption || "Galeri"}
                        onError={(e) => (e.target.style.opacity = 0.4)}
                      />
                      <div
                        className="gl-cap-overlay"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
                          opacity: 0,
                          transition: "opacity 0.25s",
                          display: "flex",
                          alignItems: "flex-end",
                          padding: "16px 18px",
                          pointerEvents: "none",
                        }}
                      >
                        {item.caption && (
                          <span
                            style={{
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                            }}
                          >
                            {item.caption}
                          </span>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
              <div className="text-center mt-4">
                <button className="t1-gold-btn">
                  Lihat Semua Foto <FaArrowRight size={13} />
                </button>
              </div>
            </Container>
          </section>
        );
      })()}

      {/* ══════════════════════════════════════════ FOOTER ════ */}
      <footer className="t1-footer" id="kontak">
        <Container className="py-5">
          <div className="row g-5 align-items-start justify-content-center">
            {/* Mosque identity */}
            <div className="col-12 col-md-5 text-center text-md-start">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-3">
                {hdr.logoImage ? (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: "#fff",
                      borderRadius: 12,
                      padding: 5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={hdr.logoImage}
                      alt="logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 13,
                      background: "rgba(201,168,76,0.18)",
                      border: "1px solid rgba(201,168,76,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaMosque size={22} style={{ color: "#C9A84C" }} />
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#fff",
                      fontSize: "1.0625rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {profile.name}
                  </div>
                  {data?.footer?.tagline && (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: "0.8125rem",
                        marginTop: 2,
                      }}
                    >
                      {data.footer.tagline}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Social */}
            <div className="col-12 col-md-4 text-center text-md-start">
              {/* Contact info */}
              {(data?.footer?.contact?.phone ||
                data?.footer?.contact?.email ||
                data?.footer?.contact?.address) && (
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 800,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      color: "#C9A84C",
                      marginBottom: 10,
                    }}
                  >
                    Kontak
                  </div>
                  {data?.footer?.contact?.phone && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                        marginBottom: 6,
                      }}
                      className="justify-content-md-start"
                    >
                      <FaPhone
                        size={11}
                        style={{
                          color: "rgba(255,255,255,0.35)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {data.footer.contact.phone}
                      </span>
                    </div>
                  )}
                  {data?.footer?.contact?.email && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                        marginBottom: 6,
                      }}
                      className="justify-content-md-start"
                    >
                      <FaEnvelope
                        size={11}
                        style={{
                          color: "rgba(255,255,255,0.35)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {data.footer.contact.email}
                      </span>
                    </div>
                  )}
                  {data?.footer?.contact?.address && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        justifyContent: "center",
                      }}
                      className="justify-content-md-start"
                    >
                      <FaMapMarkerAlt
                        size={11}
                        style={{
                          color: "rgba(255,255,255,0.35)",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      <span
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.8125rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {data.footer.contact.address}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Social media icons */}
              {(() => {
                const socials = data?.footer?.social || {};
                const links = [
                  { key: "facebook", Icon: FaFacebook, color: "#1877F2" },
                  { key: "instagram", Icon: FaInstagram, color: "#E1306C" },
                  { key: "youtube", Icon: FaYoutube, color: "#FF0000" },
                  { key: "twitter", Icon: FaTwitter, color: "#1DA1F2" },
                  { key: "whatsapp", Icon: FaWhatsapp, color: "#25D366" },
                  { key: "tiktok", Icon: FaTiktok, color: "#fff" },
                ].filter(({ key }) => socials[key]?.trim());
                if (!links.length) return null;
                return (
                  <>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        color: "#C9A84C",
                        marginBottom: 10,
                      }}
                    >
                      Ikuti Kami
                    </div>
                    <div className="d-flex gap-2 flex-wrap justify-content-center justify-content-md-start">
                      {links.map(({ key, Icon, color }) => (
                        <a
                          key={key}
                          href={socials[key]}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 9,
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            transition: "all 0.2s",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = color + "33";
                            e.currentTarget.style.borderColor = color + "66";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.07)";
                            e.currentTarget.style.borderColor =
                              "rgba(255,255,255,0.08)";
                          }}
                        >
                          <Icon size={16} />
                        </a>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <hr
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              margin: "32px 0 20px",
            }}
          />
          <p
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: "0.8125rem",
              textAlign: "center",
              margin: 0,
            }}
          >
            {data?.footer?.copyrightText ||
              "© " +
                new Date().getFullYear() +
                " " +
                profile.name +
                ". Dibuat dengan MasjidKu."}
          </p>
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
          
          <div className="bg-light p-3 rounded-4 mb-4" style={{ border: "2px dashed #0D3B2E" }}>
            <h6 className="fw-bold text-dark mb-3">Scan QRIS</h6>
            <img 
              src={donationConfig?.qrisUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"} 
              alt="QRIS Donasi" 
              style={{ maxWidth: 220, height: "auto", margin: "0 auto", display: "block" }}
            />
          </div>

          <div className="p-3 rounded-4 bg-light border text-start">
            <span className="text-muted d-block small mb-1">Transfer Bank</span>
            <div className="d-flex align-items-center justify-content-between">
              <strong style={{ fontSize: "1.1rem", color: "#0D3B2E" }}>{donationConfig?.bankName || "BSI (Bank Syariah Indonesia)"}</strong>
            </div>
            <div className="my-2 p-2 rounded bg-white border d-flex align-items-center justify-content-between">
              <code style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0D3B2E" }}>
                {donationConfig?.accountNumber || "7123456789"}
              </code>
            </div>
            <span className="text-muted d-block small">Atas Nama:</span>
            <strong style={{ color: "#0F172A" }}>{donationConfig?.accountName || "DKM MasjidKu"}</strong>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Template1;
