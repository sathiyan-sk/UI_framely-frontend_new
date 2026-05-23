'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './dashboard.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const T = {
  serif:    "Georgia, 'Times New Roman', serif",
  mono:     "'Courier New', Courier, monospace",
  bg:       '#ffffff',
  bgSoft:   '#f5f5f5',
  bgSunk:   '#ebebeb',
  line:     '#e5e5e5',
  lineSoft: '#f0f0f0',
  ink:      '#111111',
  inkSoft:  '#444444',
  inkMute:  '#888888',
  accent:   '#2563eb',
  accentBg: '#dbeafe',
}

// ── Placeholder ───────────────────────────────────────────────────────────────
function Placeholder({ aspect = '1 / 1', label, radius = 10 }) {
  return (
    <div style={{
      aspectRatio: aspect, width: '100%', borderRadius: radius,
      background: `repeating-linear-gradient(45deg, ${T.bgSunk} 0px, ${T.bgSunk} 10px, ${T.bgSoft} 10px, ${T.bgSoft} 20px)`,
      border: `1px solid ${T.line}`, display: 'grid', placeItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {label && (
        <span style={{
          fontFamily: T.mono, fontSize: 10, color: T.inkMute,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          background: T.bg, padding: '3px 7px', borderRadius: 3, border: `1px solid ${T.line}`,
        }}>{label}</span>
      )}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style, span, rowSpan }) {
  return (
    <div
      className="db-card"
      data-span={span || undefined}
      data-rowspan={rowSpan || undefined}
      style={{
      border: `1px solid ${T.line}`, 
      borderRadius: 14, 
      background: T.bg,
      padding: 20, 
      minWidth: 0, 
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconCalendar = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 16 16">
    <rect x="1" y="2.5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)
const IconImage = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 16 16">
    <rect x="1" y="2" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="5.5" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M1 11l4-3.5 3 2.5 3-4 3.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconEye = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 16 16">
    <ellipse cx="8" cy="8" rx="7" ry="5" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)
const IconChart = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 16 16">
    <path d="M1 12l3.5-4 3 2.5 3.5-5.5 2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 14h14" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
)
const IconDownload = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 16 16">
    <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 13h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)

// ── Empty state for Active Events ─────────────────────────────────────────────
function ActiveEventsEmpty() {
  const router = useRouter()
  return (
    <div style={{ padding: '8px 0 4px' }}>
      {/* Illustration */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <svg width="72" height="60" viewBox="0 0 72 60" fill="none">
          {/* Calendar base */}
          <rect x="6" y="10" width="40" height="32" rx="4" fill={T.bgSunk} stroke={T.line} strokeWidth="1.5"/>
          <rect x="6" y="10" width="40" height="10" rx="4" fill={T.bgSoft} stroke={T.line} strokeWidth="1.5"/>
          <rect x="6" y="16" width="40" height="4" fill={T.bgSoft}/>
          {/* Calendar pins */}
          <rect x="16" y="7" width="3" height="7" rx="1.5" fill={T.inkMute}/>
          <rect x="33" y="7" width="3" height="7" rx="1.5" fill={T.inkMute}/>
          {/* Calendar grid dots */}
          {[0,1,2,3].map(col => [0,1,2].map(row => (
            <rect key={`${col}-${row}`}
              x={14 + col * 9} y={25 + row * 7}
              width="5" height="4" rx="1"
              fill={col === 0 && row === 0 ? T.inkMute : T.line}
            />
          )))}
          {/* Camera icon overlapping */}
          <rect x="36" y="28" width="30" height="24" rx="5" fill={T.bg} stroke={T.line} strokeWidth="1.5"/>
          <rect x="36" y="28" width="30" height="24" rx="5" fill={T.bgSoft}/>
          <circle cx="51" cy="40" r="7" fill={T.bg} stroke={T.inkMute} strokeWidth="1.5"/>
          <circle cx="51" cy="40" r="3.5" fill={T.bgSunk}/>
          <rect x="40" y="30" width="6" height="3" rx="1" fill={T.inkMute}/>
          {/* Plus badge */}
          <circle cx="63" cy="29" r="7" fill={T.ink}/>
          <path d="M63 25v8M59 29h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 400, color: T.ink, marginBottom: 5 }}>
          No events yet
        </div>
        <div style={{ fontSize: 12.5, color: T.inkMute, lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
          Create your first event to start collecting and sharing photos with your guests.
        </div>
      </div>

      {/* Workflow steps */}
      <div style={{
        margin: '16px 0',
        padding: '12px 14px',
        background: T.bgSoft,
        borderRadius: 10,
        border: `1px solid ${T.line}`,
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: T.inkMute, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: T.mono }}>
          How it works
        </div>
        {[
          { step: '01', text: 'Create an event — wedding, birthday, party' },
          { step: '02', text: 'Upload your photos to the gallery' },
          { step: '03', text: 'Share the QR code with guests' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
            <span style={{
              fontFamily: T.mono, fontSize: 10, color: T.inkMute,
              background: T.bg, border: `1px solid ${T.line}`,
              padding: '1px 5px', borderRadius: 3, flexShrink: 0, marginTop: 1,
            }}>{s.step}</span>
            <span style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.45 }}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push('/dashboard/create-event')}
        style={{
          width: '100%', padding: '10px', borderRadius: 9,
          background: T.ink, color: '#fff', border: 'none',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.01em',
          transition: 'opacity .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        + Create your first event
      </button>
    </div>
  )
}

// ── QR Canvas ─────────────────────────────────────────────────────────────────
function QRCanvas({ url, size = 130 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || !url) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    canvas.width = size; canvas.height = size
    const hash = url.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
    const cell = size / 21
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillRect(0, 0, size, size)
    const drawFinder = (x, y) => {
      ctx.fillStyle = T.ink;     ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell)
      ctx.fillStyle = T.bg;      ctx.fillRect((x + 1) * cell, (y + 1) * cell, 5 * cell, 5 * cell)
      ctx.fillStyle = T.inkSoft; ctx.fillRect((x + 2) * cell, (y + 2) * cell, 3 * cell, 3 * cell)
    }
    drawFinder(0, 0); drawFinder(14, 0); drawFinder(0, 14)
    for (let i = 0; i < 21; i++) for (let j = 0; j < 21; j++) {
      if ((i < 8 && j < 8) || (i < 8 && j > 12) || (i > 12 && j < 8)) continue
      if (Math.abs((hash * i + j * 7 + i * j) % 3) === 0) {
        ctx.fillStyle = T.inkSoft
        ctx.beginPath()
        ctx.arc((i + .5) * cell, (j + .5) * cell, cell * .38, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,.95)'
    ctx.beginPath(); ctx.arc(size / 2, size / 2, cell * 1.8, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = T.ink; ctx.font = `bold ${cell * 1.4}px sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('P', size / 2, size / 2)
  }, [url, size])
  return <canvas ref={ref} style={{ borderRadius: 10 }} />
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isLive = status === 'Live'
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '2px 6px', borderRadius: 3,
      background: isLive ? T.accentBg : T.bgSoft,
      color:      isLive ? T.accent   : T.inkMute,
    }}>{status}</span>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const router = useRouter()

  const [userName,         setUserName]         = useState('')
  const [events,           setEvents]           = useState([])
  const [totalPhotos,      setTotalPhotos]      = useState(0)
  const [readyPhotos,      setReadyPhotos]      = useState(0)
  const [recentPhotos,     setRecentPhotos]     = useState([])
  const [eventPhotoCounts, setEventPhotoCounts] = useState({})
  const [registrations,    setRegistrations]    = useState(0)
  const [loading,          setLoading]          = useState(true)
  const [planData,         setPlanData]         = useState(null)
  const [qrIdx,            setQrIdx]            = useState(0)
  const [copied,           setCopied]           = useState(false)
  const [activity,         setActivity]         = useState([])

  useEffect(() => { loadUser(); loadData(); loadPlan() }, [])

  // ── 1. User profile ───────────────────────────────────────────────────────
  async function loadUser() {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    try {
      const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      const d   = await res.json()
      if (d.full_name) setUserName(d.full_name.split(' ')[0])
      else if (d.email) setUserName(d.email.split('@')[0])
    } catch (e) { console.error('loadUser:', e) }
  }

  // ── 2. Events + photos + guests ───────────────────────────────────────────
  async function loadData() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/events/`, { headers: { Authorization: `Bearer ${token}` } })
      const evs = await res.json()
      if (!Array.isArray(evs)) return
      setEvents(evs)

      let tp = 0, rp = 0, allPhotos = [], counts = {}, totalRegs = 0
      const actItems = []

      for (const ev of evs.slice(0, 5)) {
        // Photos
        try {
          const pr = await fetch(`${API_URL}/photos/${ev.id}`, { headers: { Authorization: `Bearer ${token}` } })
          const pd = await pr.json()
          if (Array.isArray(pd)) {
            counts[ev.id] = pd.length
            tp += pd.length
            rp += pd.filter(p => p.status === 'ready').length
            // collect photos that have a real URL for recent uploads
            const withUrls = pd.filter(p => p.thumb_url || p.url)
            allPhotos.push(...withUrls.slice(0, 3))
            if (pd.length > 0) {
              actItems.push({
                when: 'Recently',
                text: `You uploaded ${pd.length} photo${pd.length !== 1 ? 's' : ''} to ${ev.name}`,
              })
            }
          }
        } catch (_) {}

        // ── FIX: Guest registrations — handle both array and paginated object ──
        try {
          const gr = await fetch(`${API_URL}/events/${ev.id}/guests`, { headers: { Authorization: `Bearer ${token}` } })
          if (gr.ok) {
            const gd = await gr.json()
            // API may return array OR { items: [...], total: N } — handle both
            const guestList = Array.isArray(gd)
              ? gd
              : Array.isArray(gd?.items)
              ? gd.items
              : Array.isArray(gd?.guests)
              ? gd.guests
              : []
            const count = typeof gd?.total === 'number'
              ? gd.total          // use server-reported total if available
              : guestList.length  // else count the array
            totalRegs += count
            if (guestList.length > 0) {
              const last = guestList[guestList.length - 1]
              actItems.push({
                when: 'Recent',
                text: `New guest registered: ${last.name || last.email || 'Guest'} for ${ev.name}`,
              })
            }
          }
        } catch (_) {}
      }

      setTotalPhotos(tp)
      setReadyPhotos(rp)
      // ── FIX: recent uploads — use real photos, shuffle for variety ──
      setRecentPhotos(allPhotos.sort(() => Math.random() - 0.5).slice(0, 6))
      setEventPhotoCounts(counts)
      setRegistrations(totalRegs)
      setActivity(actItems.slice(0, 5))
    } catch (e) { console.error('loadData:', e) }
    setLoading(false)
  }

  // ── 3. Plan ───────────────────────────────────────────────────────────────
  async function loadPlan() {
    const token = localStorage.getItem('token')
    try {
      const res  = await fetch(`${API_URL}/payments/my-plan`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.current_plan) setPlanData(data)
    } catch (e) { console.error('loadPlan:', e) }
  }

  // ── Derived plan values ───────────────────────────────────────────────────
  const planName      = planData?.plan_name        ?? 'Starter'
  const storageUsedGB = planData
    ? parseFloat((planData.storage_used_bytes / (1024 ** 3)).toFixed(1))
    : 0
  const storageCapGB  = planData?.storage_limit_gb ?? 10
  const photosUsed    = planData?.photos_used      ?? totalPhotos
  const photosLimit   = planData?.photos_limit     ?? 10000
  const storagePct    = Math.min(Math.round((storageUsedGB / storageCapGB) * 100), 100)
  const photosPct     = Math.min(Math.round((photosUsed / photosLimit) * 100), 100)
  const renewsText    = planData?.expires_at
    ? `Renews ${new Date(planData.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
    : 'Active plan'

  // ── Event helpers ─────────────────────────────────────────────────────────
  function eventStatus(ev) {
    if (!ev.is_published) return 'Scheduled'
    if (ev.end_date && new Date(ev.end_date) < new Date()) return 'Complete'
    return 'Live'
  }

  // ── QR ────────────────────────────────────────────────────────────────────
  const currentEvent = events[qrIdx]
  const guestUrl = currentEvent
    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/guest/${currentEvent.slug}`
    : ''
  function copyLink() { navigator.clipboard.writeText(guestUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  // ── Stat cards ────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Active events',  val: events.length,                sub: `${events.filter(e => e.is_published).length} published`,  Icon: IconCalendar },
    { label: 'Photos',         val: totalPhotos.toLocaleString(), sub: `${readyPhotos.toLocaleString()} ready`,                   Icon: IconImage    },
    { label: 'Registrations',  val: registrations,               sub: 'total guests',                                            Icon: IconEye      },
    { label: 'Storage used',   val: `${storageUsedGB} GB`,       sub: `of ${storageCapGB} GB · ${storagePct}% used`,             Icon: IconChart    },
  ]

  // ── Recent uploads: labeled placeholders for empty slots ──────────────────
  const UPLOAD_LABELS = ['Forest', 'Portrait', 'Venue', 'Ceremony', 'Dinner', 'Reception']

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <div className="db-page-header">
        <div>
          <div style={{ fontSize: 11, color: T.inkMute, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Dashboard</div>
          <h1 className="db-hello-title" style={{ fontFamily: T.serif, margin: 0, letterSpacing: '-0.015em', fontWeight: 400, color: T.ink }}>
            Hey <em style={{ fontStyle: 'italic' }}>{userName || '…'}</em>, here's today.
          </h1>
        </div>
        <div className="db-page-header-actions">
          <button
            onClick={() => router.push('/dashboard/media')}
            style={{ padding: '8px 18px', border: `1px solid ${T.line}`, borderRadius: 8, background: T.bg, fontSize: 13, color: T.inkSoft, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
          >Upload</button>
          <button
            onClick={() => router.push('/dashboard/create-event')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', borderRadius: 8, background: T.ink, fontSize: 13, color: '#fff', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
          >+ New event</button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="db-grid">
        {/* 4 stat cards */}
        {statCards.map((c, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ fontSize: 11.5, color: T.inkMute, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{c.label}</div>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: T.bgSoft, display: 'grid', placeItems: 'center', color: T.inkMute }}>
                <c.Icon size={14} />
              </div>
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', color: T.ink }}>{c.val}</div>
            <div style={{ fontSize: 11.5, color: T.inkMute, marginTop: 8 }}>{c.sub}</div>
          </Card>
        ))}

        {/* ── Active events — span 2, rowSpan 2 ── */}
        <Card span={2} rowSpan={2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 style={{ fontFamily: T.serif, fontSize: 20, margin: 0, fontWeight: 400, color: T.ink }}>Active events</h3>
            {events.length > 0 && (
              <Link href="/dashboard/events" style={{ fontSize: 12, color: T.inkMute, textDecoration: 'none', fontFamily: T.mono }}>View all →</Link>
            )}
          </div>

          {loading ? (
            // Loading skeleton rows
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderTop: i === 1 ? 'none' : `1px solid ${T.lineSoft}`, alignItems: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 8, background: T.bgSunk, flexShrink: 0, animation: 'pulse 1.4s ease-in-out infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, width: '55%', background: T.bgSunk, borderRadius: 4, marginBottom: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
                    <div style={{ height: 10, width: '35%', background: T.bgSunk, borderRadius: 4, animation: 'pulse 1.4s ease-in-out infinite' }} />
                  </div>
                </div>
              ))}
            </div>

          ) : events.length === 0 ? (
            // ── Empty state: Option A + C ──
            <ActiveEventsEmpty />

          ) : (
            events.slice(0, 5).map((ev, i) => {
              const status   = eventStatus(ev)
              const picCount = eventPhotoCounts[ev.id] ?? 0
              const progress = status === 'Live' ? Math.min(Math.round((picCount / 500) * 100), 100) : 0
              return (
                <Link key={ev.id} href={`/dashboard/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ display: 'flex', gap: 14, padding: '14px 0', borderTop: i === 0 ? 'none' : `1px solid ${T.lineSoft}`, alignItems: 'center', cursor: 'pointer', borderRadius: 6, transition: 'background 140ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.bgSoft}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 72, flexShrink: 0 }}>
                      <Placeholder aspect="1 / 1" radius={8} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: T.ink }}>{ev.name}</span>
                        <StatusBadge status={status} />
                      </div>
                      <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2 }}>
                        {ev.event_type || 'Event'} · {ev.location || 'India'}
                      </div>
                      <div style={{ marginTop: 10, height: 3, background: T.bgSunk, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: T.accent }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: T.inkMute, fontFamily: T.mono, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {picCount} pics
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </Card>

        {/* ── Storage ── */}
        <Card>
          <div style={{ fontSize: 11.5, color: T.inkMute, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 16 }}>Storage</div>
          <div style={{ fontFamily: T.serif, fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', color: T.ink }}>
            {storageUsedGB}
            <span style={{ color: T.inkMute, fontSize: 16, fontFamily: 'inherit' }}> / {storageCapGB} GB</span>
          </div>
          <div style={{ marginTop: 14, height: 6, background: T.bgSunk, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(storagePct, storagePct > 0 ? storagePct : 0.5)}%`, height: '100%', background: storagePct > 80 ? '#ef4444' : T.accent }} />
          </div>
          <div style={{ fontSize: 11.5, color: T.inkMute, marginTop: 8 }}>{storagePct.toFixed(1)}% used</div>
        </Card>

        {/* ── Your Plan ── */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11.5, color: T.inkMute, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 8 }}>Your plan</div>
              <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 400, color: T.ink }}>{planName}</div>
              <div style={{ fontSize: 11.5, color: T.inkMute, marginTop: 4 }}>{renewsText}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 3, background: T.accentBg, color: T.accent }}>
              Active
            </span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.inkMute, marginBottom: 5 }}>
              <span>Photos</span>
              <span style={{ color: T.ink, fontWeight: 600 }}>{photosUsed.toLocaleString()} / {photosLimit.toLocaleString()}</span>
            </div>
            <div style={{ height: 4, background: T.bgSunk, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(photosPct, 0.5)}%`, height: '100%', background: photosPct > 80 ? '#ef4444' : T.accent }} />
            </div>
          </div>
          {planName === 'Starter' && (
            <button
              onClick={() => router.push('/dashboard/settings?tab=plan')}
              style={{ marginTop: 14, width: '100%', padding: '8px', borderRadius: 8, background: T.ink, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >Upgrade plan →</button>
          )}
        </Card>

        {/* ── Recent uploads ── */}
        <Card span={2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 style={{ fontFamily: T.serif, fontSize: 20, margin: 0, fontWeight: 400, color: T.ink }}>Recent uploads</h3>
            <Link href="/dashboard/media" style={{ fontSize: 12, color: T.inkMute, textDecoration: 'none', fontFamily: T.mono }}>View media →</Link>
          </div>

          {loading ? (
            <div className="db-thumb-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: T.bgSunk, animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          ) : recentPhotos.length === 0 ? (
            // ── No photos yet — hatched placeholders + upload nudge ──
            <div>
              <div className="db-thumb-grid" style={{ marginBottom: 12 }}>
                {UPLOAD_LABELS.map(label => (
                  <Placeholder key={label} aspect="1 / 1" label={label} radius={6} />
                ))}
              </div>
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: T.bgSoft, border: `1px solid ${T.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 12, color: T.inkMute }}>No photos uploaded yet</span>
                <button
                  onClick={() => router.push('/dashboard/media')}
                  style={{ fontSize: 11, fontWeight: 600, color: T.ink, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                >Upload now</button>
              </div>
            </div>
          ) : (
            // ── Real photos — fill remaining slots with placeholders ──
            <div className="db-thumb-grid">              {UPLOAD_LABELS.map((label, i) => (                recentPhotos[i] ? (
                  <div key={label} style={{ aspectRatio: '1', borderRadius: 6, overflow: 'hidden', position: 'relative', border: `1px solid ${T.line}` }}>
                    <img
                      src={recentPhotos[i].thumb_url || recentPhotos[i].url}
                      alt={label}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <Placeholder key={label} aspect="1 / 1" label={label} radius={6} />
                )
              ))}
            </div>
          )}
        </Card>

        {/* ── Activity ── */}
        <Card span={2}>
          <h3 style={{ fontFamily: T.serif, fontSize: 20, margin: '0 0 14px', fontWeight: 400, color: T.ink }}>Activity</h3>
          {loading ? (
            <div style={{ fontSize: 13, color: T.inkMute }}>Loading…</div>
          ) : activity.length === 0 ? (
            <div style={{
              padding: '20px 0', textAlign: 'center',
              color: T.inkMute, fontSize: 13,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>◎</div>
              <div style={{ fontFamily: T.serif, fontSize: 15, color: T.inkSoft, marginBottom: 4 }}>No activity yet</div>
              <div style={{ fontSize: 12 }}>Upload photos or share your event link to see activity here.</div>
            </div>
          ) : (
            activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${T.lineSoft}`, fontSize: 13 }}>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.inkMute, minWidth: 60, paddingTop: 2, flexShrink: 0 }}>{a.when}</div>
                <div style={{ color: T.inkSoft, lineHeight: 1.45 }}>{a.text}</div>
              </div>
            ))
          )}
        </Card>

        {/* ── QR Portal ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 400, color: T.ink, marginBottom: 2 }}>Guest QR Portal</div>
              <div style={{ fontSize: 11, color: T.inkMute }}>Scan to find photos</div>
            </div>
            {events.length > 1 && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setQrIdx(Math.max(0, qrIdx - 1))} disabled={qrIdx === 0}
                  style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.line}`, background: T.bg, cursor: 'pointer', color: T.inkMute, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qrIdx === 0 ? 0.4 : 1 }}>‹</button>
                <button onClick={() => setQrIdx(Math.min(events.length - 1, qrIdx + 1))} disabled={qrIdx === events.length - 1}
                  style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.line}`, background: T.bg, cursor: 'pointer', color: T.inkMute, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qrIdx === events.length - 1 ? 0.4 : 1 }}>›</button>
              </div>
            )}
          </div>

          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: T.inkMute, fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⬡</div>
              Create an event first
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.inkSoft, background: T.bgSoft, border: `1px solid ${T.line}`, padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 10 }}>
                {currentEvent?.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{ padding: 8, background: T.bg, borderRadius: 12, border: `1px solid ${T.line}` }}>
                  <QRCanvas url={guestUrl} size={120} />
                </div>
              </div>
              <div style={{ background: T.bgSoft, border: `1px solid ${T.line}`, borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span className="db-qr-url" style={{ fontSize: 10, color: T.inkMute, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: T.mono }}>{guestUrl}</span>
                <button onClick={copyLink} style={{ fontSize: 10, color: copied ? '#16a34a' : T.accent, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <div className="db-qr-row">                <button                  onClick={() => { const c = document.querySelector('canvas'); if (c) { const a = document.createElement('a'); a.download = `qr-${currentEvent?.slug}.png`; a.href = c.toDataURL(); a.click() } }}
                  style={{ padding: '7px 0', borderRadius: 7, background: T.ink, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  <IconDownload size={11} /> Download
                </button>
                <Link href={guestUrl} target="_blank"
                  style={{ padding: '7px 0', borderRadius: 7, background: T.bg, color: T.inkSoft, border: `1px solid ${T.line}`, fontSize: 11, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ↗ Preview
                </Link>
              </div>
            </>
          )}
        </Card>

        {/* ── Quick Actions ── */}
        <Card>
          <h3 style={{ fontFamily: T.serif, fontSize: 16, margin: '0 0 14px', fontWeight: 400, color: T.ink }}>Quick actions</h3>
          {[
            { label: 'Create event',   sub: 'Wedding, party & more',     href: '/dashboard/create-event', icon: '+' },
            { label: 'Upload photos',  sub: 'Bulk upload to gallery',    href: '/dashboard/media',        icon: '↑' },
            { label: 'View analytics', sub: 'Visits, downloads, trends', href: '/dashboard/analytics',    icon: '↗' },
          ].map((a, i) => (
            <Link key={i} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: i === 0 ? 'none' : `1px solid ${T.lineSoft}`, textDecoration: 'none', cursor: 'pointer' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: T.bgSoft, display: 'grid', placeItems: 'center', color: T.inkSoft, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {a.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: T.ink }}>{a.label}</div>
                <div style={{ fontSize: 11.5, color: T.inkMute }}>{a.sub}</div>
              </div>
              <span style={{ fontSize: 13, color: T.inkMute }}>›</span>
            </Link>
          ))}
        </Card>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>
    </div>
  )
}
