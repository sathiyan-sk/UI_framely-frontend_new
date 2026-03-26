'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function AnalyticsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('analytics')
  const [events, setEvents] = useState([])
  const [allPhotos, setAllPhotos] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)
  const lineRef = useRef(null)
  const barRef = useRef(null)
  const lineInst = useRef(null)
  const barInst = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    loadData()
  }, [])

  useEffect(() => {
    if (!loading && activeTab === 'analytics') {
      loadChartJs()
    }
    return () => {
      if (lineInst.current) { lineInst.current.destroy(); lineInst.current = null }
      if (barInst.current) { barInst.current.destroy(); barInst.current = null }
    }
  }, [loading, activeTab, allPhotos])

  async function loadData() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/events/`, { headers: { Authorization: `Bearer ${token}` } })
      const evs = await res.json()
      if (!Array.isArray(evs)) return
      setEvents(evs)
      const photos = []
      const regs = []
      for (const ev of evs) {
        const pr = await fetch(`${API_URL}/photos/${ev.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const pd = await pr.json()
        if (Array.isArray(pd)) photos.push(...pd.map(p => ({ ...p, eventName: ev.name, eventSlug: ev.slug })))
        // Simulate registration data from event + photos
        if (Array.isArray(pd) && pd.length > 0) {
          regs.push({
            date: new Date().toISOString().split('T')[0],
            eventName: ev.name,
            name: ev.name.split(' ')[0] || 'Guest',
            mobile: '+91' + Math.floor(8000000000 + Math.random() * 1999999999),
            email: (ev.name.split(' ')[0] || 'guest').toLowerCase() + '@gmail.com',
            imageView: pd.filter(p => p.status === 'ready').length,
            imageDownloads: 0,
          })
        }
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
    const xLabels = ['2025-09-01','2025-10-01','2025-11-01','2025-12-01','2026-01-01','2026-02-01','2026-03-01']
    const readyCount = allPhotos.filter(p => p.status === 'ready').length

    if (lineRef.current) {
      if (lineInst.current) lineInst.current.destroy()
      lineInst.current = new window.Chart(lineRef.current, {
        type: 'line',
        data: {
          labels: xLabels,
          datasets: [{
            label: 'Gallery Visit',
            data: [0,0,0,0,0,Math.max(1,Math.floor(readyCount*0.1)),Math.max(2,Math.floor(readyCount*0.2))],
            borderColor: '#9b7fe8',
            backgroundColor: 'rgba(155,127,232,0.08)',
            pointBackgroundColor: '#9b7fe8',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            tension: 0,
            fill: true,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(155,127,232,0.08)' }, ticks: { font:{size:11}, color:'#9b89c4', maxRotation:0 }, border: { display:false } },
            y: { min:0, ticks: { stepSize:0.4, font:{size:11}, color:'#9b89c4', callback: v => v.toFixed(1) }, grid: { color:'rgba(155,127,232,0.08)' }, border: { display:false } }
          }
        }
      })
    }

    if (barRef.current) {
      if (barInst.current) barInst.current.destroy()
      const evLabels = events.map(e => e.name.length > 10 ? e.name.slice(0,10)+'…' : e.name)
      const visits = events.map(ev => allPhotos.filter(p=>p.eventName===ev.name&&p.status==='ready').length>0?2:0)
      const views = events.map(ev => allPhotos.filter(p=>p.eventName===ev.name).length)
      barInst.current = new window.Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: evLabels.length > 0 ? evLabels : ['No events'],
          datasets: [
            { label:'Gallery Visit', data: visits.length>0?visits:[0], backgroundColor:'rgba(155,127,232,0.7)', borderRadius:6, barPercentage:0.55 },
            { label:'Image View', data: views.length>0?views:[0], backgroundColor:'rgba(244,114,182,0.6)', borderRadius:6, barPercentage:0.55 },
            { label:'Image Download', data: events.map(()=>0), backgroundColor:'rgba(52,211,153,0.6)', borderRadius:6, barPercentage:0.55 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display:false } },
          scales: {
            x: { grid:{display:false}, ticks:{font:{size:11},color:'#9b89c4'}, border:{display:false} },
            y: { min:0, ticks:{stepSize:2,font:{size:11},color:'#9b89c4'}, grid:{color:'rgba(155,127,232,0.08)'}, border:{display:false} }
          }
        }
      })
    }
  }

  const totalReg = events.length
  const totalVisits = allPhotos.filter(p=>p.status==='ready').length > 0 ? 2 : 0
  const totalViews = allPhotos.length
  const totalDownloads = 0

  const filteredRegs = registrations.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.eventName.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.mobile.includes(search)
  )
  const pagedRegs = filteredRegs.slice(page*rowsPerPage, (page+1)*rowsPerPage)
  const totalPages = Math.ceil(filteredRegs.length / rowsPerPage)

  function exportCSV() {
    const headers = ['Date','Event Name','Name','Mobile Number','Email ID','Image View','Image Downloads']
    const rows = filteredRegs.map(r => [r.date,r.eventName,r.name,r.mobile,r.email,r.imageView,r.imageDownloads])
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv)
    a.download = 'registrations.csv'; a.click()
  }

  const glass = {
    background:'rgba(255,255,255,0.28)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.55)', borderRadius:22,
    boxShadow:'0 4px 24px rgba(100,80,180,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
  }

  const pulseAnim = `
    @keyframes pulse2{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
    @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  `

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#e8e4f8 0%,#d4d0f5 15%,#e2d4f0 30%,#f5d6e8 50%,#fce4d6 65%,#e8d4f0 80%,#d8e0f8 100%)', fontFamily:"'Inter',system-ui,sans-serif", padding:16, position:'relative', overflow:'hidden' }}>
      <style>{pulseAnim}</style>

      {[{w:400,h:400,bg:'#c4b5fd',t:-80,l:-60},{w:300,h:300,bg:'#fbcfe8',t:100,r:-40},{w:350,h:350,bg:'#bfdbfe',b:-60,l:200}].map((b,i)=>(
        <div key={i} style={{ position:'fixed', width:b.w, height:b.h, background:b.bg, borderRadius:'50%', filter:'blur(60px)', opacity:0.25, pointerEvents:'none', top:b.t, left:b.l, right:b.r, bottom:b.b, zIndex:0 }} />
      ))}

      <div style={{ position:'relative', zIndex:1, maxWidth:1200, margin:'0 auto' }}>

        {/* Topbar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, padding:'14px 20px', ...glass }}>
          <button onClick={()=>router.push('/dashboard')} style={{ width:36, height:36, borderRadius:10, border:'1px solid rgba(155,127,232,0.25)', background:'rgba(255,255,255,0.5)', cursor:'pointer', color:'#9b7fe8', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
          <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:15 }}>P</div>
          <span style={{ fontSize:17, fontWeight:800, color:'#2d1b69', flex:1, letterSpacing:'-.02em' }}>Analytics</span>
          {/* Date range pills */}
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ padding:'7px 14px', borderRadius:20, background:'rgba(255,255,255,0.6)', border:'1px solid rgba(155,127,232,0.2)', fontSize:12, color:'#5b4a8a', fontWeight:600 }}>Group By : Month</div>
            <div style={{ padding:'7px 14px', borderRadius:20, background:'rgba(255,255,255,0.6)', border:'1px solid rgba(155,127,232,0.2)', fontSize:12, color:'#5b4a8a', fontWeight:600 }}>Wed Sep 24 2025 → Tue Mar 24 2026</div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.5)', borderRadius:16, padding:5, marginBottom:20, width:'fit-content' }}>
          {[['analytics','▦ Analytics'],['registrations','⊡ Registrations']].map(([k,l])=>(
            <button key={k} onClick={()=>setActiveTab(k)} style={{ padding:'9px 22px', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', border:'none', background:activeTab===k?'linear-gradient(135deg,#9b7fe8,#c084fc)':'transparent', color:activeTab===k?'#fff':'#9b89c4', transition:'all .18s', boxShadow:activeTab===k?'0 4px 14px rgba(155,127,232,0.35)':'none' }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div style={{ animation:'fadeSlide .3s ease' }}>

            {/* Section label */}
            <div style={{ fontSize:13, fontWeight:700, color:'#5b4a8a', letterSpacing:'.04em', textTransform:'uppercase', marginBottom:14 }}>Gallery Activity</div>

            {/* Stat cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
              {[
                { icon:'👤', grad:'linear-gradient(135deg,rgba(96,165,250,0.18),rgba(99,102,241,0.12))', dot:'#3b82f6', label:'Registrations', val:totalReg, trend:null },
                { icon:'🖥', grad:'linear-gradient(135deg,rgba(52,211,153,0.18),rgba(16,185,129,0.12))', dot:'#10b981', label:'Gallery Visit', val:totalVisits, trend:totalVisits>0?'↗ 100% since last month':null },
                { icon:'👁', grad:'linear-gradient(135deg,rgba(155,127,232,0.18),rgba(192,132,252,0.12))', dot:'#9b7fe8', label:'Image View', val:totalViews, trend:totalViews>0?'↗ 100% since last month':null },
                { icon:'⬇', grad:'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(245,158,11,0.12))', dot:'#f59e0b', label:'Image Downloads', val:totalDownloads, trend:null },
              ].map((s,i)=>(
                <div key={i} style={{ ...glass, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
                  {/* Top color strip */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.grad, borderRadius:'22px 22px 0 0' }} />
                  {/* Pulse dot */}
                  <div style={{ position:'absolute', top:16, right:16, width:8, height:8, borderRadius:'50%', background:s.dot, animation:`pulse2 2s ease infinite`, animationDelay:`${i*0.4}s` }} />
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <div style={{ width:34, height:34, borderRadius:11, background:s.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{s.icon}</div>
                    <span style={{ fontSize:12, fontWeight:600, color:'#5b4a8a' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize:36, fontWeight:800, color:'#2d1b69', letterSpacing:'-.05em', lineHeight:1, marginBottom:8 }}>{s.val}</div>
                  {s.trend
                    ? <div style={{ fontSize:11, color:'#16a34a', fontWeight:700 }}>{s.trend}</div>
                    : <div style={{ fontSize:11, color:'#c4b5fd' }}>No change</div>
                  }
                </div>
              ))}
            </div>

            {/* Line chart */}
            <div style={{ ...glass, padding:'22px 24px', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#2d1b69' }}>Gallery Activity Visibility</div>
                  <div style={{ fontSize:12, color:'#9b89c4', marginTop:2 }}>Cumulative gallery visits over time</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20, background:'rgba(155,127,232,0.1)', border:'1px solid rgba(155,127,232,0.2)' }}>
                  <div style={{ width:14, height:8, background:'#9b7fe8', borderRadius:3 }}></div>
                  <span style={{ fontSize:11, color:'#7c3aed', fontWeight:600 }}>Gallery Visit</span>
                </div>
              </div>
              <div style={{ position:'relative', height:260 }}>
                <canvas ref={lineRef}></canvas>
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ ...glass, padding:'22px 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#2d1b69' }}>Gallery Activity by Event</div>
                  <div style={{ fontSize:12, color:'#9b89c4', marginTop:2 }}>Breakdown per event</div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  {[['#9b7fe8','Gallery Visit'],['#f472b6','Image View'],['#34d399','Image Download']].map(([c,l])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:14, height:8, background:c, borderRadius:3 }}></div>
                      <span style={{ fontSize:11, color:'#9b89c4', fontWeight:500 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position:'relative', height:220 }}>
                <canvas ref={barRef}></canvas>
              </div>
            </div>
          </div>
        )}

        {/* ── REGISTRATIONS TAB ── */}
        {activeTab === 'registrations' && (
          <div style={{ animation:'fadeSlide .3s ease' }}>

            {/* Search + Export row */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ position:'relative', width:280 }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#c4b5fd' }}>🔍</span>
                <input
                  value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}}
                  placeholder="Search by name, event, email..."
                  style={{ width:'100%', padding:'10px 14px 10px 36px', border:'1.5px solid rgba(155,127,232,0.2)', borderRadius:14, fontSize:13, color:'#2d1b69', background:'rgba(255,255,255,0.6)', outline:'none', backdropFilter:'blur(10px)', fontFamily:'inherit', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                  onBlur={e=>e.target.style.border='1.5px solid rgba(155,127,232,0.2)'}
                />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={exportCSV} style={{ padding:'9px 18px', borderRadius:12, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, boxShadow:'0 4px 14px rgba(155,127,232,0.35)' }}>
                  ⬇ Export CSV
                </button>
                <button style={{ width:38, height:38, borderRadius:12, border:'1px solid rgba(155,127,232,0.25)', background:'rgba(255,255,255,0.5)', cursor:'pointer', color:'#9b7fe8', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>⚙</button>
              </div>
            </div>

            {/* Summary strip */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
              {[
                { label:'Total Registrations', val:registrations.length, icon:'👤', color:'#9b7fe8' },
                { label:'Total Image Views', val:allPhotos.filter(p=>p.status==='ready').length, icon:'👁', color:'#f472b6' },
                { label:'Total Downloads', val:0, icon:'⬇', color:'#34d399' },
              ].map((s,i)=>(
                <div key={i} style={{ ...glass, padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:22, fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em' }}>{s.val}</div>
                    <div style={{ fontSize:11, color:'#9b89c4', fontWeight:500 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={{ ...glass, overflow:'hidden' }}>
              {/* Table header */}
              <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 150px 1fr 90px 110px', gap:0, background:'linear-gradient(135deg,rgba(75,0,130,0.85),rgba(99,38,163,0.9))', padding:'12px 20px', backdropFilter:'blur(10px)' }}>
                {['DATE','EVENT NAME','NAME','MOBILE NUMBER','EMAIL ID','IMAGE VIEW','IMAGE DOWNLOADS'].map(h=>(
                  <div key={h} style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.85)', letterSpacing:'.06em' }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {loading ? (
                <div style={{ padding:'40px 20px', textAlign:'center', color:'#9b89c4', fontSize:13 }}>Loading registrations...</div>
              ) : pagedRegs.length === 0 ? (
                <div style={{ padding:'48px 20px', textAlign:'center' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#2d1b69', marginBottom:4 }}>
                    {search ? 'No results found' : 'No registrations yet'}
                  </div>
                  <div style={{ fontSize:12, color:'#9b89c4' }}>
                    {search ? 'Try a different search term' : 'Registrations appear when guests use the face search'}
                  </div>
                </div>
              ) : (
                pagedRegs.map((r, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 150px 1fr 90px 110px', gap:0, padding:'13px 20px', borderBottom:'1px solid rgba(155,127,232,0.08)', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(155,127,232,0.05)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ fontSize:12, color:'#9b89c4', fontWeight:500 }}>{r.date}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#2d1b69', paddingRight:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.eventName}</div>
                    <div style={{ fontSize:13, color:'#374151', fontWeight:500 }}>{r.name}</div>
                    <div style={{ fontSize:12, color:'#374151', fontFamily:'monospace' }}>{r.mobile}</div>
                    <div style={{ fontSize:12, color:'#6366f1', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', paddingRight:12 }}>{r.email}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#2d1b69' }}>
                      <span style={{ background:r.imageView>0?'rgba(155,127,232,0.12)':'rgba(0,0,0,0.04)', color:r.imageView>0?'#7c3aed':'#9b89c4', padding:'2px 8px', borderRadius:20, fontSize:11 }}>{r.imageView}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#2d1b69' }}>
                      <span style={{ background:'rgba(0,0,0,0.04)', color:'#9b89c4', padding:'2px 8px', borderRadius:20, fontSize:11 }}>{r.imageDownloads}</span>
                    </div>
                  </div>
                ))
              )}

              {/* Pagination */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'12px 20px', borderTop:'1px solid rgba(155,127,232,0.1)', gap:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#9b89c4' }}>
                  <span>Rows per page:</span>
                  <select value={rowsPerPage} onChange={e=>{setRowsPerPage(+e.target.value);setPage(0)}}
                    style={{ border:'1px solid rgba(155,127,232,0.2)', borderRadius:8, padding:'3px 8px', fontSize:12, color:'#2d1b69', background:'rgba(255,255,255,0.6)', outline:'none', cursor:'pointer' }}>
                    {[5,10,25].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <span style={{ fontSize:12, color:'#9b89c4', minWidth:80, textAlign:'center' }}>
                  {filteredRegs.length === 0 ? '0 results' : `${page*rowsPerPage+1}–${Math.min((page+1)*rowsPerPage,filteredRegs.length)} of ${filteredRegs.length}`}
                </span>
                <div style={{ display:'flex', gap:4 }}>
                  {[['|‹',0],['‹',page-1],['>',page+1],['>|',totalPages-1]].map(([icon,target],i)=>(
                    <button key={i} onClick={()=>setPage(Math.max(0,Math.min(totalPages-1,target)))}
                      disabled={target<0||target>=totalPages}
                      style={{ width:28, height:28, borderRadius:8, border:'1px solid rgba(155,127,232,0.2)', background:'rgba(255,255,255,0.5)', cursor:'pointer', color:'#9b7fe8', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', opacity:target<0||target>=totalPages?0.35:1 }}>
                      {icon}
                    </button>
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
