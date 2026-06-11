import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaSyncAlt, FaSave, FaMosque,
  FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaArrowLeft,
} from "react-icons/fa";
import { authService } from "../../../services/apiClient";

/* ════════════════════════════════════════════════════════
   PRAYER API helpers — via Vite proxy /api-prayer → equran.id/api/v2/shalat
   ════════════════════════════════════════════════════════ */
const PRAYER_BASE_URL = "/api-prayer";

const prayerAPI = {
  getProvinces: (slug) =>
    fetch(`${PRAYER_BASE_URL}/api/v1/public/${slug}/prayer/provinces`, { 
      headers: { Accept: "application/json" } 
    }).then((r) => r.json()),

  getCities: (slug, provinsi) =>
    fetch(`${PRAYER_BASE_URL}/api/v1/public/${slug}/prayer/cities`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ provinsi }),
    }).then((r) => r.json()),

  getSchedule: (slug, provinsi, kabkota, bulan, tahun) =>
    fetch(`${PRAYER_BASE_URL}/api/v1/public/${slug}/prayer/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ provinsi, kabkota, bulan, tahun }),
    }).then((r) => r.json()),
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

  const user = authService.getCurrentUser();
  const userSlug = user?.slug || user?.mosque_slug;
  const STORAGE_KEY  = `mid_prayer_config_${userSlug}`;
  const SCHEDULE_KEY = `mid_prayer_${userSlug}`;

const DEFAULT_IQAMAH = { subuh: 15, dzuhur: 10, ashar: 10, maghrib: 5, isya: 10 };
const DEFAULT_IMAM   = { subuh: "", dzuhur: "", ashar: "", maghrib: "", isya: "" };

const today      = new Date();
const todayDay   = today.getDate();
const todayMonth = today.getMonth() + 1;
const todayYear  = today.getFullYear();

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
const PrayerSchedule = () => {
  const [province,      setProvince]      = useState("");
  const [city,          setCity]          = useState("");
  const [imam,          setImam]          = useState(DEFAULT_IMAM);
  const [iqamah,        setIqamah]        = useState(DEFAULT_IQAMAH);

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

  // Ref untuk preserve kota tersimpan saat load config (mencegah province-change effect me-reset city)
  const savedCityRef = useRef("");


  /* ── Load saved config ── */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      // Set ref DULU sebelum setProvince, agar province-change effect bisa membacanya
      if (saved.city) savedCityRef.current = saved.city;

      setProvince(saved.province || "");
      setCity(saved.city || "");

      // Backward compat: old imam format was a string, new format is {subuh,dzuhur,...}
      const savedImam = saved.imam;
      if (typeof savedImam === "string" && savedImam.trim()) {
        const name = savedImam.trim();
        setImam({ subuh: name, dzuhur: name, ashar: name, maghrib: name, isya: name });
      } else if (savedImam && typeof savedImam === "object") {
        setImam({ ...DEFAULT_IMAM, ...savedImam });
      } else {
        setImam(DEFAULT_IMAM);
      }

      setIqamah({ ...DEFAULT_IQAMAH, ...(saved.iqamah || {}) });
    }
  }, []);



  /* ── Fetch provinces ── */
  useEffect(() => {
    setLoadingProv(true);
    setApiError(null);
    prayerAPI.getProvinces(userSlug)
      .then((res) => {
        const list = normalizeList(res?.data ?? res);
        setProvinces(list);
        if (!list.length) setApiError("Daftar provinsi kosong. Periksa koneksi.");
      })
      .catch((e) => {
        console.error("Province fetch error:", e);
        setApiError("Gagal memuat provinsi.");
      })
      .finally(() => setLoadingProv(false));
  }, [userSlug]);

  /* ── Fetch cities on province change ── */
  useEffect(() => {
    if (!province) { setCities([]); return; }
    setLoadingCity(true);
    setCities([]);
    prayerAPI.getCities(userSlug, province)
      .then((res) => {
        const list = normalizeList(res?.data ?? res);
        setCities(list);
        // Jika ada city tersimpan dari config, pertahankan jika ada di list
        if (savedCityRef.current) {
          const match = list.find((c) => c === savedCityRef.current);
          if (!match) setCity("");
          savedCityRef.current = "";
        }
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

      // Otomatis simpan ke localStorage agar sinkron dengan PreviewPage/Website
      const templatePrayer = {};
      PRAYERS.forEach(({ key, templateKey }) => {
        templatePrayer[templateKey] = entry[key] || "";
      });
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(templatePrayer));
    } catch (e) {
      console.error("Schedule fetch error:", e);
      setApiError("Gagal mengambil jadwal. Periksa koneksi internet.");
    } finally {
      setFetching(false);
    }
  }, []);

  /* Auto-fetch on load if saved config exists */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.province && saved?.city) {
      fetchSchedule(saved.province, saved.city);
    }
  }, [fetchSchedule]);

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


  /* ── Compute iqamah display time ── */
  const getIqamahTime = (adzan, offsetMin) => {
    if (!adzan || !offsetMin) return null;
    const [h, m] = adzan.split(":").map(Number);
    const total = h * 60 + m + offsetMin;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!province || !city) {
      setToast({ type: "error", msg: "Pilih Provinsi dan Kota terlebih dahulu." });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSaving(true);
    const config = { province, city, imam, iqamah };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    // Save template-compatible schedule to mid_prayer
    if (todaySchedule) {
      const templatePrayer = {};
      PRAYERS.forEach(({ key, templateKey }) => {
        templatePrayer[templateKey] = todaySchedule[key] || "";
      });
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(templatePrayer));
    }

    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setIsDirty(false);
    setToast({ type: "success", msg: "Pengaturan jadwal sholat berhasil disimpan!" });
    setTimeout(() => setToast(null), 3000);
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

    /* Imam batch row */
    .ps-imam-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F5F6F8; }
    .ps-imam-row:last-child { border-bottom: none; }
    .ps-imam-label { width: 80px; flex-shrink: 0; font-size: 0.875rem; font-weight: 700; color: #344054; display: flex; align-items: center; gap: 6px; }

    /* Iqamah row */
    .ps-iqamah-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F5F6F8; }
    .ps-iqamah-row:last-child { border-bottom: none; }
    .ps-iqamah-input { width: 68px; padding: 7px 10px; border: 1.5px solid #EAECF0; border-radius: 8px; font-size: 0.875rem; font-weight: 700; color: #0D3B2E; background: #F7F8FA; outline: none; text-align: center; font-family: 'Plus Jakarta Sans', sans-serif; }
    .ps-iqamah-input:focus { border-color: #1A5C45; background: #fff; }

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
        <div className="col-lg-7">

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
                    const iqDisplay = getIqamahTime(adzanTime, iqamah[key]);
                    return (
                      <div key={key} className={`ps-prayer-card ${isActive ? "active" : ""}`}>
                        <div className="ps-prayer-emoji">{emoji}</div>
                        <div className="ps-prayer-name">{label}</div>
                        <div className="ps-prayer-time">{adzanTime || "--:--"}</div>
                        {iqDisplay && (
                          <div className="ps-prayer-iqamah">Iqamah {iqDisplay}</div>
                        )}
                        {isActive && <div className="ps-active-dot" />}
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9AA3AF", padding: "8px 12px", background: "#F7F8FA", borderRadius: 8 }}>
                  <FaInfoCircle size={10} style={{ marginRight: 5, color: "#1A5C45" }} />
                  Waktu adzan dari equran.id · Iqamah dihitung dari pengaturan di bawah
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

        {/* ══════════════════════ KANAN ══════════════════════ */}
        <div className="col-lg-5">

          {/* Imam Batch */}
          <div className="ps-section">
            <div className="ps-section-title">👤 Nama Imam per Waktu Sholat</div>
            <div className="ps-callout info" style={{ marginBottom: 14 }}>
              <FaInfoCircle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Isi nama imam untuk setiap waktu sholat sekaligus. Kosongkan jika tidak perlu ditampilkan.</span>
            </div>
            {PRAYERS.map(({ key, label, emoji }) => (
              <div key={key} className="ps-imam-row">
                <div className="ps-imam-label">
                  <span>{emoji}</span>
                  <span>{label}</span>
                </div>
                <input
                  className="ps-input"
                  type="text"
                  placeholder={`Imam ${label}...`}
                  value={imam[key] || ""}
                  onChange={(e) => { setImam((p) => ({ ...p, [key]: e.target.value })); markDirty(); }}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
            <p className="ps-hint" style={{ marginTop: 10 }}>📌 Tampil di website masjid jika template mendukung.</p>
          </div>

          {/* Iqamah */}
          <div className="ps-section">
            <div className="ps-section-title">⏱️ Waktu Iqamah</div>
            <div className="ps-callout info" style={{ marginBottom: 14 }}>
              <FaInfoCircle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Berapa menit setelah adzan, sholat berjamaah dimulai.</span>
            </div>
            {PRAYERS.map(({ key, label, emoji }) => (
              <div key={key} className="ps-iqamah-row">
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9375rem" }}>
                  <span>{emoji}</span>
                  <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    className="ps-iqamah-input"
                    type="number" min="0" max="60"
                    value={iqamah[key] ?? 0}
                    onChange={(e) => { setIqamah((p) => ({ ...p, [key]: parseInt(e.target.value, 10) || 0 })); markDirty(); }}
                  />
                  <span style={{ fontSize: "0.8125rem", color: "#9AA3AF", whiteSpace: "nowrap" }}>menit</span>
                </div>
              </div>
            ))}
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
