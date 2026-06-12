import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Badge, InputGroup } from "react-bootstrap";
import CrudLayout from "../../../components/common/CrudLayout";

const ExpenseList = ({ onUpdate }) => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    date: "",
    description: "",
    amount: "",
    category: "Operasional",
    recipient: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = JSON.parse(localStorage.getItem("mid_expenses") || "[]");
    setData(stored);
  };

  const notify = () => {
    window.dispatchEvent(new Event("finance-update"));
    if (onUpdate) onUpdate();
  };

  const handleSave = (e) => {
    e.preventDefault();
    let updated = [...data];
    if (formData.id) {
      const idx = updated.findIndex((x) => x.id === formData.id);
      updated[idx] = formData;
    } else {
      updated.push({ ...formData, id: Date.now() });
    }
    localStorage.setItem("mid_expenses", JSON.stringify(updated));
    setData(updated);
    setShowModal(false);
    notify();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Hapus data pengeluaran "${item.description}"?`)) {
      const updated = data.filter((x) => x.id !== item.id);
      localStorage.setItem("mid_expenses", JSON.stringify(updated));
      setData(updated);
      notify();
    }
  };

  const openModal = (item = null) => {
    setFormData(
      item || {
        id: null,
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        category: "Operasional",
        recipient: "",
        notes: "",
      }
    );
    setShowModal(true);
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const CATEGORY_COLORS = {
    "Operasional": { bg: "#FEF3C7", color: "#92400E" },
    "Listrik & Air": { bg: "#DBEAFE", color: "#1E40AF" },
    "Renovasi": { bg: "#FCE7F3", color: "#9D174D" },
    "Kebersihan": { bg: "#D1FAE5", color: "#065F46" },
    "Honorarium": { bg: "#EDE9FE", color: "#5B21B6" },
    "Kegiatan": { bg: "#FFF7ED", color: "#C2410C" },
    "Konsumsi": { bg: "#FFF1F2", color: "#BE123C" },
    "Lainnya": { bg: "#F3F4F6", color: "#374151" },
  };

  const columns = [
    { header: "Tanggal", accessor: "date" },
    {
      header: "Deskripsi",
      accessor: "description",
      render: (row) => (
        <div>
          <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{row.description}</div>
          {row.recipient && (
            <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>Penerima: {row.recipient}</div>
          )}
        </div>
      ),
    },
    {
      header: "Jumlah",
      accessor: "amount",
      render: (row) => (
        <span className="fw-bold" style={{ color: "#B91C1C" }}>{formatRupiah(row.amount)}</span>
      ),
    },
    {
      header: "Kategori",
      accessor: "category",
      render: (row) => {
        const c = CATEGORY_COLORS[row.category] || CATEGORY_COLORS["Lainnya"];
        return (
          <Badge
            style={{
              background: c.bg, color: c.color,
              fontWeight: 600, fontSize: "0.75rem", padding: "5px 10px", borderRadius: 6,
            }}
          >
            {row.category}
          </Badge>
        );
      },
    },
    { header: "Catatan", accessor: "notes" },
  ];

  const modalStyle = `
    .fin-modal .modal-content {
      border: none; border-radius: 20px; overflow: hidden;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .fin-modal .modal-header {
      background: linear-gradient(135deg, #7F1D1D, #B91C1C);
      color: #fff; border: none; padding: 20px 24px;
    }
    .fin-modal .modal-title { font-weight: 700; font-size: 1rem; }
    .fin-modal .btn-close { filter: invert(1); }
    .fin-modal .modal-body { padding: 24px; }
    .fin-modal .form-label {
      font-weight: 600; font-size: 0.83rem; color: #344054; margin-bottom: 4px;
    }
    .fin-modal .form-control, .fin-modal .form-select {
      border-radius: 10px; border: 1.5px solid #EAECF0; padding: 10px 14px;
      font-size: 0.9rem; background: #F7F8FA; transition: all 0.2s;
    }
    .fin-modal .form-control:focus, .fin-modal .form-select:focus {
      border-color: #B91C1C; background: #fff;
      box-shadow: 0 0 0 3px rgba(185,28,28,0.08);
    }
    .fin-modal .modal-footer {
      border: none; padding: 16px 24px 20px; gap: 8px;
    }
    .fin-btn-save-red {
      background: linear-gradient(135deg, #7F1D1D, #B91C1C);
      border: none; border-radius: 10px; font-weight: 700; padding: 10px 24px;
      color: #fff; transition: all 0.2s;
    }
    .fin-btn-save-red:hover {
      background: linear-gradient(135deg, #6B1616, #991B1B);
      box-shadow: 0 4px 12px rgba(185,28,28,0.25); transform: translateY(-1px);
    }
    .fin-btn-cancel {
      background: #F3F4F6; border: 1px solid #E5E7EB; color: #374151;
      border-radius: 10px; font-weight: 600; padding: 10px 20px; transition: all 0.2s;
    }
    .fin-btn-cancel:hover { background: #E5E7EB; color: #1a1a1a; }
  `;

  return (
    <>
      <style>{modalStyle}</style>
      <CrudLayout
        title="Pengeluaran"
        columns={columns}
        data={data}
        onCreate={() => openModal()}
        onEdit={(item) => openModal(item)}
        onDelete={handleDelete}
        emptyMessage="Belum ada data pengeluaran. Mulai catat pengeluaran pertama."
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="fin-modal">
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Edit" : "Catat"} Pengeluaran</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Contoh: Bayar listrik bulan Juni"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nominal</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{ background: "#F7F8FA", border: "1.5px solid #EAECF0", borderRight: "none", borderRadius: "10px 0 0 10px", fontWeight: 600, color: "#6B7280" }}>Rp</InputGroup.Text>
                <Form.Control
                  required
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{ borderLeft: "none", borderRadius: "0 10px 10px 0" }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Operasional</option>
                <option>Listrik & Air</option>
                <option>Renovasi</option>
                <option>Kebersihan</option>
                <option>Honorarium</option>
                <option>Kegiatan</option>
                <option>Konsumsi</option>
                <option>Lainnya</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Penerima <span className="text-muted fw-normal">(opsional)</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Nama penerima pembayaran"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Catatan <span className="text-muted fw-normal">(opsional)</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Catatan tambahan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="fin-btn-cancel" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button className="fin-btn-save-red" type="submit">
              Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ExpenseList;
