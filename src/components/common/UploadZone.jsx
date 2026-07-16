import React from "react";
import { FaUpload, FaCheckCircle } from "react-icons/fa";

const UploadZone = ({ label, hint, fileKey, files, onFileChange, required }) => {
  const hasFile = !!files?.[fileKey];
  return (
    <div className="mb-4">
      <label className="fw-semibold mb-2 d-block" style={{ fontSize: "0.83rem", color: "#344054" }}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className={`upload-zone ${hasFile ? "has-file" : ""}`}>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileChange(e, fileKey)}
          required={required && !hasFile}
        />
        {hasFile ? (
          <div className="d-flex flex-column align-items-center gap-2">
            <FaCheckCircle size={28} style={{ color: "#1A5C45" }} />
            <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>
              {files[fileKey].name}
            </span>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Klik untuk mengganti file</span>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center gap-2">
            <div className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 48, height: 48, background: "#EAECF0" }}>
              <FaUpload size={18} style={{ color: "#9AA3AF" }} />
            </div>
            <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>
              Klik atau seret file ke sini
            </span>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
              {hint}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
