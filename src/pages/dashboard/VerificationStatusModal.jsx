import React, { useState } from "react";
import { Modal, Button, Spinner, Alert, Form } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaClock, FaFileUpload } from "react-icons/fa";
import UploadZone from "../../components/common/UploadZone";
import { onboardingService } from "../../services/apiClient";

const VerificationStatusModal = ({ show, onHide, profile, onStatusUpdate }) => {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const status = profile?.verification_status || "draft";
  const note = profile?.verification_note;

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [fileType]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.sk) {
      setError("Silakan lengkapi dokumen SK Kepengurusan.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      if (files.wakaf) {
        formData.append("waqf_imb_document", files.wakaf);
      }
      formData.append("management_decree_document", files.sk);

      await onboardingService.submitVerification(formData);
      setSuccessMsg("Dokumen berhasil diunggah! Status berubah menjadi Menunggu Verifikasi.");
      if (onStatusUpdate) onStatusUpdate();
      
      // Delay to let user read success message before closing
      setTimeout(() => {
        onHide();
        setSuccessMsg("");
        setFiles({});
      }, 2500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat mengunggah dokumen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold" style={{ fontSize: "1.25rem" }}>Status Verifikasi Masjid</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-3 pb-4 px-4">
        {/* Status Indicator */}
        <div className="mb-4 d-flex align-items-center gap-3 p-3 rounded-3" 
             style={{ 
               background: status === "verified" ? "#F0FDF4" : 
                           status === "rejected" ? "#FEF2F2" : 
                           status === "submitted" ? "#FFFBEB" : "#F3F4F6",
               border: `1px solid ${
                 status === "verified" ? "#BBF7D0" : 
                 status === "rejected" ? "#FECACA" : 
                 status === "submitted" ? "#FDE68A" : "#E5E7EB"
               }` 
             }}>
          
          {status === "verified" && <FaCheckCircle size={28} color="#16A34A" />}
          {status === "rejected" && <FaTimesCircle size={28} color="#DC2626" />}
          {status === "submitted" && <FaClock size={28} color="#D97706" />}
          {status === "draft" && <FaFileUpload size={28} color="#6B7280" />}

          <div>
            <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
              {status === "verified" && "Terverifikasi"}
              {status === "rejected" && "Verifikasi Ditolak"}
              {status === "submitted" && "Menunggu Verifikasi"}
              {status === "draft" && "Belum Mengajukan Verifikasi"}
            </div>
            <div className="text-muted" style={{ fontSize: "0.85rem", marginTop: 2 }}>
              {status === "verified" && "Website masjid Anda telah aktif dan dapat diakses publik."}
              {status === "rejected" && "Terdapat masalah pada dokumen yang diunggah. Silakan periksa alasan dan unggah ulang."}
              {status === "submitted" && "Dokumen sedang ditinjau oleh tim kami. Proses ini memerlukan waktu maksimal 2x24 jam."}
              {status === "draft" && "Silakan unggah dokumen legalitas masjid untuk mengaktifkan website publik."}
            </div>
          </div>
        </div>

        {/* Rejection Note */}
        {status === "rejected" && note && (
          <Alert variant="danger" className="mb-4">
            <div className="fw-bold mb-1" style={{ fontSize: "0.85rem" }}>Alasan Penolakan:</div>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>{note}</div>
          </Alert>
        )}

        {/* Existing Documents Read-only if submitted/verified */}
        {(status === "submitted" || status === "verified") && (
          <div className="mb-0">
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Dokumen yang Diunggah</h6>
            <div className="d-flex flex-column gap-2">
              <a href={profile?.waqf_imb_document_url || "#"} target="_blank" rel="noreferrer" 
                 className="text-decoration-none p-2 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.85rem", color: "#374151" }}>
                📄 Akta Wakaf / IMB
              </a>
              <a href={profile?.management_decree_document_url || "#"} target="_blank" rel="noreferrer"
                 className="text-decoration-none p-2 rounded" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.85rem", color: "#374151" }}>
                📄 SK Kepengurusan
              </a>
            </div>
          </div>
        )}

        {/* Resubmit Form */}
        {(status === "rejected" || status === "draft") && (
          <Form onSubmit={handleSubmit}>
            <h6 className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Unggah Ulang Dokumen</h6>
            
            {error && <Alert variant="danger" className="py-2 px-3" style={{ fontSize: "0.85rem" }}>{error}</Alert>}
            {successMsg && <Alert variant="success" className="py-2 px-3" style={{ fontSize: "0.85rem" }}>{successMsg}</Alert>}

            <div className="row g-4">
              <div className="col-md-6">
                <UploadZone
                  label="Akta Wakaf / IMB / Surat Keterangan"
                  hint="PDF, JPG, PNG — maks. 5MB"
                  fileKey="wakaf"
                  files={files}
                  onFileChange={handleFileChange}
                />
              </div>
              <div className="col-md-6">
                <UploadZone
                  label="SK Kepengurusan"
                  hint="PDF, JPG, PNG — maks. 5MB"
                  fileKey="sk"
                  files={files}
                  onFileChange={handleFileChange}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="border-0 fw-semibold px-4"
                style={{ background: "linear-gradient(135deg, #0D3B2E, #1A5C45)", borderRadius: 8, fontSize: "0.9rem" }}
              >
                {loading ? <Spinner size="sm" animation="border" /> : "Kirim Ulang Verifikasi"}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default VerificationStatusModal;
