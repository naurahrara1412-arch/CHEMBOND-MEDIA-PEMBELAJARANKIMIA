# CHEMBOND — Media Pembelajaran Kimia
**Ikatan Kovalen & Ikatan Kovalen Koordinasi (NH₃, NH₄⁺, H₃O⁺)**
Disusun oleh: Afifah Naurah Royyani — NIM 06101182530009

## Isi folder
```
chembond/
├── index.html      ← halaman utama (9 slide)
├── css/style.css   ← tampilan (tema biru galaksi + putih)
├── js/app.js       ← logika: kunci slide, pemeriksa jawaban, simulasi, kuis, audio
└── README.md
```

## Cara membuka di VS Code
1. Ekstrak zip, lalu di VS Code pilih **File → Open Folder…** dan pilih folder `chembond`.
2. Pasang ekstensi **Live Server** (Ritwick Dey), klik kanan `index.html` → **Open with Live Server**.
   (Bisa juga langsung klik dua kali `index.html` untuk dibuka di browser.)

## Cara upload ke Netlify
Buka https://app.netlify.com/drop lalu seret folder `chembond` ke halaman tersebut.

## Catatan
- **Audio penjelasan** memakai suara bawaan browser (Web Speech API, bahasa Indonesia). Paling baik di Google Chrome / Edge.
  Jika perangkat tidak punya suara bahasa Indonesia, browser memakai suara default. Teks penjelasan tetap tampil di layar.
- **Slide terkunci**: slide berikutnya hanya terbuka setelah tugas di slide sebelumnya selesai.
  Jika halaman dimuat ulang (refresh), progres kembali dari awal.
- **Pemeriksaan jawaban esai** memakai kata kunci konsep (misalnya "pupuk", "pasangan elektron bebas", "donor").
  Guru dapat menyesuaikan kata kunci di `js/app.js` (cari `groups:`).
- Uji pemahaman: soal yang salah tidak perlu diulang; setelah 10 soal dijawab, nilai langsung muncul dan slide Ringkasan terbuka.
- Font diambil dari Google Fonts; jika offline, otomatis memakai font bawaan sistem.
