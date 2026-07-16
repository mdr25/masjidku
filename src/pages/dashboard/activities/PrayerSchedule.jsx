import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaSyncAlt, FaSave, FaMosque,
  FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaArrowLeft,
} from "react-icons/fa";
import { authService, publicService, dashboardService, prayerService } from "../../../services/apiClient";

/* ════════════════════════════════════════════════════════
   PRAYER API helpers — wrapper around prayerService (apiClient.js)
   ════════════════════════════════════════════════════════ */
const prayerAPI = {
  getProvinces: (slug) =>
    prayerService.getProvinces(slug).then((res) => res.data),

  getCities: (slug, provinsi) =>
    prayerService.getCities(slug, { provinsi }).then((res) => res.data),

  getSchedule: (slug, provinsi, kabkota, bulan, tahun) =>
    prayerService.getSchedule(slug, { provinsi, kabkota, bulan, tahun }).then((res) => res.data),
};

/* ── Normalize API list response (handles string[] or {nama}[] or {id,nama}[]) ── */
const normalizeList = (raw) => {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw
    : Array.isArray(raw?.data) ? raw.data
    : [];
  // If array of strings, use as-is. If objects, extract name.
  return arr.map((item) =>
    typeof item === "string" ? item
    : item?.lokasi || item?.nama || item?.name || item?.kabkota || String(item)
  );
};

/* ── Normalize schedule list (handles various equran.id response shapes) ── */
const normalizeScheduleList = (res) => {
  // Shape A: { data: [ {subuh,dzuhur,...} ] }
  // Shape B: { data: { jadwal: [ {...} ] } }
  // Shape C: { data: { data: [ {...} ] } }
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (d?.jadwal && Array.isArray(d.jadwal)) return d.jadwal;
  if (d?.data  && Array.isArray(d.data))   return d.data;
  if (Array.isArray(res)) return res;
  return [];
};

/* ── Prayer definitions ── */
const PRAYERS = [
  { key: "subuh",   label: "Subuh",   emoji: "🌙", templateKey: "fajr"    },
  { key: "dzuhur",  label: "Dzuhur",  emoji: "☀️", templateKey: "dhuhr"   },
  { key: "ashar",   label: "Ashar",   emoji: "🌤️", templateKey: "asr"     },
  { key: "maghrib", label: "Maghrib", emoji: "🌅", templateKey: "maghrib" },
  { key: "isya",    label: "Isya",    emoji: "🌃", templateKey: "isha"    },
];


