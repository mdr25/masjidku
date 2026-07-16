/**
 * src/data/templates.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth untuk katalog template.
 * Dipakai oleh:
 *   - src/pages/setup/steps/Step2Template.jsx   (pilih template saat setup)
 *   - src/pages/dashboard/ThemePage.jsx         (ganti template dari dashboard)
 *   - src/services/apiClient.js  getTemplates() (mock API response)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TEMPLATE_CATALOG = [
  {
    // ── identifiers ──────────────────────────────────────────────────────────
    id: "TEMPLATE_A",
    template_code: "TEMPLATE_A",
    code: "TEMPLATE_A",

    // ── label ────────────────────────────────────────────────────────────────
    name: "Zamrud Harmoni",
    desc: "Nuansa hijau alami dengan aksen emas. Cocok untuk masjid dengan tampilan modern dan elegan.",
    tags: ["Modern", "Minimalis"],

    // ── status ───────────────────────────────────────────────────────────────
    ready: true, // true = bisa dipilih; false = segera hadir

    // ── visual ───────────────────────────────────────────────────────────────
    preview:
      "https://images.unsplash.com/photo-1560626184-524744344bef?q=80&w=800&auto=format&fit=crop",
    palette: ["#0D3B2E", "#1A5C45", "#C9A84C", "#FFF8E7"],
    gradientFrom: "#0D3B2E",
    gradientTo: "#1A5C45",
  },
  {
    id: "TEMPLATE_B",
    template_code: "TEMPLATE_B",
    code: "TEMPLATE_B",
    name: "Biru Andalusia",
    desc: "Biru safir elegan dengan sentuhan perak. Kesan bersih dan profesional.",
    tags: ["Elegan", "Profesional"],
    ready: true,
    preview:
      "https://images.unsplash.com/photo-1619729239841-d7354ebf9bb3?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    palette: ["#1B3A6B", "#2563EB", "#94A3B8", "#F0F6FF"],
    gradientFrom: "#1565C0",
    gradientTo: "#1976D2",
  },
  {
    id: "template-3",
    template_code: "template-3",
    code: "template-3",
    name: "Pesona Hijaz",
    desc: "Nuansa pasir hangat dengan ornamen kaligrafi. Kental nuansa Islam tradisional.",
    tags: ["Tradisional", "Klasik"],
    ready: false,
    preview:
      "https://images.unsplash.com/photo-1711202675843-ccdb194d2b7d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    palette: ["#7C5832", "#C8975A", "#E8C99A", "#FDF8F0"],
    gradientFrom: "#4A148C",
    gradientTo: "#6A1B9A",
  },
  {
    id: "template-4",
    template_code: "template-4",
    code: "template-4",
    name: "Pirus Madani",
    desc: "Segar dan terang. Teal dan putih dengan layout modern yang lapang.",
    tags: ["Cerah", "Modern"],
    ready: false,
    preview:
      "https://images.unsplash.com/photo-1605795733251-a0b6c96d9dea?q=80&w=1059&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    palette: ["#0F766E", "#14B8A6", "#99F6E4", "#F0FDFA"],
    gradientFrom: "#BF360C",
    gradientTo: "#D84315",
  },
  {
    id: "template-5",
    template_code: "template-5",
    code: "template-5",
    name: "Onyx Elegan",
    desc: "Dark mode elegan. Ideal untuk tampilan yang berkesan premium dan kontemporer.",
    tags: ["Dark", "Premium"],
    ready: false,
    preview:
      "https://images.unsplash.com/photo-1531213203257-16afb0eac95e?q=80&w=1145&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    palette: ["#0F0F0F", "#1F1F2E", "#7C3AED", "#F5F5F5"],
    gradientFrom: "#1B5E20",
    gradientTo: "#388E3C",
  },
];

export default TEMPLATE_CATALOG;
