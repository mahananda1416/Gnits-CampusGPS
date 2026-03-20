// server.js - Node.js backend for EZVIZ camera streaming
// Install: npm install express fluent-ffmpeg cors

const express = require('express');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Serve HLS stream files
app.use('/stream', express.static(path.join(__dirname, 'stream')));

// EZVIZ camera configuration
const CAMERA_CONFIG = {
  'LH8': {
    name: 'Lecture Hall 8 - CSE Block',
    rtspUrl: 'rtsp://admin:CSE%232024@192.168.99.206/Streaming/Channels/101',
    // Alternative EZVIZ RTSP format:
    // rtspUrl: 'rtsp://admin:VERIFICATION_CODE@CAMERA_IP:554/H264/ch01/main/av_stream'
  }
};

let streamProcess = null;

// Start streaming endpoint
app.post('/api/camera/start', (req, res) => {
  const { cameraId } = req.body;
  
  if (!CAMERA_CONFIG[cameraId]) {
    return res.status(404).json({ error: 'Camera not found' });
  }

  // Stop existing stream if any
  if (streamProcess) {
    streamProcess.kill();
  }

  const camera = CAMERA_CONFIG[cameraId];
  const outputDir = path.join(__dirname, 'stream');
  
  // Create stream directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clear old stream files
  const files = fs.readdirSync(outputDir);
  files.forEach(file => {
    fs.unlinkSync(path.join(outputDir, file));
  });

  // Start FFmpeg process to convert RTSP to HLS
  streamProcess = ffmpeg(camera.rtspUrl)
    .addOptions([
      '-rtsp_transport tcp',           // Use TCP for RTSP (more reliable)
      '-f hls',                         // Output format HLS
      '-hls_time 2',                    // 2 second segments
      '-hls_list_size 3',               // Keep last 3 segments
      '-hls_flags delete_segments',     // Delete old segments
      '-preset ultrafast',              // Fast encoding
      '-tune zerolatency',              // Low latency
      '-c:v libx264',                   // Video codec
      '-c:a aac',                       // Audio codec
      '-b:v 1000k',                     // Video bitrate
      '-s 1280x720',                    // Resolution
    ])
    .output(path.join(outputDir, 'stream.m3u8'))
    .on('start', (commandLine) => {
      console.log('FFmpeg started:', commandLine);
    })
    .on('error', (err) => {
      console.error('FFmpeg error:', err.message);
    })
    .on('end', () => {
      console.log('FFmpeg ended');
    })
    .run();

  res.json({ 
    success: true, 
    message: 'Stream started',
    streamUrl: `http://localhost:3001/stream/stream.m3u8`,
    camera: camera.name
  });
});

// Stop streaming endpoint
app.post('/api/camera/stop', (req, res) => {
  if (streamProcess) {
    streamProcess.kill();
    streamProcess = null;
  }
  res.json({ success: true, message: 'Stream stopped' });
});

// Get camera info
app.get('/api/camera/info/:cameraId', (req, res) => {
  const camera = CAMERA_CONFIG[req.params.cameraId];
  if (!camera) {
    return res.status(404).json({ error: 'Camera not found' });
  }
  res.json({ name: camera.name, id: req.params.cameraId });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Camera streaming server running on port ${PORT}`);
});

// Cleanup on exit
process.on('SIGINT', () => {
  if (streamProcess) {
    streamProcess.kill();
  }
  process.exit();
});

app.get('/api/camera/status', (req, res)=> {
  const streamFile = path.join(__dirname, 'stream', 'stream.m3u8');
  res.json({
    streaming: streamProcess!==null,
    ready: fs.existsSync(streamFile)
  });
});