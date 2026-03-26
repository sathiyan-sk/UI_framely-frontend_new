'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const eventColors = ['linear-gradient(135deg,#9b7fe8,#c084fc)','linear-gradient(135deg,#f472b6,#ec4899)','linear-gradient(135deg,#60a5fa,#3b82f6)','linear-gradient(135deg,#34d399,#10b981)','linear-gradient(135deg,#fbbf24,#f59e0b)','linear-gradient(135deg,#a78bfa,#8b5cf6)']

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/events/`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (Array.isArray(data)) setEvents(data)
    setLoading(false)
  }

  async function createEvent(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/events/`, { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({name:newName}) })
    const data = await res.json()
    if (data.id) { setEvents(p=>[...p,data]); setNewName(''); setShowForm(false) }
    setCreating(false)
  }

  async function deleteEvent(id) {
    setDeletingId(id)
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/events/${id}`, { method:'DELETE', headers:{Authorization:`Bearer ${token}`} })
    if (res.ok) setEvents(p=>p.filter(e=>e.id!==id))
    setDeletingId(null); setConfirmDelete(null)
  }

  const glass = { background:'rgba(255,255,255,0.28)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.55)', borderRadius:22, boxShadow:'0 4px 24px rgba(100,80,180,0.08)', transition:'all .2s' }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ fontSize:18, fontWeight:800, color:'#2d1b69' }}>My Events</div>
        <button onClick={()=>router.push('/dashboard/create-event')} style={{ padding:'9px 18px', borderRadius:12, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(155,127,232,0.35)' }}>+ New Event</button>
      </div>

      <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.5)', borderRadius:12, padding:4, marginBottom:18, flexWrap:'wrap' }}>
        {[['all','All',events.length],['published','Published',events.length],['unpublished','Unpublished',0],['expired','Expired',0],['selling','Photo Selling',0]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{ padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', background:filter===k?'rgba(255,255,255,0.8)':'transparent', color:filter===k?'#4b0082':'#9b89c4', display:'flex', alignItems:'center', gap:5 }}>
            {l} <span style={{ background:filter===k?'rgba(155,127,232,0.15)':'rgba(255,255,255,0.4)', color:filter===k?'#6b21a8':'#9b89c4', fontSize:10, padding:'1px 6px', borderRadius:20, fontWeight:700 }}>{c}</span>
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={createEvent} style={{ ...glass, padding:16, marginBottom:16, display:'flex', gap:10 }}>
          <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Rahul & Priya Wedding" style={{ flex:1, border:'1px solid rgba(155,127,232,0.3)', borderRadius:10, padding:'9px 14px', fontSize:13, outline:'none', background:'rgba(255,255,255,0.6)', fontFamily:'inherit', color:'#2d1b69' }} />
          <button type="submit" disabled={creating} style={{ padding:'9px 18px', borderRadius:10, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>{creating?'Creating...':'Create'}</button>
          <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'9px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.6)', background:'rgba(255,255,255,0.4)', fontSize:13, color:'#9b89c4', cursor:'pointer' }}>Cancel</button>
        </form>
      )}

      {loading ? <div style={{ textAlign:'center', padding:48, color:'#9b89c4' }}>Loading...</div>
        : events.length === 0 ? <div style={{ ...glass, textAlign:'center', padding:48 }}><div style={{ fontSize:32, marginBottom:10 }}>📷</div><div style={{ fontSize:14, fontWeight:600, color:'#2d1b69' }}>No events yet</div></div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {events.map((ev,i)=>(
            <div key={ev.id} style={{ ...glass, overflow:'hidden', position:'relative' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(155,127,232,0.18)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 24px rgba(100,80,180,0.08)'}}>
              <Link href={`/dashboard/events/${ev.id}`} style={{ textDecoration:'none' }}>
                <div style={{ height:110, background:eventColors[i%6], position:'relative' }}>
                  <div style={{ position:'absolute', top:10, right:10, background:'rgba(22,163,74,0.2)', color:'#15803d', border:'1px solid rgba(22,163,74,0.3)', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>Published</div>
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#2d1b69', marginBottom:2 }}>{ev.name}</div>
                  <div style={{ fontSize:11, color:'#9b89c4', marginBottom:10 }}>/{ev.slug}</div>
                  <button style={{ width:'100%', padding:7, border:'1px solid rgba(155,127,232,0.25)', borderRadius:10, background:'rgba(155,127,232,0.08)', fontSize:11, color:'#7c3aed', fontWeight:600, cursor:'pointer' }}>Quick Actions ···</button>
                </div>
              </Link>
              <button onClick={e=>{e.preventDefault();setConfirmDelete(ev.id)}} style={{ position:'absolute', top:10, left:10, background:'rgba(255,255,255,0.85)', border:'none', borderRadius:8, padding:'3px 8px', fontSize:10, color:'#ef4444', cursor:'pointer', fontWeight:600 }}>✕</button>
            </div>
          ))}
        </div>
      }

      {confirmDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(45,27,105,0.4)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ ...glass, padding:28, maxWidth:360, width:'90%', background:'rgba(255,255,255,0.75)' }}>
            <div style={{ fontSize:28, marginBottom:12 }}>🗑️</div>
            <h3 style={{ fontSize:16, fontWeight:700, color:'#2d1b69', margin:'0 0 8px' }}>Delete this event?</h3>
            <p style={{ fontSize:13, color:'#7c6aaa', margin:'0 0 20px', lineHeight:1.6 }}>All photos and face embeddings will be permanently deleted. This cannot be undone.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setConfirmDelete(null)} style={{ flex:1, padding:10, border:'1px solid rgba(255,255,255,0.6)', borderRadius:12, background:'rgba(255,255,255,0.4)', fontSize:13, color:'#5b4a8a', cursor:'pointer' }}>Cancel</button>
              <button onClick={()=>deleteEvent(confirmDelete)} disabled={deletingId===confirmDelete} style={{ flex:1, padding:10, border:'none', borderRadius:12, background:'linear-gradient(135deg,#dc2626,#ef4444)', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', opacity:deletingId===confirmDelete?0.6:1 }}>{deletingId===confirmDelete?'Deleting...':'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
