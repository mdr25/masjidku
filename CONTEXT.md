# 🕌 CONTEXT & DESIGN SYSTEM: MASJID WEBSITE GENERATOR (BOOTSTRAP 5)

> **PANDUAN PEMBAGIAN TUGAS AI AGENT (PENTING)**
>
> Fokus 100% pada Arsitektur State terpusat, Logic Wizard (Step 1-5), Mock API System dengan simulasi delay, dan Dynamic Component Mapping via URL Domain. JANGAN MEMBUAT file template terpisah (seperti `Template1.jsx`). Gunakan _styling_ Bootstrap 5 standar dan minimal.
> Fokus pada UI/UX Refinement, Estetika Islami Modern pada tiap-tiap komponen blok/widget, tata letak (Layout Grid), animasi mikro, dan detail visual premium. JANGAN mengubah struktur _state_, skema array JSON, atau fungsi router/API yang sudah dibuat Gemini.

---

## 1. STRUKTUR LOGIC, STATE, & MOCK API (Fokus Gemini)

Gemini harus memastikan seluruh _state management_ di React terpusat menggunakan React Context, mengalir via Wizard Setup (Step 1-5), dan merender visual secara dinamis berdasarkan domain yang sedang diakses pengguna.

### A. Skema Data Mock API (Daftar Widget Fitur Masjid)

Sistem tidak mengenal konsep file template jadi. Website dibentuk dari susunan blok data teks yang akan diterjemahkan oleh aplikasi menjadi komponen visual.

```javascript
// Data repositori widget yang tersedia di platform SaaS
export const MOCK_WIDGETS = [
  {
    id: "w-hero",
    type: "HeroBanner",
    name: "Banner Utama Masjid",
    premium: false,
  },
  {
    id: "w-sholat",
    type: "JadwalSholat",
    name: "Jadwal Sholat Digital",
    premium: false,
  },
  {
    id: "w-kas",
    type: "LaporanKas",
    name: "Laporan Kas Keuangan",
    premium: true,
  },
  { id: "w-qris", type: "DonasiQris", name: "Infaq QRIS Scan", premium: true },
];
```

### B. Arsitektur State Terpusat (React Context)

Dibuat di dalam file `src/context/MasjidGeneratorContext.jsx` untuk mengontrol alur data pendaftaran (Wizard) hingga Dashboard Pengeditan.

```javascript
const [masjidConfig, setMasjidConfig] = useState({
  subdomain: "", // Step 1: e.g., "al-ikhlas" -> ://masjidku.com
  namaMasjid: "", // Step 3: Informasi Umum
  alamat: "", // Step 3: Informasi Umum
  kontakWatsap: "", // Step 3: Informasi Umum
  warnaTema: "#064e3b", // Pilihan warna identitas (.text-emerald / custom)
  blocks: [
    // Array yang menyimpan daftar widget aktif & urutannya
    {
      id: "b1",
      type: "HeroBanner",
      props: { slogan: "Selamat Datang di Rumah Allah" },
    },
  ],
  isPremium: false, // Status paket langganan DKM
  isPublished: false, // Berubah true setelah konfirmasi sukses
});

const [currentStep, setCurrentStep] = useState(1);
const [isLoading, setIsLoading] = useState(false);
```

### C. Alur Form Setup Wizard (Step 1 - 5)

Gemini wajib menjaga agar pemindahan halaman (Next/Back) tidak menghapus data sementara di dalam state `masjidConfig`.

1. **Step 1 (Cek Subdomain):** Form input teks. Tombol "Cek" menyimulasikan API req 800ms. Jika lolos, lanjut.
2. **Step 2 (Pilih Preset Desain Awal):** Menampilkan kartu opsi "Tema Klasik" atau "Tema Modern Modern". Saat diklik, tombol ini **hanya bertugas mengisi nilai default** ke dalam state `warnaTema` dan susunan awal array `blocks`.
3. **Step 3 (Informasi Umum):** Form input teks Bootstrap biasa (Nama Masjid, Alamat, No WhatsApp DKM).
4. **Step 4 (Syarat & Ketentuan):** Dokumen persetujuan integritas pengurus takmir dan checkbox persetujuan wajib.
5. **Step 5 (Konfirmasi Akhir):** Menampilkan ringkasan ringkas teks data yang diisi. Tombol "Terbitkan Website" memicu fungsi `async/await` dengan `setTimeout` 800ms (Simulasi POST API). Setelah berhasil, status bergeser ke Dashboard Admin.

