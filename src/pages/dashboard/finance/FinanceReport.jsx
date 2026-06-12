import React, { useState, useMemo } from "react";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import {
  FaArrowUp, FaArrowDown, FaCalendarAlt, FaDownload,
  FaWallet, FaPrint,
} from "react-icons/fa";

const fmtRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const FinanceReport = ({ donations = [], expenses = [] }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = useMemo(() => {
    const s = new Set();
    [...donations, ...expenses].forEach((d) => {
      if (d.date) s.add(new Date(d.date).getFullYear());
    });
    s.add(currentYear);
    return [...s].sort((a, b) => b - a);
  }, [donations, expenses, currentYear]);

  /* ─── Monthly breakdown ─── */
  const monthlyData = useMemo(() => {
    return MONTHS.map((name, idx) => {
      const monthPrefix = `${selectedYear}-${String(idx + 1).padStart(2, "0")}`;
      const income = donations
        .filter((d) => d.date?.startsWith(monthPrefix))
        .reduce((s, d) => s + Number(d.amount || 0), 0);
      const expense = expenses
        .filter((e) => e.date?.startsWith(monthPrefix))
        .reduce((s, e) => s + Number(e.amount || 0), 0);
      return { name, income, expense, balance: income - expense };
    });
  }, [donations, expenses, selectedYear]);

  const yearIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const yearExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
  const yearBalance = yearIncome - yearExpense;
  const maxVal = Math.max(...monthlyData.map((m) => Math.max(m.income, m.expense)), 1);

  /* ─── CSV Export ─── */
  const handleExport = () => {
    let csv = "Bulan,Pemasukan,Pengeluaran,Saldo\n";
    monthlyData.forEach((m) => {
      csv += `${m.name},${m.income},${m.expense},${m.balance}\n`;
    });
    csv += `\nTotal,${yearIncome},${yearExpense},${yearBalance}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-keuangan-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─── Print ─── */
  const handlePrint = () => {
    const printContent = document.getElementById("finance-report-print");
    if (!printContent) return;
    const w = window.open("", "_blank");
    w.document.write(`
      <html>
        <head>
          <title>Laporan Keuangan Masjid - ${selectedYear}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #1a1a1a; }
            h1 { font-size: 1.4rem; margin-bottom: 4px; }
            h2 { font-size: 1rem; color: #6B7280; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #E5E7EB; font-size: 0.9rem; }
            th { background: #F9FAFB; font-weight: 700; color: #374151; text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.5px; }
            .income { color: #0D3B2E; font-weight: 700; }
            .expense { color: #B91C1C; font-weight: 700; }
            .balance { font-weight: 800; }
            .total-row { background: #F0F2F5; font-weight: 800; }
            .footer { margin-top: 40px; font-size: 0.8rem; color: #9CA3AF; text-align: center; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="footer">Dicetak dari MasjidKu — ${new Date().toLocaleDateString("id-ID")}</div>
        </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  const CSS = `
    .report-bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 180px; }
    .report-bar-group { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
    .report-bar-pair { display: flex; align-items: flex-end; gap: 2px; height: 140px; }
    .report-bar {
      width: 14px; border-radius: 4px 4px 0 0; min-height: 2px;
      transition: height 0.4s ease;
    }
    .report-bar-label { font-size: 0.68rem; color: #9CA3AF; font-weight: 600; }
    .report-table-card {
      border: none; border-radius: 16px; overflow: hidden;
    }
    .report-table { font-family: 'Plus Jakarta Sans', sans-serif; }
    .report-table th {
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #6B7280; background: #F9FAFB; padding: 12px 16px;
      border: none;
    }
    .report-table td { padding: 12px 16px; font-size: 0.875rem; border-bottom: 1px solid #F0F2F5; }
    .report-table tr:last-child td { border-bottom: none; }
    .report-total-row {
      background: linear-gradient(135deg, #0D3B2E, #1A5C45);
      color: #fff;
    }
    .report-total-row td { border: none; font-weight: 700; }
  `;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{CSS}</style>

      {/* ─── Controls ─── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <FaCalendarAlt size={14} color="#6B7280" />
          <Form.Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              width: 140, borderRadius: 10, border: "1.5px solid #EAECF0",
              fontWeight: 600, fontSize: "0.875rem", padding: "8px 14px",
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Form.Select>
        </div>
        <div className="d-flex gap-2">
          <Button
            onClick={handlePrint}
            style={{
              background: "#F3F4F6", border: "1px solid #E5E7EB", color: "#374151",
              borderRadius: 10, fontWeight: 600, fontSize: "0.83rem", padding: "8px 16px",
            }}
          >
            <FaPrint size={13} className="me-1" /> Cetak
          </Button>
          <Button
            onClick={handleExport}
            style={{
              background: "linear-gradient(135deg, #0D3B2E, #1A5C45)", border: "none",
              borderRadius: 10, fontWeight: 600, fontSize: "0.83rem", padding: "8px 16px",
              color: "#fff",
            }}
          >
            <FaDownload size={13} className="me-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* ─── Year summary ─── */}
      <Row className="g-3 mb-4">
        {[
          { label: `Total Pemasukan ${selectedYear}`, value: yearIncome, color: "#0D3B2E", bg: "#E8F5E9", icon: <FaArrowUp size={16} /> },
          { label: `Total Pengeluaran ${selectedYear}`, value: yearExpense, color: "#B91C1C", bg: "#FEE2E2", icon: <FaArrowDown size={16} /> },
          { label: `Saldo Tahun ${selectedYear}`, value: yearBalance, color: yearBalance >= 0 ? "#0D3B2E" : "#B91C1C", bg: yearBalance >= 0 ? "#E8F5E9" : "#FEE2E2", icon: <FaWallet size={16} /> },
        ].map((c, i) => (
          <Col md={4} key={i}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, color: c.color }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: c.color, letterSpacing: "-0.5px" }}>
                      {fmtRp(c.value)}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Bar chart ─── */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a" }}>Grafik Bulanan</span>
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 10, height: 10, borderRadius: 3, background: "#0D3B2E" }} />
                <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600 }}>Pemasukan</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 10, height: 10, borderRadius: 3, background: "#EF4444" }} />
                <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600 }}>Pengeluaran</span>
              </div>
            </div>
          </div>
          <div className="report-bar-chart">
            {monthlyData.map((m, i) => (
              <div key={i} className="report-bar-group">
                <div className="report-bar-pair">
                  <div
                    className="report-bar"
                    style={{ height: `${(m.income / maxVal) * 130}px`, background: "#0D3B2E" }}
                    title={`Pemasukan: ${fmtRp(m.income)}`}
                  />
                  <div
                    className="report-bar"
                    style={{ height: `${(m.expense / maxVal) * 130}px`, background: "#EF4444" }}
                    title={`Pengeluaran: ${fmtRp(m.expense)}`}
                  />
                </div>
                <span className="report-bar-label">{m.name.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* ─── Table (also used for print) ─── */}
      <div id="finance-report-print">
        <div style={{ display: "none" }}>
          <h1>Laporan Keuangan Masjid — Tahun {selectedYear}</h1>
          <h2>Dicetak oleh MasjidKu</h2>
        </div>
        <Card className="report-table-card shadow-sm mb-4">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table report-table mb-0">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th className="text-end">Pemasukan</th>
                    <th className="text-end">Pengeluaran</th>
                    <th className="text-end">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m, i) => (
                    <tr key={i}>
                      <td className="fw-semibold">{m.name}</td>
                      <td className="text-end" style={{ color: "#0D3B2E", fontWeight: 600 }}>
                        {m.income > 0 ? fmtRp(m.income) : "-"}
                      </td>
                      <td className="text-end" style={{ color: "#B91C1C", fontWeight: 600 }}>
                        {m.expense > 0 ? fmtRp(m.expense) : "-"}
                      </td>
                      <td className="text-end fw-bold" style={{ color: m.balance >= 0 ? "#0D3B2E" : "#B91C1C" }}>
                        {m.income > 0 || m.expense > 0 ? fmtRp(m.balance) : "-"}
                      </td>
                    </tr>
                  ))}
                  <tr className="report-total-row">
                    <td>TOTAL {selectedYear}</td>
                    <td className="text-end">{fmtRp(yearIncome)}</td>
                    <td className="text-end">{fmtRp(yearExpense)}</td>
                    <td className="text-end">{fmtRp(yearBalance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* ─── Transparency note ─── */}
      <Card className="border-0" style={{ borderRadius: 16, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-start gap-3">
            <span style={{ fontSize: "1.2rem" }}>💡</span>
            <div>
              <div className="fw-bold mb-1" style={{ fontSize: "0.9rem", color: "#92400E" }}>
                Halaman Transparansi Keuangan
              </div>
              <div style={{ fontSize: "0.83rem", color: "#92400E", lineHeight: 1.6 }}>
                Laporan ini bisa diekspor ke CSV atau dicetak untuk dibagikan kepada jamaah sebagai bentuk transparansi pengelolaan keuangan masjid.
                Pastikan data pemasukan dan pengeluaran selalu diperbarui agar laporan akurat.
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FinanceReport;
