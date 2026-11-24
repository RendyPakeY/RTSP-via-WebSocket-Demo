require('dotenv').config();
const http = require('http');
const express = require('express');
const ws = require('ws');
const { spawn } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const RTSP_URL = process.env.RTSP_URL || 'rtsp://admin:admin123@192.168.1.15:554/cam/realmonitor?channel=1&subtype=0';
// Waktu tunggu (detik) sebelum mematikan stream RTSP jika tidak ada penonton sama sekali
const IDLE_TIMEOUT_SEC = parseInt(process.env.STREAM_TIMEOUT_SEC || '10', 10);

console.log('----------------------------------------------------');
console.log('FFmpeg binary :', ffmpeg.path);
console.log('RTSP URL      :', RTSP_URL);
console.log('Unified Port  :', PORT, '(Web & WebSocket Stream)');
console.log('Idle Timeout  :', IDLE_TIMEOUT_SEC, 'detik (Auto Stop & Reconnect)');
console.log('----------------------------------------------------');

// Serve file frontend static
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint API config dinamis
app.get('/api/config', (req, res) => {
  res.json({
    wsPort: PORT,
    wsPath: '/stream',
    rtspUrl: RTSP_URL
  });
});

const server = http.createServer(app);

// WebSocket server menempel pada server HTTP port 3000 di path /stream
const wss = new ws.Server({ server, path: '/stream' });

const STREAM_MAGIC_BYTES = "jsmp";
let videoWidth = 352;
let videoHeight = 288;
let ffmpegProcess = null;
let stopTimer = null;

// Fungsi untuk memulai stream RTSP via FFmpeg
function startStream() {
  // Jika proses FFmpeg sudah ada dan aktif, batalkan timer stop jika ada
  if (ffmpegProcess && !ffmpegProcess.killed) {
    if (stopTimer) {
      console.log('Client baru masuk, membatalkan timer shutdown.');
      clearTimeout(stopTimer);
      stopTimer = null;
    }
    return;
  }

  console.log('▶ Memulai koneksi RTSP & FFmpeg...');

  const ffmpegArgs = [
    '-rtsp_transport', 'tcp',
    '-i', RTSP_URL,
    '-f', 'mpegts',
    '-codec:v', 'mpeg1video',
    '-stats',
    '-r', '25',
    '-q:v', '3',
    '-b:v', '500k',
    '-'
  ];

  try {
    ffmpegProcess = spawn(ffmpeg.path, ffmpegArgs, { detached: false });

    ffmpegProcess.stdout.on('data', (chunk) => {
      wss.broadcast(chunk);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      const text = data.toString();
      const sizeMatch = text.match(/(\d+)x(\d+)/);
      if (sizeMatch) {
        videoWidth = parseInt(sizeMatch[1], 10);
        videoHeight = parseInt(sizeMatch[2], 10);
      }
    });

    ffmpegProcess.on('error', (err) => {
      console.error('Error pada proses FFmpeg:', err.message);
    });

    ffmpegProcess.on('close', (code, signal) => {
      console.log(`FFmpeg ditutup (code: ${code}, signal: ${signal}).`);
      ffmpegProcess = null;

      // Jika masih ada penonton aktif tapi koneksi RTSP putus dari DVR, reconnect otomatis
      if (wss.clients.size > 0 && !stopTimer) {
        console.log('Penonton masih aktif di browser, reconnecting ke RTSP dalam 2 detik...');
        setTimeout(() => {
          if (wss.clients.size > 0 && !ffmpegProcess) {
            startStream();
          }
        }, 2000);
      }
    });

    console.log('✔ FFmpeg berjalan lancar.');
  } catch (err) {
    console.error('Gagal menjalankan FFmpeg:', err.message);
    ffmpegProcess = null;
  }
}

// Fungsi untuk menghentikan stream FFmpeg dengan bersih
function stopStream() {
  if (ffmpegProcess) {
    console.log('⏹ Tidak ada penonton. Mematikan FFmpeg untuk hemat bandwidth...');
    try {
      ffmpegProcess.kill('SIGKILL');
    } catch (e) {
      console.error('Error killing FFmpeg:', e.message);
    }
    ffmpegProcess = null;
  }
  stopTimer = null;
}

wss.on('connection', (socket, request) => {
  // Kirim Header Magic Bytes ke client baru agar JSMpeg bisa mengenali stream
  const streamHeader = Buffer.alloc(8);
  streamHeader.write(STREAM_MAGIC_BYTES);
  streamHeader.writeUInt16BE(videoWidth, 4);
  streamHeader.writeUInt16BE(videoHeight, 6);
  socket.send(streamHeader, { binary: true });

  console.log(`rtsp-stream: Client terhubung! Total penonton aktif: ${wss.clients.size}`);

  // Ada client baru masuk: batalkan timer mati & nyalakan FFmpeg jika sedang mati
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
  startStream();

  socket.on('close', () => {
    console.log(`rtsp-stream: Client keluar. Sisa penonton: ${wss.clients.size}`);

    // Jika sudah tidak ada client sama sekali, aktifkan timer countdown
    if (wss.clients.size === 0) {
      console.log(`Semua client keluar. Menunggu ${IDLE_TIMEOUT_SEC} detik sebelum mematikan RTSP...`);
      if (stopTimer) clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        if (wss.clients.size === 0) {
          stopStream();
        }
      }, IDLE_TIMEOUT_SEC * 1000);
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
});

// Broadcast video chunk ke semua client browser
wss.broadcast = function (data) {
  for (let client of wss.clients) {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  }
};

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Web & Stream aktif di: http://0.0.0.0:${PORT}`);
  console.log('Status: Standby (Auto Start on Connect & Auto Reconnect Aktif).');
  console.log('----------------------------------------------------');
});
