'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ── QR Code component using qrcode library ──────────────────────────────────
function QRCode({ url, size = 160 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!url || !canvasRef.current) return
    import('qrcode').then(QRCodeLib => {
      QRCodeLib.default.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#2d1b69',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
    })
  }, [url, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ borderRadius: 12, display: 'block' }}
      width={size}
      height={size}
    />
  )
}

export default function EventDetail() {
  const { id } = useParams()
  const router = useRouter()
  const fileRef = useRef(null)

  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadQueue, setUploadQueue] = useState([])
  const [uploadedCount, setUploadedCount] = useState(0)
  const [activeSection, setActiveSection] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [copied, setCopied] = useState(false)
  const [qrDownloading, setQrDownloading] = useState(false)

  useEffect(() => {
    loadEvent()
    loadPhotos()
  }, [id])

  async function loadEvent() {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/events/`, { headers: { Authorization: `Bearer ${token}` } })
    const evs = await res.json()
    if (Array.isArray(evs)) {
      const ev = evs.find(e => e.id === id)
      if (ev) setEvent(ev)
    }
  }

  async function loadPhotos() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/photos/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (Array.isArray(data)) setPhotos(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const queue = files.map(f => ({ name: f.name, preview: URL.createObjectURL(f), status: 'waiting' }))
    setUploadQueue(queue)
    setUploadedCount(0)
    setUploading(true)
    const token = localStorage.getItem('token')
    let done = 0
    for (let i = 0; i < files.length; i += 10) {
      const batch = files.slice(i, i + 10)
      setUploadQueue(prev => prev.map((item, idx) => i <= idx && idx < i + 10 ? { ...item, status: 'uploading' } : item))
      await Promise.all(batch.map(async (file, k) => {
        const fd = new FormData(); fd.append('file', file)
        try {
          await fetch(`${API_URL}/photos/${id}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
          const gi = i + k
          setUploadQueue(prev => prev.map((item, idx) => idx === gi ? { ...item, status: 'done' } : item))
          done++; setUploadedCount(done)
        } catch { const gi = i + k; setUploadQueue(prev => prev.map((item, idx) => idx === gi ? { ...item, status: 'error' } : item)) }
      }))
      await loadPhotos()
    }
    setUploading(false)
  }

  function copyLink() {
    const url = `${window.location.origin}/guest/${event?.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function downloadQR() {
    import('qrcode').then(QRCodeLib => {
      const canvas = document.createElement('canvas')
      QRCodeLib.default.toCanvas(canvas, guestUrl, {
        width: 512,
        margin: 3,
        color: { dark: '#2d1b69', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      }, () => {
        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/png')
        a.download = `${event?.slug || 'event'}-qr.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
    })
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`Find your photos from ${event?.name}! Open this link and take a selfie 📸\n${guestUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const ready = photos.filter(p => p.status === 'ready').length
  const processing = photos.filter(p => p.status === 'pending' || p.status === 'processing').length
  const failed = photos.filter(p => p.status === 'failed').length
  const guestUrl = event ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/guest/${event.slug}` : ''

  const filteredPhotos = photos.filter(p => {
    if (activeSection === 'ready') return p.status === 'ready'
    if (activeSection === 'processing') return p.status === 'pending' || p.status === 'processing'
    if (activeSection === 'failed') return p.status === 'failed'
    return true
  }).filter(p => !searchQuery || p.storage_key?.includes(searchQuery))

  const glass = (extra = {}) => ({
    background: 'rgba(255,255,255,0.28)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.55)',
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(100,80,180,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
    ...extra
  })

  const sideItems = [
    { id: 'all', icon: '⊞', label: 'All Photos', count: photos.length },
    { id: 'ready', icon: '✓', label: 'Ready', count: ready },
    { id: 'processing', icon: '◷', label: 'Processing', count: processing },
    { id: 'failed', icon: '⚠', label: 'Failed', count: failed },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#e8e4f8 0%,#d4d0f5 15%,#e2d4f0 30%,#f5d6e8 50%,#fce4d6 65%,#e8d4f0 80%,#d8e0f8 100%)',
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      {/* Blobs */}
      {[{ w: 400, bg: '#c4b5fd', t: -80, l: -60 }, { w: 300, bg: '#fbcfe8', t: 100, r: -40 }, { w: 350, bg: '#bfdbfe', b: -60, l: 200 }].map((b, i) => (
        <div key={i} style={{ position: 'fixed', width: b.w, height: b.w, background: b.bg, borderRadius: '50%', filter: 'blur(60px)', opacity: .25, pointerEvents: 'none', top: b.t, left: b.l, right: b.r, bottom: b.b, zIndex: 0 }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── TOPBAR ── */}
        <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(155,127,232,0.12)', padding: '0 20px', flexShrink: 0 }}>
          <div style={{ height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard/events" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9b89c4', textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 10, background: 'rgba(155,127,232,0.08)', border: '1px solid rgba(155,127,232,0.15)' }}>
              ← Events
            </Link>
            <div style={{ width: 1, height: 20, background: 'rgba(155,127,232,0.2)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#2d1b69', letterSpacing: '-.02em' }}>{event?.name || 'Loading...'}</div>
              <div style={{ fontSize: 11, color: '#9b89c4', marginTop: 1 }}>{event?.event_type || 'Event'} · {event?.location || ''} · /{event?.slug}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Published</span>
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(155,127,232,0.1)', border: '1px solid rgba(155,127,232,0.2)', fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>
              {photos.length} Photos
            </div>
            <button onClick={copyLink} style={{ padding: '8px 18px', borderRadius: 12, background: copied ? 'rgba(22,163,74,0.15)' : 'linear-gradient(135deg,#9b7fe8,#c084fc)', color: copied ? '#15803d' : '#fff', border: copied ? '1px solid rgba(22,163,74,0.3)' : 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: copied ? 'none' : '0 3px 12px rgba(155,127,232,0.35)', transition: 'all .2s' }}>
              {copied ? '✓ Copied!' : '↗ Share'}
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '8px 18px', borderRadius: 12, background: '#2d1b69', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: uploading ? 0.6 : 1 }}>
              ⬆ {uploading ? `${uploadedCount}/${uploadQueue.length}` : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" multiple onChange={handleUpload} style={{ display: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>

          {/* ── LEFT PANEL ── */}
          <div style={{ width: 240, flexShrink: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Cover card */}
            <div style={{ ...glass(), overflow: 'hidden', borderRadius: 18 }}>
              <div style={{ height: 120, background: 'linear-gradient(135deg,#9b7fe8,#c084fc,#f472b6)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 32 }}>📸</div>
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                  <button style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 600, color: '#2d1b69', border: 'none', cursor: 'pointer' }}>Change Cover ✎</button>
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[{ n: photos.length, l: 'Photos' }, { n: 0, l: 'Videos' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '8px 0', background: 'rgba(255,255,255,0.4)', borderRadius: 10, border: '1px solid rgba(155,127,232,0.1)' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#2d1b69' }}>{String(s.n).padStart(2, '0')}</div>
                      <div style={{ fontSize: 10, color: '#9b89c4', fontWeight: 500 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', marginTop: 10, padding: '8px', borderRadius: 10, border: '1px solid rgba(155,127,232,0.25)', background: 'rgba(155,127,232,0.06)', fontSize: 12, color: '#7c3aed', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  + Add Collection
                </button>
              </div>
            </div>

            {/* ── QR CODE CARD ── */}
            <div style={{ ...glass(), padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5b4a8a', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
                📱 Guest QR Code
              </div>

              {/* QR Code */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, background: '#fff', borderRadius: 14, padding: 10, border: '1px solid rgba(155,127,232,0.15)' }}>
                {guestUrl ? (
                  <QRCode url={guestUrl} size={160} />
                ) : (
                  <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 28, height: 28, border: '3px solid rgba(155,127,232,0.2)', borderTop: '3px solid #9b7fe8', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                  </div>
                )}
              </div>

              {/* Guest URL */}
              <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(155,127,232,0.15)', borderRadius: 10, padding: '7px 10px', fontSize: 10, color: '#7c6aaa', wordBreak: 'break-all', lineHeight: 1.5, marginBottom: 10 }}>
                {guestUrl}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={copyLink} style={{ width: '100%', padding: '8px', borderRadius: 10, background: copied ? 'rgba(22,163,74,0.12)' : 'linear-gradient(135deg,#9b7fe8,#c084fc)', color: copied ? '#15803d' : '#fff', border: copied ? '1px solid rgba(22,163,74,0.25)' : 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  {copied ? '✓ Link Copied!' : '🔗 Copy Guest Link'}
                </button>

                <button onClick={downloadQR} style={{ width: '100%', padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(155,127,232,0.25)', fontSize: 12, fontWeight: 600, color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  ⬇ Download QR
                </button>

                <button onClick={shareWhatsApp} style={{ width: '100%', padding: '8px', borderRadius: 10, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', fontSize: 12, fontWeight: 600, color: '#15803d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  💬 Share on WhatsApp
                </button>
              </div>
            </div>

            {/* Collections nav */}
            <div style={{ ...glass(), padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5b4a8a', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Collections</div>
              {sideItems.map(item => (
                <button key={item.id} onClick={() => setActiveSection(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, border: 'none', background: activeSection === item.id ? 'linear-gradient(135deg,rgba(155,127,232,0.15),rgba(192,132,252,0.1))' : 'transparent', cursor: 'pointer', marginBottom: 2, transition: 'all .15s' }}>
                  <span style={{ fontSize: 14, color: activeSection === item.id ? '#7c3aed' : '#9b89c4' }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: activeSection === item.id ? 700 : 500, color: activeSection === item.id ? '#2d1b69' : '#7c6aaa', flex: 1, textAlign: 'left' }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: activeSection === item.id ? 'rgba(155,127,232,0.15)' : 'rgba(0,0,0,0.05)', color: activeSection === item.id ? '#7c3aed' : '#9b89c4' }}>{item.count}</span>
                </button>
              ))}
            </div>

            {/* Stats card */}
            <div style={{ ...glass(), padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5b4a8a', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Processing Status</div>
              {[{ label: 'Ready', val: ready, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }, { label: 'Processing', val: processing, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }, { label: 'Failed', val: failed, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(155,127,232,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: 12, color: '#7c6aaa', fontWeight: 500 }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: s.color, background: s.bg, padding: '2px 8px', borderRadius: 20 }}>{s.val}</span>
                </div>
              ))}
              <button onClick={loadPhotos} style={{ width: '100%', marginTop: 12, padding: '8px', borderRadius: 10, border: '1px solid rgba(155,127,232,0.2)', background: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, color: '#7c3aed', cursor: 'pointer' }}>↺ Refresh</button>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div style={{ flex: 1, padding: '16px 20px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Upload progress */}
            {uploadQueue.length > 0 && (
              <div style={{ ...glass(), padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2d1b69' }}>{uploading ? `Uploading ${uploadedCount} of ${uploadQueue.length}...` : `${uploadedCount} of ${uploadQueue.length} uploaded`}</span>
                  {!uploading && <button onClick={() => setUploadQueue([])} style={{ fontSize: 11, color: '#9b89c4', background: 'transparent', border: 'none', cursor: 'pointer' }}>Clear</button>}
                </div>
                <div style={{ height: 4, background: 'rgba(155,127,232,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: 4, width: `${uploadQueue.length ? (uploadedCount / uploadQueue.length * 100) : 0}%`, background: 'linear-gradient(90deg,#9b7fe8,#c084fc)', borderRadius: 4, transition: 'width .3s' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 4 }}>
                  {uploadQueue.map((item, idx) => (
                    <div key={idx} style={{ aspectRatio: 1, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                      <img src={item.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.status === 'done' ? 'rgba(34,197,94,0.4)' : item.status === 'uploading' ? 'rgba(155,127,232,0.4)' : item.status === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
                        <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>{item.status === 'done' ? '✓' : item.status === 'uploading' ? '↑' : item.status === 'error' ? '✕' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div style={{ ...glass(), padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#c4b5fd' }}>🔍</span>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by filename..." style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1.5px solid rgba(155,127,232,0.18)', borderRadius: 12, fontSize: 13, color: '#2d1b69', background: 'rgba(255,255,255,0.6)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.border = '1.5px solid #9b7fe8'}
                  onBlur={e => e.target.style.border = '1.5px solid rgba(155,127,232,0.18)'} />
              </div>
              <button style={{ padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(155,127,232,0.2)', background: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, color: '#7c6aaa', cursor: 'pointer' }}>⚡ Filter</button>
              <button style={{ padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(155,127,232,0.2)', background: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, color: '#7c6aaa', cursor: 'pointer' }}>↕ Newest</button>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(155,127,232,0.18)', borderRadius: 10, padding: 3, gap: 2 }}>
                {[{ v: 'grid', icon: '⊞' }, { v: 'list', icon: '≡' }].map(m => (
                  <button key={m.v} onClick={() => setViewMode(m.v)} style={{ width: 30, height: 28, borderRadius: 8, border: 'none', background: viewMode === m.v ? 'linear-gradient(135deg,#9b7fe8,#c084fc)' : 'transparent', color: viewMode === m.v ? '#fff' : '#9b89c4', fontSize: 15, cursor: 'pointer', transition: 'all .15s' }}>{m.icon}</button>
                ))}
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '8px 18px', borderRadius: 12, background: 'linear-gradient(135deg,#2d1b69,#4b0082)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 3px 12px rgba(75,0,130,0.3)', opacity: uploading ? 0.6 : 1 }}>
                ⬆ Upload Photos
              </button>
              <button style={{ padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(155,127,232,0.2)', background: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, color: '#7c6aaa', cursor: 'pointer' }}>
                ⬇ Download
              </button>
            </div>

            {/* Photo grid / empty state */}
            {loading ? (
              <div style={{ ...glass(), flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, border: '3px solid rgba(155,127,232,0.2)', borderTop: '3px solid #9b7fe8', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
                  <div style={{ fontSize: 14, color: '#9b89c4' }}>Loading photos...</div>
                </div>
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div style={{ ...glass(), flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div style={{ textAlign: 'center', maxWidth: 360 }}>
                  <div style={{ width: 120, height: 120, borderRadius: 28, background: 'linear-gradient(135deg,rgba(155,127,232,0.15),rgba(192,132,252,0.1))', border: '1px solid rgba(155,127,232,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, margin: '0 auto 20px', animation: 'float 3s ease-in-out infinite' }}>📷</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2d1b69', marginBottom: 8 }}>{searchQuery ? 'No photos match' : 'No photos yet'}</div>
                  <div style={{ fontSize: 14, color: '#9b89c4', marginBottom: 24, lineHeight: 1.6 }}>
                    {searchQuery ? 'Try a different search term' : 'Upload your event photos to get started with AI face recognition'}
                  </div>
                  {!searchQuery && (
                    <button onClick={() => fileRef.current?.click()} style={{ padding: '13px 32px', borderRadius: 14, background: 'linear-gradient(135deg,#9b7fe8,#c084fc)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(155,127,232,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      ⬆ Upload Photos
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
                {filteredPhotos.map((photo, i) => (
                  <div key={photo.id} style={{ aspectRatio: 1, borderRadius: 14, overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(155,127,232,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}>
                    {photo.url
                      ? <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                      : <div style={{ width: '100%', height: '100%', background: `hsl(${(i * 47) % 360},60%,75%)` }} />
                    }
                    <div style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: '50%', background: photo.status === 'ready' ? '#22c55e' : photo.status === 'failed' ? '#ef4444' : '#f59e0b', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...glass(), overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 80px', gap: 0, background: 'linear-gradient(135deg,rgba(75,0,130,0.8),rgba(99,38,163,0.85))', padding: '10px 16px' }}>
                  {['#', 'Filename', 'Status', 'Size', ''].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '.05em' }}>{h}</div>)}
                </div>
                {filteredPhotos.map((p, i) => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 80px', gap: 0, padding: '10px 16px', borderBottom: '1px solid rgba(155,127,232,0.06)', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,127,232,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ fontSize: 12, color: '#9b89c4' }}>{i + 1}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.url && <img src={p.url} alt="" style={{ width: 32, height: 32, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
                      <span style={{ fontSize: 12, color: '#2d1b69', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.storage_key?.split('/').pop()}</span>
                    </div>
                    <div><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: p.status === 'ready' ? 'rgba(34,197,94,0.12)' : p.status === 'failed' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', color: p.status === 'ready' ? '#15803d' : p.status === 'failed' ? '#dc2626' : '#d97706' }}>{p.status}</span></div>
                    <div style={{ fontSize: 12, color: '#9b89c4' }}>—</div>
                    <div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}
