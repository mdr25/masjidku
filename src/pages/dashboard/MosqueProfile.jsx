import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col, Spinner } from "react-bootstrap";
import Select from "react-select";
import { dashboardService, geoService } from "../../services/apiClient";
import {
  FaSave,
  FaMosque,
  FaPhone,
  FaEnvelope,
  FaImage,
  FaTimes,
  FaCamera,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaCheck,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaUpload,
} from "react-icons/fa";


// ─── Template name lookup (sinkron dengan ThemePage.jsx) ──────────────────────
const TEMPLATE_NAMES = {
  "template-1": "Earthy Modern",
  "template-2": "Sapphire Harmony",
  "template-3": "Desert Heritage",
  "template-4": "Ocean Breeze",
  "template-5": "Midnight Modern",
};
const getTemplateName = (code) => TEMPLATE_NAMES[code] || code || "Belum dipilih";

// ─── Title Case helper (API geo data returns ALL CAPS) ────────────────────────
const toTitleCase = (str) => {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// ─── Field mapping (Step3Info → mock_mosques storage) ────────────────────────
// province   = Provinsi
// city       = Kota / Kabupaten
// district   = Kecamatan
// sub_district = Kelurahan / Desa
// postal     = Kode Pos
// description = Tentang Masjid
// ─────────────────────────────────────────────────────────────────────────────

// ─── react-select shared styles ───────────────────────────────────────────────
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: state.isDisabled ? "#F0F0F0" : "#F7F8FA",
    border: `1.5px solid ${state.isFocused ? "#1A5C45" : "#EAECF0"}`,
    borderRadius: 10,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(26,92,69,0.08)" : "none",
    minHeight: 44,
    fontSize: "1rem",
    "&:hover": { borderColor: state.isFocused ? "#1A5C45" : "#C9CDD4" },
    cursor: state.isDisabled ? "not-allowed" : "default",
  }),
  menu: (base) => ({ ...base, borderRadius: 10, zIndex: 999 }),
  option: (base, state) => ({
    ...base,
    fontSize: "1rem",
    backgroundColor: state.isSelected
      ? "#1A5C45"
      : state.isFocused
      ? "#F0F7F4"
      : "white",
    color: state.isSelected ? "white" : "#1a1a1a",
  }),
  placeholder: (base) => ({ ...base, color: "#9AA3AF", fontSize: "1rem" }),
  singleValue: (base) => ({ ...base, color: "#1a1a1a", fontSize: "1rem" }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionTitle = ({ emoji, children }) => (
  <div className="d-flex align-items-center gap-2 mb-4 pb-2"
    style={{ borderBottom: "1.5px solid #F0F2F5" }}>
    <span style={{ fontSize: "1rem" }}>{emoji}</span>
    <span className="fw-bold" style={{ fontSize: "0.9375rem", color: "#0D3B2E" }}>
      {children}
    </span>
  </div>
);

const FieldGroup = ({ label, hint, required, children }) => (
  <Form.Group className="mb-3">
    <Form.Label className="fw-semibold mb-1" style={{ fontSize: "0.9375rem", color: "#344054" }}>
      {label}{required && <span className="text-danger ms-1">*</span>}
    </Form.Label>
    {hint && (
      <p className="text-muted mb-1" style={{ fontSize: "0.875rem", lineHeight: 1.4 }}>
        {hint}
      </p>
    )}
    {children}
  </Form.Group>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MosqueProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    contact: "",
    email: "",
    address: "",
    province: "",
    city: "",
    district: "",
    sub_district: "",
    postal: "",
    description: "",
    template_code: "",
    slug: "",
  });

  // Track original data to detect unsaved changes
  const initialData = useRef(null);
  const isDirty = initialData.current
    ? JSON.stringify(formData) !== JSON.stringify(initialData.current)
    : false;

  // ── Geo dropdown options & loading state ──
  const [provinces,  setProvinces]  = useState([]);
  const [cities,     setCities]     = useState([]);
  const [districts,  setDistricts]  = useState([]);
  const [villages,   setVillages]   = useState([]);
  const [geoLoading, setGeoLoading] = useState({ prov: true, city: false, dist: false, vill: false });

  // ── UI state ──
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);  // { type: 'success'|'error', msg: string }
  const [error,    setError]    = useState("");


  const fetchProfile = async () => {
    try {
      const res = await dashboardService.getProfile();
      const profile = res.data?.data || {};
      // Convert any null values from the API to empty strings to avoid React warnings
      const sanitizedProfile = Object.fromEntries(
        Object.entries(profile).map(([key, value]) => [key, value === null ? "" : value])
      );
      
      let imageUrl = profile.profile_image_url || "";
      // Load saved profile image from site_settings (legacy base64 or mirror)
      if (!imageUrl) {
        try {
          const settings = await dashboardService.getSiteSettings();
          if (settings.profile_image) {
            imageUrl = settings.profile_image;
          }
        } catch { /* ignore */ }
      }
      
      sanitizedProfile.image = imageUrl;
      // Merge ignoring previous formData to ensure strict reset from server
      const merged = { ...formData, ...sanitizedProfile };
      setFormData(merged);
      // Snapshot the loaded data — used to detect dirty state
      initialData.current = merged;
    } catch (err) {
      console.error("Gagal memuat profil:", err);
      setError("Gagal memuat data profil. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  // ── Load profile on mount ──
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load provinces on mount ──
  useEffect(() => {
    setGeoLoading((p) => ({ ...p, prov: true }));
    geoService
      .getProvinces(formData.slug || "masjidbesar")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setProvinces(
          data.map((k) => ({ value: k.name, label: toTitleCase(k.name), id: k.id }))
        );
      })
      .catch(console.error)
      .finally(() => setGeoLoading((p) => ({ ...p, prov: false })));
  }, []);

  // ── Load cities when province changes ──
  useEffect(() => {
    if (!formData.province) { setCities([]); return; }
    const prov = provinces.find((o) => o.value === formData.province);
    if (!prov) return;
    setGeoLoading((p) => ({ ...p, city: true }));
    setCities([]);
    geoService
      .getRegencies(formData.slug || "masjidbesar", prov.id)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCities(data.map((k) => ({ value: k.name, label: toTitleCase(k.name), id: k.id })));
      })
      .catch(console.error)
      .finally(() => setGeoLoading((p) => ({ ...p, city: false })));
  }, [formData.province, provinces]);

  // ── Load districts when city changes ──
  useEffect(() => {
    if (!formData.city) { setDistricts([]); return; }
    const city = cities.find((o) => o.value === formData.city);
    if (!city) return;
    setGeoLoading((p) => ({ ...p, dist: true }));
    setDistricts([]);
    geoService
      .getDistricts(formData.slug || "masjidbesar", city.id)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setDistricts(data.map((k) => ({ value: k.name, label: toTitleCase(k.name), id: k.id })));
      })
      .catch(console.error)
      .finally(() => setGeoLoading((p) => ({ ...p, dist: false })));
  }, [formData.city, cities]);

  // ── Load villages when district changes ──
  useEffect(() => {
    if (!formData.district) { setVillages([]); return; }
    const dist = districts.find((o) => o.value === formData.district);
    if (!dist) return;
    setGeoLoading((p) => ({ ...p, vill: true }));
    setVillages([]);
    geoService
      .getVillages(formData.slug || "masjidbesar", dist.id)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setVillages(data.map((k) => ({ value: k.name, label: toTitleCase(k.name), id: k.id })));
      })
      .catch(console.error)
      .finally(() => setGeoLoading((p) => ({ ...p, vill: false })));
  }, [formData.district, districts]);

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeoSelect = (name, option) => {
    const value = option ? option.value : "";
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Reset child fields when parent changes
      if (name === "province") { next.city = ""; next.district = ""; next.sub_district = ""; }
      if (name === "city")     { next.district = ""; next.sub_district = ""; }
      if (name === "district") { next.sub_district = ""; }
      return next;
    });
  };

  // ── Image upload via Object URL ──
  const fileRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [removeImageRequested, setRemoveImageRequested] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", msg: "Ukuran gambar maksimal 5 MB." });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    // Revoke old object URL if exists
    if (logoFile && formData.image.startsWith("blob:")) {
      URL.revokeObjectURL(formData.image);
    }

    setLogoFile(file);
    setRemoveImageRequested(false);
    setFormData((p) => ({ ...p, image: URL.createObjectURL(file) }));
    e.target.value = "";
  };

  const removeImage = () => {
    if (logoFile && formData.image.startsWith("blob:")) {
      URL.revokeObjectURL(formData.image);
    }
    setLogoFile(null);
    setRemoveImageRequested(true);
    setFormData((p) => ({ ...p, image: "" }));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!isDirty && !logoFile && !removeImageRequested) return;
    setError("");

    // Validate if any non-empty field is being cleared (due to backend restriction)
    const textFields = [
      "name",
      "contact",
      "email",
      "address",
      "province",
      "city",
      "district",
      "sub_district",
      "postal",
      "description"
    ];
    const fieldNames = {
      name: "Nama Masjid",
      contact: "No. Telepon / Kontak",
      email: "Email Masjid",
      address: "Alamat",
      province: "Provinsi",
      city: "Kabupaten/Kota",
      district: "Kecamatan",
      sub_district: "Kelurahan",
      postal: "Kode Pos",
      description: "Deskripsi/Sejarah"
    };

    const clearedFields = [];
    if (initialData.current) {
      for (const field of textFields) {
        const initialVal = initialData.current[field];
        const currentVal = formData[field];
        if (
          initialVal &&
          String(initialVal).trim() !== "" &&
          (!currentVal || String(currentVal).trim() === "")
        ) {
          clearedFields.push(fieldNames[field] || field);
        }
      }
    }

    if (clearedFields.length > 0) {
      setToast({
        type: "error",
        msg: `Pengosongan field (${clearedFields.join(", ")}) tidak didukung oleh API saat ini. Silakan isi kembali.`
      });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setSaving(true);
    try {
      if (isDirty) {
        await dashboardService.updateProfile(formData);
      }
      
      let updatedImageUrl = null;
      let shouldUpdateMirror = false;
      
      if (removeImageRequested) {
        await dashboardService.deleteProfileImage();
        updatedImageUrl = "";
        shouldUpdateMirror = true;
      }
      
      if (logoFile) {
        const uploadRes = await dashboardService.uploadProfileImage(logoFile);
        updatedImageUrl = uploadRes.data?.data?.profile_image_url || "";
        shouldUpdateMirror = true;
      }
      
      // Simpan URL profil foto yang pendek sebagai mirror ke site_settings agar tampil di API Publik
      if (shouldUpdateMirror) {
        const currentSettings = await dashboardService.getSiteSettings();
        const updatedSettings = { ...currentSettings, profile_image: updatedImageUrl };
        await dashboardService.updateSiteSettings(updatedSettings);
      }

      setLogoFile(null);
      setRemoveImageRequested(false);
      await fetchProfile();
      
      setToast({ type: "success", msg: "Profil masjid berhasil disimpan!" });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      setToast({ type: "error", msg: "Gagal menyimpan. Silakan coba lagi." });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Spinner animation="border" style={{ color: "#0D3B2E", width: 34, height: 34, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .pf-input {
          background: #F7F8FA !important;
          border: 1.5px solid #EAECF0 !important;
          border-radius: 10px !important;
          font-size: 0.875rem !important;
          color: #1a1a1a !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
          box-shadow: none !important;
          padding: 10px 14px !important;
        }
        .pf-input:focus {
          border-color: #1A5C45 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(26,92,69,0.08) !important;
        }
        .pf-prefix {
          background: #F0F7F4;
          border: 1.5px solid #EAECF0;
          border-right: none;
          border-radius: 10px 0 0 10px;
          color: #1A5C45;
          padding: 0 12px;
          display: flex;
          align-items: center;
        }
        .pf-prefix + .pf-input {
          border-left: none !important;
          border-radius: 0 10px 10px 0 !important;
        }
        .pf-section {
          background: #fff;
          border: 1px solid #EAECF0;
          border-radius: 14px;
          padding: 22px 24px;
          margin-bottom: 16px;
        }
        /* Floating Save Bar */
        .floating-save-bar {
          position: fixed;
          bottom: 0;
          left: 260px;
          right: 0;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-top: 1px solid #EAECF0;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          z-index: 500;
        }
        .floating-save-btn {
          background: linear-gradient(135deg, #0D3B2E, #1A5C45);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 10px 24px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 12px rgba(13,59,46,0.25);
        }
        .floating-save-btn:hover:not(:disabled) {
          box-shadow: 0 4px 20px rgba(13,59,46,0.35);
          transform: translateY(-1px);
          color: #fff;
        }
        .floating-save-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          background: #9AA3AF;
          box-shadow: none;
        }
        /* Back btn */
        .pf-btn-back { display: inline-flex; align-items: center; gap: 8px; color: #6B7280; font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 8px; background: #F5F6F8; border: 1px solid #EAECF0; transition: all 0.2s; margin-bottom: 16px; }
        .pf-btn-back:hover { background: #EAECF0; color: #1a1a1a; }
        /* Toast */
        .pf-toast {
          position: fixed;
          bottom: 76px;
          right: 28px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          animation: pfToastUp 0.3s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        .pf-toast.success { background: #1A5C45; color: #fff; }
        .pf-toast.error   { background: #DC2626; color: #fff; }
        @keyframes pfToastUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      <Link to="/app/content" className="pf-btn-back">
        <FaArrowLeft size={13} /> Kembali
      </Link>

      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            Profil Masjid
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            Kelola informasi masjid yang tampil di website publik Anda.
          </p>
        </div>
      </div>




      <Form onSubmit={handleSubmit}>

        {/* ── 1. Identitas ── */}
        <div className="pf-section">
          <SectionTitle emoji="🕌">Identitas Masjid</SectionTitle>

          {/* ── Foto Profil Masjid ── */}
          <div className="mb-4">
            <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9375rem", color: "#344054", display: "block" }}>
              Foto Profil Masjid
            </Form.Label>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              {/* Preview */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      alt="Foto masjid"
                      style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12, border: "1.5px solid #EAECF0", display: "block" }}
                      onError={(e) => (e.target.style.opacity = 0.3)}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem" }}
                    >
                      <FaTimes size={8} />
                    </button>
                  </>
                ) : (
                  <div style={{ width: 120, height: 120, borderRadius: 12, border: "1.5px dashed #C9CDD4", background: "#F7F8FA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#9AA3AF" }}>
                    <FaMosque size={28} style={{ color: "#C9CDD4" }} />
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600 }}>Belum ada foto</span>
                  </div>
                )}
              </div>

              {/* Upload area */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F0F7F4", color: "#1A5C45", border: "1px solid #C8E6D9", borderRadius: 8, padding: "6px 12px", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", marginBottom: 6 }}
                >
                  <FaUpload size={10} /> {formData.image ? "Ganti Foto" : "Upload Foto"}
                </button>
                <p style={{ fontSize: "0.8125rem", color: "#9AA3AF", margin: 0, lineHeight: 1.5 }}>
                  Foto ini tampil di bagian <strong>Profil Masjid</strong> di website.<br />
                  Format JPG, PNG, WEBP · Maks. 5 MB
                </p>
              </div>
            </div>
          </div>

          <Row className="g-3">
            <Col md={8}>
              <FieldGroup 
                label="Nama Masjid" 
                required 
                hint="Nama resmi masjid Anda. Catatan: jika Nama Masjid pada website tidak berubah, periksa apakah Anda menggunakan Teks Logo kustom di menu Header & Navigasi."
              >
                <Form.Control type="text" name="name" className="pf-input"
                  placeholder="Contoh: Masjid Al-Furqon"
                  value={formData.name} onChange={handleChange} required />
              </FieldGroup>
            </Col>
            <Col md={6}>
              <FieldGroup label="Email Masjid">
                <div className="d-flex">
                  <span className="pf-prefix"><FaEnvelope size={13} /></span>
                  <Form.Control type="email" name="email" className="pf-input"
                    placeholder="info@masjid.com"
                    value={formData.email} onChange={handleChange} />
                </div>
              </FieldGroup>
            </Col>
            <Col md={6}>
              <FieldGroup label="No. Telepon / WhatsApp">
                <div className="d-flex">
                  <span className="pf-prefix"><FaPhone size={13} /></span>
                  <Form.Control type="text" name="contact" className="pf-input"
                    placeholder="08xx-xxxx-xxxx"
                    value={formData.contact} onChange={handleChange} />
                </div>
              </FieldGroup>
            </Col>
          </Row>
        </div>


        {/* ── 3. Lokasi ── */}
        <div className="pf-section">
          <SectionTitle emoji="📍">Lokasi Masjid</SectionTitle>

          <FieldGroup label="Alamat Lengkap" required>
            <Form.Control as="textarea" rows={2} name="address" className="pf-input" required
              placeholder="Jl. Contoh No. 10, RT 02/RW 03"
              value={formData.address} onChange={handleChange}
              style={{ resize: "none" }} />
          </FieldGroup>

          <Row className="g-3">
            <Col md={6}>
              <FieldGroup label="Provinsi">
                <Select
                  options={provinces}
                  value={provinces.find((o) => o.value === formData.province) || null}
                  onChange={(opt) => handleGeoSelect("province", opt)}
                  isLoading={geoLoading.prov}
                  isClearable
                  isSearchable
                  placeholder="Pilih Provinsi..."
                  styles={selectStyles}
                  noOptionsMessage={() => "Tidak ditemukan"}
                  loadingMessage={() => "Memuat..."}
                />
              </FieldGroup>
            </Col>
            <Col md={6}>
              <FieldGroup label="Kota / Kabupaten">
                <Select
                  options={cities}
                  value={cities.find((o) => o.value === formData.city) || null}
                  onChange={(opt) => handleGeoSelect("city", opt)}
                  isLoading={geoLoading.city}
                  isDisabled={!formData.province}
                  isClearable
                  isSearchable
                  placeholder={formData.province ? "Pilih Kota / Kab..." : "Pilih provinsi dulu"}
                  styles={selectStyles}
                  noOptionsMessage={() => "Tidak ditemukan"}
                />
              </FieldGroup>
            </Col>
            <Col md={5}>
              <FieldGroup label="Kecamatan">
                <Select
                  options={districts}
                  value={districts.find((o) => o.value === formData.district) || null}
                  onChange={(opt) => handleGeoSelect("district", opt)}
                  isLoading={geoLoading.dist}
                  isDisabled={!formData.city}
                  isClearable
                  isSearchable
                  placeholder={formData.city ? "Pilih Kecamatan..." : "Pilih kota dulu"}
                  styles={selectStyles}
                  noOptionsMessage={() => "Tidak ditemukan"}
                />
              </FieldGroup>
            </Col>
            <Col md={5}>
              <FieldGroup label="Kelurahan / Desa">
                <Select
                  options={villages}
                  value={villages.find((o) => o.value === formData.sub_district) || null}
                  onChange={(opt) => handleGeoSelect("sub_district", opt)}
                  isLoading={geoLoading.vill}
                  isDisabled={!formData.district}
                  isClearable
                  isSearchable
                  placeholder={formData.district ? "Pilih Kelurahan..." : "Pilih kecamatan dulu"}
                  styles={selectStyles}
                  noOptionsMessage={() => "Tidak ditemukan"}
                />
              </FieldGroup>
            </Col>
            <Col md={2}>
              <FieldGroup label="Kode Pos">
                <Form.Control type="text" name="postal" className="pf-input"
                  placeholder="40135"
                  value={formData.postal} onChange={handleChange} maxLength={5} />
              </FieldGroup>
            </Col>
          </Row>
        </div>

        {/* ── 4. Tentang Masjid ── */}
        <div className="pf-section">
          <SectionTitle emoji="📝">Tentang Masjid</SectionTitle>
          <FieldGroup label="Deskripsi"
            hint="Ceritakan sejarah singkat, jumlah jamaah, atau keunikan masjid.">
            <Form.Control as="textarea" rows={5} name="description" className="pf-input"
              placeholder="Masjid kami berdiri sejak tahun..."
              value={formData.description} onChange={handleChange}
              style={{ resize: "vertical" }} />
          </FieldGroup>
        </div>
      </Form>

      {/* ── Floating Save Bar ── */}
      <div className="floating-save-bar">
        {(isDirty || logoFile) && (
          <span className="text-muted" style={{ fontSize: "0.8rem" }}>
            Ada perubahan yang belum disimpan
          </span>
        )}
        <button
          type="button"
          className="floating-save-btn"
          onClick={handleSubmit}
          disabled={saving || (!isDirty && !logoFile)}
          title={(!isDirty && !logoFile) ? "Tidak ada perubahan" : "Simpan perubahan"}
        >
          {saving
            ? <><Spinner size="sm" animation="border" /> Menyimpan...</>
            : <><FaSave size={14} /> Simpan Perubahan</>}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`pf-toast ${toast.type}`}>
          {toast.type === "success"
            ? <FaCheckCircle size={13} />
            : <FaExclamationCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default MosqueProfile;

