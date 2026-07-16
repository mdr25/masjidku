import React, { useState, useEffect } from "react";
import { authService, publicService, prayerService } from "../../services/apiClient";
import BrandLogo from "../../components/common/BrandLogo";

const TvDisplay = () => {
  const [time, setTime] = useState(new Date());
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Slideshow state
  const [slides, setSlides] = useState([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // 1. Clock timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authService.getCurrentUser();
        const slug = user?.slug || user?.mosque_slug || "masjid-agung";
        
        const profileRes = await publicService.getMasjidProfile(slug);
        const profile = profileRes.data?.data || { name: "Masjid Agung", address: "Jln. Raya Masjid No. 1, Kota Impian" };
        
        // Prayer Config: prioritas site_settings.prayer_config, fallback ke province/city dari profil
        const savedPrayerConfig = profile.site_settings?.prayer_config || null;
        const prayerProvince = savedPrayerConfig?.province || profile.province || "";
        const prayerCity = savedPrayerConfig?.city || profile.city || "";
        let prayerTimes = { fajr: "04:30", dhuhr: "12:00", asr: "15:15", maghrib: "18:00", isha: "19:15" };
        
        if (prayerProvince && prayerCity) {
            try {
                const todayMonth = new Date().getMonth() + 1;
                const todayYear = new Date().getFullYear();
                const todayDay = new Date().getDate();
                const prayerRes = await prayerService.getSchedule(slug, {
                    provinsi: prayerProvince,
                    kabkota: prayerCity,
                    bulan: todayMonth,
                    tahun: todayYear
                });
                
                // Normalize response shape
                const rawData = prayerRes.data?.data;
                const list = Array.isArray(rawData) ? rawData
                  : Array.isArray(rawData?.jadwal) ? rawData.jadwal
                  : Array.isArray(rawData?.data) ? rawData.data
                  : [];
                let entry = list.find((d) => parseInt(d.tanggal || d.hari || d.date || d.no || "", 10) === todayDay);
                if (!entry && list.length >= todayDay) entry = list[todayDay - 1];
                if (!entry) entry = list[0];
                
                if (entry) {
                    prayerTimes = {
                        fajr: entry.subuh || prayerTimes.fajr,
                        dhuhr: entry.dzuhur || prayerTimes.dhuhr,
                        asr: entry.ashar || prayerTimes.asr,
                        maghrib: entry.maghrib || prayerTimes.maghrib,
                        isha: entry.isya || prayerTimes.isha
                    };
                }
            } catch (err) {
                console.error("Prayer fetch failed", err);
            }
        }


        // Fetch Slides (Kajian / Gallery)
        const kajianRes = await publicService.getMasjidPosts(slug, "pengumuman");
        const kajianList = (kajianRes.data?.data || []).map(p => ({
          ...p,
          image: p.cover_image_url || p.image
        }));
        
        // Fetch Gallery
        const galleryRes = await publicService.getMasjidPosts(slug, "gallery");
        let galleryImages = [];
        if (galleryRes.data?.data?.length > 0) {
          galleryImages = galleryRes.data.data[0].gallery_images || [];
        }

        const getFullUrl = (path) => {
          if (!path) return "";
          if (path.startsWith("http")) return path;
          const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
          const baseUrl = apiUrl.replace(/\/api$/, "");
          return `${baseUrl}/storage/${path}`;
        };

        const formattedGallery = galleryImages.map(path => getFullUrl(path));
        
        // Gabungkan gambar dari Galeri dan Kajian
        let extractedSlides = [
          ...formattedGallery,
          ...kajianList.map(k => k.image_url || k.image || k.thumbnail)
        ].filter(Boolean); // Hapus yang kosong
        
        if (extractedSlides.length === 0) {
          // Default beautiful mosque pictures for idle slideshow
          extractedSlides = [
            "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1920&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1920&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1920&auto=format&fit=crop"
          ];
        }

        setConfig({
          profile,
          prayer: prayerTimes
        });
        setSlides(extractedSlides);

      } catch (error) {
        console.error("Failed to load TV data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. Slideshow Timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
    }, 10000); // Ganti gambar tiap 10 detik
    
    return () => clearInterval(slideTimer);
  }, [slides]);

  if (loading) {
    return (
      <div style={{ height: "100vh", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2 style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Memuat Layar TV...</h2>
      </div>
    );
  }

  // Formatting helpers
  const formatTime = (date) => date.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

  // Determine next prayer and countdown
  const getNextPrayer = () => {
    if (!config || !config.prayer) return { name: "-", diffStr: "", isWarning: false, diffMinutes: 0 };
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: "Subuh", time: config.prayer.fajr },
      { name: "Dzuhur", time: config.prayer.dhuhr },
      { name: "Ashar", time: config.prayer.asr },
      { name: "Maghrib", time: config.prayer.maghrib },
      { name: "Isya", time: config.prayer.isha }
    ];

    let next = null;
    for (let p of prayers) {
      if (!p.time) continue;
      const [h, m] = p.time.split(":");
      const pMinutes = parseInt(h) * 60 + parseInt(m);
      if (pMinutes > currentMinutes) {
        next = { ...p, minutes: pMinutes };
        break;
      }
    }
    
    // If all passed today, next is Subuh tomorrow
    if (!next && prayers[0].time) {
      const [h, m] = prayers[0].time.split(":");
      next = { name: "Subuh", time: prayers[0].time, minutes: parseInt(h) * 60 + parseInt(m) + 1440 };
    }

    if (!next) return { name: "-", diffStr: "", isWarning: false, diffMinutes: 0 };

    // Calculate difference
    const diffMinutes = next.minutes - currentMinutes;
    const diffHours = Math.floor(diffMinutes / 60);
    const diffMinsRem = diffMinutes % 60;
    
    // Warning state if < 15 minutes
    const isWarning = diffMinutes <= 15 && diffMinutes > 0;
    const isAdzan = diffMinutes <= 0 && diffMinutes > -10; // Adzan/Iqomah time (10 min window)

    let diffStr = "";
    if (isAdzan) {
      diffStr = "WAKTU SHOLAT / IQOMAH";
    } else {
      diffStr = `-${String(diffHours).padStart(2, '0')}:${String(diffMinsRem).padStart(2, '0')}`;
    }

    return { name: next.name, time: next.time, diffStr, isWarning, isAdzan, diffMinutes };
  };

  const nextPrayer = getNextPrayer();
  
  // LOGIC: Mode Iklan aktif jika sisa waktu > 30 menit
  const isIdleMode = nextPrayer.diffMinutes > 30;

  const tvCss = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Share+Tech+Mono&display=swap');
    
    body { margin: 0; overflow: hidden; background: #080f0c; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; }
    
    .tv-layout { height: 100vh; display: flex; flex-direction: column; position: relative; z-index: 10; }
    
    /* SLIDESHOW BACKGROUND (IDLE MODE) */
    .tv-slideshow-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; background: #080f0c; }
    .tv-slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1.5s ease-in-out; }
    .tv-slide.active { opacity: 1; }
    /* Gradient ditingkatkan agar background cerah tidak menabrak teks putih di Header dan Footer */
    .tv-overlay-gradient { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.95) 100%); pointer-events: none; }
    
    /* BACKGROUND GLOW (STANDBY MODE) */
    .tv-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, rgba(0,0,0,0) 70%); z-index: 1; pointer-events: none; transition: opacity 1s; }
    
    /* HEADER */
    .tv-header { padding: 30px 50px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 10; text-shadow: 0 4px 20px rgba(0,0,0,1); }
    .tv-clock { font-family: 'Share Tech Mono', monospace; font-size: 5rem; font-weight: 400; color: #C9A84C; line-height: 1; letter-spacing: -2px; text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.9); }
    .tv-date { font-size: 1.2rem; color: #E5E7EB; font-weight: 600; text-align: right; margin-top: 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.9); }
    .tv-mosque-name { font-size: 2.2rem; font-weight: 800; margin-bottom: 5px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.9); }
    .tv-mosque-address { font-size: 1.1rem; color: #E5E7EB; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.9); }
    
    /* COMPACT PRAYER WIDGET (FOR IDLE MODE) */
    .tv-compact-widget { background: rgba(0,0,0,0.5); border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; padding: 10px 20px; margin-top: 10px; display: inline-block; backdrop-filter: blur(10px); }
    .tv-compact-widget-label { color: #9AA3AF; font-size: 0.9rem; font-weight: 600; letter-spacing: 1px; }
    .tv-compact-widget-val { color: #C9A84C; font-size: 1.2rem; font-weight: 800; }

    /* MAIN BODY (STANDBY MODE) */
    .tv-main { flex: 1; padding: 40px 50px; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 10; transition: opacity 0.5s; }
    .tv-main.hidden { opacity: 0; pointer-events: none; display: none; }
    
    /* COUNTDOWN */
    .tv-countdown-box { text-align: center; margin-bottom: 60px; }
    .tv-countdown-title { font-size: 1.5rem; color: #9AA3AF; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px; }
    .tv-countdown-time { font-family: 'Share Tech Mono', monospace; font-size: 8rem; font-weight: 400; color: #fff; line-height: 1; letter-spacing: -3px; text-shadow: 0 0 30px rgba(255,255,255,0.1); }
    
    .tv-countdown-time.warning { color: #F59E0B; animation: pulse 2s infinite; text-shadow: 0 0 40px rgba(245,158,11,0.3); }
    .tv-countdown-time.adzan { color: #EF4444; font-size: 6rem; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; letter-spacing: 0; animation: blink 1s infinite; text-shadow: 0 0 40px rgba(239,68,68,0.5); }
    
    /* PRAYER SCHEDULE CARDS */
    .tv-prayers { display: flex; gap: 20px; justify-content: space-between; }
    .tv-prayer-card { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 30px 20px; text-align: center; transition: all 0.3s; backdrop-filter: blur(5px); }
    .tv-prayer-card.active { background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(184,148,31,0.05)); border-color: rgba(201,168,76,0.5); transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .tv-prayer-name { font-size: 1.4rem; color: #9AA3AF; font-weight: 600; margin-bottom: 15px; }
    .tv-prayer-card.active .tv-prayer-name { color: #C9A84C; }
    .tv-prayer-time { font-family: 'Share Tech Mono', monospace; font-size: 3rem; color: #fff; }
    
    /* MARQUEE FOOTER */
    .tv-footer { background: rgba(13,59,46,0.9); border-top: 2px solid #C9A84C; height: 70px; display: flex; align-items: center; overflow: hidden; position: relative; z-index: 10; backdrop-filter: blur(10px); }
    .tv-marquee-label { background: #C9A84C; color: #000; height: 100%; display: flex; align-items: center; padding: 0 30px; font-weight: 800; font-size: 1.2rem; z-index: 10; position: absolute; left: 0; top: 0; letter-spacing: 1px; box-shadow: 10px 0 20px rgba(0,0,0,0.3); }
    .tv-marquee-content { white-space: nowrap; font-size: 1.5rem; font-weight: 600; color: #fff; animation: marquee 30s linear infinite; padding-left: 200px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
    .tv-marquee-item { display: inline-block; margin-right: 80px; }
    .tv-marquee-highlight { color: #C9A84C; }
    
    /* ANIMATIONS */
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
    @keyframes blink { 0% { opacity: 1; color: #EF4444; } 50% { opacity: 0; } 100% { opacity: 1; color: #EF4444; } }
    @keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
  `;

  return (
    <>
      <style>{tvCss}</style>

      {/* SLIDESHOW BACKGROUND (Only visible dynamically via opacity but always rendered for transitions) */}
      <div className="tv-slideshow-container" style={{ opacity: isIdleMode ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
        {slides.map((url, idx) => (
          <img 
            key={idx} 
            src={url} 
            alt="Slideshow" 
            className={`tv-slide ${idx === currentSlideIdx ? 'active' : ''}`} 
          />
        ))}
        <div className="tv-overlay-gradient" />
      </div>

      <div className="tv-layout">
        {/* HEADER */}
        <div className="tv-header">
          <div className="d-flex flex-column align-items-start">
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'left center', marginBottom: '-5px' }}>
              <BrandLogo size="md" dark={true} hideText={false} />
            </div>
            <div className="tv-mosque-name">{config.profile.name}</div>
            <div className="tv-mosque-address">{config.profile.address || "Jln. Raya Masjid No. 1"}</div>
          </div>
          <div className="text-end">
            <div className="tv-clock">{formatTime(time)}</div>
            <div className="tv-date">{formatDate(time)}</div>
            
            {/* Show Compact Widget only in Idle Mode */}
            {isIdleMode && (
              <div className="tv-compact-widget">
                <span className="tv-compact-widget-label">MENUJU {nextPrayer.name.toUpperCase()}: </span>
                <span className="tv-compact-widget-val">{nextPrayer.diffStr.replace("-", "")}</span>
              </div>
            )}
          </div>
        </div>

        {/* MAIN BODY (Standby Countdown Mode) */}
        {!isIdleMode && (
          <div className="tv-main">
            {/* BACKGROUND GLOW */}
            <div className="tv-glow" />
            
            <div style={{ position: "relative", zIndex: 1 }}>
              {/* COUNTDOWN */}
              <div className="tv-countdown-box">
                <div className="tv-countdown-title">
                  {nextPrayer.isAdzan ? "PERHATIAN" : `MENUJU WAKTU ${nextPrayer.name.toUpperCase()}`}
                </div>
                <div className={`tv-countdown-time ${nextPrayer.isWarning ? 'warning' : ''} ${nextPrayer.isAdzan ? 'adzan' : ''}`}>
                  {nextPrayer.diffStr}
                </div>
              </div>

              {/* PRAYER CARDS */}
              <div className="tv-prayers">
                {[
                  { id: 'fajr', name: 'Subuh', time: config.prayer.fajr },
                  { id: 'dhuhr', name: 'Dzuhur', time: config.prayer.dhuhr },
                  { id: 'asr', name: 'Ashar', time: config.prayer.asr },
                  { id: 'maghrib', name: 'Maghrib', time: config.prayer.maghrib },
                  { id: 'isha', name: 'Isya', time: config.prayer.isha },
                ].map((p) => {
                  const isActive = p.name === nextPrayer.name;
                  return (
                    <div key={p.id} className={`tv-prayer-card ${isActive ? 'active' : ''}`}>
                      <div className="tv-prayer-name">{p.name}</div>
                      <div className="tv-prayer-time">{p.time || "-"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Fill empty space if in idle mode so footer stays at bottom */}
        {isIdleMode && <div style={{ flex: 1 }} />}

        {/* FOOTER MARQUEE */}
        <div className="tv-footer">
          <div className="tv-marquee-label">INFO MASJID</div>
          <div className="tv-marquee-content">
            <span className="tv-marquee-item">
              Selamat datang di <span className="tv-marquee-highlight">{config.profile.name}</span>. Mari luruskan dan rapatkan shaf sebelum sholat dimulai.
            </span>
            <span className="tv-marquee-item">
              Selamat Datang di {config.profile.name}. Luruskan dan rapatkan shaf sebelum sholat berjamaah dimulai. Matikan alat komunikasi agar ibadah lebih khusyuk.
            </span>
            <span className="tv-marquee-item">
              Matikan atau nada getarkan handphone Anda saat khutbah berlangsung atau saat sholat berjamaah.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TvDisplay;
