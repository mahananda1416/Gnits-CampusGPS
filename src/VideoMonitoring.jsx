import React, { useRef, useState, useEffect } from 'react'
import { Home, LogOut, Camera, AlertCircle, Fan, Lightbulb, Bell, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Hls from 'hls.js'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const CAMERA_TO_ROOM_KEY = {
  LH8: 'LH-8'
}

const ROOM_SCHEDULES = {
  'LH-8': {
    schedule: {
      MON: [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'ML' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'FSD(B1)/CN(B2) Lab' },
        { time: '11:10-12:10', class: 'III Year CSE-D', subject: 'FSD' },
        { time: '1:00-2:00', class: 'III Year CSE-D', subject: 'AI' },
        { time: '2:00-3:00', class: 'III Year CSE-D', subject: 'Department Activities' }
      ],
      TUE: [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'CC' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'AI' },
        { time: '11:10-12:10', class: 'III Year CSE-D', subject: 'CN' },
        { time: '2:00-3:00', class: 'III Year CSE-D', subject: 'FSD' }
      ],
      WED: [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'CN' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'ML Lab' },
        { time: '11:10-12:10', class: 'III Year CSE-D', subject: 'ML' },
        { time: '1:00-2:00', class: 'III Year CSE-D', subject: 'FSD(T)' },
        { time: '2:00-3:00', class: 'III Year CSE-D', subject: 'Pre Placement Training' }
      ],
      THU: [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'AI' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'ML' },
        { time: '11:10-12:10', class: 'III Year CSE-D', subject: 'CC' }
      ],
      FRI: [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'FSD' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'CN(B1)/FSD(B2) Lab' },
        { time: '1:00-2:00', class: 'III Year CSE-D', subject: 'CN' },
        { time: '2:00-3:00', class: 'III Year CSE-D', subject: 'CC' }
      ],
      SAT: [
        { time: '3:00-4:00', class: 'III Year CSE-D', subject: 'Library' }
      ]
    }
  }
}

const getCurrentDayName = () => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  return days[new Date().getDay()]
}

const getCurrentTimeSlot = () => {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()

  if (minutes >= 540 && minutes < 600) return '9:00-10:00'
  if (minutes >= 600 && minutes < 670) return '10:00-11:00'
  if (minutes >= 670 && minutes < 730) return '11:10-12:10'
  if (minutes >= 780 && minutes < 840) return '1:00-2:00'
  if (minutes >= 840 && minutes < 900) return '2:00-3:00'
  if (minutes >= 900 && minutes < 960) return '3:00-4:00'
  return null
}

const isRoomScheduledOccupied = (cameraId) => {
  const roomKey = CAMERA_TO_ROOM_KEY[cameraId]
  if (!roomKey) return false

  const day = getCurrentDayName()
  const slot = getCurrentTimeSlot()
  if (!slot) return false

  const schedule = ROOM_SCHEDULES[roomKey]?.schedule[day]
  if (!schedule) return false
  return schedule.some(item => item.time === slot)
}

