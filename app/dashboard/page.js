'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function QRCanvas({ url, size = 140 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || !url) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    canvas.width = size; canvas.height = size
    const hash = url.split('').reduce((a,c) => ((a<<5)-a+c.charCodeAt(0))|0, 0)
    const cell = size / 21
    const colors = ['#9b7fe8','#c084fc','#f472b6','#60a5fa']
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillRect(0,0,size,size)
    const drawFinder = (x,y) => {
      ctx.fillStyle='#2d1b69'; ctx.fillRect(x*cell,y*cell,7*cell,7*cell)
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect((x+1)*cell,(y+1)*cell,5*cell,5*cell)
      ctx.fillStyle='#9b7fe8'; ctx.fillRect((x+2)*cell,(y+2)*cell,3*cell,3*cell)
    }
    drawFinder(0,0); drawFinder(14,0); drawFinder(0,14)
    for(let i=0;i<21;i++) for(let j=0;j<21;j++) {
      if((i<8&&j<8)||(i<8&&j>12)||(i>12&&j<8)) continue
      if(Math.abs((hash*i+j*7+i*j)%3)===0) {
        ctx.fillStyle = colors[Math.abs((hash+i*j)%colors.length)]
        ctx.beginPath(); ctx.arc((i+.5)*cell,(j+.5)*cell,cell*.38,0,Math.PI*2); ctx.fill()
      }
    }
    ctx.fillStyle='rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(size/2,size/2,cell*1.8,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#9b7fe8'; ctx.font=`bold ${cell*1.4}px Inter`; ctx.textAlign='center'; ctx.textBaseline='middle'
    ctx.fillText('P',size/2,size/2)
  }, [url, size])
  return <canvas ref={ref} style={{ borderRadius:10 }} />
}

