'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

  .er {
    --serif:      'DM Serif Display', Georgia, serif;
    --mono:       'DM Mono', monospace;
    --sans:       'DM Sans', sans-serif;
    --bg:         #faf9f7;
    --bg-soft:    #f2f0ec;
    --bg-sunk:    #e8e4dd;
    --ink:        #1a1714;
    --ink-soft:   #4a453f;
    --ink-mute:   #8c8680;
    --line:       #e0dbd3;
    --line-soft:  #ede9e2;
    --accent:     #2563eb;
    --accent-bg:  #eff6ff;
    --danger:     #dc2626;
    --danger-bg:  #fef2f2;
    --success:    #16a34a;
    --success-bg: #f0fdf4;
    --amber:      #d97706;
    --amber-bg:   #fffbeb;
    font-family: var(--sans);
    background: var(--bg);
    color: var(--ink);
    min-height: 100vh;
  }
  .er * { box-sizing: border-box; }

  .er-tabs {
    display: flex;
    border-bottom: 1px solid var(--line);
    margin-bottom: 32px;
    overflow-x: auto;
    gap: 0;
  }
  .er-tab {
    padding: 10px 20px;
    font-family: var(--sans); font-size: 13.5px; font-weight: 500;
    color: var(--ink-mute); background: transparent;
    border: none; border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    cursor: pointer; transition: all 120ms;
    display: flex; align-items: center; gap: 7px;
    white-space: nowrap; flex-shrink: 0;
  }
  .er-tab:hover { color: var(--ink-soft); }
  .er-tab.active { color: var(--ink); border-bottom-color: var(--ink); font-weight: 600; }
  .er-tab .ct {
    font-size: 11px; font-weight: 600; font-family: var(--mono);
    padding: 1px 6px; border-radius: 20px;
    background: var(--bg-sunk); color: var(--ink-mute);
  }
  .er-tab.active .ct { background: var(--ink); color: var(--bg); }

  .ev-card {
    border: 1px solid var(--line); border-radius: 12px;
    background: var(--bg); overflow: hidden;
    transition: box-shadow 180ms, transform 180ms;
    text-decoration: none; color: inherit; display: block;
  }
  .ev-card:hover { box-shadow: 0 10px 32px rgba(0,0,0,0.09); transform: translateY(-2px); }

  .ev-cover { height: 240px; position: relative; overflow: hidden; }
  .ev-cover img { width:100%; height:100%; object-fit:cover; display:block; transition: transform .35s; }
  .ev-card:hover .ev-cover img { transform: scale(1.04); }

  .ev-status {
    position: absolute; top: 14px; right: 14px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.09em;
    text-transform: uppercase; font-family: var(--mono);
    padding: 3px 9px; border-radius: 4px;
  }

  .ev-tag {
    position: absolute; bottom: 14px; left: 14px;
    background: rgba(250,249,247,0.92); border: 1px solid rgba(0,0,0,0.1);
    backdrop-filter: blur(6px);
    font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; font-family: var(--mono); color: var(--ink-soft);
    padding: 3px 9px; border-radius: 4px;
  }

  .ev-body { padding: 18px 20px 20px; border-top: 1px solid var(--line-soft); }
  .ev-name { font-family:var(--serif);font-size:22px;font-weight:400;letter-spacing:-0.01em;margin:0 0 5px;color:var(--ink);line-height:1.2; }
  .ev-meta { font-size:12.5px;color:var(--ink-mute);margin-bottom:5px; }
  .ev-dates { font-size:11.5px;color:var(--ink-mute);font-family:var(--mono);letter-spacing:0.02em;margin-bottom:14px; }

  .ev-stat-chip {
    display: inline-flex; flex-direction: column; align-items: center;
    padding: 4px 10px; border-radius: 6px;
    background: var(--bg-soft); border: 1px solid var(--line-soft);
    min-width: 52px;
  }
  .ev-stat-chip-val {
    font-family: var(--mono); font-size: 14px; font-weight: 600;
    color: var(--ink); line-height: 1.2;
  }
  .ev-stat-chip-lbl {
    font-size: 9px; color: var(--ink-mute); text-transform: uppercase;
    letter-spacing: 0.06em; font-family: var(--mono); white-space: nowrap;
  }

  .ev-toggle {
    width:100%;padding:8px 0;border-radius:7px;
    font-size:12px;font-weight:600;cursor:pointer;
    font-family:var(--sans);transition:all 160ms;text-align:center;
  }

  .ev-wrap { position: relative; }
  .ev-del {
    position:absolute;top:12px;left:12px;width:26px;height:26px;border-radius:6px;
    background:rgba(250,249,247,0.92);border:1px solid rgba(0,0,0,0.1);
    color:var(--ink-mute);font-size:11px;font-weight:700;cursor:pointer;
    display:grid;place-items:center;backdrop-filter:blur(4px);
    transition:all 120ms;opacity:0;z-index:2;
  }
  .ev-wrap:hover .ev-del { opacity:1; }
  .ev-del:hover { background:#fef2f2;color:#dc2626;border-color:rgba(220,38,38,0.2); }

  .er-search {
    display:flex;align-items:center;gap:8px;
    border:1px solid var(--line);border-radius:8px;padding:8px 12px;
    background:var(--bg);width:220px;transition:border-color 140ms;
  }
  .er-search:focus-within { border-color:var(--ink); }
  .er-search input { border:none;outline:none;background:transparent;font-size:13px;color:var(--ink);font-family:var(--sans);width:100%; }
  .er-search input::placeholder { color:var(--ink-mute); }

  .er-btn { display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-family:var(--sans);font-size:13.5px;font-weight:600;cursor:pointer;transition:all 140ms;border:none;white-space:nowrap; }
  .er-btn-primary { background:var(--ink);color:var(--bg); }
  .er-btn-primary:hover { opacity:.88; }
  .er-btn-outline { background:transparent;color:var(--ink-soft);border:1px solid var(--line); }
  .er-btn-outline:hover { background:var(--bg-soft); }

  .er-overlay { position:fixed;inset:0;background:rgba(26,23,20,0.45);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:50; }
  .er-modal { background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:32px;max-width:380px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,0.18); }

  .er-empty { grid-column:1/-1;border:1px dashed var(--line);border-radius:16px;padding:64px 40px;text-align:center; }

  /* Hatch pattern for no-cover */
  .ev-hatch {
    width:100%; height:100%;
    background-image: repeating-linear-gradient(
      -45deg,
      transparent, transparent 8px,
      rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 16px
    );
    background-color: var(--bg-soft);
  }

  /* Skeleton shimmer */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .ev-skeleton {
    background: linear-gradient(90deg, var(--bg-sunk) 25%, var(--bg-soft) 50%, var(--bg-sunk) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
  }
`

function fmtDate(s) {
  if (!s) return null
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRange(start, end) {
  if (!start) return null
  if (!end || start === end) return fmtDate(start)
  return `${fmtDate(start)} — ${fmtDate(end)}`
}

function metaLine(ev) {
  return [ev.event_type, ev.location].filter(Boolean).join(' · ') || null
}

function templateLabel(id) {
  if (!id) return null
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Status: only published / unpublished / expired ───────────────────────────
// expired = data expiry date (expires_at) has passed — NOT the event end date
function getStatus(ev) {
  if (ev.expires_at && new Date(ev.expires_at) < new Date()) return 'expired'
  if (ev.is_published) return 'published'
  return 'unpublished'
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ ev, index, photoCount, guestCount, coverUrl, onDelete, onToggle, toggling }) {
  const status    = getStatus(ev)
  const tLabel    = templateLabel(ev.gallery_template)
  const dateRange = fmtRange(ev.start_date || ev.starts_at, ev.end_date || ev.ends_at)
  const meta      = metaLine(ev)
  const displayCover = coverUrl || ev.cover_url

  const statusCfg = {
    published:   { label: '● Published',   bg: 'rgba(22,163,74,0.12)',   color: '#16a34a' },
    unpublished: { label: '○ Unpublished', bg: 'rgba(250,249,247,0.92)', color: '#8c8680' },
    expired:     { label: 'Expired',       bg: 'rgba(220,38,38,0.12)',   color: '#dc2626' },
  }[status]

  return (
    <div className="ev-wrap">
      <Link href={`/dashboard/events/${ev.id}`} className="ev-card">

        {/* Cover */}
        <div className="ev-cover">
          {displayCover
            ? <img src={displayCover} alt={ev.name} onError={e => { e.target.style.display = 'none' }} />
            : <div className="ev-hatch" />
          }
          {/* Status badge */}
          <div className="ev-status" style={{ background: statusCfg.bg, color: statusCfg.color }}>
            {statusCfg.label}
          </div>
          {/* Template tag */}
          {tLabel && <div className="ev-tag">{tLabel}</div>}
          {/* Photo selling badge */}
          {ev.photo_selling_enabled && (
            <div style={{ position: 'absolute', top: 14, left: 46, background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)', color: '#d97706', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--mono)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Photo Sales
            </div>
          )}
        </div>

        {/* Body */}
        <div className="ev-body">
          {/* Name row — name/meta left, stat chips right */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 className="ev-name">{ev.name}</h3>
              {meta      && <div className="ev-meta">{meta}</div>}
              {dateRange && <div className="ev-dates">{dateRange}</div>}
              {/* Feature badges */}
              <div style={{ display: 'flex', gap: 5, marginTop: meta || dateRange ? 6 : 4, flexWrap: 'wrap' }}>
                {ev.guest_upload_enabled && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(22,163,74,0.2)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Guest Upload</span>
                )}
                {ev.public_gallery && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid rgba(37,99,235,0.2)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Public</span>
                )}
              </div>
            </div>

            {/* Stat chips — right aligned */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'flex-start', paddingTop: 2 }}>
              <div className="ev-stat-chip">
                <div className="ev-stat-chip-val">
                  {photoCount === null ? '—' : photoCount.toLocaleString()}
                </div>
                <div className="ev-stat-chip-lbl">Photos</div>
              </div>
              <div className="ev-stat-chip">
                <div className="ev-stat-chip-val">
                  {guestCount === null ? '—' : guestCount.toLocaleString()}
                </div>
                <div className="ev-stat-chip-lbl">Guests</div>
              </div>
            </div>
          </div>

          {/* Publish toggle */}
          <button
            className="ev-toggle"
            onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(ev, e) }}
            disabled={toggling}
            style={{
              border:     `1px solid ${ev.is_published ? 'rgba(22,163,74,0.2)' : 'var(--line)'}`,
              background: ev.is_published ? 'var(--success-bg)' : 'var(--bg-soft)',
              color:      ev.is_published ? 'var(--success)' : 'var(--ink-mute)',
              opacity:    toggling ? 0.6 : 1,
              cursor:     toggling ? 'wait' : 'pointer',
            }}
          >
            {toggling
              ? 'Updating…'
              : ev.is_published
              ? '● Published · click to unpublish'
              : '○ Unpublished · click to publish'
            }
          </button>
        </div>
      </Link>

      {/* Delete X */}
      <button
        className="ev-del"
        onClick={e => { e.preventDefault(); onDelete(ev.id) }}
        title="Delete event"
      >✕</button>
    </div>
  )
}

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg)' }}>
      <div style={{ height: 240, background: 'var(--bg-soft)' }} className="ev-skeleton" />
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div className="ev-skeleton" style={{ height: 22, width: '55%', marginBottom: 8 }} />
            <div className="ev-skeleton" style={{ height: 12, width: '38%', marginBottom: 6 }} />
            <div className="ev-skeleton" style={{ height: 12, width: '28%' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="ev-skeleton" style={{ width: 52, height: 44, borderRadius: 6 }} />
            <div className="ev-skeleton" style={{ width: 52, height: 44, borderRadius: 6 }} />
          </div>
        </div>
        <div className="ev-skeleton" style={{ height: 34, borderRadius: 7 }} />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const router = useRouter()

  const [events,      setEvents]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('all')
  const [search,      setSearch]      = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deletingId,    setDeletingId]   = useState(null)
  const [togglingId,    setTogglingId]   = useState(null)

  // Per-event enriched data
  const [photoCounts, setPhotoCounts] = useState({})   // { eventId: number }
  const [guestCounts, setGuestCounts] = useState({})   // { eventId: number }
  const [autoCoverUrls, setAutoCoverUrls] = useState({}) // { eventId: url } — first photo if no cover set

  useEffect(() => { loadEvents() }, [])

  // ── Load events, then enrich each with photos + guests in parallel ─────────
  async function loadEvents() {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res  = await fetch(`${API_URL}/events/`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!Array.isArray(data)) return
      setEvents(data)
      setLoading(false)
      // Enrich all events in parallel — non-blocking
      enrichEvents(data, token)
    } catch (e) {
      console.error('loadEvents:', e)
      setLoading(false)
    }
  }

  async function enrichEvents(evs, token) {
    await Promise.all(evs.map(ev => enrichOne(ev, token)))
  }

  async function enrichOne(ev, token) {
    // Photos
    try {
      const res  = await fetch(`${API_URL}/photos/${ev.id}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (Array.isArray(data)) {
        setPhotoCounts(prev => ({ ...prev, [ev.id]: data.length }))
        // Auto-cover: use first ready photo's thumb if event has no cover set
        if (!ev.cover_url && !ev.cover_photo_id) {
          const first = data.find(p => p.status === 'ready' && (p.thumb_url || p.url))
          if (first) {
            setAutoCoverUrls(prev => ({ ...prev, [ev.id]: first.thumb_url || first.url }))
          }
        }
      }
    } catch (_) {}

    // Guests
    try {
      const res  = await fetch(`${API_URL}/events/${ev.id}/guests`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        // API returns plain array per backend code
        const count = Array.isArray(data) ? data.length
          : typeof data?.total === 'number' ? data.total
          : Array.isArray(data?.items) ? data.items.length
          : 0
        setGuestCounts(prev => ({ ...prev, [ev.id]: count }))
      }
    } catch (_) {}
  }

  async function togglePublish(ev, e) {
    e.preventDefault(); e.stopPropagation()
    setTogglingId(ev.id)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/events/${ev.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_published: !ev.is_published }),
      })
      if (res.ok) {
        setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, is_published: !ev.is_published } : e))
      }
    } catch (err) { console.error(err) }
    setTogglingId(null)
  }

  async function deleteEvent(id) {
    setDeletingId(id)
    const token = localStorage.getItem('token')
    const res   = await fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      setEvents(p => p.filter(e => e.id !== id))
      setPhotoCounts(p => { const n = { ...p }; delete n[id]; return n })
      setGuestCounts(p => { const n = { ...p }; delete n[id]; return n })
    }
    setDeletingId(null)
    setConfirmDelete(null)
  }

  // ── Tabs: All / Published / Unpublished / Photo Sales / Expired ───────────
  const counts = {
    all:         events.length,
    published:   events.filter(e => getStatus(e) === 'published').length,
    unpublished: events.filter(e => getStatus(e) === 'unpublished').length,
    selling:     events.filter(e => e.photo_selling_enabled).length,
    expired:     events.filter(e => getStatus(e) === 'expired').length,
  }

  const tabs = [
    ['all',         'All'],
    ['published',   'Published'],
    ['unpublished', 'Unpublished'],
    ['selling',     'Photo Sales'],
    ['expired',     'Expired'],
  ]

  const filtered = events.filter(ev => {
    const st = getStatus(ev)
    const matchTab =
      filter === 'all'         ? true :
      filter === 'published'   ? st === 'published' :
      filter === 'unpublished' ? st === 'unpublished' :
      filter === 'expired'     ? st === 'expired' :
      filter === 'selling'     ? ev.photo_selling_enabled : true
    const q = search.toLowerCase()
    const matchSearch = !q || ev.name?.toLowerCase().includes(q) || ev.slug?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="er">
      <style>{css}</style>

      <div className="db-page-container">

        {/* Header */}
        <div className="db-page-header">
          <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            Workspace · Events
          </div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.05 }}>
                Your <em style={{ fontStyle: 'italic' }}>events</em>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-mute)', margin: 0, maxWidth: 480, lineHeight: 1.55 }}>
                {events.length} event{events.length !== 1 ? 's' : ''} across all states.
                {events.length > 0 ? ' Manage covers, galleries, photo sales, and guest access.' : ''}
              </p>
            </div>
          <div className="db-page-header-actions">
              <div className="er-search">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: 'var(--ink-mute)', flexShrink: 0 }}>
                  <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input placeholder="Search events" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="er-btn er-btn-primary" onClick={() => router.push('/dashboard/create-event')}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                New event
              </button>
            </div>
        
        </div>

        {/* Tabs */}
        <div className="er-tabs">
          {tabs.map(([k, l]) => (
            <button key={k} className={`er-tab${filter === k ? ' active' : ''}`} onClick={() => setFilter(k)}>
              {l}<span className="ct">{counts[k]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="db-events-grid">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>

        ) : filtered.length === 0 ? (
          <div className="er-empty">
            <div style={{ fontSize: 36, marginBottom: 14 }}>📷</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, marginBottom: 8 }}>
              {filter === 'all' && !search ? 'No events yet' : `No ${filter} events${search ? ` matching "${search}"` : ''}`}
            </div>
            <p style={{ color: 'var(--ink-mute)', fontSize: 14, maxWidth: 320, margin: '0 auto 20px', lineHeight: 1.6 }}>
              {filter === 'all' && !search ? 'Create your first event and start sharing beautiful galleries.' : ''}
            </p>
            {filter === 'all' && !search && (
              <button className="er-btn er-btn-primary" onClick={() => router.push('/dashboard/create-event')}>
                Create your first event
              </button>
            )}
          </div>

        ) : (
          <div className="db-events-grid">
            {filtered.map((ev, i) => (
              <EventCard
                key={ev.id}
                ev={ev}
                index={i}
                photoCount={photoCounts[ev.id] ?? null}
                guestCount={guestCounts[ev.id] ?? null}
                coverUrl={autoCoverUrls[ev.id] || null}
                onDelete={id => setConfirmDelete(id)}
                onToggle={togglePublish}
                toggling={togglingId === ev.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {confirmDelete && (
        <div className="er-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="er-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, marginBottom: 6 }}>Delete event?</div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-mute)', margin: '0 0 24px', lineHeight: 1.65 }}>
              All photos and face embeddings will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="er-btn er-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="er-btn"
                style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)', color: '#fff', opacity: deletingId === confirmDelete ? 0.6 : 1, cursor: deletingId === confirmDelete ? 'wait' : 'pointer' }}
                onClick={() => deleteEvent(confirmDelete)}
                disabled={deletingId === confirmDelete}
              >
                {deletingId === confirmDelete ? 'Deleting…' : 'Delete event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
