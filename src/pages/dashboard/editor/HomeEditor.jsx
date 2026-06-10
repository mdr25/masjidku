import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// HomeEditor sudah digantikan oleh menu Kelola Konten (/app/content)
// Redirect otomatis agar link lama tidak 404
const HomeEditor = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/app/content", { replace: true });
  }, [navigate]);
  return null;
};

export default HomeEditor;