const VideoMonitoring = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const prevImageRef = useRef(null)
  const intervalRef = useRef(null)       // stores rAF id
  const hlsRef = useRef(null)
  const streamRef = useRef(null)
  const motionHistoryRef = useRef([])
  const brightnessHistoryRef = useRef([])
  const fanFlickerHistoryRef = useRef([])
  const baselineBrightnessRef = useRef(null)
  const runningRef = useRef(false)       // mirror of running for rAF loop
  const lastDetectRef = useRef(0)        // throttle timestamp
  const backgroundImageRef = useRef(null) // for background subtraction

  const [cameraMode, setCameraMode] = useState('local')
  const [running, setRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  const PERSON_MOTION_THRESHOLD = 5
  const LIGHT_BRIGHTNESS_DIFF = 25  // lowered for better detection
  const CEILING_REGION_START = 0.0
  const CEILING_REGION_END = 0.35

  // ── lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCameraInfo()
    return () => {
      runningRef.current = false
      cancelAnimationFrame(intervalRef.current)
      fetch('http://localhost:3001/api/camera/stop', { method: 'POST' }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (running) checkForWastage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presence, fanStatus, lightStatus, running])

  // ── helpers ───────────────────────────────────────────────────────────────
  const fetchCameraInfo = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/camera/info/${CAMERA_ID}`)
      setCameraInfo(await res.json())
    } catch (err) {
      console.error('Failed to fetch camera info:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ── FIX 5: rAF loop replaces setInterval so HLS decode & detection
  //    don't fight each other on the main thread ─────────────────────────────
  const startDetectLoop = () => {
    lastDetectRef.current = 0
    const loop = (timestamp) => {
      if (!runningRef.current) return
      if (timestamp - lastDetectRef.current >= 600) {
        lastDetectRef.current = timestamp
        detectFrame()
      }
      intervalRef.current = requestAnimationFrame(loop)
    }
    intervalRef.current = requestAnimationFrame(loop)
  }

  const stopDetectLoop = () => {
    cancelAnimationFrame(intervalRef.current)
    intervalRef.current = null
  }

  // ── stream control ────────────────────────────────────────────────────────
  const startEzvizStream = async () => {
    try {
      setIsLoading(true)
      setStatus('Connecting to EZVIZ camera...')
      const response = await fetch(`${BACKEND_URL}/api/camera/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cameraId: CAMERA_ID })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to start stream')

      // Poll until HLS segments are written to disk
      let ready = false
      while (!ready) {
        await new Promise(r => setTimeout(r, 1000))
        const s = await fetch(`${BACKEND_URL}/api/camera/status`).then(r => r.json())
        ready = s.ready
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 4,
          maxBufferLength: 6,
          maxMaxBufferLength: 10,
          liveSyncDurationCount: 1,
          liveMaxLatencyDurationCount: 3,
        })
        hlsRef.current = hls
        hls.loadSource(data.streamUrl)
        hls.attachMedia(videoRef.current)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play()
          runningRef.current = true
          setRunning(true)
          setIsLoading(false)
          setStatus('Monitoring LH8')
          startDetectLoop()
        })

        hls.on(Hls.Events.ERROR, (event, errData) => {
          if (errData.fatal) {
            console.error('HLS fatal error:', errData)
            setStatus('Stream error – check camera connection')
          }
        })
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = data.streamUrl
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play()
          runningRef.current = true
          setRunning(true)
          setIsLoading(false)
          setStatus('Monitoring LH8')
          startDetectLoop()
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
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.addEventListener('playing', () => {
          setIsLoading(false)
        }, { once: true })
        await videoRef.current.play()
      }
      runningRef.current = true
      setRunning(true)
      setStatus('Monitoring (Local Camera)')
      startDetectLoop()
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
    cameraMode === 'ezviz' ? startEzvizStream() : startLocalCamera()
  }

  const stop = async () => {
    runningRef.current = false
    stopDetectLoop()

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      try { videoRef.current.pause() } catch (_) {}
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }
    if (cameraMode === 'ezviz') {
      try { await fetch(`${BACKEND_URL}/api/camera/stop`, { method: 'POST' }) }
      catch (err) { console.error('Failed to stop backend stream:', err) }
    }

    prevImageRef.current = null
    motionHistoryRef.current = []
    brightnessHistoryRef.current = []
    fanFlickerHistoryRef.current = []
    baselineBrightnessRef.current = null
    backgroundImageRef.current = null
    setRunning(false)
    setStatus('Stopped')
    setPresence(false)
    setFanStatus(false)
    setLightStatus('unknown')
    setLastScore(0)
    setDebugInfo({})
    setIsLoading(false)
  }

  // ── frame detection ───────────────────────────────────────────────────────
  const detectFrame = () => {
    const v = videoRef.current
    const c = canvasRef.current
    if (!v || !c || v.readyState < 2) return
    // FIX 2a: HLS frames often report 0 dimensions briefly — skip them
    if (!v.videoWidth || !v.videoHeight) return

    const w = Math.min(640, v.videoWidth)
    const h = Math.min(480, v.videoHeight)
    if (w === 0 || h === 0) return

    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    ctx.drawImage(v, 0, 0, w, h)
    const image = ctx.getImageData(0, 0, w, h)

    const prev = prevImageRef.current
    if (!prev) { prevImageRef.current = image; return }

    const lightResult  = detectTubeLights(image, w, h)
    const fanResult    = detectCeilingFans(image, prev, w, h)
    const personResult = detectPerson(image, prev, w, h)

    setPresence(personResult.detected)
    setLastScore(personResult.score)
    setFanStatus(fanResult.detected)
    setLightStatus(lightResult.status)
    setDebugInfo({
      ceilingBrightness:  lightResult.brightness,
      baselineBrightness: baselineBrightnessRef.current?.toFixed(1) ?? '—',
      fanFlicker:         fanResult.flicker,
      fanNormalized:      fanResult.normalized,
      fanCrossings:       fanResult.crossings,
      fanColumns:         fanResult.activeColumns,
      personMotion:       personResult.score,
    })

    prevImageRef.current = image
  }

  // ── tubelight detection ───────────────────────────────────────────────────
  const detectTubeLights = (image, w, h) => {
    const data = image.data
    const ceilingStartY = Math.floor(h * CEILING_REGION_START)
    const ceilingEndY   = Math.floor(h * CEILING_REGION_END)

    let totalBrightness = 0, pixelCount = 0

    for (let y = ceilingStartY; y < ceilingEndY; y += 3) {
      for (let x = 0; x < w; x += 3) {
        const i = (y * w + x) * 4
        if (i >= data.length) continue
        totalBrightness += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
        pixelCount++
      }
    }

    const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0

    brightnessHistoryRef.current.push(avgBrightness)
    if (brightnessHistoryRef.current.length > 30) brightnessHistoryRef.current.shift()

    // FIX 4: refresh baseline continuously (lower-30th-percentile of history)
    // instead of setting it once at frame 25 and never touching it again.
    // Slow exponential drift prevents sudden light-on events from poisoning it.
    if (brightnessHistoryRef.current.length >= 25) {
      const sorted = [...brightnessHistoryRef.current].sort((a, b) => a - b)
      const newBaseline = sorted[Math.floor(sorted.length * 0.3)]
      if (!baselineBrightnessRef.current) {
        baselineBrightnessRef.current = newBaseline
      } else {
        baselineBrightnessRef.current =
          baselineBrightnessRef.current * 0.95 + newBaseline * 0.05
      }
    }

    let status = 'unknown'
    if (brightnessHistoryRef.current.length >= 10) {
  const recent    = brightnessHistoryRef.current.slice(-10)
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length

  // Method 1 — ABSOLUTE: ceiling brightness > 130 = lights are on
  // (ambient/natural light alone rarely exceeds 100 in a classroom)
  const absolutelyBright = recentAvg > 130

  // Method 2 — RELATIVE: brighter than the learned baseline
  const relativelyBrighter = baselineBrightnessRef.current
    ? (recentAvg - baselineBrightnessRef.current) > LIGHT_BRIGHTNESS_DIFF
    : false

  // Either method is enough — absolute catches lights-on-at-start,
  // relative catches lights being turned ON after monitoring begins
  status = (absolutelyBright || relativelyBrighter) ? 'on' : 'off'
}

    return { status, brightness: avgBrightness.toFixed(1) }
  }

  // ── ceiling fan detection ─────────────────────────────────────────────────
  const detectCeilingFans = (image, prev, w, h) => {
    // FIX 2b: prev frame may have different dimensions — bail to avoid wrong pixel reads
    if (prev.width !== w || prev.height !== h) {
      return { detected: false, flicker: '0', normalized: '0', crossings: 0, activeColumns: 0 }
    }

    const data  = image.data
    const pData = prev.data
    const ceilingStartY = Math.floor(h * CEILING_REGION_START)
    const ceilingEndY   = Math.floor(h * CEILING_REGION_END)

    // 16 vertical columns — fans are circular, columns catch blade sweeps
    const columnCount   = 16
    const colWidth      = Math.floor(w / columnCount)
    const columnFlicker = []

    for (let col = 0; col < columnCount; col++) {
      const startX = col * colWidth
      const endX   = startX + colWidth
      let colDiff = 0, pixelCount = 0

      for (let y = ceilingStartY; y < ceilingEndY; y += 2) {
        for (let x = startX; x < endX; x += 2) {
          const i = (y * w + x) * 4
          if (i >= data.length) continue
          const lum  = 0.2126 * data[i]  + 0.7152 * data[i + 1]  + 0.0722 * data[i + 2]
          const pLum = 0.2126 * pData[i] + 0.7152 * pData[i + 1] + 0.0722 * pData[i + 2]
          colDiff += Math.abs(lum - pLum)
          pixelCount++
        }
      }
      columnFlicker.push(pixelCount > 0 ? colDiff / pixelCount : 0)
    }

    const totalFlicker = columnFlicker.reduce((a, b) => a + b, 0) / columnFlicker.length

    fanFlickerHistoryRef.current.push(totalFlicker)
    if (fanFlickerHistoryRef.current.length > 30) fanFlickerHistoryRef.current.shift()
    
      const history = fanFlickerHistoryRef.current
if (history.length < 10) {
  return { detected: false, flicker: totalFlicker.toFixed(2), normalized: '0', crossings: 0, activeColumns: 0 }
}

const recent = history.slice(-20)
const mean   = recent.reduce((a, b) => a + b, 0) / recent.length
const stdDev = Math.sqrt(
  recent.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / recent.length
)

// Coefficient of variation — detects oscillation regardless of absolute magnitude
// A still ceiling: CoV ≈ 0. A spinning fan: CoV > 3-5% even on white ceiling
const coefficientOfVariation = mean > 0.1 ? stdDev / mean : 0

// Zero crossings around the mean — periodic fans cross many times
let zeroCrossings = 0
for (let i = 1; i < recent.length; i++) {
  if ((recent[i - 1] - mean) * (recent[i] - mean) < 0) zeroCrossings++
}

// Column activity: use % of mean instead of fixed +0.5
// This works for both high and low contrast fans
const colMean = columnFlicker.reduce((a, b) => a + b, 0) / columnFlicker.length
const activeColumns = columnFlicker.filter(v => v > colMean * 1.3).length
const spatiallySpread = activeColumns >= 2

// Three independent signals — need all 3 to agree
const hasOscillation     = coefficientOfVariation > 0.03  // 3% periodic variation
const hasCrossings       = zeroCrossings >= 3             // signal oscillates around mean
const hasSomeFlicker     = mean > 0.2                     // some actual movement exists

const detected = hasOscillation && hasCrossings && hasSomeFlicker && spatiallySpread

return {
  detected,
  flicker:      totalFlicker.toFixed(2),
  normalized:   coefficientOfVariation.toFixed(3),  // now shows CoV instead
  crossings:    zeroCrossings,
  activeColumns,
}
  }

  // ── person detection ──────────────────────────────────────────────────────
