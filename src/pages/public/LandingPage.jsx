import React from "react";
import {
  Container,
  Navbar,
  Nav,
  Button,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaMosque,
  FaInfoCircle,
  FaList,
  FaImages,
  FaNewspaper,
  FaPhone,
  FaUsers,
  FaInstagram,
  FaClock,
  FaDatabase,
} from "react-icons/fa";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div
      className="bg-white"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Navbar */}
      <Navbar
        expand="lg"
        className="py-3 bg-white fixed-top"
        style={{ boxShadow: "0 2px 15px rgba(0,0,0,0.05)" }}
      >
        <Container>
          <Navbar.Brand href="#" className="d-flex align-items-center gap-2">
            {/* Mock Logo Icon for Masjid Indonesia */}
            <div
              className="d-flex align-items-center justify-content-center text-green-brand"
              style={{ width: 40, height: 40 }}
            >
              <FaMosque size={30} />
            </div>
            <div className="lh-1">
              <span className="fw-bold fs-5 text-dark d-block">Masjid</span>
              <span
                className="fw-bold text-green-brand"
                style={{ fontSize: "0.8rem" }}
              >
                Indonesia
              </span>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav
              className="ms-auto fw-semibold text-dark"
              style={{ fontSize: "0.9rem" }}
            >
              <Nav.Link href="#home" className="text-dark px-3">
                Beranda
              </Nav.Link>
              <Nav.Link href="#about" className="text-dark px-3">
                Tentang Kami
              </Nav.Link>
              <Nav.Link href="#donate" className="text-dark px-3">
                Donasi
              </Nav.Link>
              <Nav.Link href="#contact" className="text-dark px-3">
                Kontak
              </Nav.Link>
            </Nav>
            <Button
              as={Link}
              to="/login"
              className="btn-green-light ms-lg-4 px-4 py-2 rounded-1 fw-semibold"
            >
              Daftar
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <header className="pt-5" style={{ marginTop: "76px" }}>
        <Container className="py-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="position-relative overflow-hidden shadow-lg bg-green-brand"
            style={{ minHeight: "400px", borderRadius: "24px" }}
          >
            {/* Background mask/image */}
            <div
              className="position-absolute top-0 end-0 h-100"
              style={{
                width: "60%",
                background:
                  "url(https://images.unsplash.com/photo-1696691907697-1293552cb22a?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) center right/cover",
                opacity: 0.8,
                maskImage: "linear-gradient(to right, transparent, black 40%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 40%)",
              }}
            ></div>

            <div
              className="position-relative z-index-1 p-5 d-flex flex-column justify-content-center h-100 text-white"
              style={{ maxWidth: "800px", minHeight: "400px" }}
            >
              <h1
                className="fw-bold mb-4 pe-md-5"
                style={{ fontSize: "2.5rem", lineHeight: 1.3 }}
              >
                Berdayakan Masjid, Luaskan Manfaat Kepada Ummat dengan
                Transformasi Digital melalui layanan unggulan kami.
              </h1>
              <div>
                <Button
                  as={Link}
                  to="/register"
                  className="btn-green-light px-4 py-2 rounded-1 fw-bold"
                >
                  Daftar Sekarang
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </header>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-5"
          >
            <h2 className="fw-bold fs-3 mb-2 text-dark">Tahukah Anda ?</h2>
            <p className="text-dark m-0 pb-3 fs-6">
              Berdasarkan data dari <em>We Are Social</em> dan
              databoks.katadata.co.id pada
              <br /> tahun 2022 menunjukkan
            </p>
          </motion.div>
          <Row className="g-4 justify-content-center">
            {[
              {
                icon: <FaUsers size={32} />,
                title: "205 Juta",
                desc: "Pengguna Internet\ndi Indonesia",
              },
              {
                icon: <FaInstagram size={32} />,
                title: "190 Juta",
                desc: "Orang berinteraksi\ndengan medsos",
              },
              {
                icon: <FaClock size={32} />,
                title: "> 8 Jam / hari",
                desc: "Orang Indonesia\nmenghabiskan internet",
              },
              {
                icon: <FaDatabase size={32} />,
                title: "84 %",
                desc: "Berusia produktif\numur 19-54 tahun",
              },
            ].map((stat, idx) => (
              <Col lg={3} md={6} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="h-100"
                >
                  <Card className="h-100 border rounded-4 p-4 shadow-sm hover-scale text-center">
                    <div className="text-dark mb-3">{stat.icon}</div>
                    <h4 className="fw-bold fs-5 text-dark mb-1">
                      {stat.title}
                    </h4>
                    <p
                      className="text-muted small mb-0"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {stat.desc}
                    </p>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-5"
          >
            <h4 className="fw-bold text-dark fs-5">
              Saat nya Masjid bangkit memanfaatkan transformasi digital
              <br />
              melalui <span className="text-dark">Masjid Indonesia.id</span>
            </h4>
          </motion.div>
        </Container>
      </section>

      {/* Description Section */}
      <section className="py-5 overflow-hidden">
        <Container>
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <Card
              className="border-0 text-white p-5 bg-green-brand"
              style={{ borderRadius: "24px" }}
            >
              <Row className="align-items-center">
                <Col md={5} className="text-center mb-4 mb-md-0">
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <h3 className="fw-bold mb-0">Masjid Indonesia</h3>
                    <p
                      className="small tracking-wider opacity-70"
                      style={{ letterSpacing: "2px" }}
                    >
                      MASJID DIGITAL
                    </p>
                  </div>
                </Col>
                <Col md={7}>
                  <h2 className="fw-bold mb-4 fs-3">
                    Apa itu
                    <br />
                    Masjid Indonesia?
                  </h2>
                  <p
                    className="fs-6 opacity-75 mb-4"
                    style={{ lineHeight: 1.8 }}
                  >
                    Sebuah platform Aplikasi berbasis Web yang berfokus pada
                    pengembangan ekosistem masjid berbasis digital. Berkomitmen
                    untuk meningkatkan peran masjid sebagai pilar peradaban
                    islam melalui transformasi digital.
                  </p>
                  <p
                    className="fs-6 opacity-75 m-0"
                    style={{ lineHeight: 1.8 }}
                  >
                    Masjid Indonesia mengajak para pengurus dan takmir masjid
                    untuk tumbuh dan berkembang bersama meningkatkan manfaat
                    kepada ummat serta memperluas jangkauan dakwah masjid ke
                    seluruh Indonesia.
                  </p>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Menu Grid Section */}
      <section className="py-5 bg-white">
        <Container className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="fw-bold mb-5 text-dark"
          >
            Menu Kami
          </motion.h2>
          <Row className="g-4 justify-content-center">
            {[
              {
                icon: <FaHome size={40} />,
                title: "Beranda",
                desc: "Menu Utama Website dengan berbagai macam tema yang menarik.",
              },
              {
                icon: <FaInfoCircle size={40} />,
                title: "Profil Masjid",
                desc: "Menu yang berisi sejarah masjid, struktur kepengurusan, dan visi misi masjid",
              },
              {
                icon: <FaList size={40} />,
                title: "Program",
                desc: "Menu yang berisi program-program yang ada di masjid",
              },
              {
                icon: <FaImages size={40} />,
                title: "Media",
                desc: "Menu untuk mengupload media digital masjid berupa gambar atau video",
              },
              {
                icon: <FaNewspaper size={40} />,
                title: "Artikel & Berita",
                desc: "Menu untuk menulis sebuah artikel dan berita baik tentang masjid ataupun islam",
              },
              {
                icon: <FaPhone size={40} />,
                title: "Kontak",
                desc: "Menu untuk mencantumkan nomor kontak pengelola masjid serta media sosial masjid",
              },
            ].map((item, idx) => (
              <Col lg={4} md={6} key={idx}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="h-100"
                >
                  <Card
                    className="h-100 border-0 menu-card p-5 text-white shadow-sm"
                    style={{ borderRadius: "20px" }}
                  >
                    <div className="mb-4 d-flex justify-content-center text-white opacity-70">
                      {item.icon}
                    </div>
                    <h4 className="fw-bold fs-5 mb-3">{item.title}</h4>
                    <p
                      className="small m-0 text-white opacity-75"
                      style={{ lineHeight: 1.6 }}
                    >
                      {item.desc}
                    </p>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Footer CTA */}
      <section
        className="py-5 text-white position-relative bg-green-brand overflow-hidden"
        style={{ marginTop: "2rem" }}
      >
        <Container className="position-relative z-index-1 text-center py-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <h2 className="fw-bold mb-3">MARI BERGABUNG BERSAMA KAMI !</h2>
            <p className="lead mb-4 fs-5 opacity-75">
              Bersama meningkatkan peran masjid untuk umat dengan{" "}
              <span className="fw-bold text-white">MasjidIndonesia.id</span>
            </p>
            <Button
              as={Link}
              to="/register"
              className="btn-green-light px-5 py-2 mt-2 rounded-1 fw-bold shadow-sm"
            >
              Gabung Sekarang
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-white py-5 border-top">
        <Container>
          <Row className="align-items-start g-4">
            <Col lg={4} md={12}>
              <div className="d-flex align-items-center mb-3 text-green-brand">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="32"
                  height="32"
                  className="me-2"
                >
                  <path d="M12 2L8 6H4V18H20V6H16L12 2ZM12 5.5L14.5 8H18V16H6V8H9.5L12 5.5Z" />
                  <path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" />
                </svg>
                <div className="lh-1">
                  <span className="fw-bold fs-5 d-block text-dark">Masjid</span>
                  <span
                    className="fw-bold text-green-brand"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Indonesia
                  </span>
                </div>
              </div>
              <p className="small text-muted pe-md-5 lh-lg">
                Sebuah platform aplikasi berbasis web yang berfokus pada
                pengembangan ekosistem masjid berbasis digital yang dapat
                dnikmati secara online.
              </p>
            </Col>
            <Col lg={2} md={4}>
              <h6 className="fw-bold text-dark mb-4">Menu</h6>
              <ul className="list-unstyled small text-muted lh-lg">
                <li>
                  <a href="#about" className="text-decoration-none text-muted">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#donate" className="text-decoration-none text-muted">
                    Donasi
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-decoration-none text-muted"
                  >
                    Kontak
                  </a>
                </li>
              </ul>
            </Col>
            <Col lg={3} md={4}>
              <h6 className="fw-bold text-dark mb-4">Bantuan</h6>
              <ul className="list-unstyled small text-muted lh-lg">
                <li>
                  <a href="#terms" className="text-decoration-none text-muted">
                    Syarat & Ketentuan
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="text-decoration-none text-muted"
                  >
                    Kebijakan Privasi
                  </a>
                </li>
              </ul>
            </Col>
            <Col lg={3} md={4}>
              <h6 className="fw-bold text-dark mb-4">Media Sosial</h6>
              <div className="d-flex text-dark gap-3">
                <a
                  href="#ig"
                  className="text-dark bg-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36 }}
                >
                  <FaInstagram size={18} />
                </a>
                <a
                  href="#fb"
                  className="text-dark bg-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36 }}
                >
                  <FaHome size={18} />
                </a>
                <a
                  href="#tw"
                  className="text-dark bg-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36 }}
                >
                  <FaPhone size={18} />
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
      <div className="bg-green-brand text-center text-white py-3">
        <small className="opacity-75">
          © 2024 Masjid Indonesia.id. All right reserved.
        </small>
      </div>
    </div>
  );
};

export default LandingPage;
