import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, InputGroup, Alert } from "react-bootstrap";
import Select from "react-select";
import { geoService } from "../../../services/apiClient";

// API Geo mengembalikan nama dalam HURUF KAPITAL — konversi ke Title Case
const toTitleCase = (str) =>
  str ? str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : str;

const Step3Info = ({ data, updateData, onNext, onBack }) => {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  
  const [loadingGeo, setLoadingGeo] = useState({
    prov: true, city: false, dist: false, vill: false
  });

  const [errorMsg, setErrorMsg] = useState("");

  // Fetch Provinces on mount
  useEffect(() => {
    setLoadingGeo(prev => ({ ...prev, prov: true }));
    setErrorMsg("");
    geoService.getProvinces(data.domain || 'masjidbesar')
      .then(res => {
        if (!Array.isArray(res.data)) {
          setErrorMsg("Data provinsi bukan array! Tipe: " + typeof res.data);
          return;
        }
        const options = res.data.map(k => ({ value: k.name, label: toTitleCase(k.name), id: k.id }));
        setProvinces(options);
      })
      .catch(err => {
        console.error("Gagal memuat provinsi:", err);
        setErrorMsg("Error narik API: " + err.message);
      })
      .finally(() => setLoadingGeo(prev => ({ ...prev, prov: false })));
  }, []);

  // Fetch Cities when Province changes
  useEffect(() => {
    if (data.info.province) {
      const selectedProv = provinces.find(opt => opt.value === data.info.province);
      if (selectedProv) {
        setLoadingGeo(prev => ({ ...prev, city: true }));
        geoService.getRegencies(data.domain || 'masjidbesar', selectedProv.id)
          .then(res => {
            const options = res.data.map(k => ({ value: k.name, label: toTitleCase(k.name), id: k.id }));
            setCities(options);
          })
          .catch(console.error)
          .finally(() => setLoadingGeo(prev => ({ ...prev, city: false })));
      }
    } else {
      setCities([]);
    }
  }, [data.info.province, provinces]);

  // Fetch Districts when City changes
  useEffect(() => {
    if (data.info.city) {
      const selectedCity = cities.find(opt => opt.value === data.info.city);
      if (selectedCity) {
        setLoadingGeo(prev => ({ ...prev, dist: true }));
        geoService.getDistricts(data.domain || 'masjidbesar', selectedCity.id)
          .then(res => {
            const options = res.data.map(k => ({ value: k.name, label: toTitleCase(k.name), id: k.id }));
            setDistricts(options);
          })
          .catch(console.error)
          .finally(() => setLoadingGeo(prev => ({ ...prev, dist: false })));
      }
    } else {
      setDistricts([]);
    }
  }, [data.info.city, cities]);

  // Fetch Villages when District changes
  useEffect(() => {
    if (data.info.district) {
      const selectedDist = districts.find(opt => opt.value === data.info.district);
      if (selectedDist) {
        setLoadingGeo(prev => ({ ...prev, vill: true }));
        geoService.getVillages(data.domain || 'masjidbesar', selectedDist.id)
          .then(res => {
            const options = res.data.map(k => ({ value: k.name, label: toTitleCase(k.name), id: k.id }));
            setVillages(options);
          })
          .catch(console.error)
          .finally(() => setLoadingGeo(prev => ({ ...prev, vill: false })));
      }
    } else {
      setVillages([]);
    }
  }, [data.info.district, districts]);

  const handleChange = (e) => {
    updateData("info", { ...data.info, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Hanya terima angka
    if (val.startsWith('0')) {
      val = val.substring(1); // Otomatis hapus 0 di depan
    }
    updateData("info", { ...data.info, contact: val });
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    const newInfo = { ...data.info, [name]: value };
    
    // Reset child fields automatically when parent changes
    if (name === "province") {
      newInfo.city = "";
      newInfo.district = "";
      newInfo.sub_district = "";
    } else if (name === "city") {
      newInfo.district = "";
      newInfo.sub_district = "";
    } else if (name === "district") {
      newInfo.sub_district = "";
    }
    
    updateData("info", newInfo);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: state.isDisabled ? '#F0F0F0' : '#F7F8FA',
      border: `1.5px solid ${state.isFocused ? '#1A5C45' : '#EAECF0'}`,
      borderRadius: 10,
      boxShadow: state.isFocused ? '0 0 0 3px rgba(26,92,69,0.08)' : 'none',
      minHeight: 46,
      fontSize: '1rem',             /* 16px */
      '&:hover': { borderColor: state.isFocused ? '#1A5C45' : '#C9CDD4' },
    }),
    menu: (base) => ({ ...base, borderRadius: 10, zIndex: 999 }),
    option: (base, state) => ({
      ...base,
      fontSize: '1rem',
      backgroundColor: state.isSelected ? '#1A5C45' : state.isFocused ? '#F0F7F4' : 'white',
      color: state.isSelected ? 'white' : '#1a1a1a',
    }),
    placeholder: (base) => ({ ...base, color: '#9AA3AF', fontSize: '1rem' }),
    singleValue: (base) => ({ ...base, color: '#1a1a1a', fontSize: '1rem' }),
  };

  return (
    <div>
      <div className="step-header">
        <h4>Informasi Umum Masjid</h4>
        <p>Lengkapi data profil masjid Anda. Informasi ini akan ditampilkan di website publik.</p>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-3" style={{ background: '#FFF0F0', border: '1px solid #FCA5A5', fontSize: '1rem', color: '#991B1B' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">

          {/* Nama Masjid */}
          <Col md={8}>
            <div className="sw-field">
              <label>Nama Masjid <span className="text-danger">*</span></label>
              <Form.Control name="name" placeholder="Masjid Agung Al-Azhar"
                value={data.info.name} onChange={handleChange} required className="sw-input" />
            </div>
          </Col>

          {/* Email */}
          <Col md={4}>
            <div className="sw-field">
              <label>Email Masjid <span className="text-danger">*</span></label>
              <Form.Control name="email" type="email" placeholder="kontak@masjid.com"
                value={data.info.email} onChange={handleChange} required className="sw-input" />
            </div>
          </Col>

          {/* Alamat */}
          <Col md={8}>
            <div className="sw-field">
              <label>Alamat Lengkap <span className="text-danger">*</span></label>
              <Form.Control as="textarea" rows={2} name="address"
                placeholder="Jalan, No. Bangunan, RT/RW..."
                value={data.info.address} onChange={handleChange} required className="sw-input"
                style={{ resize: 'none' }} />
            </div>
          </Col>

          {/* Telepon */}
          <Col md={4}>
            <div className="sw-field">
              <label>No. Telepon <span className="text-danger">*</span></label>
              <div className="d-flex">
                <div className="d-flex align-items-center px-3 fw-semibold flex-shrink-0"
                  style={{ background: '#F0F7F4', border: '1.5px solid #EAECF0', borderRight: 'none',
                           borderRadius: '10px 0 0 10px', fontSize: '0.82rem', color: '#1A5C45' }}>
                  +62
                </div>
                <Form.Control name="contact" placeholder="81234567890"
                  value={data.info.contact} onChange={handleContactChange} required
                  className="sw-input" style={{ borderRadius: '0 10px 10px 0 !important', borderLeft: 'none !important' }} />
              </div>
            </div>
          </Col>

          {/* Deskripsi */}
          <Col md={12}>
            <div className="sw-field">
              <label>Deskripsi Singkat (Opsional)</label>
              <Form.Control as="textarea" rows={2} name="description"
                placeholder="Ceritakan singkat tentang masjid ini..."
                value={data.info.description} onChange={handleChange} className="sw-input"
                style={{ resize: 'none' }} />
            </div>
          </Col>

          {/* Divider */}
          <Col md={12}>
            <div style={{ borderTop: '1px solid #F0F2F5', margin: '4px 0' }}></div>
            <p className="mb-0" style={{ fontSize: '0.78rem', color: '#9AA3AF', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>Lokasi</p>
          </Col>

          {/* Provinsi */}
          <Col md={6}>
            <div className="sw-field">
              <label>Provinsi <span className="text-danger">*</span></label>
              <Select options={provinces} isClearable isSearchable isLoading={loadingGeo.prov}
                value={provinces.find(o => o.value === data.info.province) || null}
                onChange={opt => handleSelectChange('province', opt)}
                placeholder="Pilih Provinsi..." styles={selectStyles}
                noOptionsMessage={() => 'Tidak ditemukan'} loadingMessage={() => 'Memuat...'} />
            </div>
          </Col>

          {/* Kota */}
          <Col md={6}>
            <div className="sw-field">
              <label>Kota / Kabupaten <span className="text-danger">*</span></label>
              <Select options={cities} isClearable isSearchable isLoading={loadingGeo.city}
                isDisabled={!data.info.province}
                value={cities.find(o => o.value === data.info.city) || null}
                onChange={opt => handleSelectChange('city', opt)}
                placeholder={data.info.province ? 'Pilih Kota / Kab...' : 'Pilih provinsi dulu'}
                styles={selectStyles} noOptionsMessage={() => 'Tidak ditemukan'} />
            </div>
          </Col>

          {/* Kecamatan */}
          <Col md={5}>
            <div className="sw-field">
              <label>Kecamatan <span className="text-danger">*</span></label>
              <Select options={districts} isClearable isSearchable isLoading={loadingGeo.dist}
                isDisabled={!data.info.city}
                value={districts.find(o => o.value === data.info.district) || null}
                onChange={opt => handleSelectChange('district', opt)}
                placeholder={data.info.city ? 'Pilih Kecamatan...' : 'Pilih kota dulu'}
                styles={selectStyles} noOptionsMessage={() => 'Tidak ditemukan'} />
            </div>
          </Col>

          {/* Kelurahan */}
          <Col md={5}>
            <div className="sw-field">
              <label>Kelurahan / Desa (Opsional)</label>
              <Select options={villages} isClearable isSearchable isLoading={loadingGeo.vill}
                isDisabled={!data.info.district}
                value={villages.find(o => o.value === data.info.sub_district) || null}
                onChange={opt => handleSelectChange('sub_district', opt)}
                placeholder={data.info.district ? 'Pilih Kelurahan...' : 'Pilih kecamatan dulu'}
                styles={selectStyles} noOptionsMessage={() => 'Tidak ditemukan'} />
            </div>
          </Col>

          {/* Kode Pos */}
          <Col md={2}>
            <div className="sw-field">
              <label>Kode Pos</label>
              <Form.Control name="postal" placeholder="40135"
                value={data.info.postal} onChange={handleChange}
                type="text" maxLength={5} className="sw-input" />
            </div>
          </Col>

        </Row>

        <div className="step-footer">
          <button type="button" className="sw-btn-secondary d-flex align-items-center gap-2" onClick={onBack}>
            ← Kembali
          </button>
          <button type="submit" className="sw-btn-primary d-flex align-items-center gap-2">
            Lanjutkan →
          </button>
        </div>
      </Form>
    </div>
  );
};

export default Step3Info;

      
