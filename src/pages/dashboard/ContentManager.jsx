import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaColumns,
  FaImage,
  FaListAlt,
  FaBullhorn,
  FaClock,
  FaNewspaper,
  FaImages,
  FaLink,
  FaArrowRight,
  FaMosque,
} from "react-icons/fa";

const contentSections = [
  {
    id: "header",
    title: "Header & Navigasi",
    description: "Atur logo, menu navigasi, dan tombol CTA website Anda.",
    icon: <FaColumns size={22} />,
    link: "/app/editor/home/header",
    color: "#0D3B2E",
    bgLight: "#E8F5E9",
  },
  {
    id: "hero",
    title: "Hero / Banner",
    description: "Gambar utama, judul besar, dan pesan penyambut pengunjung.",
    icon: <FaImage size={22} />,
    link: "/app/editor/home/slider",
    color: "#1565C0",
    bgLight: "#E3F2FD",
  },
  {
    id: "profil",
    title: "Profil Masjid",
    description: "Nama, deskripsi, visi & misi, alamat, dan kontak yang tampil di halaman Profil website.",
    icon: <FaMosque size={22} />,
    link: "/app/profile",
    color: "#1A5C45",
    bgLight: "#E8F5E9",
    badge: "Profil Website",
  },
  {
    id: "program",
    title: "Program",
    description: "Kelola program-program kegiatan masjid Anda.",
    icon: <FaListAlt size={22} />,
    link: "/app/activities/program",
    color: "#E65100",
    bgLight: "#FFF3E0",
  },
  {
    id: "kajian",
    title: "Kajian",
    description: "Atur jadwal dan informasi kajian rutin masjid.",
    icon: <FaBullhorn size={22} />,
    link: "/app/activities/kajian",
    color: "#6A1B9A",
    bgLight: "#F3E5F5",
  },
  {
    id: "prayer",
    title: "Jadwal Sholat",
    description: "Konfigurasi waktu sholat yang ditampilkan di website.",
    icon: <FaClock size={22} />,
    link: "/app/activities/prayer",
    color: "#00695C",
    bgLight: "#E0F2F1",
  },
  {
    id: "articles",
    title: "Artikel & Berita",
    description: "Tulis dan kelola artikel atau berita masjid.",
    icon: <FaNewspaper size={22} />,
    link: "/app/info/articles",
    color: "#C62828",
    bgLight: "#FFEBEE",
  },
  {
    id: "gallery",
    title: "Galeri Media",
    description: "Upload foto dan video kegiatan masjid.",
    icon: <FaImages size={22} />,
    link: "/app/info/gallery",
    color: "#283593",
    bgLight: "#E8EAF6",
  },
  {
    id: "footer",
    title: "Footer & Sosmed",
    description: "Atur copyright, alamat, dan link sosial media.",
    icon: <FaLink size={22} />,
    link: "/app/editor/home/footer",
    color: "#37474F",
    bgLight: "#ECEFF1",
  },
];

const ContentManager = () => {
  return (
    <div>
      <style>
        {`
          .content-card {
            border: 1px solid #e9ecef;
            border-radius: 14px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            text-decoration: none;
            overflow: hidden;
          }
          .content-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.08);
            border-color: transparent;
          }
          .content-card .card-arrow {
            opacity: 0;
            transform: translateX(-8px);
            transition: all 0.25s ease;
          }
          .content-card:hover .card-arrow {
            opacity: 1;
            transform: translateX(0);
          }
          .content-card .card-icon-wrapper {
            transition: all 0.25s ease;
          }
          .content-card:hover .card-icon-wrapper {
            transform: scale(1.08);
          }
        `}
      </style>

      {/* Page Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            Kelola Konten
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            Atur semua bagian konten yang tampil di website masjid Anda.
          </p>
        </div>
      </div>

      {/* Content Cards Grid */}
      <Row className="g-3">
        {contentSections.map((section) => (
          <Col md={6} lg={4} xl={3} key={section.id}>
            <Card
              as={Link}
              to={section.link}
              className="content-card h-100 bg-white text-decoration-none"
            >
              <Card.Body className="p-4 d-flex flex-column">
                {/* Icon */}
                <div
                  className="card-icon-wrapper d-flex align-items-center justify-content-center rounded-3 mb-3"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: section.bgLight,
                    color: section.color,
                  }}
                >
                  {section.icon}
                </div>

                {/* Text */}
                <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {section.title}
                </h6>

                {/* Badge opsional */}
                {section.badge && (
                  <span style={{
                    display: "inline-block", fontSize: "0.625rem", fontWeight: 700,
                    letterSpacing: "0.6px", textTransform: "uppercase",
                    background: `${section.color}18`, color: section.color,
                    borderRadius: 5, padding: "2px 8px", marginBottom: 6,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    📌 {section.badge}
                  </span>
                )}

                <p
                  className="text-muted mb-0 flex-grow-1"
                  style={{ fontSize: "0.8125rem", lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {section.description}
                </p>

                {/* Arrow indicator */}
                <div className="d-flex justify-content-end mt-3">
                  <div
                    className="card-arrow d-flex align-items-center gap-1"
                    style={{ color: section.color, fontSize: "0.8rem", fontWeight: 600 }}
                  >
                    Kelola <FaArrowRight size={11} />
                  </div>
                </div>

              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ContentManager;
