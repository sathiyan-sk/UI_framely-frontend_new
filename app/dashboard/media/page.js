'use client'
import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const eventColors = ['linear-gradient(135deg,#9b7fe8,#c084fc)','linear-gradient(135deg,#f472b6,#ec4899)','linear-gradient(135deg,#60a5fa,#3b82f6)','linear-gradient(135deg,#34d399,#10b981)','linear-gradient(135deg,#fbbf24,#f59e0b)','linear-gradient(135deg,#a78bfa,#8b5cf6)']

export default function MediaPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    async function load() {
      const res = await fetch(`${API_URL}/events/`, { headers: { Authorization: `Bearer ${token}` } })
      const evs = await res.json()
      if (!Array.isArray(evs)) return
      const all = []
      for (const ev of evs) {
        const pr = await fetch(`${API_URL}/photos/${ev.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const pd = await pr.json()
        if (Array.isArray(pd)) all.push(...pd.map(p=>({...p,eventName:ev.name})))
      }
      setPhotos(all)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div style={{ fontSize:18, fontWeight:800, color:'#2d1b69', marginBottom:16 }}>Media Library</div>
      {loading ? <div style={{ textAlign:'center', padding:48, color:'#9b89c4' }}>Loading media...</div>
        : photos.length === 0 ? <div style={{ textAlign:'center', padding:48, color:'#9b89c4', fontSize:13 }}><div style={{ fontSize:36, marginBottom:8 }}>🖼</div>No photos yet</div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
          {photos.map((p,i)=>(
            <div key={i} style={{ aspectRatio:1, borderRadius:14, overflow:'hidden', position:'relative' }}>
              {p.url
                ? <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';e.target.parentNode.style.background=eventColors[i%6]}} />
                : <div style={{ width:'100%', height:'100%', background:eventColors[i%6] }} />
              }
              <div style={{ position:'absolute', top:5, right:5, width:8, height:8, borderRadius:'50%', background:p.status==='ready'?'#22c55e':'#f59e0b', border:'1.5px solid rgba(255,255,255,0.8)' }} />
            </div>
          ))}
        </div>
      }
    </div>
  )
}
