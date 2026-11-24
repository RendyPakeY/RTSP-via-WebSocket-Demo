# RTSP via WebSocket Demo 🎥⚡

A modern, lightweight, and bandwidth-efficient web application designed to stream live video feeds from CCTV / IP Cameras / DVRs (**RTSP protocol**) directly to web browsers using **WebSocket + JSMpeg (MPEG1)**.

---

## ✨ Key Features

- **Ultra Low Latency (< 0.5s)**: Delivers video frames via binary WebSockets rendered directly on an HTML5 `<canvas>` using JSMpeg, vastly outperforming traditional HLS streams (which suffer from 5–15 seconds of delay).
- **On-Demand Streaming (Bandwidth & CPU Saver)**: 
  - The RTSP connection and FFmpeg transcoding process **only run when active viewers are connected**.
  - When all viewers close their browser/tab, FFmpeg is automatically terminated after a configurable idle timeout (`STREAM_TIMEOUT_SEC`).
- **Auto Reconnect & Resilience**: 
  - If the camera/DVR connection drops, the backend automatically attempts to reconnect.
  - If the client's Wi-Fi/network disconnects, the browser player automatically reconnects without requiring a manual page refresh.
- **RTSP over TCP**: Eliminates packet loss, artifacts, and pixelation/gray screens frequently caused by UDP transmission over busy networks.
- **Unified Single Port**: Web server (HTTP) and Video stream (WebSocket) operate on the same port (default `3000`), simplifying reverse proxies, port forwarding, and tunneling (e.g., Cloudflare Tunnel, Ngrok, or VPS).
- **Zero External Dependencies**: Powered by `@ffmpeg-installer/ffmpeg`, eliminating the need to manually install FFmpeg on the host operating system.

---

## 📁 Project Structure

```text
├── public/
│   └── index.html      # Frontend HTML5 + JSMpeg Canvas Player
├── .env.example        # Environment variable template
├── .gitignore          # Ignored sensitive files (.env, node_modules)
├── package.json        # Project metadata and dependencies
├── README.md           # Complete documentation
└── server.js           # Node.js backend (Express + WebSocket + FFmpeg)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended).
- An IP Camera / DVR with RTSP enabled and accessible from the server machine.

### 2. Installation
Clone the repository and navigate into the project directory:
```bash
git clone https://github.com/RendyPakeY/RTSP-via-WebSocket-Demo.git
cd RTSP-via-WebSocket-Demo
```

Install the dependencies:
```bash
npm install
```

### 3. Environment Configuration (`.env`)
Create a `.env` file based on the provided template:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Open `.env` and configure your settings:
```env
# RTSP URL of your Camera / DVR
RTSP_URL=rtsp://username:password@192.168.1.15:554/cam/realmonitor?channel=1&subtype=0

# Unified Port for Web & WebSocket Stream
PORT=3000

# Idle timeout (in seconds) before stopping FFmpeg when no viewers are connected
STREAM_TIMEOUT_SEC=10
```

### 4. Running the Server
Start the server:
```bash
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 🌐 Local Network & Remote Access (Wi-Fi / LAN)

Because the server binds to `0.0.0.0`, any device connected to the same local network (Wi-Fi/LAN) can access the live feed using the server's local IP address:

1. Find the server's local IPv4 address (`ipconfig` on Windows or `ifconfig` / `ip a` on Linux/macOS).
2. Open a browser on another device (phone, laptop, tablet) and access:
   ```text
   http://<SERVER_IP>:3000
   ```
3. Make sure inbound traffic on port `3000` is allowed in your operating system's firewall settings.

---

## 🛠️ Tech Stack

- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [ws (WebSocket)](https://github.com/websockets/ws)
- **Converter / Transcoder**: [FFmpeg](https://ffmpeg.org/) via `@ffmpeg-installer/ffmpeg`
- **Frontend Player**: [JSMpeg](https://github.com/phoboslab/jsmpeg) (JavaScript MPEG1 Video Decoder to HTML5 Canvas)

---

## 📄 License
This project is open-source and intended for demonstration and development purposes. Feel free to use and modify it according to your needs.