const today      = new Date();
const todayDay   = today.getDate();
const todayMonth = today.getMonth() + 1;
const todayYear  = today.getFullYear();

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
const PrayerSchedule = () => {
  const user = authService.getCurrentUser();
  const userSlug = user?.slug || user?.mosque_slug;
  const [allSettings, setAllSettings] = useState({});

  const [province,      setProvince]      = useState("");
  const [city,          setCity]          = useState("");

  const [provinces,     setProvinces]     = useState([]);
  const [cities,        setCities]        = useState([]);
  const [todaySchedule, setTodaySchedule] = useState(null);

  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);
  const [fetching,    setFetching]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [isDirty,     setIsDirty]     = useState(false);
  const [apiError,    setApiError]    = useState(null);

  // Ref untuk preserve kota tersimpan saat load config
  const savedCityRef = useRef("");
  const initialLoadDone = useRef(false);


  /* ── Load config: SELALU ambil province/city dari Profil Masjid → fuzzy match ke prayer API ── */
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 1. Load site_settings (untuk simpan allSettings)
        const settings = await dashboardService.getSiteSettings();
        setAllSettings(settings);

        // 2. Ambil province/city: PRIORITAS dari settings.prayer_config, fallback ke Profil Masjid
        let profileProv = "";
        let profileCity = "";
        
        if (settings?.prayer_config?.province && settings?.prayer_config?.city) {
          profileProv = settings.prayer_config.province;
          profileCity = settings.prayer_config.city;
        } else {
          // Fallback ke profil masjid jika belum ada pengaturan
          try {
            const res = await publicService.getMasjidProfile(userSlug);
            const mosque = res.data?.data;
            if (mosque) {
              profileProv = mosque.province || "";
              profileCity = mosque.city || mosque.district || "";
            }
          } catch (e) {
            console.error("Failed to load mosque profile:", e);
          }
        }

        if (!profileProv) {
          initialLoadDone.current = true;
          return;
        }

        // 3. Fetch daftar provinsi dari Prayer API
        setLoadingProv(true);
        let provList = [];
        try {
          const provRes = await prayerAPI.getProvinces(userSlug);
          provList = normalizeList(provRes?.data ?? provRes);
          setProvinces(provList);
          if (!provList.length) setApiError("Daftar provinsi kosong. Periksa koneksi.");
        } catch (e) {
          console.error("Province fetch error:", e);
          setApiError("Gagal memuat provinsi.");
        } finally {
          setLoadingProv(false);
        }

        // 4. Fuzzy match provinsi profil → daftar prayer API
        //    Prioritas: exact match dulu, baru substring match
        let matchedProv = "";
        if (profileProv && provList.length) {
          const target = profileProv.toUpperCase().replace(/^PROV(?:INSI)?\.?\s*/i, "");
          // Pass 1: Exact match (case-insensitive)
          matchedProv = provList.find(p => p.toUpperCase() === target) || "";
          // Pass 2: Exact match setelah strip prefix "Kepulauan", "D.I.", dll
          if (!matchedProv) {
            matchedProv = provList.find(p => {
              const norm = p.toUpperCase();
              return target === norm || target.includes(norm);
            }) || "";
          }
          // Pass 3: Fallback substring (hanya jika belum ketemu)
          if (!matchedProv) {
            matchedProv = provList.find(p => p.toUpperCase().includes(target)) || "";
          }
        }

        if (!matchedProv) {
          initialLoadDone.current = true;
          return;
        }

        setProvince(matchedProv);

        // 5. Fetch daftar kota → fuzzy match
        setLoadingCity(true);
        let matchedCity = "";
        try {
          const cityRes = await prayerAPI.getCities(userSlug, matchedProv);
          const cityList = normalizeList(cityRes?.data ?? cityRes);
          setCities(cityList);

          if (profileCity && cityList.length) {
            // Pass 1: Exact match (untuk memprioritaskan yang dari settings.prayer_config)
            let match = cityList.find(c => c === profileCity);

            // Pass 2: Fuzzy match
            if (!match) {
              const normTarget = profileCity.toUpperCase()
                .replace(/^KAB(?:UPATEN)?\.?\s*/i, "")
                .replace(/^KOTA\.?\s*/i, "")
                .trim();

              match = cityList.find(c => {
                const normC = c.toUpperCase()
                  .replace(/^KAB(?:UPATEN)?\.?\s*/i, "")
                  .replace(/^KOTA\.?\s*/i, "")
                  .trim();
                return normC === normTarget || normC.includes(normTarget) || normTarget.includes(normC);
              });
            }

            if (match) {
              matchedCity = match;
              setCity(match);
              fetchSchedule(matchedProv, match);
            }
          }
        } catch (e) {
          console.error("Cities fetch error:", e);
        } finally {
          setLoadingCity(false);
        }

        // 6. Auto-save prayer_config (format prayer API) agar MosqueWebsitePage/TvDisplay bisa pakai langsung
        if (matchedProv && matchedCity) {
          const newConfig = { province: matchedProv, city: matchedCity };
          const existing = settings.prayer_config || {};
          if (existing.province !== matchedProv || existing.city !== matchedCity) {
            const updated = { ...settings, prayer_config: newConfig };
            await dashboardService.updateSiteSettings(updated);
            setAllSettings(updated);
          }
        }

        initialLoadDone.current = true;
      } catch (e) {
        console.error("Failed to load prayer config", e);
        initialLoadDone.current = true;
      }
    };
    loadConfig();
  }, [userSlug]);



  /* ── Fetch cities saat user MENGUBAH provinsi (bukan saat load awal) ── */
  useEffect(() => {
    if (!initialLoadDone.current) return; // Skip saat initial load (sudah ditangani loadConfig)
    if (!province) { setCities([]); return; }
    setLoadingCity(true);
    setCities([]);
    setCity("");
    setTodaySchedule(null);
    prayerAPI.getCities(userSlug, province)
      .then((res) => {
        const list = normalizeList(res?.data ?? res);
        setCities(list);
      })
      .catch((e) => console.error("Cities fetch error:", e))
      .finally(() => setLoadingCity(false));
  }, [province, userSlug]);



  /* ── Fetch schedule ── */
  const fetchSchedule = useCallback(async (prov, kot) => {
    if (!prov || !kot) return;
    setFetching(true);
    setApiError(null);
    try {
      const res = await prayerAPI.getSchedule(userSlug, prov, kot, todayMonth, todayYear);
      const list = normalizeScheduleList(res);

      if (!list.length) {
        setApiError("Jadwal tidak tersedia untuk kota ini. Coba kota lain atau periksa nama kota.");
        setFetching(false);
        return;
      }

      // Find today's entry — try by field match, then by index
      let entry = list.find((d) => {
        const raw = String(d.tanggal || d.hari || d.date || d.no || "");
        return parseInt(raw, 10) === todayDay;
      });
      if (!entry && list.length >= todayDay) entry = list[todayDay - 1];
      if (!entry) entry = list[0];

      setTodaySchedule(entry);
    } catch (e) {
      console.error("Schedule fetch error:", e);
      setApiError("Gagal mengambil jadwal. Periksa koneksi internet.");
    } finally {
      setFetching(false);
    }
  }, []);

  // Removed Auto-fetch on load effect because it is now handled inside loadConfig

  /* ── Active prayer detector: sholat terakhir yang sudah lewat tetap nyala ── */
  const getActivePrayer = () => {
    if (!todaySchedule) return null;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    // Urutkan ascending berdasarkan waktu
    const times = PRAYERS
      .map(({ key }) => ({ key, val: todaySchedule[key] }))
      .filter(({ val }) => val)
      .map(({ key, val }) => {
        const [h, m] = val.split(":").map(Number);
        return { key, totalMins: h * 60 + m };
      })
      .sort((a, b) => a.totalMins - b.totalMins);

    // Cari sholat terakhir yang sudah lewat atau tepat tiba
    let active = null;
    for (let i = times.length - 1; i >= 0; i--) {
      if (times[i].totalMins <= nowMins) {
        active = times[i].key;
        break;
      }
    }
    // Sebelum Subuh → tampilkan Isya
    if (!active && times.length > 0) active = times[times.length - 1].key;
    return active;
  };
  const activePrayer = getActivePrayer();




  /* ── Save ── */
  const handleSave = async () => {
    if (!province || !city) {
      setToast({ type: "error", msg: "Pilih Provinsi dan Kota terlebih dahulu." });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSaving(true);
    try {
      const prayerConfig = { province, city };
      const updated = { ...allSettings, prayer_config: prayerConfig };
      await dashboardService.updateSiteSettings(updated);
      setAllSettings(updated);

      setIsDirty(false);
      setToast({ type: "success", msg: "Pengaturan jadwal sholat berhasil disimpan!" });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error("Failed to save prayer config", e);
      setToast({ type: "error", msg: "Gagal menyimpan. Silakan coba lagi." });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const markDirty = () => setIsDirty(true);

  /* ════════════════════════════════════════════════ CSS */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .ps-page { font-family: 'Plus Jakarta Sans', sans-serif; padding-bottom: 80px; }

    /* Back btn */
    .ps-btn-back { display: inline-flex; align-items: center; gap: 8px; color: #6B7280; font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 8px; background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s; margin-bottom: 16px; }
    .ps-btn-back:hover { background: #EAECF0; color: #1a1a1a; }

    .ps-section { background: #fff; border: 1px solid #EAECF0; border-radius: 16px; padding: 24px; margin-bottom: 20px; }

    .ps-select { width: 100%; padding: 10px 13px; border: 1.5px solid #EAECF0; border-radius: 10px; font-size: 0.9375rem; color: #1a1a1a; background-color: #F7F8FA; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; cursor: pointer; appearance: none; }
    .ps-select:focus { border-color: #1A5C45; background-color: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }
    .ps-select:disabled { opacity: 0.5; cursor: not-allowed; }

    .ps-input { width: 100%; padding: 10px 13px; border: 1.5px solid #EAECF0; border-radius: 10px; font-size: 0.9375rem; color: #1a1a1a; background: #F7F8FA; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; box-sizing: border-box; }
    .ps-input:focus { border-color: #1A5C45; background: #fff; box-shadow: 0 0 0 3px rgba(26,92,69,0.08); }

    .ps-label { display: block; font-size: 0.875rem; font-weight: 700; color: #344054; margin-bottom: 6px; }
    .ps-hint  { font-size: 0.75rem; color: #9AA3AF; margin-top: 5px; }
    .ps-field { margin-bottom: 16px; }

    .ps-section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1.5px solid #F0F2F5; font-size: 0.9375rem; font-weight: 800; color: #0D3B2E; }

    .ps-btn-fetch { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #0D3B2E, #1A5C45); color: #fff; border: none; border-radius: 10px; font-size: 0.875rem; font-weight: 700; padding: 10px 20px; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
    .ps-btn-fetch:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(13,59,46,0.28); transform: translateY(-1px); }
    .ps-btn-fetch:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Prayer card grid */
    .ps-prayer-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
    @media (max-width: 640px) { .ps-prayer-grid { grid-template-columns: repeat(3, 1fr); } }
    .ps-prayer-card { border-radius: 12px; padding: 14px 8px; text-align: center; border: 1.5px solid #EAECF0; background: #FAFBFA; transition: all 0.2s; }
    .ps-prayer-card.active { border-color: rgba(26,92,69,0.3); background: linear-gradient(135deg, rgba(13,59,46,0.04), rgba(201,168,76,0.06)); box-shadow: 0 4px 16px rgba(13,59,46,0.08); }
    .ps-prayer-emoji  { font-size: 1.1rem; margin-bottom: 5px; }
    .ps-prayer-name   { font-size: 0.625rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9AA3AF; margin-bottom: 3px; }
    .ps-prayer-card.active .ps-prayer-name { color: #C9A84C; }
    .ps-prayer-time   { font-size: 1rem; font-weight: 800; color: #0D3B2E; line-height: 1; }
    .ps-prayer-iqamah { font-size: 0.625rem; color: #9AA3AF; margin-top: 3px; }
    .ps-prayer-card.active .ps-prayer-iqamah { color: #1A5C45; font-weight: 700; }
    .ps-active-dot { width: 5px; height: 5px; border-radius: 50%; background: #C9A84C; margin: 5px auto 0; animation: psPulse 2s ease infinite; box-shadow: 0 0 0 3px rgba(201,168,76,0.25); }
    @keyframes psPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.7} }



    /* Callout */
    .ps-callout { display: flex; align-items: flex-start; gap: 10px; padding: 11px 14px; border-radius: 10px; font-size: 0.8125rem; font-weight: 600; margin-bottom: 16px; line-height: 1.5; }
    .ps-callout.error { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18); color: #DC2626; }
    .ps-callout.info  { background: rgba(26,92,69,0.06); border: 1px solid rgba(26,92,69,0.15); color: #1A5C45; }

    /* Skeleton */
    @keyframes psShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .ps-sk { border-radius: 8px; background: linear-gradient(90deg,#F0F2F5 25%,#E8EAED 50%,#F0F2F5 75%); background-size: 800px; animation: psShimmer 1.4s infinite; }

    /* Floating save */
    .ps-save-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.96); backdrop-filter: blur(12px); border-top: 1px solid #EAECF0; padding: 13px 32px; display: flex; align-items: center; justify-content: flex-end; gap: 12px; z-index: 100; }
    .ps-save-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #0D3B2E, #1A5C45); color: #fff; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 700; padding: 11px 28px; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
    .ps-save-btn:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(13,59,46,0.28); }
    .ps-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Toast */
    .ps-toast { position: fixed; bottom: 76px; right: 28px; z-index: 9999; display: flex; align-items: center; gap: 9px; padding: 12px 20px; border-radius: 12px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: psUp 0.3s ease; font-family: 'Plus Jakarta Sans', sans-serif; }
    .ps-toast.success { background: #1A5C45; color: #fff; }
    .ps-toast.error   { background: #DC2626; color: #fff; }
    @keyframes psUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes spin  { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  `;

  return (
    <div className="ps-page">
      <style>{css}</style>

      <Link to="/app/content" className="ps-btn-back">
        <FaArrowLeft size={13} /> Kembali
      </Link>

      {/* ── Header ── */}
      <div className="mb-4">
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
          Jadwal Sholat
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
          Jadwal sholat otomatis berdasarkan lokasi kota masjid Anda.
        </p>
      </div>

      {apiError && (
        <div className="ps-callout error">
          <FaExclamationCircle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{apiError}</span>
        </div>
      )}

      <div className="row g-4">
        {/* ══════════════════════ KIRI ══════════════════════ */}
        <div className="col-lg-12">

          {/* Konfigurasi Lokasi */}
          <div className="ps-section">
            <div className="ps-section-title">📍 Lokasi Masjid</div>

            <div className="ps-callout info">
              <FaInfoCircle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Pilih provinsi dan kota sesuai lokasi masjid. Jadwal akan diperbarui secara otomatis setiap kali Anda mengambil jadwal.</span>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="ps-label">Provinsi <span style={{ color: "#EF4444" }}>*</span></label>
                <select
                  className="ps-select"
                  value={province}
                  disabled={loadingProv}
                  onChange={(e) => { setProvince(e.target.value); markDirty(); }}
                >
                  <option value="">{loadingProv ? "Memuat..." : "Pilih Provinsi"}</option>
                  {provinces.map((p, i) => <option key={i} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="ps-label">Kota / Kabupaten <span style={{ color: "#EF4444" }}>*</span></label>
                <select
                  className="ps-select"
                  value={city}
                  disabled={loadingCity || !province}
                  onChange={(e) => { setCity(e.target.value); markDirty(); setTodaySchedule(null); }}
                >
                  <option value="">
                    {!province ? "Pilih provinsi dulu" : loadingCity ? "Memuat kota..." : "Pilih Kota / Kab"}
                  </option>
                  {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button
              className="ps-btn-fetch"
              onClick={() => { fetchSchedule(province, city); markDirty(); }}
              disabled={fetching || !province || !city}
            >
              <FaSyncAlt size={12} style={fetching ? { animation: "spin 1s linear infinite" } : {}} />
              {fetching ? "Mengambil Jadwal…" : "Ambil Jadwal Hari Ini"}
            </button>
          </div>

          {/* Preview Jadwal */}
          <div className="ps-section">
            <div className="ps-section-title">
              🕌 Jadwal Hari Ini
              {todaySchedule && (
                <span style={{ fontWeight: 500, color: "#9AA3AF", fontSize: "0.8125rem", marginLeft: 6 }}>
                  {today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>

            {fetching ? (
              <div className="ps-prayer-grid">
                {PRAYERS.map(({ key }) => (
                  <div key={key} className="ps-prayer-card">
                    <div className="ps-sk" style={{ width: 28, height: 28, borderRadius: 6, margin: "0 auto 8px" }} />
                    <div className="ps-sk" style={{ width: 44, height: 9, margin: "0 auto 8px" }} />
                    <div className="ps-sk" style={{ width: 52, height: 16, margin: "0 auto" }} />
                  </div>
                ))}
              </div>
            ) : todaySchedule ? (
              <>
                <div className="ps-prayer-grid mb-3">
                  {PRAYERS.map(({ key, label, emoji }) => {
                    const isActive = activePrayer === key;
                    const adzanTime = todaySchedule[key];
                    return (
                      <div key={key} className={`ps-prayer-card ${isActive ? "active" : ""}`}>
                        <div className="ps-prayer-emoji">{emoji}</div>
                        <div className="ps-prayer-name">{label}</div>
                        <div className="ps-prayer-time">{adzanTime || "--:--"}</div>
                        {isActive && <div className="ps-active-dot" />}
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9AA3AF", padding: "8px 12px", background: "#F7F8FA", borderRadius: 8 }}>
                  <FaInfoCircle size={10} style={{ marginRight: 5, color: "#1A5C45" }} />
                  Waktu adzan otomatis disinkronisasi dari equran.id
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "36px 0", color: "#C0C7D0" }}>
                <FaMosque size={30} style={{ marginBottom: 10 }} />
                <div style={{ fontWeight: 700, color: "#9AA3AF", marginBottom: 4, fontSize: "0.875rem" }}>
                  Belum ada jadwal
                </div>
                <div style={{ fontSize: "0.8125rem" }}>
                  Pilih provinsi dan kota, lalu klik "Ambil Jadwal Hari Ini".
                </div>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* ── Floating Save ── */}
      <div className="ps-save-bar">
        {isDirty && !saving && (
          <span style={{ fontSize: "0.8125rem", color: "#9AA3AF" }}>Ada perubahan yang belum disimpan</span>
        )}
        <button className="ps-save-btn" onClick={handleSave} disabled={saving || !province || !city || !isDirty}>
          <FaSave size={14} />
          {saving ? "Menyimpan…" : "Simpan Pengaturan"}
        </button>
      </div>


      {/* ── Toast ── */}
      {toast && (
        <div className={`ps-toast ${toast.type}`}>
          {toast.type === "success" ? <FaCheckCircle size={13} /> : <FaExclamationCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default PrayerSchedule;
