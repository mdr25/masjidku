import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { FaCheck, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import TEMPLATE_CATALOG from "../../../data/templates";

const Step2Template = ({ data, updateData, onNext, onBack }) => {
  // Set default ke TEMPLATE_A jika belum ada pilihan
  React.useEffect(() => {
    if (!data.templateId) updateData("templateId", "TEMPLATE_A");
  }, []);

  const css = `
    .s2-card {
      border: 2px solid #EAECF0; border-radius: 14px; overflow: hidden;
      cursor: pointer; transition: all 0.2s ease; background: #fff;
      position: relative;
    }
    .s2-card:hover { border-color: #1A5C45; box-shadow: 0 6px 20px rgba(26,92,69,0.1); transform: translateY(-2px); }
    .s2-card.selected { border-color: #1A5C45; box-shadow: 0 0 0 3px rgba(26,92,69,0.12); }
    .s2-card.unavailable { opacity: 0.6; cursor: not-allowed; }
    .s2-card.unavailable:hover { transform: none; border-color: #EAECF0; box-shadow: none; }
    .s2-thumb { width: 100%; height: 140px; object-fit: cover; display: block; }
    .s2-thumb-wrap { overflow: hidden; position: relative; }
    .s2-selected-badge {
      position: absolute; top: 10px; right: 10px;
      background: #1A5C45; color: #fff; border-radius: 20px;
      padding: 3px 10px; font-size: 0.6875rem; font-weight: 700;
      display: flex; align-items: center; gap: 4px;
      box-shadow: 0 2px 6px rgba(13,59,46,0.3);
    }
    .s2-coming-badge {
      position: absolute; top: 10px; right: 10px;
      background: rgba(0,0,0,0.5); color: #fff; border-radius: 20px;
      padding: 3px 10px; font-size: 0.6875rem; font-weight: 700;
      backdrop-filter: blur(4px);
    }
    .s2-body { padding: 12px 14px 14px; }
    .s2-name { font-size: 0.9375rem; font-weight: 800; color: #1a1a1a; margin-bottom: 3px; }
    .s2-desc { font-size: 0.75rem; color: #6B7280; line-height: 1.45; margin-bottom: 8px; }
    .s2-palette { display: flex; gap: 5px; margin-bottom: 8px; }
    .s2-dot { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid rgba(0,0,0,0.07); flex-shrink: 0; }
    .s2-tag { display: inline-block; font-size: 0.625rem; font-weight: 700; border-radius: 5px; padding: 2px 7px; margin-right: 4px; background: rgba(26,92,69,0.08); color: #1A5C45; }
  `;

  return (
    <div>
      <style>{css}</style>
      <div className="step-header">
        <h4>Pilih Template Desain</h4>
        <p>Pilih tampilan visual untuk website masjid Anda. Template bisa diganti kapan saja dari dashboard.</p>
      </div>

      <Row className="g-3 mb-4">
        {TEMPLATE_CATALOG.map((tpl) => {
          const selected    = data.templateId === tpl.id;
          const unavailable = !tpl.ready;
          return (
            <Col md={4} key={tpl.id}>
              <div
                className={`s2-card${selected ? " selected" : ""}${unavailable ? " unavailable" : ""}`}
                onClick={() => tpl.ready && updateData("templateId", tpl.id)}
              >
                {/* Thumbnail */}
                <div className="s2-thumb-wrap">
                  {tpl.preview
                    ? <img src={tpl.preview} alt={tpl.name} className="s2-thumb" />
                    : <div className="s2-thumb" style={{ background: `linear-gradient(135deg, ${tpl.gradientFrom}, ${tpl.gradientTo})` }} />
                  }
                  {selected && (
                    <div className="s2-selected-badge"><FaCheck size={9} /> Dipilih</div>
                  )}
                  {unavailable && (
                    <div className="s2-coming-badge">Segera Hadir</div>
                  )}
                </div>

                {/* Info */}
                <div className="s2-body">
                  <div className="s2-name">{tpl.name}</div>
                  <div className="s2-desc">{tpl.desc}</div>
                  <div className="s2-palette">
                    {tpl.palette.map((c, i) => (
                      <div key={i} className="s2-dot" style={{ background: c }} title={c} />
                    ))}
                  </div>
                  <div>
                    {tpl.tags.map((tag, i) => (
                      <span key={i} className="s2-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {/* Pilihan aktif */}
      {data.templateId && (
        <div className="d-flex align-items-center gap-2 mb-2 p-3 rounded-3"
          style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", fontSize: "0.8125rem", color: "#166534", fontWeight: 600 }}>
          <FaCheck size={13} />
          Template dipilih: <strong>{TEMPLATE_CATALOG.find(t => t.id === data.templateId)?.name || data.templateId}</strong>
        </div>
      )}

      <div className="step-footer">
        <button className="sw-btn-secondary d-flex align-items-center gap-2" onClick={onBack}>
          <FaArrowLeft size={12} /> Kembali
        </button>
        <button className="sw-btn-primary d-flex align-items-center gap-2"
          onClick={onNext} disabled={!data.templateId}>
          Lanjutkan <FaArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default Step2Template;