export default function DashboardHome() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [readyPhotos, setReadyPhotos] = useState(0)
  const [recentPhotos, setRecentPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrIdx, setQrIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  // ── NEW: plan state ──────────────────────────────────────────────────────
  const [planData, setPlanData] = useState(null)

  const eventColors = ['linear-gradient(135deg,#9b7fe8,#c084fc)','linear-gradient(135deg,#f472b6,#ec4899)','linear-gradient(135deg,#60a5fa,#3b82f6)','linear-gradient(135deg,#34d399,#10b981)','linear-gradient(135deg,#fbbf24,#f59e0b)','linear-gradient(135deg,#a78bfa,#8b5cf6)']
  const statusMap = ['Live','Processing','Complete']
  const badgeColors = { Live:{bg:'rgba(22,163,74,0.15)',color:'#15803d',border:'rgba(22,163,74,0.25)'}, Processing:{bg:'rgba(245,158,11,0.15)',color:'#d97706',border:'rgba(245,158,11,0.25)'}, Complete:{bg:'rgba(99,102,241,0.15)',color:'#4338ca',border:'rgba(99,102,241,0.25)'} }

  useEffect(() => {
    loadData()
    loadPlan()  // ── NEW ──
  }, [])

  async function loadData() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/events/`, { headers: { Authorization: `Bearer ${token}` } })
      const evs = await res.json()
      if (!Array.isArray(evs)) return
      setEvents(evs)
      let tp=0, rp=0, photos=[]
      for (const ev of evs.slice(0,3)) {
        const pr = await fetch(`${API_URL}/photos/${ev.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const pd = await pr.json()
        if (Array.isArray(pd)) {
          tp += pd.length; rp += pd.filter(p=>p.status==='ready').length
          photos.push(...pd.filter(p=>p.url).slice(0,3))
        }
      }
      setTotalPhotos(tp); setReadyPhotos(rp); setRecentPhotos(photos)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  // ── NEW: load real plan from backend ────────────────────────────────────
  async function loadPlan() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/payments/my-plan`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.current_plan) setPlanData(data)
    } catch(e) { console.error('Plan load failed:', e) }
  }

  // ── CHANGED: dynamic plan values (fallback to free defaults) ─────────────
  const planName = planData ? planData.plan_name : 'Starter'
  const planPhotosUsed = planData ? planData.photos_used : totalPhotos
  const planPhotosLimit = planData ? planData.photos_limit : 1000
  const planStorageGB = planData ? planData.storage_limit_gb : 10
  const storageUsedGB = planData ? (planData.storage_used_bytes / (1024**3)).toFixed(1) : '0.0'
  const storagePct = Math.min(Math.round((planPhotosUsed / planPhotosLimit) * 100), 100)

  // Keep storageGB for the storage card (top row) — same value
  const storageGB = storageUsedGB

  const planFeatures = planName === 'Pro'
    ? ['50,000 photos', '50 GB storage', 'AI face recognition', 'Guest selfie search', 'WhatsApp sharing']
    : planName === 'Elite'
    ? ['1,00,000 photos', '100 GB storage', 'AI face recognition', 'Guest selfie search', 'Custom branding']
    : ['1,000 photos', '10 GB storage', 'AI face recognition', 'Guest selfie search', 'QR code sharing']

  const currentEvent = events[qrIdx]
  const guestUrl = currentEvent ? `${typeof window!=='undefined'?window.location.origin:'http://localhost:3000'}/guest/${currentEvent.slug}` : ''

  function copyLink() { navigator.clipboard.writeText(guestUrl); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  const glass = { background:'rgba(255,255,255,0.28)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.55)', borderRadius:22, boxShadow:'0 4px 24px rgba(100,80,180,0.08),inset 0 1px 0 rgba(255,255,255,0.5)', transition:'all .2s' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}`}</style>

      {/* Row 1 — Hero + stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr', gap:14 }}>
        <div style={{ background:'linear-gradient(135deg,rgba(155,127,232,0.28),rgba(219,171,245,0.22),rgba(252,196,220,0.28))', border:'1px solid rgba(255,255,255,0.6)', borderRadius:22, padding:'22px 24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:160, height:160, background:'#c084fc', borderRadius:'50%', filter:'blur(40px)', opacity:.22, top:-60, right:-30 }} />
          <div style={{ fontSize:11, fontWeight:600, color:'#8b6bc4', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6 }}>Good morning</div>
          <div style={{ fontSize:26, fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', lineHeight:1.1, marginBottom:4 }}>Your Studio<br/>Dashboard</div>
          <div style={{ fontSize:13, color:'#7c6aaa', marginBottom:18 }}>AI face recognition · Indian wedding specialist</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[{val:events.length,lbl:'Total Events',trend:'Active'},{val:totalPhotos.toLocaleString(),lbl:'Photos',trend:'↑ 98.5% accuracy'}].map((s,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.6)', borderRadius:14, padding:'10px 14px' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#2d1b69' }}>{s.val}</div>
                <div style={{ fontSize:10, color:'#9b7fe8', fontWeight:600, marginTop:2 }}>{s.lbl}</div>
                <div style={{ fontSize:10, color:'#16a34a', fontWeight:600, marginTop:1 }}>{s.trend}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...glass, padding:'18px 20px' }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'rgba(155,127,232,0.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, fontSize:18 }}>👥</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#4b0082', lineHeight:1 }}>{readyPhotos.toLocaleString()}</div>
          <div style={{ fontSize:11, fontWeight:600, color:'#9b7fe8', textTransform:'uppercase', letterSpacing:'.04em', marginTop:4 }}>Photos Ready</div>
          <div style={{ height:4, background:'rgba(155,127,232,0.15)', borderRadius:4, marginTop:12, overflow:'hidden' }}>
            <div style={{ height:4, width:`${totalPhotos>0?Math.round(readyPhotos/totalPhotos*100):0}%`, background:'linear-gradient(90deg,#9b7fe8,#c084fc)', borderRadius:4 }} />
          </div>
          <div style={{ fontSize:11, color:'#9b89c4', marginTop:5 }}>{totalPhotos>0?Math.round(readyPhotos/totalPhotos*100):0}% processed</div>
        </div>
        {/* ── CHANGED: storage card now shows plan-based limit ── */}
        <div style={{ ...glass, padding:'18px 20px', background:'linear-gradient(135deg,rgba(251,207,232,0.38),rgba(252,231,243,0.28))' }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'rgba(219,39,119,0.12)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, fontSize:18 }}>☁</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#831843', lineHeight:1 }}>{storagePct}%</div>
          <div style={{ fontSize:11, fontWeight:600, color:'#db2777', textTransform:'uppercase', letterSpacing:'.04em', marginTop:4 }}>Storage Used</div>
          <div style={{ height:4, background:'rgba(219,39,119,0.12)', borderRadius:4, marginTop:12, overflow:'hidden' }}>
            <div style={{ height:4, width:`${Math.max(storagePct,2)}%`, background:'linear-gradient(90deg,#f472b6,#ec4899)', borderRadius:4 }} />
          </div>
          <div style={{ fontSize:11, color:'#9b89c4', marginTop:5 }}>{storageGB} / {planStorageGB} GB</div>
        </div>
      </div>

      {/* Gallery Activity — UNCHANGED */}
      <div style={{ ...glass, padding:'20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#2d1b69' }}>Gallery Activity</span>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(155,127,232,0.12)', color:'#7c3aed', border:'1px solid rgba(155,127,232,0.2)' }}>Last 7 Days</span>
          </div>
          <Link href="/dashboard/analytics" style={{ fontSize:11, color:'#9b7fe8', fontWeight:600, textDecoration:'none' }}>Full analytics →</Link>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            {icon:'👤',grad:'linear-gradient(135deg,rgba(96,165,250,0.18),rgba(99,102,241,0.12))',dot:'#3b82f6',label:'Registrations',val:events.length},
            {icon:'🖥',grad:'linear-gradient(135deg,rgba(52,211,153,0.18),rgba(16,185,129,0.12))',dot:'#10b981',label:'Gallery Visits',val:readyPhotos>0?2:0,trend:readyPhotos>0?'+100%':null},
            {icon:'👁',grad:'linear-gradient(135deg,rgba(155,127,232,0.18),rgba(192,132,252,0.12))',dot:'#9b7fe8',label:'Image Views',val:totalPhotos,trend:totalPhotos>0?'+100%':null},
            {icon:'⬇',grad:'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(245,158,11,0.12))',dot:'#f59e0b',label:'Downloads',val:0},
          ].map((s,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.6)', borderRadius:16, padding:'14px 16px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.grad, borderRadius:'16px 16px 0 0' }} />
              <div style={{ position:'absolute', top:14, right:14, width:8, height:8, borderRadius:'50%', background:s.dot, animation:'pulse 2s ease infinite', animationDelay:`${i*0.4}s` }} />
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:s.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{s.icon}</div>
                <span style={{ fontSize:11, fontWeight:600, color:'#5b4a8a' }}>{s.label}</span>
              </div>
              <div style={{ fontSize:30, fontWeight:800, color:'#2d1b69', letterSpacing:'-.04em', lineHeight:1, marginBottom:5 }}>{s.val}</div>
              {s.trend ? <div style={{ fontSize:11, color:'#16a34a', fontWeight:700 }}>↗ {s.trend} since last month</div>
                : <div style={{ fontSize:10, color:'#c4b5fd' }}>No change</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — UNCHANGED */}
      <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:14 }}>
        <div style={{ ...glass, padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#2d1b69' }}>Active Events</span>
            <Link href="/dashboard/events" style={{ width:28, height:28, borderRadius:9, background:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', fontSize:14, color:'#8b7ab5' }}>→</Link>
          </div>
          {loading ? <div style={{ textAlign:'center', padding:24, color:'#9b89c4', fontSize:13 }}>Loading...</div>
            : events.length === 0 ? <div style={{ textAlign:'center', padding:24, color:'#9b89c4', fontSize:13 }}>No events yet</div>
            : events.slice(0,5).map((ev,i) => {
              const st=statusMap[i%3]; const bc=badgeColors[st]
              return (
                <Link key={ev.id} href={`/dashboard/events/${ev.id}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:i<4?'1px solid rgba(255,255,255,0.35)':'none', textDecoration:'none' }}>
                  <div style={{ width:42, height:42, borderRadius:11, background:eventColors[i%6], display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:15, fontWeight:800, flexShrink:0 }}>{ev.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#2d1b69', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ev.name}</div>
                    <div style={{ fontSize:11, color:'#9b89c4' }}>{ev.event_type||'Event'} · {ev.location||'India'}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:bc.bg, color:bc.color, border:`1px solid ${bc.border}`, flexShrink:0 }}>{st}</span>
                </Link>
              )
            })
          }
        </div>
        <div style={{ ...glass, padding:'18px 20px' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#2d1b69', marginBottom:14 }}>Quick Actions</div>
          {[
            {icon:'➕',bg:'rgba(155,127,232,0.15)',title:'Create New Event',sub:'Wedding, birthday, corporate',href:'/dashboard/create-event'},
            {icon:'📤',bg:'rgba(219,39,119,0.1)',title:'Upload Photos',sub:'Batch upload up to 500 photos',href:'/dashboard/events'},
            {icon:'🔍',bg:'rgba(20,184,166,0.12)',title:'View Analytics',sub:'Gallery stats and registrations',href:'/dashboard/analytics'},
          ].map((q,i)=>(
            <Link key={i} href={q.href} style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.6)', borderRadius:14, display:'flex', alignItems:'center', gap:12, textDecoration:'none', marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:11, background:q.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{q.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#2d1b69' }}>{q.title}</div>
                <div style={{ fontSize:11, color:'#9b89c4', marginTop:1 }}>{q.sub}</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:14, color:'#c4b5fd' }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Row 3 — Photos + QR + Plan */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>

        {/* Recent Uploads — UNCHANGED */}
        <div style={{ ...glass, padding:'18px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#2d1b69' }}>Recent Uploads</span>
            <Link href="/dashboard/media" style={{ fontSize:11, color:'#9b7fe8', textDecoration:'none', fontWeight:600 }}>View all →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {recentPhotos.length > 0
              ? recentPhotos.slice(0,8).map((p,i)=>(
                <div key={i} style={{ aspectRatio:1, borderRadius:10, overflow:'hidden', position:'relative' }}>
                  <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';e.target.parentNode.style.background=eventColors[i%6]}} />
                  <div style={{ position:'absolute', top:4, right:4, width:7, height:7, borderRadius:'50%', background:p.status==='ready'?'#22c55e':'#f59e0b', border:'1.5px solid rgba(255,255,255,0.8)' }} />
                </div>
              ))
              : [...Array(8)].map((_,i)=><div key={i} style={{ aspectRatio:1, borderRadius:10, background:eventColors[i%6] }} />)
            }
          </div>
        </div>

        {/* QR Portal — UNCHANGED */}
        <div style={{ ...glass, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:120, height:120, background:'#c084fc', borderRadius:'50%', filter:'blur(40px)', opacity:.1, top:-20, right:-20 }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#2d1b69' }}>Guest QR Portal</div>
              <div style={{ fontSize:11, color:'#9b89c4', marginTop:1 }}>Scan to find photos</div>
            </div>
            {events.length > 0 && (
              <div style={{ display:'flex', gap:4 }}>
                <button onClick={()=>setQrIdx(Math.max(0,qrIdx-1))} disabled={qrIdx===0} style={{ width:24,height:24,borderRadius:8,border:'1px solid rgba(155,127,232,0.25)',background:'rgba(255,255,255,0.5)',cursor:'pointer',color:'#9b7fe8',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',opacity:qrIdx===0?0.4:1 }}>‹</button>
                <button onClick={()=>setQrIdx(Math.min(events.length-1,qrIdx+1))} disabled={qrIdx===events.length-1} style={{ width:24,height:24,borderRadius:8,border:'1px solid rgba(155,127,232,0.25)',background:'rgba(255,255,255,0.5)',cursor:'pointer',color:'#9b7fe8',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',opacity:qrIdx===events.length-1?0.4:1 }}>›</button>
              </div>
            )}
          </div>
          {events.length === 0
            ? <div style={{ textAlign:'center', padding:'20px 0', color:'#9b89c4', fontSize:13 }}><div style={{ fontSize:28, marginBottom:8 }}>⬡</div>Create an event first</div>
            : <>
              <div style={{ fontSize:11, fontWeight:700, color:'#6b21a8', background:'rgba(155,127,232,0.1)', border:'1px solid rgba(155,127,232,0.2)', padding:'3px 10px', borderRadius:20, display:'inline-block', marginBottom:10 }}>{currentEvent?.name}</div>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                <div style={{ padding:8, background:'rgba(255,255,255,0.8)', borderRadius:14, border:'1px solid rgba(155,127,232,0.15)' }}>
                  <QRCanvas url={guestUrl} size={130} />
                </div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.5)', border:'1px solid rgba(155,127,232,0.15)', borderRadius:10, padding:'6px 10px', display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ fontSize:10, color:'#7c6aaa', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{guestUrl}</span>
                <button onClick={copyLink} style={{ fontSize:10, color:copied?'#22c55e':'#9b7fe8', background:'transparent', border:'none', cursor:'pointer', fontWeight:700, flexShrink:0 }}>{copied?'✓ Copied!':'Copy'}</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                <button onClick={()=>{const c=document.querySelector('canvas');if(c){const a=document.createElement('a');a.download=`qr-${currentEvent?.slug}.png`;a.href=c.toDataURL();a.click()}}} style={{ padding:'7px 0', borderRadius:10, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:11, fontWeight:700, cursor:'pointer' }}>⬇ Download</button>
                <Link href={guestUrl} target="_blank" style={{ padding:'7px 0', borderRadius:10, background:'rgba(255,255,255,0.6)', color:'#7c3aed', border:'1px solid rgba(155,127,232,0.25)', fontSize:11, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>↗ Preview</Link>
              </div>
            </>
          }
        </div>

        {/* ── CHANGED: Plan card now dynamic ── */}
        <div style={{ ...glass, padding:'18px 20px' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#2d1b69', marginBottom:12 }}>Your Plan</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, background:'linear-gradient(90deg,#9b7fe8,#c084fc)', color:'#fff', boxShadow:'0 2px 10px rgba(155,127,232,0.35)', marginBottom:14 }}>
            ★ {planName}
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9b89c4', marginBottom:5 }}>
              <span>Photos</span>
              <span style={{ color:'#2d1b69', fontWeight:600 }}>{planPhotosUsed.toLocaleString()} / {planPhotosLimit.toLocaleString()}</span>
            </div>
            <div style={{ height:6, background:'rgba(155,127,232,0.15)', borderRadius:10, overflow:'hidden' }}>
              <div style={{ height:6, width:`${Math.max(storagePct,1)}%`, background: storagePct > 80 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,#9b7fe8,#c084fc)', borderRadius:10 }} />
            </div>
            {storagePct > 80 && <div style={{ fontSize:10, color:'#ef4444', fontWeight:600, marginTop:3 }}>⚠ {storagePct}% used — consider upgrading</div>}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9b89c4', marginBottom:5 }}>
            <span>Storage</span>
            <span style={{ color:'#2d1b69', fontWeight:600 }}>{storageGB} / {planStorageGB} GB</span>
          </div>
          <div style={{ height:4, background:'rgba(155,127,232,0.15)', borderRadius:10, overflow:'hidden', marginBottom:14 }}>
            <div style={{ height:4, width:`${Math.max(storagePct,1)}%`, background:'linear-gradient(90deg,#9b7fe8,#c084fc)', borderRadius:10 }} />
          </div>
          {planFeatures.map(f=>(
            <div key={f} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#5b4a8a', padding:'5px 0', fontWeight:500 }}>
              <div style={{ width:16, height:16, borderRadius:5, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:9, flexShrink:0 }}>✓</div>
              {f}
            </div>
          ))}
          {planName === 'Starter' && (
            <button onClick={()=>router.push('/dashboard/settings')} style={{ width:'100%', padding:11, borderRadius:14, marginTop:14, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(155,127,232,0.3)' }}>
              Upgrade Plan →
            </button>
          )}
          {planName !== 'Starter' && planData?.expires_at && (
            <div style={{ fontSize:11, color:'#9b89c4', marginTop:12, textAlign:'center' }}>
              Renews {new Date(planData.expires_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}