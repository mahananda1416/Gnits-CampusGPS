import React, { useRef, useState, useEffect } from 'react'
import { Home, LogOut, Camera, AlertCircle, Fan, Lightbulb, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Hls from 'hls.js'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const VideoMonitoring = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const prevImageRef = useRef(null)
  const intervalRef = useRef(null)
  const hlsRef = useRef(null)
  const streamRef = useRef(null)
  const motionHistoryRef = useRef([])
  const brightnessHistoryRef = useRef([])
  const fanFlickerHistoryRef = useRef([])
  const baselineBrightnessRef = useRef(null)

  const [cameraMode, setCameraMode] = useState('local')
  const [running, setRunning] = useState(false)
  const [presence, setPresence] = useState(false)
  const [fanStatus, setFanStatus] = useState(false)
  const [lightStatus, setLightStatus] = useState('unknown')
  const [status, setStatus] = useState('Idle')
  const [lastScore, setLastScore] = useState(0)
  const [cameraInfo, setCameraInfo] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [debugInfo, setDebugInfo] = useState({})

  const BACKEND_URL = 'http://localhost:3001'
  const CAMERA_ID = 'LH8'

  // Improved thresholds based on classroom analysis
  const PERSON_MOTION_THRESHOLD = 12
  const FAN_FLICKER_THRESHOLD = 0.5 // Detect subtle blade flicker
  const LIGHT_BRIGHTNESS_DIFF = 25 // Difference between lights on/off
  const CEILING_REGION_START = 0.0 // Top of frame
  const CEILING_REGION_END = 0.35 // Top 35% of frame (ceiling area)

  useEffect(() => {
    fetchCameraInfo()
    return () => {
      fetch('http://localhost:3001/api/camera/stop', { method: 'POST' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (running) {
      checkForWastage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presence, fanStatus, lightStatus, running])

  const fetchCameraInfo = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/camera/info/${CAMERA_ID}`)
      const data = await response.json()
      setCameraInfo(data)
    } catch (err) {
      console.error('Failed to fetch camera info:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const startEzvizStream = async () => {
    try {
      setStatus('Connecting to EZVIZ camera...')
      
      const response = await fetch(`${BACKEND_URL}/api/camera/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cameraId: CAMERA_ID })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start stream')
      }

      let ready = false;
      while (!ready) {
        await new Promise(r => setTimeout(r, 1000));
        const status = await fetch(`${BACKEND_URL}/api/camera/status`).then(r => r.json());
        ready = status.ready;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 4,        // only 4s back buffer
        maxBufferLength: 6,         // don't buffer ahead more than 6s
        maxMaxBufferLength: 10,
        liveSyncDurationCount: 1,   // sync to latest segment
        liveMaxLatencyDurationCount: 3,
      })
        hlsRef.current = hls
        
        hls.loadSource(data.streamUrl)
        hls.attachMedia(videoRef.current)
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play()
          setRunning(true)
          setStatus('Monitoring LH8')
          intervalRef.current = setInterval(detectFrame, 300)  // Increased from 500ms for better accuracy
        })
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS fatal error:', data)
            setStatus('Stream error - check camera connection')
          }
        })
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = data.streamUrl
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play()
          setRunning(true)
          setStatus('Monitoring LH8')
          intervalRef.current = setInterval(detectFrame, 500)
        })
      } else {
        throw new Error('HLS not supported in this browser')
      }
    } catch (err) {
      console.error('EZVIZ stream error:', err)
      setStatus(`Error: ${err.message}`)
    }
  }

  const startLocalCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setRunning(true)
      setStatus('Monitoring (Local Camera)')
      intervalRef.current = setInterval(detectFrame, 300)  // Increased from 500ms for better accuracy
    } catch (err) {
      console.error('Local camera error:', err)
      setStatus('Camera access denied')
    }
  }

  const start = () => {
    motionHistoryRef.current = []
    brightnessHistoryRef.current = []
    fanFlickerHistoryRef.current = []
    baselineBrightnessRef.current = null
    setAlerts([])
    
    if (cameraMode === 'ezviz') {
      startEzvizStream()
    } else {
      startLocalCamera()
    }
  }

  const stop = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      try { 
        videoRef.current.pause() 
      } catch (e) {}
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }

    if (cameraMode === 'ezviz') {
      try {
        await fetch(`${BACKEND_URL}/api/camera/stop`, { method: 'POST' })
      } catch (err) {
        console.error('Failed to stop backend stream:', err)
      }
    }

    prevImageRef.current = null
    motionHistoryRef.current = []
    brightnessHistoryRef.current = []
    fanFlickerHistoryRef.current = []
    baselineBrightnessRef.current = null
    setRunning(false)
    setStatus('Stopped')
    setPresence(false)
    setFanStatus(false)
    setLightStatus('unknown')
    setLastScore(0)
    setDebugInfo({})
  }

  const detectFrame = () => {
    const v = videoRef.current
    const c = canvasRef.current
    if (!v || !c || v.readyState < 2) return
    if (!v.videoWidth || !v.videoHeight) return
    
    // Skip frame if video is still buffering
    if (v.paused && v !== videoRef.current?.parentElement) return
    
    const w = Math.min(640, v.videoWidth)
    const h = Math.min(480, v.videoHeight)
    if (w === 0 || h === 0) return

    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    ctx.drawImage(v, 0, 0, w, h)
    const image = ctx.getImageData(0, 0, w, h)

    const prev = prevImageRef.current
    if (!prev) {
      prevImageRef.current = image
      return
    }

    // 1. Detect tubelight status (ceiling area only)
    const lightResult = detectTubeLights(image, w, h)
    
    // 2. Detect fan status (ceiling area only)
    const fanResult = detectCeilingFans(image, prev, w, h)
    
    // 3. Detect person (full frame)
    const personResult = detectPerson(image, prev, w, h)
    
    setPresence(personResult.detected)
    setLastScore(personResult.score)
    setFanStatus(fanResult.detected)
    setLightStatus(lightResult.status)
    
    setDebugInfo({
      ceilingBrightness: lightResult.brightness,
      baselineBrightness: baselineBrightnessRef.current,
      fanFlicker: fanResult.flicker,
      fanNormalized: fanResult.normalized,
      fanCrossings: fanResult.crossings,
      fanColumns: fanResult.activeColumns,
      personMotion: personResult.score
    })

    prevImageRef.current = image
  }

  const detectTubeLights = (image, w, h) => {
    const data = image.data
    
    // Focus ONLY on ceiling area (top 35% of frame)
    const ceilingStartY = Math.floor(h * CEILING_REGION_START)
    const ceilingEndY = Math.floor(h * CEILING_REGION_END)
    
    let totalBrightness = 0
    let pixelCount = 0

    // Sample ceiling area only - process more pixels for accuracy
    for (let y = ceilingStartY; y < ceilingEndY; y += 3) {
      for (let x = 0; x < w; x += 3) {
        const i = (y * w + x) * 4
        if (i >= data.length) continue
        
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // Calculate luminance
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b
        totalBrightness += brightness
        pixelCount++
      }
    }

    const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0

    // Add to history
    brightnessHistoryRef.current.push(avgBrightness)
    if (brightnessHistoryRef.current.length > 30) {
      brightnessHistoryRef.current.shift()
    }

    // Establish baseline (first 25 frames)
    if (!baselineBrightnessRef.current && brightnessHistoryRef.current.length >= 25) {
      // Sort and take median to avoid outliers
      const sorted = [...brightnessHistoryRef.current].sort((a, b) => a - b)
      baselineBrightnessRef.current = sorted[Math.floor(sorted.length / 2)]
    }

    // Determine status
    let status = 'unknown'
    
    if (brightnessHistoryRef.current.length >= 10 && baselineBrightnessRef.current) {
      // Get recent average
      const recent = brightnessHistoryRef.current.slice(-10)
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
      
      // Compare to baseline
      const diff = recentAvg - baselineBrightnessRef.current
      
      // If significantly brighter than baseline = lights on
      // If similar to baseline = lights off (only natural light)
      if (diff > LIGHT_BRIGHTNESS_DIFF) {
        status = 'on'
      } else {
        status = 'off'
      }
    }

    return { status, brightness: avgBrightness.toFixed(1) }
  }

  const detectCeilingFans = (image, prev, w, h) => {
    const data = image.data
    const pData = prev.data
    
    // Focus on ceiling area where fans are located
    const ceilingStartY = Math.floor(h * CEILING_REGION_START)
    const ceilingEndY = Math.floor(h * CEILING_REGION_END)
    
    // Fans divided into sample vertical columns across ceiling
    const columnCount = 16
    const colWidth = Math.floor(w/columnCount)
    const columnFlicker = []
    
    for(let col = 0; col < columnCount; col++) {
      const startX = col * colWidth
      const endX = startX + colWidth
      let colDiff = 0
      let pixelCount = 0

      for(let y = ceilingStartY; y < ceilingEndY; y+=2) {
        for(let x = startX; x < endX; x+=2) {
          const i = (y * w + x) * 4
          if (i >= data.length) continue
          const lum = 0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2]
          const pLum = 0.2126*pData[i] + 0.7152*pData[i+1] + 0.0722*pData[i+2]
          colDiff += Math.abs(lum - pLum)
          pixelCount++
        }
      }
      // Store actual flicker difference (not pixelCount) - FIX for critical bug
      const avgColFlicker = pixelCount > 0 ? colDiff / pixelCount : 0
      columnFlicker.push(avgColFlicker)
    }

    // Calculate overall flicker
    const totalFlicker = columnFlicker.reduce((a, b) => a + b, 0) / columnFlicker.length
    
    // Add to history
    fanFlickerHistoryRef.current.push(totalFlicker)
    if (fanFlickerHistoryRef.current.length > 20) {
      fanFlickerHistoryRef.current.shift()
    }
    
    const history = fanFlickerHistoryRef.current 
    if (history.length < 8) return { detected: false, flicker: totalFlicker.toFixed(2), normalized: '0', crossings: 0, activeColumns: 0 }
    
    const sorted = [...history].sort((a, b) => a - b)
    const baseline = sorted[Math.floor(sorted.length * 0.3)]
    const normalizedFlicker = totalFlicker - baseline

    const recent = history.slice(-15)
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length
    const stdDev = Math.sqrt(recent.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / recent.length)

    // Count direction changes (more sensitive: just needs oscillation)
    let directionChanges = 0
    for(let i = 1; i < recent.length; i++) {
      if ((recent[i] - recent[i-1]) * (recent[i-1] - (i >= 2 ? recent[i-2] : recent[i-1])) < 0) {
        directionChanges++
      }
    }

    // Count flicker columns above baseline
    const activeColumns = columnFlicker.filter(v => v > baseline + 0.5).length
    const spatiallySpread = activeColumns >= 2  // Reduced from 4 to 2

    // Fan detected with more relaxed thresholds
    const hasVariation = stdDev > 0.3
    const hasFlicker = normalizedFlicker > 0.5  // Reduced from 1.5
    const hasMotion = directionChanges >= 2  // Reduced from 4
    const detected = hasVariation && hasFlicker && hasMotion && spatiallySpread

    return { detected, flicker: totalFlicker.toFixed(2), normalized: normalizedFlicker.toFixed(2), crossings: directionChanges, activeColumns }
  }

  const detectPerson = (image, prev, w, h) => {
    const data = image.data
    const pData = prev.data
    
    // Focus on lower 70% of frame (student area)
    const studentStartY = Math.floor(h * 0.3)
    
    // Divide into grid
    const gridSize = 8
    const regionWidth = Math.floor(w / gridSize)
    const regionHeight = Math.floor((h - studentStartY) / gridSize)
    
    let activeRegions = 0
    let totalMotion = 0
    
    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        let regionSum = 0
        let pixelCount = 0
        
        for (let y = studentStartY + gy * regionHeight; y < studentStartY + (gy + 1) * regionHeight; y += 3) {
          for (let x = gx * regionWidth; x < (gx + 1) * regionWidth; x += 3) {
            const i = (y * w + x) * 4
            if (i >= data.length) continue
            
            const r = data[i], g = data[i + 1], b = data[i + 2]
            const pr = pData[i], pg = pData[i + 1], pb = pData[i + 2]
            
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
            const pl = 0.2126 * pr + 0.7152 * pg + 0.0722 * pb
            
            regionSum += Math.abs(lum - pl)
            pixelCount++
          }
        }
        
        const regionAvg = pixelCount > 0 ? regionSum / pixelCount : 0
        
        if (regionAvg > PERSON_MOTION_THRESHOLD) {
          activeRegions++
          totalMotion += regionAvg
        }
      }
    }
    
    const avgMotion = activeRegions > 0 ? totalMotion / activeRegions : 0
    const score = clamp(avgMotion, 0, 255)
    
    // Add to history
    motionHistoryRef.current.push({ score, activeRegions })
    if (motionHistoryRef.current.length > 15) {
      motionHistoryRef.current.shift()
    }
    
    // Person detected if consistent motion
    let detected = false
    if (motionHistoryRef.current.length >= 3) {
      const recent = motionHistoryRef.current.slice(-3)
      const avgScore = recent.reduce((sum, d) => sum + d.score, 0) / recent.length
      const avgRegions = recent.reduce((sum, d) => sum + d.activeRegions, 0) / recent.length
      
      const regionRatio = avgRegions / (gridSize * gridSize)
      detected = avgScore > PERSON_MOTION_THRESHOLD && regionRatio > 0.15
    }
    
    return { detected, score: Number(score.toFixed(2)) }
  }

  const checkForWastage = () => {
    if (!presence && (fanStatus || lightStatus === 'on')) {
      const newAlert = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: `⚠️ WASTAGE: Room EMPTY but ${
          fanStatus && lightStatus === 'on' ? 'fans AND lights' :
          fanStatus ? 'fans' :
          'lights'
        } are ON!`,
        type: 'warning'
      }

      setAlerts(prev => {
        const recentAlert = prev[prev.length - 1]
        if (recentAlert && Date.now() - recentAlert.id < 30000) {
          return prev
        }
        return [...prev.slice(-4), newAlert]
      })
    }
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  const snapshot = () => {
    const c = canvasRef.current
    if (!c) return
    const url = c.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `LH8-snapshot-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Smart Classroom Monitoring
              </h1>
              <p className="text-sm text-gray-600">
                Ceiling-focused detection: Tubelights & Fans
              </p>
              <p className="text-sm text-indigo-600 mt-1">
                Logged in as: <span className="font-semibold capitalize">{user?.role}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Camera Mode Selection */}
        {!running && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-yellow-800 mb-2">Camera Source</div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cameraMode"
                      value="ezviz"
                      checked={cameraMode === 'ezviz'}
                      onChange={(e) => setCameraMode(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">EZVIZ Camera (LH8)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cameraMode"
                      value="local"
                      checked={cameraMode === 'local'}
                      onChange={(e) => setCameraMode(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Local Camera (Testing)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Video Feed */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  playsInline 
                  muted 
                />
                {!running && (
                  <div className="absolute text-gray-400 flex items-center gap-2">
                    <Camera className="w-6 h-6" />
                    <span>Camera Off</span>
                  </div>
                )}
                {running && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Ceiling Analysis Active
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              <div className="text-center text-sm text-gray-500">
                {!running && `Click "Start Monitoring" to begin`}
                {running && `Analyzing top 35% (ceiling) for lights/fans`}
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-4">
            {/* Occupancy Status */}
            <div className={`rounded-lg p-4 ${presence ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">Occupancy</div>
              </div>
              <div className={`text-lg font-bold ${presence ? 'text-green-700' : 'text-gray-500'}`}>
                {presence ? 'OCCUPIED' : 'EMPTY'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Motion: {lastScore}</div>
            </div>

            {/* Fan Status */}
            <div className={`rounded-lg p-4 ${fanStatus ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Fan className="w-5 h-5 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">Ceiling Fans</div>
              </div>
              <div className={`text-lg font-bold ${fanStatus ? 'text-blue-700' : 'text-gray-500'}`}>
                {fanStatus ? 'RUNNING' : 'OFF'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Flicker: {debugInfo.fanFlicker || '0'} | Norm: {debugInfo.fanNormalized || '0'} | Crossings: {debugInfo.fanCrossings || '0'} | Cols: {debugInfo.fanColumns || '0'}
              </div>
            </div>

            {/* Light Status */}
            <div className={`rounded-lg p-4 ${lightStatus === 'on' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">Tubelights</div>
              </div>
              <div className={`text-lg font-bold ${lightStatus === 'on' ? 'text-yellow-700' : 'text-gray-500'}`}>
                {lightStatus.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ceiling: {debugInfo.ceilingBrightness || '0'}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-2">
              {!running ? (
                <button 
                  onClick={start} 
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Start Monitoring
                </button>
              ) : (
                <button 
                  onClick={stop} 
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Stop Monitoring
                </button>
              )}
              <button 
                onClick={snapshot} 
                disabled={!running}
                className={`w-full px-4 py-2 rounded-lg transition ${
                  running 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Take Snapshot
              </button>
            </div>
          </div>
        </div>

        {/* Admin Alerts */}
        {user?.role === 'admin' && running && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                Wastage Alerts
              </h3>
              {alerts.length > 0 && (
                <button
                  onClick={clearAlerts}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </button>
              )}
            </div>
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-red-800">{alert.message}</div>
                        <div className="text-xs text-red-600 mt-1">{alert.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No wastage detected</p>
                <p className="text-xs mt-1">System monitors ceiling area for tubelights and fans</p>
              </div>
            )}
          </div>
        )}

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <strong>Improved Detection:</strong><br/>
            • <strong>Tubelights:</strong> Analyzes top 35% of frame (ceiling only), ignores window light<br/>
            • <strong>Fans:</strong> Detects blade flicker patterns in ceiling strips<br/>
            • <strong>People:</strong> Analyzes lower 70% of frame (student area)<br/>
            • <strong>Baseline:</strong> System learns normal brightness in first 20 frames
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoMonitoring