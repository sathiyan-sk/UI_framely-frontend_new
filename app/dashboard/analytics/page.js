'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ── Design tokens (matching the editorial system) ─────────────────────────────
const C = {
  bg:          '#F9F7F4',
  surface:     '#FFFFFF',
  primary:     '#1A1814',
  secondary:   '#8B8680',
  tertiary:    '#B5B0A9',
  border:      '#EAE6E1',
  borderLight: '#F0EDE8',
  amber:       '#D97736',
  sage:        '#7A8B76',
  rose:        '#C58A80',
  gold:        '#C2A578',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap');

  .an-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: ${C.bg};
    color: ${C.primary};
    min-height: 100vh;
  }
  .an-root * { box-sizing: border-box; }

  /* Responsive container */

  .an-container {
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Topbar */
  .an-topbar {
    padding: 14px 36px;
    border-bottom: 1px solid ${C.border};
    background: ${C.surface};
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  @media (max-width: 640px) {
    .an-topbar {
      padding: 12px 16px;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  /* Underline tabs */
  .an-tabs {
    display: flex;
    border-bottom: 1px solid ${C.border};
    margin-bottom: 32px;
  }
  .an-tab {
    padding: 11px 22px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 400;
    color: ${C.secondary}; background: transparent;
    border: none; border-bottom: 2px solid transparent;
    margin-bottom: -1px; cursor: pointer;
    display: flex; align-items: center; gap: 7px;
    transition: all 120ms; white-space: nowrap;
    letter-spacing: -0.01em;
  }
  .an-tab:hover { color: ${C.primary}; }
  .an-tab.active { color: ${C.primary}; border-bottom-color: ${C.primary}; font-weight: 600; }

  /* Metric card */
  .an-metric-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 22px 24px 20px;
    position: relative; overflow: hidden;
    transition: box-shadow 180ms;
  }
  .an-metric-card:hover { box-shadow: 0 4px 18px rgba(26,24,20,0.08); }

  /* Chart panels */
  .an-panel {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 28px 32px;
    margin-bottom: 20px;
  }

  /* Ctrl buttons */
  .an-ctrl {
    padding: 6px 14px;
    border: 1px solid ${C.border};
    border-radius: 7px;
    background: ${C.surface};
    font-size: 12px; color: ${C.secondary};
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
    transition: background 120ms;
  }
  .an-ctrl:hover { background: ${C.bg}; }

  /* Table */
  .an-table-head {
    display: grid;
    border-bottom: 1px solid ${C.border};
    padding-bottom: 10px; margin-bottom: 2px;
  }
  .an-table-row {
    display: grid;
    padding: 14px 0;
    border-bottom: 1px solid ${C.borderLight};
    align-items: center;
    transition: background 140ms;
  }
  .an-table-row:last-child { border-bottom: none; }
  .an-table-row:hover { background: ${C.bg}; border-radius: 6px; }

  /* Search input */
  .an-search {
    display: flex; align-items: center; gap: 8px;
    border: 1px solid ${C.border}; border-radius: 8px;
    padding: 8px 14px; background: ${C.surface};
    width: 280px; transition: border-color 140ms;
  }
  .an-search:focus-within { border-color: ${C.primary}; }
  .an-search input {
    border: none; outline: none; background: transparent;
    font-size: 13px; color: ${C.primary}; font-family: 'DM Sans', sans-serif;
    width: 100%;
  }
  .an-search input::placeholder { color: ${C.tertiary}; }

  /* Pagination btn */
  .pg-btn {
    width: 28px; height: 28px; border-radius: 7px;
    border: 1px solid ${C.border}; background: ${C.surface};
    cursor: pointer; display: grid; place-items: center;
    font-size: 12px; color: ${C.secondary};
    transition: background 120ms;
  }
  .pg-btn:hover:not(:disabled) { background: ${C.bg}; }
  .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Rows-per-page select */
  .rpp-select {
    border: 1px solid ${C.border}; border-radius: 6px;
    padding: 3px 8px; font-size: 12px; color: ${C.primary};
    background: ${C.surface}; outline: none; cursor: pointer;
  }

  /* Btn */
  .an-btn-primary {
    padding: 8px 18px; border-radius: 8px;
    background: ${C.primary}; color: #fff;
    border: none; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 7px;
    transition: opacity 140ms;
  }
  .an-btn-primary:hover { opacity: 0.88; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 280ms ease; }

  @keyframes pulse3 { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(1.4); } }
    

  /* ============ RESPONSIVE STYLES ============ */
  
  /* Metric cards - 4 columns on desktop */
  .an-metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 28px;
  }
  
  /* Registrations table - desktop view */
  .an-table-desktop {
    display: block;
  }
  
  .an-table-mobile {
    display: none;
  }
  
  /* Registrations table header */
  .an-reg-table-header {
    display: grid;
    grid-template-columns: 120px 1fr 1fr 150px 1fr 90px 110px;
    gap: 0;
    background: ${C.primary};
    padding: 12px 24px;
  }
  
  /* Registrations table row */
  .an-reg-table-row {
    display: grid;
    grid-template-columns: 120px 1fr 1fr 150px 1fr 90px 110px;
    gap: 0;
    padding: 13px 24px;
    border-bottom: 1px solid ${C.borderLight};
    transition: background 140ms;
  }
  
  /* Summary strip - 3 columns */
  .an-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  
  /* Tablet styles - 1024px and below */
  @media (max-width: 1024px) {
    .an-topbar {
      padding: 14px 24px;
    }
    
    /* Metric cards: 4 → 2 columns */
    .an-metrics-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    /* Summary strip: 3 → 2 columns */
    .an-summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    /* Table: switch to card layout */
    .an-table-desktop {
      display: none;
    }
    
    .an-table-mobile {
      display: block;
    }
    
    /* Mobile card for each registration */
    .an-reg-card {
      background: ${C.surface};
      border: 1px solid ${C.border};
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
      transition: box-shadow 140ms;
    }
    
    .an-reg-card:hover {
      box-shadow: 0 4px 12px rgba(26,24,20,0.08);
    }
    
    .an-reg-card-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      gap: 12px;
    }
    
    .an-reg-card-row:last-child {
      margin-bottom: 0;
    }
    
    .an-reg-card-label {
      font-size: 10px;
      font-weight: 700;
      color: ${C.secondary};
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: 'DM Mono', monospace;
      margin-bottom: 4px;
    }
    
    .an-reg-card-value {
      font-size: 13px;
      color: ${C.primary};
      word-break: break-word;
    }
  }
  
  /* Mobile styles - 640px and below */
  @media (max-width: 640px) {
    /* Content padding */
    .an-root > div:last-child {
      padding: 24px 16px !important;
    }
    
    .an-topbar {
      padding: 12px 16px;
    }
    
    /* Metric cards: 2 → 1 column */
    .an-metrics-grid {
      grid-template-columns: 1fr;
    }
    
    /* Summary strip: 2 → 1 column */
    .an-summary-grid {
      grid-template-columns: 1fr;
    }
    
    /* Search and export row */
    .an-search-row {
      flex-direction: column;
      gap: 12px;
    }
    
    .an-search {
      width: 100% !important;
    }
    
    .an-btn-primary {
      width: 100%;
      justify-content: center;
    }
    
    /* Tabs: allow horizontal scroll */
    .an-tabs {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    
    .an-tabs::-webkit-scrollbar {
      display: none;
    }
  }
`
// ── Metric card ───────────────────────────────────────────────────────────────
const METRIC_DEFS = [
  { key: 'registrations',  label: 'Registrations',   accent: C.amber, icon: '👤' },
  { key: 'galleryVisits',  label: 'Gallery Visit',    accent: C.sage,  icon: '🖥' },
  { key: 'imageViews',     label: 'Image View',       accent: C.rose,  icon: '👁' },
  { key: 'imageDownloads', label: 'Image Downloads',  accent: C.gold,  icon: '⬇' },
]

function MetricCard({ def, value, idx }) {
  return (
    <div className="an-metric-card">
      {/* Top accent bar */}
      <div style={{ position:'absolute',top:0,left:0,right:0,height:2.5,background:`linear-gradient(90deg,${def.accent}40,${def.accent})`,borderRadius:'10px 10px 0 0' }} />
      {/* Header row */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
        <div style={{ display:'flex',alignItems:'center',gap:7 }}>
          <div style={{ width:28,height:28,background:`${def.accent}12`,border:`1px solid ${def.accent}25`,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>
            {def.icon}
          </div>
          <span style={{ fontSize:12,color:C.secondary,fontWeight:500,letterSpacing:'-0.01em' }}>{def.label}</span>
        </div>
        <div style={{ width:7,height:7,borderRadius:'50%',background:def.accent,animation:`pulse3 2s ease infinite`,animationDelay:`${idx*0.4}s` }} />
      </div>
      {/* Value */}
      <p style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:44,fontWeight:600,color:C.primary,lineHeight:1,marginBottom:8,letterSpacing:'-0.02em' }}>
        {value}
      </p>
      {/* Change */}
      <div style={{ display:'flex',alignItems:'center',gap:5 }}>
        <div style={{ width:5,height:5,borderRadius:'50%',background:C.borderLight,border:`1px solid ${C.border}` }} />
        <span style={{ fontSize:11,color:C.tertiary }}>No change</span>
      </div>
    </div>
  )
}

// ── Legend dot ────────────────────────────────────────────────────────────────
function LegendDot({ color, label }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:5 }}>
      <div style={{ width:7,height:7,borderRadius:'50%',background:color }} />
      <span style={{ fontSize:11,color:C.secondary }}>{label}</span>
    </div>
  )
}

// ── Custom tooltip (used by Chart.js externally; this is for recharts fallback)
// We use Chart.js (CDN) since the existing code already does — keeping that pattern.

export default function AnalyticsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab]         = useState('analytics')
  const [events, setEvents]               = useState([])
  const [allPhotos, setAllPhotos]         = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [rowsPerPage, setRowsPerPage]     = useState(10)
  const [page, setPage]                   = useState(0)
  const lineRef = useRef(null)
  const barRef  = useRef(null)
  const lineInst = useRef(null)
  const barInst  = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    loadData()
  }, [])

  useEffect(() => {
    if (!loading && activeTab === 'analytics') loadChartJs()
    return () => {
      if (lineInst.current) { lineInst.current.destroy(); lineInst.current = null }
      if (barInst.current)  { barInst.current.destroy();  barInst.current  = null }
    }
  }, [loading, activeTab, allPhotos])

  async function loadData() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/events/`, { headers: { Authorization: `Bearer ${token}` } })
      const evs = await res.json()
      if (!Array.isArray(evs)) return
      setEvents(evs)
      const photos = [], regs = []
      for (const ev of evs) {
        const pr = await fetch(`${API_URL}/photos/${ev.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const pd = await pr.json()
        if (Array.isArray(pd)) photos.push(...pd.map(p => ({ ...p, eventName: ev.name, eventSlug: ev.slug })))
        try {
          const gr = await fetch(`${API_URL}/events/${ev.id}/guests`, { headers: { Authorization: `Bearer ${token}` } })
          if (gr.ok) {
            const gd = await gr.json()
            if (Array.isArray(gd)) gd.forEach(g => regs.push({
              date:           g.created_at ? g.created_at.split('T')[0] : '—',
              eventName:      ev.name,
              name:           g.name,
              mobile:         g.phone,
              email:          g.email,
              notified:       g.notified,
              imageView:      0,
              imageDownloads: 0,
            }))
          }
        } catch (e) { console.error('guests fetch', e) }
      }
      setAllPhotos(photos)
      setRegistrations(regs)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function loadChartJs() {
    if (window.Chart) { buildCharts(); return }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
    s.onload = buildCharts
    document.head.appendChild(s)
  }

  function buildCharts() {
    if (!window.Chart) return
    const readyCount = allPhotos.filter(p => p.status === 'ready').length

    // ── Line chart ──
    if (lineRef.current) {
      if (lineInst.current) lineInst.current.destroy()
      lineInst.current = new window.Chart(lineRef.current, {
        type: 'line',
        data: {
          labels: ["Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26"],
          datasets: [{
            label: 'Gallery Visit',
            data: [0, 0, 0, 0, 0.7, 0.9, 2.0],
            borderColor: C.primary,
            backgroundColor: 'transparent',
            pointBackgroundColor: C.primary,
            pointBorderColor: C.surface,
            pointBorderWidth: 2,
            pointRadius: 5,
            tension: 0,
            fill: false,
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: {
            backgroundColor: C.surface,
            borderColor: C.border, borderWidth: 1,
            titleColor: C.secondary, bodyColor: C.primary,
            titleFont: { size: 11 }, bodyFont: { size: 15, family: "'Playfair Display',serif" },
            padding: 12, cornerRadius: 6,
            callbacks: { title: i => i[0].label, label: i => `${i.raw} visits` },
          }},
          scales: {
            x: { grid: { color: C.border, drawBorder: false, lineWidth: 0.8, dashOffset: 3 }, ticks: { font: { size: 11, family: "'DM Sans',sans-serif" }, color: C.secondary, maxRotation: 0 }, border: { display: false } },
            y: { min: 0, max: 2.4, ticks: { stepSize: 0.4, font: { size: 11, family: "'DM Sans',sans-serif" }, color: C.secondary, callback: v => v.toFixed(1) }, grid: { color: C.border, drawBorder: false, lineWidth: 0.8 }, border: { display: false } },
          },
        },
      })
    }

    // ── Bar chart ──
    if (barRef.current) {
      if (barInst.current) barInst.current.destroy()
      const evLabels = events.map(e => e.name.length > 14 ? e.name.slice(0, 14) + '…' : e.name)
      const visits   = events.map(ev => allPhotos.filter(p => p.eventName === ev.name && p.status === 'ready').length > 0 ? 2 : 0)
      const views    = events.map(ev => allPhotos.filter(p => p.eventName === ev.name).length)
      barInst.current = new window.Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: evLabels.length > 0 ? evLabels : ['No events'],
          datasets: [
            { label: 'Gallery Visit',   data: visits.length > 0 ? visits : [0], backgroundColor: C.primary, borderRadius: 4, maxBarThickness: 32 },
            { label: 'Image View',      data: views.length  > 0 ? views  : [0], backgroundColor: C.rose,    borderRadius: 4, maxBarThickness: 32 },
            { label: 'Image Download',  data: events.map(() => 0),               backgroundColor: C.sage,    borderRadius: 4, maxBarThickness: 32 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: {
            backgroundColor: C.surface, borderColor: C.border, borderWidth: 1,
            titleColor: C.secondary, bodyColor: C.primary,
            padding: 10, cornerRadius: 6,
          }},
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11, family: "'DM Sans',sans-serif" }, color: C.secondary }, border: { display: false } },
            y: { min: 0, ticks: { stepSize: 1, font: { size: 11, family: "'DM Sans',sans-serif" }, color: C.secondary }, grid: { color: C.border, lineWidth: 0.8 }, border: { display: false } },
          },
        },
      })
    }
  }

  // ── Derived metrics ──
  const totalReg       = events.length
  const totalVisits    = allPhotos.filter(p => p.status === 'ready').length > 0 ? 2 : 0
  const totalViews     = allPhotos.length
  const totalDownloads = 0
  const metricValues   = { registrations: totalReg, galleryVisits: totalVisits, imageViews: totalViews, imageDownloads: totalDownloads }

  // ── Registrations table ──
  const filteredRegs = registrations.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.eventName?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    (r.mobile || '').includes(search)
  )
  const pagedRegs  = filteredRegs.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
  const totalPages = Math.ceil(filteredRegs.length / rowsPerPage)

  function exportCSV() {
    const headers = ['Date','Event Name','Name','Mobile Number','Email ID','Image View','Image Downloads']
    const rows = filteredRegs.map(r => [r.date, r.eventName, r.name, r.mobile, r.email, r.imageView, r.imageDownloads])
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'registrations.csv'; a.click()
  }

  // ── Per-event table data for the bar chart summary ──
  const eventTableRows = events.map(ev => ({
    event:    ev.name,
    visits:   allPhotos.filter(p => p.eventName === ev.name && p.status === 'ready').length > 0 ? 1 : 0,
    views:    allPhotos.filter(p => p.eventName === ev.name).length,
    downloads: 0,
  }))

  return (
    <div className="an-root">
      <style>{css}</style>

      {/* ── Topbar ── */}
      <div className="an-topbar">
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <button
            onClick={() => router.push('/dashboard')}
            className="an-ctrl"
            style={{ width:30,height:30,padding:0,justifyContent:'center',borderRadius:7 }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M9.5 3L5 7.5 9.5 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{ width:30,height:30,background:`${C.sage}18`,border:`1px solid ${C.sage}30`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span style={{ fontSize:13,fontWeight:700,color:C.sage,fontFamily:"'Playfair Display',serif" }}>P</span>
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:21,fontWeight:600,color:C.primary,margin:0,letterSpacing:'-0.03em' }}>Analytics</h1>
        </div>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <button className="an-ctrl">Group By: Month</button>
          <button className="an-ctrl">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 1v2M9 1v2M1 5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Wed Sep 24 2025 — Tue Mar 24 2026
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding:'32px 36px',flex:1 }}>

        {/* Underline tabs */}
        <div className="an-tabs">
          {[
            { id:'analytics',     label:'Analytics',     svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="7" width="3" height="5" rx="0.5" fill="currentColor"/><rect x="5" y="4" width="3" height="8" rx="0.5" fill="currentColor"/><rect x="9" y="1" width="3" height="11" rx="0.5" fill="currentColor"/></svg> },
            { id:'registrations', label:'Registrations', svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 11.5c0-2.5 2.46-4.5 5.5-4.5s5.5 2 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
          ].map(tab => (
            <button key={tab.id} className={`an-tab${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.svg} {tab.label}
            </button>
          ))}
        </div>

        {/* ══════ ANALYTICS TAB ══════ */}
        {activeTab === 'analytics' && (
          <div className="fade-up">

            {/* Section label */}
            <p style={{ fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:C.tertiary,fontWeight:600,marginBottom:16,fontFamily:"'DM Mono',monospace" }}>
              Gallery Activity
            </p>

            {/* Metric cards */}
            <div className="an-metrics-grid">
              {METRIC_DEFS.map((def, idx) => (
                <MetricCard key={def.key} def={def} value={metricValues[def.key]} idx={idx} />
              ))}
            </div>

            {/* Line chart panel */}
            <div className="an-panel">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28 }}>
                <div>
                  <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:17,fontWeight:600,color:C.primary,margin:'0 0 5px',letterSpacing:'-0.02em' }}>Gallery Activity Visibility</h3>
                  <p style={{ fontSize:12,color:C.secondary,margin:0 }}>Cumulative gallery visits over time</p>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',border:`1px solid ${C.border}`,borderRadius:6 }}>
                  <LegendDot color={C.primary} label="Gallery Visit" />
                </div>
              </div>
              <div style={{ position:'relative',height:240 }}>
                <canvas ref={lineRef} />
              </div>
            </div>

            {/* Bar chart + table panel */}
            <div className="an-panel" style={{ marginBottom:0 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28 }}>
                <div>
                  <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:17,fontWeight:600,color:C.primary,margin:'0 0 5px',letterSpacing:'-0.02em' }}>Gallery Activity by Event</h3>
                  <p style={{ fontSize:12,color:C.secondary,margin:0 }}>Breakdown per event</p>
                </div>
                <div style={{ display:'flex',gap:16,alignItems:'center' }}>
                  <LegendDot color={C.primary} label="Gallery Visit" />
                  <LegendDot color={C.rose}    label="Image View"    />
                  <LegendDot color={C.sage}    label="Image Download" />
                </div>
              </div>

              <div style={{ position:'relative',height:160,marginBottom:28 }}>
                <canvas ref={barRef} />
              </div>

              {/* Summary table */}
              <div className="an-table-head" style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr' }}>
                {['Event','Gallery Visit','Image View','Image Download'].map(h => (
                  <span key={h} style={{ fontSize:10.5,color:C.secondary,textTransform:'uppercase',letterSpacing:'0.09em',fontWeight:600,fontFamily:"'DM Mono',monospace" }}>{h}</span>
                ))}
              </div>
              {loading ? (
                <div style={{ padding:'32px 0',textAlign:'center',color:C.secondary,fontSize:13 }}>Loading…</div>
              ) : eventTableRows.length === 0 ? (
                <div style={{ padding:'32px 0',textAlign:'center',color:C.tertiary,fontSize:13 }}>No events yet</div>
              ) : eventTableRows.map((row, i) => (
                <div key={i} className="an-table-row" style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <div style={{ width:6,height:6,borderRadius:'50%',background:C.amber,flexShrink:0 }} />
                    <span style={{ fontSize:13,fontWeight:500,color:C.primary }}>{row.event}</span>
                  </div>
                  <span style={{ fontSize:14,color:C.primary,fontFamily:"'Playfair Display',serif",fontWeight:500 }}>{row.visits}</span>
                  <span style={{ fontSize:14,color:C.primary,fontFamily:"'Playfair Display',serif",fontWeight:500 }}>{row.views}</span>
                  <span style={{ fontSize:14,color:C.primary,fontFamily:"'Playfair Display',serif",fontWeight:500 }}>{row.downloads}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ REGISTRATIONS TAB ══════ */}
        {activeTab === 'registrations' && (
          <div className="fade-up">

            {/* Search + Export */}
            <div className="an-search-row" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <div className="an-search">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color:C.tertiary,flexShrink:0 }}>
                  <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0) }}
                  placeholder="Search by name, event, email…"
                />
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button className="an-btn-primary" onClick={exportCSV}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Summary strip */}
            <div className="an-summary-grid">
              {[
                { label:'Total Registrations', val:registrations.length, accent:C.amber },
                { label:'Total Image Views',   val:allPhotos.filter(p=>p.status==='ready').length, accent:C.rose },
                { label:'Total Downloads',     val:0, accent:C.sage },
              ].map((s,i) => (
                <div key={i} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'18px 22px',display:'flex',alignItems:'center',gap:16,position:'relative',overflow:'hidden' }}>
                  <div style={{ position:'absolute',top:0,left:0,right:0,height:2.5,background:`linear-gradient(90deg,${s.accent}40,${s.accent})`,borderRadius:'10px 10px 0 0' }} />
                  <div>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:600,color:C.primary,letterSpacing:'-0.03em',lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:12,color:C.secondary,marginTop:6,fontWeight:500 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden' }}>
                          {/* DESKTOP TABLE VIEW */}
              <div className="an-table-desktop">
              {/* Header */}
              <div style={{ display:'grid',gridTemplateColumns:'120px 1fr 1fr 150px 1fr 90px 110px',gap:0,background:C.primary,padding:'12px 24px' }}>
                {['DATE','EVENT NAME','NAME','MOBILE NUMBER','EMAIL ID','IMAGE VIEW','DOWNLOADS'].map(h => (
                  <div key={h} style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.75)',letterSpacing:'.08em',fontFamily:"'DM Mono',monospace" }}>{h}</div>
                ))}
              </div>

              {/* Body */}
              {loading ? (
                <div style={{ padding:'48px 24px',textAlign:'center',color:C.secondary,fontSize:13 }}>Loading registrations…</div>
              ) : pagedRegs.length === 0 ? (
                <div style={{ padding:'56px 24px',textAlign:'center' }}>
                  <div style={{ width:48,height:48,borderRadius:12,background:`${C.sage}12`,border:`1px solid ${C.sage}25`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="7" r="3.5" stroke={C.sage} strokeWidth="1.5"/><path d="M3 19c0-4 3.58-7 8-7s8 3 8 7" stroke={C.sage} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <p style={{ fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:500,color:C.primary,marginBottom:6 }}>
                    {search ? 'No results found' : 'No registrations yet'}
                  </p>
                  <p style={{ fontSize:13,color:C.secondary,lineHeight:1.6 }}>
                    {search ? 'Try a different search term.' : 'Registration data will appear here once guests sign up for your events.'}
                  </p>
                </div>
              ) : pagedRegs.map((r, i) => (
                  <div key={i} className="an-reg-table-row"
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ fontSize:12,color:C.secondary,fontFamily:"'DM Mono',monospace" }}>{r.date}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.primary,paddingRight:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{r.eventName}</div>
                  <div style={{ fontSize:13,color:C.primary,fontWeight:500 }}>{r.name}</div>
                  <div style={{ fontSize:12,color:C.secondary,fontFamily:"'DM Mono',monospace" }}>{r.mobile}</div>
                  <div style={{ fontSize:12,color:'#6366f1',fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',paddingRight:12 }}>{r.email}</div>
                  <div>
                    <span style={{ background:r.imageView>0?`${C.sage}18`:`${C.borderLight}`,color:r.imageView>0?C.sage:C.tertiary,padding:'2px 8px',borderRadius:20,fontSize:11,fontFamily:"'DM Mono',monospace" }}>{r.imageView}</span>
                  </div>
                  <div>
                    <span style={{ background:C.borderLight,color:C.tertiary,padding:'2px 8px',borderRadius:20,fontSize:11,fontFamily:"'DM Mono',monospace" }}>{r.imageDownloads}</span>
                  </div>
                </div>
              ))}


              </div>
              
              {/* MOBILE CARD VIEW */}
              <div className="an-table-mobile">
                {loading ? (
                  <div style={{ padding:'48px 24px',textAlign:'center',color:C.secondary,fontSize:13 }}>Loading registrations…</div>
                ) : pagedRegs.length === 0 ? (
                  <div style={{ padding:'56px 24px',textAlign:'center' }}>
                    <div style={{ width:48,height:48,borderRadius:12,background:`${C.sage}12`,border:`1px solid ${C.sage}25`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="7" r="3.5" stroke={C.sage} strokeWidth="1.5"/><path d="M3 19c0-4 3.58-7 8-7s8 3 8 7" stroke={C.sage} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <p style={{ fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:500,color:C.primary,marginBottom:6 }}>
                      {search ? 'No results found' : 'No registrations yet'}
                    </p>
                    <p style={{ fontSize:13,color:C.secondary,lineHeight:1.6 }}>
                      {search ? 'Try a different search term.' : 'Registration data will appear here once guests sign up for your events.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ padding:'16px' }}>
                    {pagedRegs.map((r, i) => (
                      <div key={i} className="an-reg-card">
                        <div className="an-reg-card-row">
                          <div style={{ flex:1 }}>
                            <div className="an-reg-card-label">Name</div>
                            <div className="an-reg-card-value" style={{ fontWeight:600 }}>{r.name}</div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div className="an-reg-card-label">Date</div>
                            <div className="an-reg-card-value" style={{ fontFamily:"'DM Mono',monospace",fontSize:11 }}>{r.date}</div>
                          </div>
                        </div>
                        
                        <div className="an-reg-card-row">
                          <div style={{ flex:1 }}>
                            <div className="an-reg-card-label">Event</div>
                            <div className="an-reg-card-value" style={{ fontWeight:600,fontSize:12 }}>{r.eventName}</div>
                          </div>
                        </div>
                        
                        <div className="an-reg-card-row">
                          <div style={{ flex:1 }}>
                            <div className="an-reg-card-label">Mobile</div>
                            <div className="an-reg-card-value" style={{ fontFamily:"'DM Mono',monospace",fontSize:12 }}>{r.mobile}</div>
                          </div>
                        </div>
                        
                        <div className="an-reg-card-row">
                          <div style={{ flex:1 }}>
                            <div className="an-reg-card-label">Email</div>
                            <div className="an-reg-card-value" style={{ color:'#6366f1',fontSize:12,wordBreak:'break-all' }}>{r.email}</div>
                          </div>
                        </div>
                        
                        <div className="an-reg-card-row">
                          <div>
                            <div className="an-reg-card-label">Image Views</div>
                            <span style={{ background:r.imageView>0?`${C.sage}18`:`${C.borderLight}`,color:r.imageView>0?C.sage:C.tertiary,padding:'4px 10px',borderRadius:20,fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:600 }}>{r.imageView}</span>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div className="an-reg-card-label">Downloads</div>
                            <span style={{ background:C.borderLight,color:C.tertiary,padding:'4px 10px',borderRadius:20,fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:600 }}>{r.imageDownloads}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div style={{ display:'flex',alignItems:'center',justifyContent:'flex-end',padding:'12px 24px',borderTop:`1px solid ${C.border}`,gap:16,flexWrap:'wrap' }}>
                <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:C.secondary }}>
                  <span>Rows per page:</span>
                  <select className="rpp-select" value={rowsPerPage} onChange={e=>{setRowsPerPage(+e.target.value);setPage(0)}}>
                    {[5,10,25].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <span style={{ fontSize:12,color:C.secondary,minWidth:80,textAlign:'center' }}>
                  {filteredRegs.length===0?'0 results':`${page*rowsPerPage+1}–${Math.min((page+1)*rowsPerPage,filteredRegs.length)} of ${filteredRegs.length}`}
                </span>
                <div style={{ display:'flex',gap:4 }}>
                  {[['|‹',0],['‹',page-1],['>',page+1],['>|',totalPages-1]].map(([icon,target],i)=>(
                    <button key={i} className="pg-btn" onClick={()=>setPage(Math.max(0,Math.min(totalPages-1,target)))} disabled={target<0||target>=totalPages}>{icon}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
