import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { FaCheck, FaArrowLeft } from "react-icons/fa";
import BrandLogo from "../../components/common/BrandLogo";
import Step1Domain from "./steps/Step1Domain";
import Step2Template from "./steps/Step2Template";
import Step3Info from "./steps/Step3Info";
import Step4Verification from "./steps/Step4Verification";
import Step5Terms from "./steps/Step5Terms";
import Step6Finish from "./steps/Step6Finish";
import { authService } from "../../services/apiClient";
import "./SetupWizard.css";

const STEPS = [
  { num: 1, label: "Nama Domain" },
  { num: 2, label: "Template" },
  { num: 3, label: "Info Masjid" },
  { num: 4, label: "Verifikasi" },
  { num: 5, label: "Ketentuan" },
  { num: 6, label: "Selesai" },
];

const SetupWizard = () => {
  const [step, setStep] = useState(1);

  const currentUser = authService.getCurrentUser() || {};

  const [wizardData, setWizardData] = useState({
    domain: currentUser.slug || "",
    templateId: "",
    info: {
      name: currentUser.name || "", address: "", description: "",
      province: "", city: "", district: "",
      sub_district: "", postal: "", contact: "", email: currentUser.email || "",
    },
    files: { wakaf: null, sk: null },
    agreedToTerms: false,
  });

  const handleNext = () => { if (step < 6) { setStep(step + 1); window.scrollTo(0, 0); } };
  const handleBack = () => { if (step > 1 && step < 6) { setStep(step - 1); window.scrollTo(0, 0); } };
  const updateData = (key, value) => setWizardData((prev) => ({ ...prev, [key]: value }));

  const user = authService.getCurrentUser();
  const userName = user?.name || "Admin Masjid";
  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const renderStep = () => {
    const props = { data: wizardData, updateData, onNext: handleNext, onBack: handleBack };
    switch (step) {
      case 1: return <Step1Domain {...props} />;
      case 2: return <Step2Template {...props} />;
      case 3: return <Step3Info {...props} />;
      case 4: return <Step4Verification {...props} />;
      case 5: return <Step5Terms {...props} />;
      case 6: return <Step6Finish data={wizardData} />;
      default: return null;
    }
  };

  return (
    <div className="setup-page">
      {/* ── Top Navbar ── */}
      <nav className="setup-navbar">
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <Link to="/app/dashboard" className="setup-back-btn">
                <FaArrowLeft size={13} />
                <span>Kembali</span>
              </Link>
              <BrandLogo size="md" dark={true} subtitle="Setup Website" />
            </div>
            {/* User */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-white" style={{ fontSize: "0.82rem", opacity: 0.7 }}>{userName}</span>
              <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                style={{ width: 34, height: 34, background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.8rem" }}>
                {initials}
              </div>
            </div>
          </div>
        </Container>
      </nav>

      {/* ── Stepper ── */}
      <div className="setup-stepper">
        <div className="stepper-inner">
          {STEPS.map(({ num, label }) => {
            const isActive    = step === num;
            const isCompleted = step > num;
            return (
              <div key={num}
                className={`stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                onClick={() => { if (num < 6) { setStep(num); window.scrollTo(0, 0); } }}
              >
                <div className="stepper-dot">
                  {isCompleted ? <FaCheck size={10} /> : num}
                </div>
                <span className="stepper-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step Content ── */}
      <Container>
        <div className="setup-card">
          {renderStep()}
        </div>
      </Container>
    </div>
  );
};

export default SetupWizard;
