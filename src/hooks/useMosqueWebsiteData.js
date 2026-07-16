import { useState, useEffect } from "react";
import { publicService, prayerService } from "../services/apiClient";

// Helper to format image URL (Module-level to avoid initialization order issues)
function getFullUrl(path) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;
  
  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const baseUrl = apiUrl.replace(/\/api$/, "");
  
  if (path.startsWith("http") && path.includes("/storage/")) {
    try {
      const storageIndex = path.indexOf("/storage/");
      path = path.substring(storageIndex);
    } catch (e) {}
  }
  
  if (path.startsWith("http")) {
    if (path.startsWith("http://localhost") || path.startsWith("http://127.0.0.1")) {
      try {
        const urlObj = new URL(path);
        path = urlObj.pathname;
      } catch (e) {
        return path;
      }
    } else {
      return path;
    }
  }
  
  let cleanPath = path;
  if (cleanPath.startsWith("/storage/")) {
    cleanPath = cleanPath.substring(9);
  } else if (cleanPath.startsWith("storage/")) {
    cleanPath = cleanPath.substring(8);
  } else if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }
  
  return `${baseUrl}/storage/${cleanPath}`;
}

export const useMosqueWebsiteData = (slug) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusError, setStatusError] = useState(null); // 'not_verified', 'not_found', etc.

  useEffect(() => {
    if (!slug) {
      setError("Slug tidak valid.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setStatusError(null);

      try {
        const profileRes = await publicService.getMasjidProfile(slug);
        const profile = profileRes.data?.data || null;

        if (!profile) {
          setStatusError("not_found");
          return;
        }

        // --- Workaround / Check verification status ---
        // Karena endpoint publik tidak mengembalikan verification_status,
        // profile.verification_status akan selalu undefined di sini.
        // Blokir frontend hanya akan bekerja efektif ketika backend
        // mengembalikan status error (seperti 403) di masa depan.
        if (
          profile.verification_status &&
          profile.verification_status !== "verified"
        ) {
          setStatusError("not_verified");
        }

        const kajianRes = await publicService.getMasjidPosts(
          slug,
          "pengumuman",
        );
        const kajian = (kajianRes.data?.data || []).map((p) => ({
          ...p,
          date: p.event_date || p.date,
          time: p.event_time || p.time,
          image: p.cover_image_url ? getFullUrl(p.cover_image_url) : (p.image ? getFullUrl(p.image) : ""),
        }));

        const programRes = await publicService.getMasjidPosts(slug, "kegiatan");
        const programs = (programRes.data?.data || []).map((p) => ({
          ...p,
          link: p.target_url || p.link,
          image: p.cover_image_url ? getFullUrl(p.cover_image_url) : (p.image ? getFullUrl(p.image) : ""),
        }));

        const beritaRes = await publicService.getMasjidPosts(slug, "berita");
        const articles = (beritaRes.data?.data || []).map((p) => ({
          ...p,
          date: p.article_date || p.date,
          image: p.cover_image_url ? getFullUrl(p.cover_image_url) : (p.image ? getFullUrl(p.image) : ""),
        }));

        const galleryRes = await publicService.getMasjidPosts(slug, "gallery");
        const galleryList = galleryRes.data?.data || [];
        let gallery = [];
        if (galleryList.length > 0) {
          const mainPost = galleryList[0];
          gallery = (mainPost.gallery_images || []).map((path) => getFullUrl(path));
        }

        const siteConfig = profile.site_settings || {};

        const savedPrayerConfig = siteConfig.prayer_config || null;
        const prayerProvince =
          savedPrayerConfig?.province || profile.province || "";
        const prayerCity = savedPrayerConfig?.city || profile.city || "";
        let prayerTimes = {
          fajr: "--:--",
          dhuhr: "--:--",
          asr: "--:--",
          maghrib: "--:--",
          isha: "--:--",
        };

        if (prayerProvince && prayerCity) {
          try {
            const todayMonth = new Date().getMonth() + 1;
            const todayYear = new Date().getFullYear();
            const todayDay = new Date().getDate();
            const prayerRes = await prayerService.getSchedule(slug, {
              provinsi: prayerProvince,
              kabkota: prayerCity,
              bulan: todayMonth,
              tahun: todayYear,
            });

            if (prayerRes.data) {
              const resData = prayerRes.data;
              const d = resData?.data;
              let list = [];
              if (Array.isArray(d)) list = d;
              else if (d?.jadwal && Array.isArray(d.jadwal)) list = d.jadwal;
              else if (d?.data && Array.isArray(d.data)) list = d.data;
              else if (Array.isArray(resData)) list = resData;

              if (list.length > 0) {
                let currentSchedule = list.find((item) => {
                  const raw = String(
                    item.tanggal || item.hari || item.date || item.no || "",
                  );
                  return parseInt(raw, 10) === todayDay;
                });

                if (!currentSchedule && list.length >= todayDay)
                  currentSchedule = list[todayDay - 1];
                if (!currentSchedule) currentSchedule = list[0];

                if (currentSchedule) {
                  prayerTimes = {
                    fajr: currentSchedule.subuh || prayerTimes.fajr,
                    dhuhr: currentSchedule.dzuhur || prayerTimes.dhuhr,
                    asr: currentSchedule.ashar || prayerTimes.asr,
                    maghrib: currentSchedule.maghrib || prayerTimes.maghrib,
                    isha: currentSchedule.isya || prayerTimes.isha,
                  };
                }
              }
            }
          } catch (err) {
            console.error("Gagal load prayer time di hook", err);
          }
        }

        setConfig({
          templateId: profile.template_code || "TEMPLATE_A",
          themeColor: siteConfig.primary_color || "#0D3B2E",
          profile: {
            ...profile,
            name: profile.name ?? "",
            address: profile.address ?? "",
            logo: profile.logo_path ? getFullUrl(profile.logo_path) : "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=150",
            phone: profile.contact ?? "",
            email: profile.email ?? "",
            description: (profile.description && profile.description.trim())
              ? profile.description
              : "Belum ada deskripsi profil masjid.",
            province: profile.province ?? "",
            city: profile.city ?? "",
            district: profile.district ?? "",
            sub_district: profile.sub_district ?? "",
            postal: profile.postal ?? "",
            image: profile.profile_image_url 
              ? getFullUrl(profile.profile_image_url) 
              : (siteConfig.profile_image ? getFullUrl(siteConfig.profile_image) : ""),
          },
          hero: {
            title: siteConfig.hero_title || `Selamat Datang di ${profile.name}`,
            subtitle:
              siteConfig.hero_subtitle ||
              "Pusat informasi dan kegiatan jamaah.",
            image:
              "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=1920",
            primaryButtonText: siteConfig.hero_btn1_text || "Lihat Kegiatan",
            primaryButtonLink: siteConfig.hero_btn1_link || "#kegiatan",
            secondaryButtonText: siteConfig.hero_btn2_text || "Donasi",
            secondaryButtonText: siteConfig.hero_btn2_text || "Donasi",
            secondaryButtonLink: siteConfig.hero_btn2_link || "#donasi",
            ...siteConfig.hero,
          },
          header: {
            ...siteConfig.header,
            logoImage: siteConfig.header?.logoImage !== undefined
              ? (siteConfig.header.logoImage ? getFullUrl(siteConfig.header.logoImage) : "")
              : (profile.logo_path ? getFullUrl(profile.logo_path) : ""),
          },
          prayer: prayerTimes,
          prayerConfig: savedPrayerConfig || {},
          activities: {
            kajian,
            programs,
          },
          kajian,
          programs,
          articles,
          gallery,
          footer: {
            about: siteConfig.footer?.tagline || profile.description || "Bersama memakmurkan masjid.",
            copyrightText: siteConfig.footer?.copyrightText || "",
            links: [
              { label: "Jadwal Sholat", url: "#prayer" },
              { label: "Kajian", url: "#kajian" },
              { label: "Kegiatan", url: "#kegiatan" },
              { label: "Berita", url: "#berita" },
            ],
            social: {
              facebook: siteConfig.footer?.social?.facebook || siteConfig.social_fb || "",
              instagram: siteConfig.footer?.social?.instagram || siteConfig.social_ig || "",
              youtube: siteConfig.footer?.social?.youtube || siteConfig.social_yt || "",
              twitter: siteConfig.footer?.social?.twitter || "",
              whatsapp: siteConfig.footer?.social?.whatsapp || "",
              tiktok: siteConfig.footer?.social?.tiktok || "",
            },
            contact: {
              phone: siteConfig.footer?.contact?.phone || profile.contact || "",
              email: siteConfig.footer?.contact?.email || profile.email || "",
              address: siteConfig.footer?.contact?.address || profile.address || "",
            },
          },
        });
      } catch (err) {
        console.error("Failed to load mosque data", err);
        if (err.response?.status === 404) {
          setStatusError("not_found");
        } else if (err.response?.status === 403) {
          setStatusError("not_verified");
        } else {
          setError(err.message || "Gagal memuat data masjid.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return { config, loading, error, statusError };
};
