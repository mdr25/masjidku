import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { authService } from "../../../services/apiClient";

const PrayerSchedule = () => {
  const defaultSchedule = {
    fajr: "04:30",
    dhuhr: "12:00",
    asr: "15:15",
    maghrib: "18:00",
    isha: "19:15",
  };

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      const saved = JSON.parse(localStorage.getItem("mid_prayer") || "null");
      // In a real app we would filter by mosque ID, but for this mock we allow global or user specific
      if (saved) {
        setSchedule(saved);
      }
    }
  }, []);

  const handleChange = (e) => {
    setSchedule({
      ...schedule,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("mid_prayer", JSON.stringify(schedule));
      setMessage("Jadwal Sholat berhasil diperbaharui");
      setLoading(false);
    }, 500);
  };

  return (
    <div>
      <h2 className="mb-4">Jadwal Sholat</h2>
      {message && (
        <Alert variant="success" onClose={() => setMessage("")} dismissible>
          {message}
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <p className="text-muted mb-4">
            Atur jadwal sholat yang akan tampil di halaman depan website masjid
            Anda.
          </p>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Subuh</Form.Label>
                  <Form.Control
                    type="time"
                    name="fajr"
                    value={schedule.fajr}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Dzuhur</Form.Label>
                  <Form.Control
                    type="time"
                    name="dhuhr"
                    value={schedule.dhuhr}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Ashar</Form.Label>
                  <Form.Control
                    type="time"
                    name="asr"
                    value={schedule.asr}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Maghrib</Form.Label>
                  <Form.Control
                    type="time"
                    name="maghrib"
                    value={schedule.maghrib}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Isya</Form.Label>
                  <Form.Control
                    type="time"
                    name="isha"
                    value={schedule.isha}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4">
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Jadwal"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PrayerSchedule;
