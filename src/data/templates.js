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
    id: "template-1",
    template_code: "template-1",
    code: "template-1",

    // ── label ────────────────────────────────────────────────────────────────
    name: "Earthy Modern",
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
    id: "template-2",
    template_code: "template-2",
    code: "template-2",
    name: "Sapphire Harmony",
    desc: "Biru safir elegan dengan sentuhan perak. Kesan bersih dan profesional.",
    tags: ["Elegan", "Profesional"],
    ready: true,
    preview:
      "https://images.unsplash.com/photo-1547619292-240b0e975f85?q=80&w=800&auto=format&fit=crop",
    palette: ["#1B3A6B", "#2563EB", "#94A3B8", "#F0F6FF"],
    gradientFrom: "#1565C0",
    gradientTo: "#1976D2",
  },
  {
    id: "template-3",
    template_code: "template-3",
    code: "template-3",
    name: "Desert Heritage",
    desc: "Nuansa pasir hangat dengan ornamen kaligrafi. Kental nuansa Islam tradisional.",
    tags: ["Tradisional", "Klasik"],
    ready: false,
    preview:
      "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=800&auto=format&fit=crop",
    palette: ["#7C5832", "#C8975A", "#E8C99A", "#FDF8F0"],
    gradientFrom: "#4A148C",
    gradientTo: "#6A1B9A",
  },
  {
    id: "template-4",
    template_code: "template-4",
    code: "template-4",
    name: "Ocean Breeze",
    desc: "Segar dan terang. Teal dan putih dengan layout modern yang lapang.",
    tags: ["Cerah", "Modern"],
    ready: false,
    preview:
      "https://images.unsplash.com/photo-1519817650390-64a93dbad11c?q=80&w=800&auto=format&fit=crop",
    palette: ["#0F766E", "#14B8A6", "#99F6E4", "#F0FDFA"],
    gradientFrom: "#BF360C",
    gradientTo: "#D84315",
  },
  {
    id: "template-5",
    template_code: "template-5",
    code: "template-5",
    name: "Midnight Modern",
    desc: "Dark mode elegan. Ideal untuk tampilan yang berkesan premium dan kontemporer.",
    tags: ["Dark", "Premium"],
    ready: false,
    preview:
      "https://images.unsplash.com/photo-1683828936769-92c51298885c?q=80&w=800&auto=format&fit=crop",
    palette: ["#0F0F0F", "#1F1F2E", "#7C3AED", "#F5F5F5"],
    gradientFrom: "#1B5E20",
    gradientTo: "#388E3C",
  },
];

export default TEMPLATE_CATALOG;
