import React, { useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { onboardingService } from "../../../services/apiClient";

const Step5Terms = ({ data, updateData, onNext }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isDataComplete = () => {
    if (!data.domain || !data.templateId) return false;
    const i = data.info;
    if (!i.name || !i.address || !i.email || !i.province || !i.city || !i.district || !i.contact) return false;
    if (!data.files || !data.files.wakaf || !data.files.sk) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.agreedToTerms) return;
    if (!isDataComplete()) { setError("Pastikan semua langkah sebelumnya sudah dilengkapi."); return; }
    setError("");
    setSubmitting(true);
    try {
      // 1. Set domain/slug
      await onboardingService.setDomain(data.domain);

      // 2. Set template
      await onboardingService.selectTemplate(data.templateId);

      // 3. Simpan semua data info masjid
      await onboardingService.updateProfile(data.domain, data.info);

      // 4. Submit Verification (jika ada file yang diunggah)
      if (data.files && data.files.wakaf && data.files.sk) {
        const fd = new FormData();
        fd.append("waqf_imb_document", data.files.wakaf);
        fd.append("management_decree_document", data.files.sk);
        await onboardingService.submitVerification(fd);
      }

      // 5. Accept Terms
      await onboardingService.acceptTerms();

      // 3. Tandai setup selesai di current user
      const user = JSON.parse(localStorage.getItem("mid_current_user"));
      if (user) {
        user.isSetupComplete = true;
        user.slug = data.domain;
        localStorage.setItem("mid_current_user", JSON.stringify(user));
      }
      onNext();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="step-header">
        <h4>Syarat & Ketentuan</h4>
        <p>Baca dan setujui syarat ketentuan sebelum website Anda diaktifkan.</p>
      </div>

      {!isDataComplete() && (
        <div className="p-3 mb-4 rounded-3"
          style={{ background: "#FFF0F0", border: "1px solid #FCA5A5", fontSize: "0.83rem", color: "#991B1B" }}>
          ⚠️ Beberapa data pada langkah sebelumnya belum lengkap. Silakan kembali dan lengkapi terlebih dahulu.
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 rounded-3"
          style={{ background: "#FFF0F0", border: "1px solid #FCA5A5", fontSize: "0.83rem", color: "#991B1B" }}>
          {error}
        </div>
      )}

      {/* Terms Content */}
      <div className="terms-box mb-4">
        <p className="fw-semibold mb-2" style={{ color: "#0D3B2E" }}>1. Pendaftar adalah pengurus resmi masjid.</p>
        <p className="fw-semibold mb-2">2. Data yang diberikan adalah benar dan dapat dipertanggungjawabkan.</p>
        <p className="fw-semibold mb-2">3. Website tidak boleh digunakan untuk kegiatan yang melanggar hukum atau bertentangan dengan nilai-nilai Islam.</p>
        <p className="fw-semibold mb-2">4. Platform berhak menonaktifkan website jika ditemukan pelanggaran setelah verifikasi.</p>
        <p className="fw-semibold mb-2">5. Pengurus masjid bertanggung jawab atas konten yang dipublikasikan.</p>
        <p className="fw-semibold mb-2">6. Platform tidak bertanggung jawab atas kerugian yang timbul akibat informasi yang tidak akurat.</p>
        <p className="text-muted mt-3 mb-0" style={{ fontSize: "0.8rem" }}>
          Dengan menyetujui syarat dan ketentuan ini, Anda mengikat diri secara sah pada perjanjian dengan platform MasjidKu.
        </p>
      </div>

      {/* Agree checkbox */}
      <Form onSubmit={handleSubmit}>
        <div className="d-flex align-items-start gap-3 p-3 mb-4 rounded-3"
          style={{ background: "#F7F8FA", border: "1.5px solid #EAECF0", cursor: "pointer" }}
          onClick={() => updateData("agreedToTerms", !data.agreedToTerms)}>
          <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0 mt-1"
            style={{
              width: 20,
              height: 20,
              background: data.agreedToTerms ? "linear-gradient(135deg, #0D3B2E, #1A5C45)" : "#fff",
              border: `2px solid ${data.agreedToTerms ? "#1A5C45" : "#D0D5DD"}`,
              transition: "all 0.2s",
            }}>
            {data.agreedToTerms && <FaCheckCircle size={10} color="#fff" />}
          </div>
          <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "#344054" }}>
            Saya menyetujui seluruh Syarat & Ketentuan yang berlaku di atas
          </span>
        </div>

        <div className="step-footer">
          <button type="submit"
            className="sw-btn-gold d-flex align-items-center gap-2"
            disabled={!data.agreedToTerms || !isDataComplete() || submitting}>
            {submitting
              ? <><Spinner size="sm" animation="border" /> Menyimpan...</>
              : <>🚀 Aktifkan Website Saya</>}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default Step5Terms;