## 2. ATURAN VISUAL & ESTETIKA ISLAMI MODERN (BOOTSTRAP 5)

Wajib menghias kerangka logika mentah dari Gemini menggunakan utility kelas Bootstrap 5 dan CSS kustom agar menghasilkan antarmuka premium tanpa merusak jalannya sirkulasi state.

### A. Palet Warna (Custom CSS Integration untuk Template Website)

Website Masjid menyediakan 5 pilihan template yang memiliki karakter visual berbeda melalui kombinasi warna dan tipografi yang unik pada setiap template. Setiap template dirancang untuk memberikan suasana dan identitas yang berbeda tanpa harus mempertahankan warna yang sama antar template. Font yang digunakan harus berasal dari Google Fonts agar mudah diimplementasikan dan konsisten di berbagai perangkat.

# Template 1 — Emerald Serenity

Template ini menggunakan kombinasi Emerald Green (#064e3b), Royal Gold (#d97706), dan Warm Ivory (#fdfbf7). Karakter visualnya tenang, elegan, dan religius dengan nuansa Islami modern. Font yang digunakan adalah Poppins untuk heading dan Inter untuk body text.

# Template 2 — Sapphire Harmony

Template ini menggunakan kombinasi Deep Sapphire (#1e3a8a), Sky Blue (#60a5fa), dan Soft White (#f8fafc). Nuansanya bersih, modern, dan profesional dengan kesan sejuk serta terpercaya. Font yang digunakan adalah Manrope untuk heading dan Inter untuk body text.

# Template 3 — Desert Heritage

Template ini menggunakan kombinasi Terracotta (#9a3412), Sand Gold (#eab308), dan Cream (#fffbeb). Tampilan terasa hangat, klasik, dan berkarakter dengan sentuhan Timur Tengah yang elegan. Font yang digunakan adalah Cormorant Garamond untuk heading dan Source Sans 3 untuk body text.

# Template 4 — Ocean Breeze

Template ini menggunakan kombinasi Teal (#0f766e), Turquoise (#2dd4bf), dan Light Aqua (#f0fdfa). Karakter visualnya segar, ringan, dan modern dengan nuansa yang nyaman untuk dibaca dalam waktu lama. Font yang digunakan adalah Nunito Sans untuk heading dan body text.

# Template 5 — Midnight Modern

Template ini menggunakan kombinasi Slate Navy (#1e293b), Amber (#f59e0b), dan Off White (#fafaf9). Desain terasa premium, minimalis, dan kontemporer dengan kontras yang kuat namun tetap elegan. Font yang digunakan adalah Outfit untuk heading dan Plus Jakarta Sans untuk body text.

Setiap template harus mempertahankan prinsip desain yang bersih, mudah dibaca, responsif untuk perangkat mobile maupun desktop, serta memberikan pengalaman pengguna yang nyaman bagi pengunjung website masjid. Fokus utama berada pada keterbacaan konten, kemudahan navigasi, dan tampilan visual yang modern tanpa kehilangan identitas Islami yang profesional.

### B. Karakter UI/UX Menggunakan Bootstrap 5

- **Layouting Bersih:** Maksimalkan pemanfaatan grid `row`, `col`, spacing `p-4` / `g-4`, dan lengkungan halus modern menggunakan `.rounded-4` atau `.rounded-5` pada setiap komponen card.
- **Dua Sisi Dashboard Editor:** Sisi kiri berupa panel kontrol form (lebar `col-md-4`) dan sisi kanan berupa wadah sandbox pratinjau live website (lebar `col-md-8`) yang membungkus komponen `<MasjidRenderer>`. Perubahan input di kiri wajib mengalir instan secara visual di sisi kanan secara _real-time_.
- **Sentuhan Ornamen:** Untuk widget visual, gunakan paduan ikon _line-art_ berbasis SVG tipis yang rapi. Berikan sentuhan CSS efek transisi halus `.card-fitur { transition: all 0.3s ease; }` ketika Admin menyalakan atau mematikan saklar (_switch form_) fitur di dashboard.
