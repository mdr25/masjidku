import React from "react";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaMosque, FaThLarge, FaArrowRight, FaCheckCircle } from "react-icons/fa";

const Step6Finish = ({ data }) => {
  const navigate = useNavigate();

  const steps_done = [
    { label: "Domain ditetapkan", value: data.domain ? `${data.domain}.masjidku.id` : "-" },
    { label: "Template dipilih", value: data.templateId || "-" },
    { label: "Profil masjid", value: data.info?.name || "-" },
    { label: "Berkas diunggah", value: data.files?.wakaf && data.files?.sk ? "✓ Lengkap" : "Sebagian" },
  ];

  return (
    <div className="text-center py-2">
      {/* Icon */}
      <div className="finish-icon">
        <FaCheckCircle size={36} style={{ color: "#1A5C45" }} />
      </div>

      <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a", letterSpacing: "-0.3px" }}>
        Pendaftaran Berhasil!
      </h4>
      <p className="text-muted mx-auto mb-4"
        style={{ maxWidth: 480, fontSize: "0.9rem", lineHeight: 1.7 }}>
        Data masjid Anda telah kami terima. Tim kami akan melakukan verifikasi dalam <strong>1–3 hari kerja</strong>.
        Informasi aktivasi akan dikirimkan ke email Anda.
      </p>

      {/* Summary */}
      <div className="mx-auto mb-4 text-start"
        style={{ maxWidth: 440, background: "#F7F8FA", border: "1px solid #EAECF0", borderRadius: 12, padding: "16px 20px" }}>
        <p className="fw-semibold mb-3" style={{ fontSize: "0.78rem", color: "#9AA3AF", letterSpacing: "1px", textTransform: "uppercase" }}>
          Ringkasan Pendaftaran
        </p>
        {steps_done.map((s, i) => (
          <div key={i} className="d-flex justify-content-between align-items-center py-2"
            style={{ borderBottom: i < steps_done.length - 1 ? "1px solid #EAECF0" : "none" }}>
            <span style={{ fontSize: "0.82rem", color: "#6B7280" }}>{s.label}</span>
            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "#1a1a1a" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div className="mx-auto mb-5" style={{ maxWidth: 440 }}>
        <p className="fw-semibold mb-3 text-start" style={{ fontSize: "0.78rem", color: "#9AA3AF", letterSpacing: "1px", textTransform: "uppercase" }}>
          Langkah Selanjutnya
        </p>
        <Row className="g-3 text-start">
          {[
            { icon: <FaMosque size={16} />, title: "Lengkapi Profil Masjid", desc: "Tambahkan foto, deskripsi, dan informasi kontak." },
            { icon: <FaThLarge size={16} />, title: "Tambahkan Konten", desc: "Buat berita, program, dan jadwal kajian." },
          ].map((item, i) => (
            <Col md={6} key={i}>
              <div className="p-3 rounded-3 h-100"
                style={{ background: "#F0F7F4", border: "1px solid #C8E6D9" }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: "#1A5C45" }}>
                  {item.icon}
                  <span className="fw-bold" style={{ fontSize: "0.82rem" }}>{item.title}</span>
                </div>
                <p className="mb-0 text-muted" style={{ fontSize: "0.76rem", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA */}
      <button className="sw-btn-primary d-inline-flex align-items-center gap-2"
        onClick={() => navigate("/app/dashboard")}>
        Pergi ke Dashboard <FaArrowRight size={13} />
      </button>
    </div>
  );
};

export default Step6Finish;
