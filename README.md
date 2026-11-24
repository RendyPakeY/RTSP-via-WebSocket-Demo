# RTSP via WebSocket Demo 🎥⚡

Aplikasi web modern, ringan, dan hemat bandwidth untuk menampilkan live video stream dari kamera CCTV / IP Cam / DVR (berprotokol **RTSP**) langsung ke web browser menggunakan **WebSocket + JSMpeg (MPEG1)**.

---

## ✨ Fitur Utama

- **Ultra Low Latency (< 0.5 detik)**: Menggunakan streaming binary WebSocket dan JSMpeg canvas rendering di sisi browser, jauh lebih cepat dibanding HLS yang memiliki delay 5-15 detik.
- **On-Demand Streaming (Hemat Bandwidth & CPU)**: 
  - Stream RTSP dan proses transcode FFmpeg **hanya berjalan saat ada penonton** yang membuka web.
  - Saat semua penonton menutup browser/tab, proses FFmpeg otomatis di-kill setelah waktu timeout tertentu (`STREAM_TIMEOUT_SEC`).
- **Auto Reconnect**: 
  - Jika koneksi RTSP kamera sempat drop, server otomatis melakukan reconnect.
  - Jika koneksi Wi-Fi/jaringan client drop, browser otomatis mencoba reconnect kembali tanpa perlu refresh halaman.
- **Koneksi RTSP via TCP**: Mencegah packet loss, frame pecah/corrupt (glitch pixelated) yang sering terjadi pada koneksi UDP.
- **Unified Single Port**: Web server (HTTP) dan Video stream (WebSocket) berjalan di satu port yang sama (default `3000`), sehingga mudah di-expose, port-forwarding, atau di-tunneling (Ngrok / Cloudflare Tunnel / VPS).
- **Zero External Dependency**: Menggunakan `@ffmpeg-installer/ffmpeg` bawaan npm, sehingga tidak perlu menginstall FFmpeg secara manual di sistem operasi.

---

## 📁 Struktur Direktori

```text
├── public/
│   └── index.html      # Frontend HTML5 + JSMpeg Canvas Player
├── .env.example        # Template konfigurasi environment
├── .gitignore          # Mengabaikan file sensitif (.env, node_modules)
├── package.json        # Dependensi proyek
├── README.md           # Dokumentasi lengkap
└── server.js           # Server backend Node.js (Express + WebSocket + FFmpeg)
```

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau yang lebih baru.
- Kamera IP / DVR yang mendukung protokol RTSP dan berada dalam jaringan yang dapat diakses oleh komputer server.

### 2. Instalasi
Clone repository ini dan masuk ke direktori proyek:
```bash
git clone https://github.com/RendyPakeY/RTSP-via-WebSocket-Demo.git
cd RTSP-via-WebSocket-Demo
```

Install dependensi:
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
*(Di Windows PowerShell: `Copy-Item .env.example .env`)*

Buka file `.env` dan sesuaikan parameter berikut:
```env
# URL RTSP Kamera / DVR Anda
RTSP_URL=rtsp://username:password@192.168.1.15:554/cam/realmonitor?channel=1&subtype=0

# Port Web Server & WebSocket Stream
PORT=3000

# Waktu tunggu (detik) mematikan RTSP saat semua client keluar
STREAM_TIMEOUT_SEC=10
```

### 4. Menjalankan Aplikasi
Jalankan server dengan perintah:
```bash
npm start
```

Buka browser Anda dan akses:
👉 **`http://localhost:3000`**

---

## 🌐 Akses dari Jaringan Lain (Wi-Fi / LAN)

Karena server mendengarkan di `0.0.0.0`, perangkat lain di jaringan Wi-Fi/LAN yang sama dapat langsung mengakses streaming melalui IP lokal komputer host:

1. Cek IPv4 komputer server Anda (`ipconfig` di Windows atau `ifconfig` di Linux/Mac).
2. Akses dari browser HP / laptop lain di jaringan yang sama:
   ```text
   http://<IP_KOMPUTER_SERVER>:3000
   ```
3. Pastikan port `3000` diizinkan pada Firewall sistem operasi Anda.

---

## 🛠️ Stack Teknologi

- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [ws (WebSocket)](https://github.com/websockets/ws)
- **Converter / Transcoding**: [FFmpeg](https://ffmpeg.org/) via `@ffmpeg-installer/ffmpeg`
- **Frontend Player**: [JSMpeg](https://github.com/phoboslab/jsmpeg) (JavaScript MPEG1 Video Decoder ke HTML5 Canvas)

---

## 📄 Lisensi
Proyek ini dibuat untuk tujuan demonstrasi dan eksperimen streaming CCTV/DVR berlatensi rendah ke web. Silakan gunakan dan kembangkan sesuai kebutuhan.
