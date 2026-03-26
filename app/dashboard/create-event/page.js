'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const EVENT_TYPES = ['Wedding','Birthday','Corporate Event','Engagement','Baby Shower','Anniversary','Conference','Product Launch','School Event','Sports Event','Concert','Other']

export default function CreateEvent() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [creating, setCreating] = useState(false)
  const [errors, setErrors] = useState({})
  const [reelAI, setReelAI] = useState(false)
  const [branding, setBranding] = useState(false)
  const [form, setForm] = useState({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    event_type: '',
    location: '',
    description: '',
  })

  function set(k, v) {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Event name is required'
    if (!form.event_type) e.event_type = 'Event type is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleCreate() {
    if (!validate()) return
    setCreating(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/events/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.id) router.push(`/dashboard/events/${data.id}`)
    } catch (e) { console.error(e) }
    setCreating(false)
  }

  const glass = {
    background: 'rgba(255,255,255,0.5)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.75)',
    borderRadius: 22,
    boxShadow: '0 4px 24px rgba(100,80,180,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
  }

  const inp = (hasError) => ({
    width: '100%',
    padding: '12px 16px',
    border: hasError ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(155,127,232,0.2)',
    borderRadius: 14,
    fontSize: 14,
    color: '#2d1b69',
    background: 'rgba(255,255,255,0.7)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border .15s',
    boxSizing: 'border-box',
  })

  const label = {
    fontSize: 13,
    fontWeight: 600,
    color: '#5b4a8a',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Inter',system-ui,sans-serif",
      background: 'linear-gradient(135deg,#ddd6fe 0%,#e9d5ff 20%,#fbcfe8 45%,#fde68a 70%,#fecdd3 85%,#ddd6fe 100%)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Glow blobs */}
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,220,200,0.45) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 60% 50% at 20% 70%, rgba(200,190,255,0.3) 0%, transparent 60%)', pointerEvents:'none', zIndex:0 }} />

      {/* Topbar */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderBottom:'1px solid rgba(0,0,0,0.06)', padding:'0 24px' }}>
        <div style={{ maxWidth:820, margin:'0 auto', height:60, display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => router.push('/dashboard/events')} style={{ width:36, height:36, borderRadius:10, border:'1px solid rgba(155,127,232,0.25)', background:'rgba(255,255,255,0.8)', cursor:'pointer', color:'#9b7fe8', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
          <div style={{ width:34, height:34, borderRadius:12, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:15 }}>P</div>
          <span style={{ fontSize:16, fontWeight:700, color:'#2d1b69', flex:1 }}>Create Event</span>
          <Link href="/dashboard" style={{ fontSize:13, color:'#9b89c4', textDecoration:'none' }}>Dashboard</Link>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:'0 auto', padding:'32px 20px 60px', position:'relative', zIndex:1 }}>

        {/* Stepper */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:36, gap:0 }}>
          {[{n:1,l:'Event Details'},{n:2,l:'Select Design'}].map((s,i) => (
            <div key={s.n} style={{ display:'flex', alignItems:'center' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:step>=s.n?'linear-gradient(135deg,#9b7fe8,#c084fc)':'rgba(255,255,255,0.6)', border:step>=s.n?'none':'1.5px solid rgba(155,127,232,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:step>=s.n?'#fff':'#9b89c4', fontSize:15, fontWeight:800, boxShadow:step>=s.n?'0 4px 14px rgba(155,127,232,0.4)':'none', transition:'all .2s' }}>{s.n}</div>
                <span style={{ fontSize:11, fontWeight:600, color:step>=s.n?'#7c3aed':'#9b89c4', transition:'color .2s' }}>{s.l}</span>
              </div>
              {i===0 && <div style={{ width:120, height:2, background:step>=2?'linear-gradient(90deg,#9b7fe8,#c084fc)':'rgba(155,127,232,0.2)', margin:'0 12px 18px', borderRadius:2, transition:'background .3s' }} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ animation:'fadeIn .3s ease' }}>
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {/* Main form card */}
            <div style={{ ...glass, padding:'28px 28px 24px', marginBottom:16, position:'relative' }}>
              {errors.name && <div style={{ position:'absolute', top:24, right:24, color:'#ef4444', fontSize:18 }}>⚠</div>}

              {/* Event name — large title input */}
              <div style={{ marginBottom:22, borderBottom:'1.5px solid rgba(155,127,232,0.15)', paddingBottom:20 }}>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Event Name"
                  style={{ width:'100%', border:'none', outline:'none', fontSize:24, fontWeight:700, color:form.name?'#2d1b69':'#c4b5fd', fontFamily:'inherit', background:'transparent', boxSizing:'border-box' }}
                />
                {errors.name && <div style={{ fontSize:12, color:'#ef4444', marginTop:5, fontWeight:500 }}>⚠ {errors.name}</div>}
              </div>

              {/* Start + End date */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                <div>
                  <div style={label}><span style={{ fontSize:15 }}>📅</span> Start Date</div>
                  <input type="date" value={form.start_date} onChange={e=>set('start_date',e.target.value)} style={inp(false)}
                    onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                    onBlur={e=>e.target.style.border='1.5px solid rgba(155,127,232,0.2)'} />
                </div>
                <div>
                  <div style={label}><span style={{ fontSize:15 }}>📅</span> End Date</div>
                  <input type="date" value={form.end_date} onChange={e=>set('end_date',e.target.value)} style={inp(false)}
                    onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                    onBlur={e=>e.target.style.border='1.5px solid rgba(155,127,232,0.2)'} />
                </div>
              </div>

              {/* Event type + Location */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                <div>
                  <div style={label}><span style={{ fontSize:15 }}>🏷</span> Event Type</div>
                  <select value={form.event_type} onChange={e=>set('event_type',e.target.value)}
                    style={{ ...inp(!!errors.event_type), appearance:'none', cursor:'pointer', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239b7fe8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center' }}
                    onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                    onBlur={e=>e.target.style.border=errors.event_type?'1.5px solid rgba(239,68,68,0.5)':'1.5px solid rgba(155,127,232,0.2)'}>
                    <option value="">Select Event Type</option>
                    {EVENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.event_type && <div style={{ fontSize:12, color:'#ef4444', marginTop:5, fontWeight:500 }}>⚠ {errors.event_type}</div>}
                </div>
                <div>
                  <div style={label}><span style={{ fontSize:15 }}>📍</span> Event Location</div>
                  <input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Add location or virtual link (Optional)" style={inp(false)}
                    onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                    onBlur={e=>e.target.style.border='1.5px solid rgba(155,127,232,0.2)'} />
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={label}><span style={{ fontSize:15 }}>≡</span> Description</div>
                <textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Add event description (Optional)" rows={3}
                  style={{ ...inp(false), resize:'vertical', minHeight:90 }}
                  onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                  onBlur={e=>e.target.style.border='1.5px solid rgba(155,127,232,0.2)'} />
              </div>
            </div>

            {/* Feature cards */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              {/* Photo Selling */}
              <div style={{ background:'linear-gradient(135deg,rgba(255,237,213,0.8),rgba(254,215,170,0.6))', border:'1px solid rgba(251,146,60,0.25)', borderRadius:18, padding:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:16 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow:'0 4px 12px rgba(245,158,11,0.35)' }}>🛒</div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#c2410c' }}>Enable Photo Selling</span>
                      <span style={{ background:'#f97316', color:'#fff', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:4, letterSpacing:'.04em' }}>NEW</span>
                    </div>
                    <div style={{ fontSize:12, color:'#92400e', marginTop:3, lineHeight:1.5 }}>Sell your photos to guests and earn more revenue</div>
                  </div>
                </div>
                <button style={{ width:'100%', padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, boxShadow:'0 4px 14px rgba(249,115,22,0.35)' }}>
                  👑 Upgrade Plan
                </button>
              </div>

              {/* Reel AI */}
              <div style={{ background:'linear-gradient(135deg,rgba(254,226,226,0.8),rgba(252,205,205,0.6))', border:'1px solid rgba(239,68,68,0.2)', borderRadius:18, padding:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:42, height:42, borderRadius:'50%', background:'rgba(254,202,202,0.8)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🎬</div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:14, fontWeight:700, color:'#dc2626' }}>Enable Reel AI</span>
                        <span style={{ background:'#ef4444', color:'#fff', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:4, letterSpacing:'.04em' }}>NEW</span>
                      </div>
                      <div style={{ fontSize:12, color:'#991b1b', marginTop:3, lineHeight:1.5 }}>AI-powered tool that automatically creates personalized short-form videos for all guests</div>
                    </div>
                  </div>
                  {/* Toggle */}
                  <div onClick={()=>setReelAI(!reelAI)} style={{ width:44, height:24, borderRadius:12, background:reelAI?'linear-gradient(135deg,#9b7fe8,#c084fc)':'rgba(209,213,219,0.8)', cursor:'pointer', position:'relative', flexShrink:0, marginLeft:10, transition:'background .2s', boxShadow:reelAI?'0 2px 8px rgba(155,127,232,0.4)':'none' }}>
                    <div style={{ position:'absolute', top:3, left:reelAI?23:3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Event Branding */}
            <div style={{ ...glass, padding:22, marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#374151,#1f2937)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎨</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#2d1b69' }}>Event Branding</div>
                    <div style={{ fontSize:12, color:'#9b89c4' }}>Apply your brand kit to the event</div>
                  </div>
                </div>
                <div onClick={()=>setBranding(!branding)} style={{ width:48, height:26, borderRadius:13, background:branding?'linear-gradient(135deg,#1f2937,#374151)':'rgba(209,213,219,0.8)', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:3, left:branding?25:3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
                </div>
              </div>

              {branding && (
                <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid rgba(155,127,232,0.12)', textAlign:'center' }}>
                  <div style={{ width:56, height:56, borderRadius:16, background:'rgba(155,127,232,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 12px' }}>🖼</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#2d1b69', marginBottom:4 }}>You don't have any brandings</div>
                  <div style={{ fontSize:12, color:'#9b89c4', marginBottom:16 }}>Create a brand kit to apply your logo and colors</div>
                  <button style={{ padding:'10px 28px', borderRadius:12, background:'linear-gradient(135deg,#1f2937,#374151)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(0,0,0,0.2)' }}>Add Brand</button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={()=>router.push('/dashboard/events')} style={{ padding:'12px 24px', borderRadius:12, border:'1px solid rgba(155,127,232,0.2)', background:'rgba(255,255,255,0.6)', fontSize:14, color:'#9b89c4', fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button onClick={()=>{ if(validate()) setStep(2) }} style={{ padding:'12px 28px', borderRadius:12, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(155,127,232,0.4)', display:'flex', alignItems:'center', gap:8 }}>
                Next: Select Design <span style={{ fontSize:16 }}>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={{ animation:'fadeIn .3s ease' }}>

            {/* Summary */}
            <div style={{ ...glass, padding:24, marginBottom:16 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#2d1b69', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:24, height:24, borderRadius:8, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12 }}>✓</span>
                Event Summary
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['Event Name',form.name],['Event Type',form.event_type],['Start Date',form.start_date],['End Date',form.end_date],['Location',form.location||'—'],['Description',form.description||'—']].map(([k,v])=>(
                  <div key={k} style={{ background:'rgba(255,255,255,0.5)', border:'1px solid rgba(155,127,232,0.1)', borderRadius:12, padding:'10px 14px' }}>
                    <div style={{ fontSize:10, color:'#9b89c4', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{k}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#2d1b69', wordBreak:'break-word' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery design picker */}
            <div style={{ ...glass, padding:24, marginBottom:24 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#2d1b69', marginBottom:6 }}>Choose Gallery Design</div>
              <div style={{ fontSize:12, color:'#9b89c4', marginBottom:18 }}>How guests will see your event photos</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                {[
                  {name:'Classic',sub:'Clean and minimal',color:'linear-gradient(135deg,#9b7fe8,#c084fc)',selected:true},
                  {name:'Elegant',sub:'Soft and refined',color:'linear-gradient(135deg,#f472b6,#ec4899)',selected:false},
                  {name:'Modern',sub:'Bold and vibrant',color:'linear-gradient(135deg,#60a5fa,#3b82f6)',selected:false},
                ].map((d,i)=>(
                  <div key={i} style={{ borderRadius:16, overflow:'hidden', border:d.selected?'2px solid #9b7fe8':'1px solid rgba(155,127,232,0.15)', cursor:'pointer', transition:'all .15s', boxShadow:d.selected?'0 4px 16px rgba(155,127,232,0.25)':'none' }}>
                    <div style={{ height:80, background:d.color, position:'relative' }}>
                      {d.selected && <div style={{ position:'absolute', top:8, right:8, width:22, height:22, borderRadius:'50%', background:'rgba(255,255,255,0.9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#7c3aed', fontWeight:800 }}>✓</div>}
                    </div>
                    <div style={{ padding:'10px 12px', background:'rgba(255,255,255,0.7)' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#2d1b69' }}>{d.name}</div>
                      <div style={{ fontSize:11, color:'#9b89c4', marginTop:2 }}>{d.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button onClick={()=>setStep(1)} style={{ padding:'12px 24px', borderRadius:12, border:'1px solid rgba(155,127,232,0.2)', background:'rgba(255,255,255,0.6)', fontSize:14, color:'#9b89c4', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                <span>←</span> Back
              </button>
              <button onClick={handleCreate} disabled={creating} style={{ padding:'12px 32px', borderRadius:12, background:creating?'rgba(155,127,232,0.5)':'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:creating?'not-allowed':'pointer', boxShadow:'0 6px 20px rgba(155,127,232,0.4)', display:'flex', alignItems:'center', gap:8, transition:'all .2s' }}>
                {creating ? (
                  <>
                    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }} />
                    Creating...
                  </>
                ) : <>🎉 Create Event</>}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
