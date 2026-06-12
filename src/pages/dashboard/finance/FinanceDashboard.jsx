import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Nav } from "react-bootstrap";
import {
  FaWallet, FaArrowUp, FaArrowDown, FaChartPie,
  FaCalendarAlt, FaExchangeAlt, FaFileAlt,
} from "react-icons/fa";
import DonationList from "./DonationList";
import ExpenseList from "./ExpenseList";
import FinanceReport from "./FinanceReport";

/* ─── Helpers ─── */
const fmtRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

const getMonth = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
};

/* ─── FinanceDashboard ─── */
const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const loadAll = () => {
    setDonations(JSON.parse(localStorage.getItem("mid_donations") || "[]"));
    setExpenses(JSON.parse(localStorage.getItem("mid_expenses") || "[]"));
  };

  useEffect(() => { loadAll(); }, []);

  // Listen for storage updates from child components
  useEffect(() => {
    const handler = () => loadAll();
    window.addEventListener("finance-update", handler);
    return () => window.removeEventListener("finance-update", handler);
  }, []);

  /* ─── Computed stats ─── */
  const totalIncome = useMemo(() => donations.reduce((s, d) => s + Number(d.amount || 0), 0), [donations]);
  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);
  const balance = totalIncome - totalExpense;

  // Current month only
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthIncome = useMemo(
    () => donations.filter((d) => d.date?.startsWith(thisMonth)).reduce((s, d) => s + Number(d.amount || 0), 0),
    [donations, thisMonth]
  );
  const monthExpense = useMemo(
    () => expenses.filter((e) => e.date?.startsWith(thisMonth)).reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses, thisMonth]
  );

  // Income by category
  const incomeByType = useMemo(() => {
    const map = {};
    donations.forEach((d) => {
      const t = d.type || "Lainnya";
      map[t] = (map[t] || 0) + Number(d.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [donations]);

  // Expense by category
  const expenseByType = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const t = e.category || "Lainnya";
      map[t] = (map[t] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // Recent transactions
  const recentTx = useMemo(() => {
    const all = [
      ...donations.map((d) => ({ ...d, _type: "income" })),
      ...expenses.map((e) => ({ ...e, _type: "expense" })),
    ];
    return all.sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8);
  }, [donations, expenses]);

  const TABS = [
    { key: "overview", icon: <FaChartPie size={14} />, label: "Ringkasan" },
    { key: "income", icon: <FaArrowUp size={14} />, label: "Pemasukan" },
    { key: "expense", icon: <FaArrowDown size={14} />, label: "Pengeluaran" },
    { key: "report", icon: <FaFileAlt size={14} />, label: "Laporan" },
  ];

  const CSS = `
    .fin-tab { font-family: 'Plus Jakarta Sans', sans-serif; }
    .fin-tab .nav-link {
      color: #6B7280; font-weight: 600; font-size: 0.875rem;
      border: none; border-bottom: 2.5px solid transparent;
      padding: 10px 18px; border-radius: 0;
      transition: all 0.2s; display: flex; align-items: center; gap: 6px;
    }
    .fin-tab .nav-link:hover { color: #0D3B2E; background: rgba(13,59,46,0.04); }
    .fin-tab .nav-link.active {
      color: #0D3B2E; border-bottom-color: #0D3B2E; background: transparent;
    }
    .fin-summary-card {
      border-radius: 16px; border: 1px solid #F0F2F5;
      padding: 24px; background: #fff;
      transition: all 0.25s;
    }
    .fin-summary-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); transform: translateY(-2px); }
    .fin-icon-box {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .fin-bar {
      height: 8px; border-radius: 99px; background: #F0F2F5;
      overflow: hidden; position: relative;
    }
    .fin-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
    .fin-tx-row {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 0; border-bottom: 1px solid #F0F2F5;
      transition: background 0.15s;
    }
    .fin-tx-row:last-child { border-bottom: none; }
    .fin-tx-row:hover { background: #FAFBFC; }
    .fin-tx-dot {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 0.8rem;
    }
  `;

  const COLORS_INCOME = ["#0D3B2E", "#1A5C45", "#2E7D5C", "#3DA87A", "#5CC99B"];
  const COLORS_EXPENSE = ["#B91C1C", "#DC2626", "#EF4444", "#F87171", "#FCA5A5"];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{CSS}</style>

      {/* ─── Page Header ─── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 4, letterSpacing: "-0.3px" }}>
            Keuangan Masjid
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", margin: 0 }}>
            Catat pemasukan, pengeluaran, dan lihat laporan keuangan masjid.
          </p>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <Nav variant="tabs" className="fin-tab border-bottom mb-4">
        {TABS.map((t) => (
          <Nav.Item key={t.key}>
            <Nav.Link
              active={activeTab === t.key}
              onClick={() => setActiveTab(t.key)}
              style={{ cursor: "pointer" }}
            >
              {t.icon} {t.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* ─── TAB: Overview ─── */}
      {activeTab === "overview" && (
        <>
          {/* Summary cards */}
          <Row className="g-3 mb-4">
            {[
              { label: "Total Pemasukan", value: totalIncome, color: "#0D3B2E", bg: "#E8F5E9", icon: <FaArrowUp size={18} /> },
              { label: "Total Pengeluaran", value: totalExpense, color: "#B91C1C", bg: "#FEE2E2", icon: <FaArrowDown size={18} /> },
              { label: "Saldo", value: balance, color: balance >= 0 ? "#0D3B2E" : "#B91C1C", bg: balance >= 0 ? "#E8F5E9" : "#FEE2E2", icon: <FaWallet size={18} /> },
              { label: "Bulan Ini", value: monthIncome - monthExpense, color: "#C9A84C", bg: "#FFFBEB", icon: <FaCalendarAlt size={18} />, sub: `+${fmtRp(monthIncome)} / -${fmtRp(monthExpense)}` },
            ].map((c, i) => (
              <Col lg={3} md={6} key={i}>
                <div className="fin-summary-card">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="fin-icon-box" style={{ background: c.bg, color: c.color }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: 600 }}>{c.label}</div>
                      <div style={{ fontSize: "1.35rem", fontWeight: 800, color: c.color, letterSpacing: "-0.5px" }}>
                        {fmtRp(c.value)}
                      </div>
                    </div>
                  </div>
                  {c.sub && <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>{c.sub}</div>}
                </div>
              </Col>
            ))}
          </Row>

          <Row className="g-3">
            {/* Income breakdown */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <FaArrowUp size={13} color="#0D3B2E" />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a" }}>Pemasukan per Jenis</span>
                  </div>
                  {incomeByType.length === 0 ? (
                    <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Belum ada data pemasukan.</p>
                  ) : (
                    incomeByType.map(([type, amt], i) => (
                      <div key={type} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{type}</span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0D3B2E" }}>{fmtRp(amt)}</span>
                        </div>
                        <div className="fin-bar">
                          <div
                            className="fin-bar-fill"
                            style={{
                              width: `${totalIncome > 0 ? (amt / totalIncome) * 100 : 0}%`,
                              background: COLORS_INCOME[i % COLORS_INCOME.length],
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Expense breakdown */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <FaArrowDown size={13} color="#B91C1C" />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a" }}>Pengeluaran per Kategori</span>
                  </div>
                  {expenseByType.length === 0 ? (
                    <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Belum ada data pengeluaran.</p>
                  ) : (
                    expenseByType.map(([type, amt], i) => (
                      <div key={type} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{type}</span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#B91C1C" }}>{fmtRp(amt)}</span>
                        </div>
                        <div className="fin-bar">
                          <div
                            className="fin-bar-fill"
                            style={{
                              width: `${totalExpense > 0 ? (amt / totalExpense) * 100 : 0}%`,
                              background: COLORS_EXPENSE[i % COLORS_EXPENSE.length],
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Recent transactions */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <FaExchangeAlt size={13} color="#C9A84C" />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a" }}>Transaksi Terakhir</span>
                  </div>
                  {recentTx.length === 0 ? (
                    <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Belum ada transaksi.</p>
                  ) : (
                    recentTx.map((tx, i) => (
                      <div className="fin-tx-row" key={i}>
                        <div
                          className="fin-tx-dot"
                          style={{
                            background: tx._type === "income" ? "#E8F5E9" : "#FEE2E2",
                            color: tx._type === "income" ? "#0D3B2E" : "#B91C1C",
                          }}
                        >
                          {tx._type === "income" ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="text-truncate fw-semibold" style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>
                            {tx._type === "income" ? (tx.donor || "Hamba Allah") : (tx.description || "Pengeluaran")}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                            {tx.date} · {tx._type === "income" ? (tx.type || "Infaq") : (tx.category || "-")}
                          </div>
                        </div>
                        <div style={{
                          fontWeight: 700, fontSize: "0.85rem",
                          color: tx._type === "income" ? "#0D3B2E" : "#B91C1C",
                        }}>
                          {tx._type === "income" ? "+" : "-"}{fmtRp(tx.amount)}
                        </div>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* ─── TAB: Income ─── */}
      {activeTab === "income" && <DonationList onUpdate={loadAll} />}

      {/* ─── TAB: Expense ─── */}
      {activeTab === "expense" && <ExpenseList onUpdate={loadAll} />}

      {/* ─── TAB: Report ─── */}
      {activeTab === "report" && <FinanceReport donations={donations} expenses={expenses} />}
    </div>
  );
};

export default FinanceDashboard;
