import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import templateRegistry from "../../templates/registry";
import { authService, publicService } from "../../services/apiClient";

const PreviewPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authService.getCurrentUser();
        const slug = user?.slug || user?.mosque_slug;
        
        const profileRes = await publicService.getMasjidProfile(slug);
        const profile = profileRes.data?.data || { name: "Preview Masjid" };
        
        const kajianRes = await publicService.getMasjidPosts(slug, "kajian");
        const kajian = kajianRes.data?.data || [];
        
        const programRes = await publicService.getMasjidPosts(slug, "program");
        const programs = programRes.data?.data || [];

        // Artikel & Berita: gabungkan kedua tipe, urutkan terbaru dulu
        const artikelRes = await publicService.getMasjidPosts(slug, "artikel");
        const beritaRes  = await publicService.getMasjidPosts(slug, "berita");
        const articles = [
          ...(artikelRes.data?.data || []),
          ...(beritaRes.data?.data  || []),
        ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        const siteConfig = JSON.parse(localStorage.getItem(`mid_site_config_${slug}`) || "{}");
        
        // Prayer: baca dari localStorage (disimpan oleh PrayerSchedule dashboard)
        const savedPrayer = JSON.parse(localStorage.getItem(`mid_prayer_${slug}`) || "null");
        const savedPrayerConfig = JSON.parse(localStorage.getItem(`mid_prayer_config_${slug}`) || "null");
        const prayerTimes = savedPrayer || {
          fajr: "04:30", dhuhr: "12:00", asr: "15:15", maghrib: "18:00", isha: "19:15"
        };

        // Gallery: baca dari localStorage (disimpan oleh GalleryList dashboard)
        const gallery = JSON.parse(localStorage.getItem(`mid_gallery_${slug}`) || "[]");

        setConfig({
          profile: profile,
          templateId: profile.template_code || "template-1",
          prayer: prayerTimes,
          prayerConfig: savedPrayerConfig || {},
          kajian: kajian,
          programs: programs,
          articles: articles,
          gallery: gallery,
          ...siteConfig,
        });


      } catch (error) {
        console.error("Failed to load preview data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set page title dynamically based on mosque name
  useEffect(() => {
    if (config?.profile?.name) {
      document.title = `${config.profile.name} - Website Masjid`;
    }
  }, [config?.profile?.name]);

  if (loading) return <div>Loading...</div>;

  const templateCode = config?.templateId || "template-1";
  const TemplateComponent = templateRegistry[templateCode]?.component || templateRegistry["template-1"].component;

  return (
    <div>
      {TemplateComponent ? (
        <TemplateComponent data={config} />
      ) : (
        <div>Template not found</div>
      )}
    </div>
  );
};

export default PreviewPage;
