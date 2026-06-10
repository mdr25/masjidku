import React, { useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { FaGlobe, FaCheckCircle, FaTimesCircle, FaArrowRight } from "react-icons/fa";
import { onboardingService } from "../../../services/apiClient";

const Step1Domain = ({ data, updateData, onNext }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const handleCheckDomain = async () => {
    if (!data.domain) return;
    setIsChecking(true);
    setCheckResult(null);
    try {
      const response = await onboardingService.checkDomain(data.domain);
      const payload = response.data?.data || response.data;
      const isAvailable = payload.available !== undefined ? payload.available : true;
      setCheckResult({ available: isAvailable });
    } catch {
      setCheckResult({ available: false, error: true });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkResult?.available) onNext();
    else handleCheckDomain();
  };

  return (
    <div>
      {/* Step Header */}
      <div className="step-header">
        <h4>Tentukan Nama Domain Website</h4>
        <p>Domain ini akan menjadi alamat publik website masjid Anda dan tidak dapat diubah setelah terdaftar.</p>
      </div>

      <Form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>

        {/* Domain Input */}
        <div className="sw-field mb-3">
          <label>Nama Domain <span className="text-danger">*</span></label>
          <div className="d-flex gap-0">
            <Form.Control
              placeholder="nama-masjid-anda"
              value={data.domain}
              onChange={(e) => {
                updateData("domain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                setCheckResult(null);
              }}
              required
              className="sw-input"
              style={{ borderRadius: "10px 0 0 10px !important", flex: 1 }}
            />
            <div className="d-flex align-items-center px-3 fw-semibold"
              style={{
                background: "#F0F7F4",
                border: "1.5px solid #EAECF0",
                borderLeft: "none",
                borderRadius: "0 10px 10px 0",
                fontSize: "0.82rem",
                color: "#1A5C45",
                whiteSpace: "nowrap",
              }}>
              <FaGlobe size={12} className="me-1" />.masjidku.id
            </div>
          </div>
          <p className="hint mt-2 mb-0">
            Gunakan huruf kecil, angka, dan tanda hubung (-). Contoh: <code>masjid-al-furqon</code>
          </p>
        </div>

        {/* Preview */}
        {data.domain && (
          <div className="domain-preview mb-4">
            <FaGlobe size={14} style={{ color: "#1A5C45" }} />
            <span style={{ color: "#9AA3AF" }}>https://</span>
            <span style={{ color: "#0D3B2E" }}>{data.domain}</span>
            <span style={{ color: "#9AA3AF" }}>.masjidku.id</span>
          </div>
        )}

        {/* Check Result */}
        {checkResult && (
          <div className="d-flex align-items-center gap-2 mb-4 p-3 rounded-3"
            style={{
              background: checkResult.available ? "#F0FDF4" : "#FFF0F0",
              border: `1px solid ${checkResult.available ? "#BBF7D0" : "#FCA5A5"}`,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: checkResult.available ? "#166534" : "#991B1B",
            }}>
            {checkResult.available
              ? <><FaCheckCircle /> Domain tersedia dan siap digunakan!</>
              : <><FaTimesCircle /> Domain ini sudah digunakan masjid lain.</>}
          </div>
        )}

        {/* Actions */}
        <div className="d-flex gap-3">
          <button type="button" className="sw-btn-secondary"
            onClick={handleCheckDomain}
            disabled={!data.domain || isChecking}>
            {isChecking ? <Spinner size="sm" animation="border" className="me-2" /> : null}
            {isChecking ? "Mengecek..." : "Cek Ketersediaan"}
          </button>
          <button type="submit" className="sw-btn-primary d-flex align-items-center gap-2"
            disabled={!checkResult?.available}>
            Lanjutkan <FaArrowRight size={13} />
          </button>
        </div>
      </Form>
    </div>
  );
};

export default Step1Domain;
