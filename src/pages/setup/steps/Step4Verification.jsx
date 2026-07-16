import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FaUpload, FaCheckCircle, FaArrowRight, FaArrowLeft, FaFilePdf, FaFileImage } from "react-icons/fa";

import UploadZone from "../../../components/common/UploadZone";

const Step4Verification = ({ data, updateData, onNext, onBack }) => {
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) updateData("files", { ...data.files, [fileType]: file });
  };

  return (
    <div>
      <div className="step-header">
        <h4>Verifikasi Berkas</h4>
        <p>Unggah dokumen resmi untuk memverifikasi keaslian kepengurusan masjid Anda.</p>
      </div>

      {/* Info */}
      <div className="p-3 mb-4 rounded-3 d-flex align-items-start gap-3"
        style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <span style={{ fontSize: "1.2rem" }}>ℹ️</span>
        <div>
          <div className="fw-semibold" style={{ fontSize: "0.83rem", color: "#92400E" }}>Dokumen Wajib</div>
          <div style={{ fontSize: "0.78rem", color: "#92400E", lineHeight: 1.6 }}>
            Format yang diterima: <strong>PDF, JPG, atau PNG</strong>. Ukuran maksimal: <strong>5MB</strong> per file.
            Dokumen akan diverifikasi oleh tim kami sebelum website diaktifkan.
          </div>
        </div>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <UploadZone
            label="Akta Wakaf / IMB"
            hint="PDF, JPG, PNG — maks. 5MB"
            fileKey="wakaf"
            files={data.files}
            onFileChange={handleFileChange}
            required
          />
        </Col>
        <Col md={6}>
          <UploadZone
            label="SK Kepengurusan"
            hint="PDF, JPG, PNG — maks. 5MB"
            fileKey="sk"
            files={data.files}
            onFileChange={handleFileChange}
            required
          />
        </Col>
      </Row>

      <div className="step-footer">
        <button className="sw-btn-secondary d-flex align-items-center gap-2" onClick={onBack}>
          <FaArrowLeft size={12} /> Kembali
        </button>
        <button className="sw-btn-primary d-flex align-items-center gap-2" onClick={onNext}>
          Lanjutkan <FaArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default Step4Verification;
