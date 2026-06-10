/**
 * BrandLogo.jsx
 * Komponen logo MasjidKu yang konsisten di semua halaman.
 *
 * Props:
 *  - size      : "sm" | "md" | "lg"  (default "md")
 *  - dark      : bool — true = teks putih (untuk bg gelap), false = teks hijau (untuk bg terang)
 *  - subtitle  : string — teks di bawah nama brand (opsional, default sesuai konteks)
 *  - className : string — class tambahan pada wrapper
 *
 * Spec konsisten:
 *  - Icon     : FaMosque, warna emas #C9A84C
 *  - Bg icon  : rgba(201,168,76,0.18), border 1px rgba(201,168,76,0.35)
 *  - Font     : Plus Jakarta Sans
 *  - "MasjidKu" fw-bold
 *  - Subtitle : uppercase, letter-spacing 1.5px
 */

import React from "react";
import { FaMosque } from "react-icons/fa";

const SIZE_MAP = {
  sm: { box: 32, icon: 16, name: "0.92rem", sub: "0.6rem", gap: 8 },
  md: { box: 38, icon: 20, name: "1rem",    sub: "0.65rem", gap: 10 },
  lg: { box: 48, icon: 26, name: "1.2rem",  sub: "0.7rem",  gap: 12 },
};

const BrandLogo = ({
  size     = "md",
  dark     = true,
  subtitle = "Platform Digital Masjid",
  className = "",
}) => {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const nameColor    = dark ? "#ffffff" : "#0D3B2E";
  const subColor     = dark ? "rgba(201,168,76,0.8)" : "#1A5C45";

  return (
    <div
      className={`d-flex align-items-center ${className}`}
      style={{ gap: s.gap, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Icon box */}
      <div
        style={{
          width:        s.box,
          height:       s.box,
          borderRadius: Math.round(s.box * 0.24),
          background:   "rgba(201,168,76,0.18)",
          border:       "1px solid rgba(201,168,76,0.35)",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          flexShrink:   0,
        }}
      >
        <FaMosque size={s.icon} style={{ color: "#C9A84C" }} />
      </div>

      {/* Text */}
      <div style={{ lineHeight: 1.15 }}>
        <div
          style={{
            fontWeight:    700,
            fontSize:      s.name,
            color:         nameColor,
            letterSpacing: "-0.2px",
          }}
        >
          MasjidKu
        </div>
        {subtitle && (
          <div
            style={{
              fontSize:      s.sub,
              color:         subColor,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight:    500,
              marginTop:     2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