const detectPerson = (image, prev, w, h) => {
  if (prev.width !== w || prev.height !== h) {
    return { detected: false, score: 0 }
  }

  const data  = image.data
  const pData = prev.data

  // ── Step 1: Update background model ONLY if no person currently detected ──
  // This prevents a still person from being absorbed into the background
  const currentlyDetected = motionHistoryRef.current.length > 0 &&
    motionHistoryRef.current[motionHistoryRef.current.length - 1]?.detected === true

  if (!backgroundImageRef.current) {
    backgroundImageRef.current = new ImageData(new Uint8ClampedArray(data), w, h)
  } else if (!currentlyDetected) {
    // Only learn background when room is confirmed empty
    const bgData = backgroundImageRef.current.data
    const alpha  = 0.005  // slower: ~200 frames to fully update
    for (let i = 0; i < data.length; i += 4) {
      bgData[i]     = bgData[i]     * (1 - alpha) + data[i]     * alpha
      bgData[i + 1] = bgData[i + 1] * (1 - alpha) + data[i + 1] * alpha
      bgData[i + 2] = bgData[i + 2] * (1 - alpha) + data[i + 2] * alpha
      bgData[i + 3] = 255
    }
  }

  const bgData = backgroundImageRef.current.data
  const studentStartY = Math.floor(h * 0.3)
  const gridSize      = 8
  const regionWidth   = Math.floor(w / gridSize)
  const regionHeight  = Math.floor((h - studentStartY) / gridSize)

  let activeRegions = 0, totalScore = 0

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let regionFG = 0, regionMotion = 0, pixelCount = 0

      for (let y = studentStartY + gy * regionHeight; y < studentStartY + (gy + 1) * regionHeight; y += 3) {
        for (let x = gx * regionWidth; x < (gx + 1) * regionWidth; x += 3) {
          const i = (y * w + x) * 4
          if (i >= data.length) continue

          const lum   = 0.2126 * data[i]   + 0.7152 * data[i+1]   + 0.0722 * data[i+2]
          const bgLum = 0.2126 * bgData[i]  + 0.7152 * bgData[i+1]  + 0.0722 * bgData[i+2]
          const pLum  = 0.2126 * pData[i]   + 0.7152 * pData[i+1]   + 0.0722 * pData[i+2]

          // FG = difference from background (catches stationary people)
          regionFG     += Math.abs(lum - bgLum)
          // Motion = difference from previous frame (catches moving people)
          regionMotion += Math.abs(lum - pLum)
          pixelCount++
        }
      }

      if (pixelCount === 0) continue

      const avgFG     = regionFG     / pixelCount  // ← NOW actually background subtraction
      const avgMotion = regionMotion / pixelCount

      // FG is primary (catches still people), motion is secondary (catches new arrivals)
      // A still person: avgFG high, avgMotion ~0
      // A moving person: both high
      // Empty room: both ~0
      const combinedScore = (avgFG * 0.7) + (avgMotion * 0.3)

      const FG_THRESHOLD = 8  // lower than motion threshold — bg subtraction is cleaner
      if (combinedScore > FG_THRESHOLD) {
        activeRegions++
        totalScore += combinedScore
      }
    }
  }

  const avgScore = activeRegions > 0 ? totalScore / activeRegions : 0
  const score    = clamp(avgScore, 0, 255)

  // Store detected flag alongside score so background freeze logic works
  let detected = false
  if (motionHistoryRef.current.length >= 3) {
    const recent     = motionHistoryRef.current.slice(-3)
    const rAvgScore  = recent.reduce((sum, d) => sum + d.score,         0) / recent.length
    const rAvgRegions = recent.reduce((sum, d) => sum + d.activeRegions, 0) / recent.length
    const regionRatio = rAvgRegions / (gridSize * gridSize)
    detected = rAvgScore > 8 && regionRatio > 0.05
  }

  motionHistoryRef.current.push({ score, activeRegions, detected })
  if (motionHistoryRef.current.length > 15) motionHistoryRef.current.shift()

  return { detected, score: Number(score.toFixed(2)) }
}

  // ── alert logic ───────────────────────────────────────────────────────────
  const checkForWastage = () => {
    const scheduledOccupied = isRoomScheduledOccupied(CAMERA_ID)

    if (!presence && (fanStatus || lightStatus === 'on')) {
      const newAlert = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: `⚠️ WASTAGE: Room EMPTY but ${
          fanStatus && lightStatus === 'on' ? 'fans AND lights' :
          fanStatus ? 'fans' : 'lights'
        } are ON!`,
        type: 'warning',
      }
      setAlerts(prev => {
        const last = prev[prev.length - 1]
        if (last && Date.now() - last.id < 30000) return prev
        return [...prev.slice(-4), newAlert]
      })
    }

    if (presence && !scheduledOccupied) {
      const newAlert = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: '⚠️ CONFLICT: Camera sees OCCUPIED but schedule says room should be EMPTY.',
        type: 'warning',
      }
      setAlerts(prev => {
        const last = prev[prev.length - 1]
        if (last && last.message === newAlert.message) return prev
        return [...prev.slice(-4), newAlert]
      })
    }

    if (!presence && scheduledOccupied) {
      const newAlert = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: '⚠️ CONFLICT: Camera sees EMPTY but schedule says room should be OCCUPIED.',
        type: 'warning',
      }
      setAlerts(prev => {
        const last = prev[prev.length - 1]
        if (last && last.message === newAlert.message) return prev
        return [...prev.slice(-4), newAlert]
      })
    }
  }

  const clearAlerts = () => setAlerts([])

  const snapshot = () => {
    const c = canvasRef.current
    if (!c) return
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `LH8-snapshot-${Date.now()}.png`
    a.click()
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Classroom Monitoring</h1>
              <p className="text-sm text-gray-600">Ceiling-focused detection: Tubelights &amp; Fans</p>
              <p className="text-sm text-indigo-600 mt-1">
                Logged in as: <span className="font-semibold capitalize">{user?.role}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Home className="w-4 h-4" /> Home
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" /> Logout
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
                      type="radio" name="cameraMode" value="ezviz"
                      checked={cameraMode === 'ezviz'}
                      onChange={e => setCameraMode(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">EZVIZ Camera (LH8)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="cameraMode" value="local"
                      checked={cameraMode === 'local'}
                      onChange={e => setCameraMode(e.target.value)}
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
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                {!running && !isLoading && (
                  <div className="absolute text-gray-400 flex items-center gap-2">
                    <Camera className="w-6 h-6" /><span>Camera Off</span>
                  </div>
                )}
                {isLoading && (
                  <div className="absolute text-white flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" /><span>Loading live footage...</span>
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
                {!running
                  ? 'Click "Start Monitoring" to begin'
                  : 'Analysing top 35% (ceiling) for lights/fans'}
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-4">

            {/* Occupancy */}
            <div className={`rounded-lg p-4 ${presence ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">Occupancy</div>
              </div>
              <div className={`text-lg font-bold ${presence ? 'text-green-700' : 'text-gray-500'}`}>
                {presence ? 'OCCUPIED' : 'EMPTY'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Motion score: {lastScore}</div>
            </div>

            {/* Fan */}
            <div className={`rounded-lg p-4 ${fanStatus ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Fan className="w-5 h-5 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">Ceiling Fans</div>
              </div>
              <div className={`text-lg font-bold ${fanStatus ? 'text-blue-700' : 'text-gray-500'}`}>
                {fanStatus ? 'RUNNING' : 'OFF'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Flicker: {debugInfo.fanFlicker || '0'} | CoV: {debugInfo.fanNormalized || '0'} | Cross: {debugInfo.fanCrossings || '0'} | Cols: {debugInfo.fanColumns || '0'}
              </div>
            </div>

            {/* Lights */}
            <div className={`rounded-lg p-4 ${lightStatus === 'on' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">Tubelights</div>
              </div>
              <div className={`text-lg font-bold ${lightStatus === 'on' ? 'text-yellow-700' : 'text-gray-500'}`}>
                {lightStatus.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ceiling: {debugInfo.ceilingBrightness || '0'} | Baseline: {debugInfo.baselineBrightness || '—'}
              </div>
            </div>

            {/* Controls */}
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
                <Bell className="w-5 h-5 text-red-600" /> Wastage Alerts
              </h3>
              {alerts.length > 0 && (
                <button onClick={clearAlerts} className="text-sm text-gray-600 hover:text-gray-800">
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
            <strong>Detection Notes:</strong><br />
            • <strong>Tubelights:</strong> Analyses top 35% of frame; baseline refreshes continuously<br />
            • <strong>Fans:</strong> Periodic zero-crossing + spatial spread check across 16 columns<br />
            • <strong>People:</strong> Lower 70% of frame; motion across grid regions<br />
            • <strong>Limitation:</strong> Still/seated people may read as EMPTY — detection is motion-based
          </div>
        </div>

      </div>
    </div>
  )
}

export default VideoMonitoring