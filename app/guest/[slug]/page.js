'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { searchFaces, getEventBySlug } from '../../../lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ─── Shared styles ────────────────────────────────────────────────────────────
const ANIM = `
  @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-25px,20px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes zoomIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes countdown{0%{opacity:0;transform:scale(2.5)}15%{opacity:1;transform:scale(1)}85%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.5)}}
  @keyframes shutter{0%,100%{opacity:0}20%,60%{opacity:1}}
  @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}
`

// ─── PremiumInput ─────────────────────────────────────────────────────────────
function PremiumInput({ label, type = 'text', value, onChange, placeholder, icon, required }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position:'relative', marginBottom:16 }}>
      <label style={{ position:'absolute', left:44, top:active?9:18, fontSize:active?10:14, fontWeight:600, color:active?'#9b7fe8':'#9b89c4', transition:'all .18s', pointerEvents:'none', zIndex:1, letterSpacing:active?'.06em':'normal', textTransform:active?'uppercase':'none' }}>
        {label}{required && ' *'}
      </label>
      <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:17, color:focused?'#9b7fe8':'#c4b5fd', transition:'color .18s', zIndex:1 }}>{icon}</span>
      <input type={type} value={value} onChange={onChange} placeholder={focused?placeholder:''}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{ width:'100%', padding:active?'26px 16px 10px 44px':'19px 16px 19px 44px', border:`1.5px solid ${focused?'#9b7fe8':'rgba(155,127,232,0.2)'}`, borderRadius:16, fontSize:15, color:'#2d1b69', background:focused?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.6)', outline:'none', fontFamily:'inherit', transition:'all .18s', boxSizing:'border-box', boxShadow:focused?'0 0 0 4px rgba(155,127,232,0.1)':'none' }} />
    </div>
  )
}

// ─── Page 1: Guest Landing ────────────────────────────────────────────────────
function GuestLanding({ event, onContinue }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [privacy, setPrivacy] = useState(true)
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#ddd6fe 0%,#e9d5ff 20%,#fbcfe8 50%,#fde68a 80%,#ddd6fe 100%)' }}>
      <style>{ANIM}</style>
      {/* Orbs */}
      <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', background:'#c4b5fd', filter:'blur(90px)', opacity:.3, top:-100, left:-100, animation:'orb1 9s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'#fbcfe8', filter:'blur(80px)', opacity:.25, bottom:-80, right:-60, animation:'orb2 11s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:460, opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(32px)', transition:'all .6s cubic-bezier(.4,0,.2,1)' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.9)', padding:'8px 18px', borderRadius:50, marginBottom:16 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s ease infinite' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'#5b4a8a', letterSpacing:'.04em' }}>{event?.name || 'Event Gallery'}</span>
          </div>
          <h1 style={{ fontSize:'clamp(28px,6vw,42px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:8, lineHeight:1.1 }}>
            Get Your<br/>
            <span style={{ background:'linear-gradient(135deg,#9b7fe8,#c084fc,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Event Photos ✨</span>
          </h1>
          <p style={{ fontSize:14, color:'#9b89c4', lineHeight:1.7 }}>Enter your details and take a quick selfie<br/>to instantly find all your photos</p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.55)', backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)', border:'1px solid rgba(255,255,255,0.85)', borderRadius:28, padding:'28px 28px 24px', boxShadow:'0 12px 48px rgba(155,127,232,0.15), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
          <PremiumInput label="Your Name" value={name} onChange={e=>setName(e.target.value)} placeholder="Rahul Sharma" icon="👤" required />
          <PremiumInput label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" icon="✉" required />

          {/* Phone */}
          <div style={{ position:'relative', marginBottom:16 }}>
            <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', gap:6, zIndex:2, pointerEvents:'none' }}>
              <span style={{ fontSize:18 }}>🇮🇳</span>
              <span style={{ fontSize:13, color:'#9b89c4', fontWeight:600 }}>+91</span>
              <div style={{ width:1, height:16, background:'rgba(155,127,232,0.25)' }} />
            </div>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile number"
              style={{ width:'100%', padding:'19px 16px 19px 80px', border:'1.5px solid rgba(155,127,232,0.2)', borderRadius:16, fontSize:15, color:'#2d1b69', background:'rgba(255,255,255,0.6)', outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'all .18s' }}
              onFocus={e=>{e.target.style.border='1.5px solid #9b7fe8';e.target.style.boxShadow='0 0 0 4px rgba(155,127,232,0.1)'}}
              onBlur={e=>{e.target.style.border='1.5px solid rgba(155,127,232,0.2)';e.target.style.boxShadow='none'}} />
          </div>

          {/* Privacy checkbox */}
          <div onClick={()=>setPrivacy(!privacy)} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:22, cursor:'pointer' }}>
            <div style={{ width:20, height:20, borderRadius:6, border:`1.5px solid ${privacy?'transparent':'rgba(155,127,232,0.3)'}`, background:privacy?'linear-gradient(135deg,#9b7fe8,#c084fc)':'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, transition:'all .15s', boxShadow:privacy?'0 2px 8px rgba(155,127,232,0.3)':'none' }}>
              {privacy && <span style={{ color:'#fff', fontSize:11, fontWeight:900 }}>✓</span>}
            </div>
            <span style={{ fontSize:12, color:'#7c6aaa', lineHeight:1.6 }}>I agree to the <span style={{ color:'#9b7fe8', fontWeight:600 }}>Privacy Policy</span> and give my <span style={{ color:'#9b7fe8', fontWeight:600 }}>Consent</span> for face recognition</span>
          </div>

          <button onClick={()=>onContinue({name,email,phone})} disabled={!name||!email||!phone||!privacy}
            style={{ width:'100%', padding:'16px', borderRadius:16, fontSize:15, fontWeight:700, cursor:(!name||!email||!phone||!privacy)?'not-allowed':'pointer', border:'none', background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', boxShadow:'0 8px 28px rgba(155,127,232,0.45)', transition:'all .18s', opacity:(!name||!email||!phone||!privacy)?0.5:1, fontFamily:'inherit' }}>
            📸 Continue to Camera
          </button>
        </div>
        <p style={{ textAlign:'center', fontSize:11, color:'#c4b5fd', marginTop:14, fontWeight:500 }}>🔒 Secure · Powered by Framely AI</p>
      </div>
    </div>
  )
}

// ─── Page 2: Camera ───────────────────────────────────────────────────────────
function CameraPage({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const mountedRef = useRef(true)
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [captured, setCaptured] = useState(null)
  const [shutter, setShutter] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    mountedRef.current = true
    setVisible(true)
    startCamera()
    return () => {
      mountedRef.current = false
      stopCamera()
    }
  }, [facingMode])

  async function startCamera() {
    stopCamera()
    setError('')
    setReady(false)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width:{ ideal:1280 }, height:{ ideal:720 } },
        audio: false
      })
      if (!mountedRef.current) { s.getTracks().forEach(t=>t.stop()); return }
      streamRef.current = s
      const video = videoRef.current
      if (!video) return
      video.srcObject = s
      video.onloadedmetadata = async () => {
        if (!mountedRef.current) return
        try { await video.play() } catch(e) { if(e.name!=='AbortError') console.error(e) }
        if (mountedRef.current) setReady(true)
      }
    } catch(e) {
      if (mountedRef.current) setError('Camera access denied. Please allow camera permission.')
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  function startCountdown() {
    if (!ready || countdown !== null) return
    let n = 3
    setCountdown(n)
    const iv = setInterval(() => {
      n--
      if (n <= 0) { clearInterval(iv); setCountdown(null); capturePhoto() }
      else setCountdown(n)
    }, 1000)
  }

  function capturePhoto() {
    setShutter(true)
    setTimeout(() => setShutter(false), 500)
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
    ctx.drawImage(video, 0, 0)
    setCaptured(canvas.toDataURL('image/jpeg', 0.9))
  }

  function retake() {
    setCaptured(null)
    setReady(false)
    startCamera()
  }

  function confirm() {
    canvasRef.current.toBlob(blob => onCapture(blob), 'image/jpeg', 0.9)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'#0d0d1a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:visible?1:0, transition:'opacity .3s', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{ANIM}</style>

      <button onClick={onClose} style={{ position:'absolute', top:20, right:20, width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>✕</button>

      <div style={{ textAlign:'center', marginBottom:28, animation:'fadeUp .4s ease' }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Capture Selfie</h2>
        <p style={{ fontSize:13, color:'rgba(192,132,252,0.9)', fontWeight:600 }}>
          {error || 'Keep face in center · Look straight at camera'}
        </p>
      </div>

      {/* Circular viewport */}
      <div style={{ position:'relative', width:'min(320px,80vw)', height:'min(320px,80vw)' }}>
        {/* Spinning dashed ring */}
        {!captured && <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:'2px dashed rgba(155,127,232,0.4)', animation:'spin 14s linear infinite', zIndex:3, pointerEvents:'none' }} />}

        {/* Video circle */}
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', overflow:'hidden', border:'3px solid rgba(155,127,232,0.7)', boxShadow:'0 0 0 1px rgba(155,127,232,0.2), 0 0 50px rgba(155,127,232,0.25)', zIndex:2 }}>
          {captured
            ? <img src={captured} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transform:facingMode==='user'?'scaleX(-1)':'none' }} />
            : <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover', transform:facingMode==='user'?'scaleX(-1)':'none' }} />
          }
        </div>

        {/* Face mesh SVG */}
        {!captured && ready && (
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:4, pointerEvents:'none', opacity:.45 }} viewBox="0 0 320 320">
            <ellipse cx="160" cy="148" rx="70" ry="84" fill="none" stroke="#9b7fe8" strokeWidth="1" strokeDasharray="4 4"/>
            {[[160,76],[122,96],[198,96],[100,134],[220,134],[96,168],[224,168],[108,200],[212,200],[133,232],[187,232],[160,242],[143,124],[177,124],[153,152],[167,152],[160,176],[147,196],[173,196]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="2.5" fill="#c084fc" opacity=".9"/>
            ))}
            {[[160,76,122,96],[160,76,198,96],[122,96,100,134],[198,96,220,134],[100,134,96,168],[220,134,224,168],[96,168,108,200],[224,168,212,200],[108,200,133,232],[212,200,187,232],[133,232,160,242],[187,232,160,242],[143,124,122,96],[177,124,198,96],[153,152,143,124],[167,152,177,124],[160,176,153,152],[160,176,167,152],[147,196,160,176],[173,196,160,176]].map(([x1,y1,x2,y2],i)=>(
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9b7fe8" strokeWidth=".8" opacity=".5"/>
            ))}
          </svg>
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:6 }}>
            <span key={countdown} style={{ fontSize:88, fontWeight:900, color:'#fff', animation:'countdown 1s ease', lineHeight:1, textShadow:'0 0 40px rgba(155,127,232,0.9)' }}>{countdown}</span>
          </div>
        )}

        {/* Shutter flash */}
        {shutter && <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(255,255,255,0.95)', zIndex:7, animation:'shutter .4s ease', pointerEvents:'none' }} />}

        {/* Captured confirm tick */}
        {captured && (
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(34,197,94,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:6, animation:'zoomIn .3s ease' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(34,197,94,0.9)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 30px rgba(34,197,94,0.6)' }}>
              <span style={{ color:'#fff', fontSize:26, fontWeight:900 }}>✓</span>
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {!ready && !captured && !error && (
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:6 }}>
            <div style={{ width:32, height:32, border:'3px solid rgba(155,127,232,0.3)', borderTop:'3px solid #9b7fe8', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display:'none' }} />

      {/* Controls */}
      <div style={{ marginTop:36, display:'flex', flexDirection:'column', alignItems:'center', gap:14, width:'min(320px,80vw)', animation:'slideUp .4s ease .15s both' }}>
        {!captured ? (
          <>
            {/* Capture button with ripples */}
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>
              {ready && <div style={{ position:'absolute', width:88, height:88, borderRadius:'50%', border:'2px solid rgba(155,127,232,0.3)', animation:'ripple 2s ease-in-out infinite' }} />}
              {ready && <div style={{ position:'absolute', width:76, height:76, borderRadius:'50%', border:'2px solid rgba(155,127,232,0.2)', animation:'ripple 2s ease-in-out infinite .6s' }} />}
              <button onClick={startCountdown} disabled={!ready || countdown !== null}
                style={{ width:68, height:68, borderRadius:'50%', background:ready?'linear-gradient(135deg,#9b7fe8,#c084fc)':'rgba(155,127,232,0.3)', border:'4px solid rgba(255,255,255,0.25)', cursor:ready?'pointer':'not-allowed', fontSize:24, boxShadow:ready?'0 0 30px rgba(155,127,232,0.7)':'none', transition:'all .2s', position:'relative', zIndex:2 }}>
                📷
              </button>
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:0 }}>3-second countdown · Look straight</p>
            <button onClick={()=>setFacingMode(f=>f==='user'?'environment':'user')} style={{ padding:'9px 22px', borderRadius:20, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              🔄 Flip Camera
            </button>
          </>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, width:'100%' }}>
            <button onClick={retake} style={{ padding:'14px', borderRadius:16, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>↺ Retake</button>
            <button onClick={confirm} style={{ padding:'14px', borderRadius:16, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 20px rgba(155,127,232,0.5)' }}>✓ Use This</button>
          </div>
        )}
      </div>
    </div>
  )
}


// ─── ImageCard ────────────────────────────────────────────────────────────────
function ImageCard({ photo, index, selected, onSelect, onFullView, onDownload }) {
  const [hovered, setHovered] = useState(false)
  const isLarge = index % 5 === 0
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={onFullView}
      style={{
        gridColumn: isLarge ? 'span 2' : 'span 1',
        position: 'relative',
        borderRadius: 18,
        overflow: 'hidden',
        border: `2px solid ${selected ? '#9b7fe8' : 'transparent'}`,
        boxShadow: selected ? '0 0 0 3px rgba(155,127,232,0.25)' : hovered ? '0 16px 40px rgba(155,127,232,0.2)' : '0 4px 16px rgba(0,0,0,0.07)',
        transition: 'all .22s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'pointer',
        aspectRatio: isLarge ? '16/9' : '4/3',
        animation: `slideUp .4s ease ${Math.min(index * 0.05, 0.5)}s both`,
      }}>
      <img
        src={photo.url}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s cubic-bezier(.4,0,.2,1)', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
        onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160"><rect fill="%239b7fe8" opacity=".2" width="200" height="160"/></svg>' }}
      />
      {/* Hover overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(45,27,105,0.85) 0%,rgba(45,27,105,0.1) 60%,transparent 100%)', opacity: hovered ? 1 : 0, transition: 'opacity .22s' }}>
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {photo.similarity && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: 700, background: 'rgba(155,127,232,0.55)', padding: '2px 8px', borderRadius: 20 }}>
              {Math.round(photo.similarity * 100)}% match
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDownload() }}
            style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.95)', color: '#7c3aed', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            ⬇ Save
          </button>
        </div>
      </div>
      {/* Checkbox */}
      <div
        onClick={e => { e.stopPropagation(); onSelect() }}
        style={{ position: 'absolute', top: 10, left: 10, width: 26, height: 26, borderRadius: 8, background: selected ? 'linear-gradient(135deg,#9b7fe8,#c084fc)' : 'rgba(255,255,255,0.92)', border: `2px solid ${selected ? 'transparent' : 'rgba(155,127,232,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: hovered || selected ? 1 : 0, transition: 'all .15s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        {selected && <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>✓</span>}
      </div>
    </div>
  )
}

// ─── Page 3: Gallery ──────────────────────────────────────────────────────────
function GalleryPage({ photos, guestName, onFaceSearch, searching }) {
  const [selected, setSelected] = useState(new Set())
  const [fullView, setFullView] = useState(null)
  const [fullViewIdx, setFullViewIdx] = useState(0)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  function toggle(id) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  function selectAll() { setSelected(new Set(photos.map(p => p.photo_id))) }
  function clearSel() { setSelected(new Set()) }

  async function downloadOne(url, name) {
    // Route through backend proxy so browser saves to Downloads folder
    // instead of opening in a new tab (cross-origin R2 limitation)
    const filename = name || url.split('/').pop() || 'photo.jpg'
    const proxyUrl = `${API_URL}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
    const a = document.createElement('a')
    a.href = proxyUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function bulkDownload() {
    setBulkLoading(true)
    let i = 0
    for (const id of selected) {
      const p = photos.find(x => x.photo_id === id)
      if (p) { await downloadOne(p.url, `photo-${++i}.jpg`); await new Promise(r => setTimeout(r, 300)) }
    }
    setBulkLoading(false); clearSel()
  }

  function openModal(photo, idx) { setFullView(photo); setFullViewIdx(idx) }
  function prevPhoto() { const i = Math.max(0, fullViewIdx - 1); setFullViewIdx(i); setFullView(photos[i]) }
  function nextPhoto() { const i = Math.min(photos.length - 1, fullViewIdx + 1); setFullViewIdx(i); setFullView(photos[i]) }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#ddd6fe 0%,#e9d5ff 20%,#fbcfe8 50%,#fde68a 80%,#ddd6fe 100%)', fontFamily: "'Inter',system-ui,sans-serif", position: 'relative' }}>
      <style>{ANIM}</style>
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#c4b5fd', filter: 'blur(90px)', opacity: .22, top: -80, left: -60, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 350, height: 350, borderRadius: '50%', background: '#fbcfe8', filter: 'blur(80px)', opacity: .18, bottom: -60, right: -40, pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all .5s cubic-bezier(.4,0,.2,1)' }}>

        {/* Sticky topbar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(155,127,232,0.1)', padding: '0 20px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg,#9b7fe8,#c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>P</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#2d1b69', flex: 1 }}>Framely</span>

            {selected.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'rgba(155,127,232,0.1)', border: '1px solid rgba(155,127,232,0.2)', borderRadius: 20, animation: 'zoomIn .2s ease' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{selected.size} selected</span>
                <button onClick={bulkDownload} disabled={bulkLoading}
                  style={{ padding: '4px 12px', borderRadius: 8, background: 'linear-gradient(135deg,#9b7fe8,#c084fc)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  {bulkLoading ? '...' : '⬇ Download Selected'}
                </button>
                <button onClick={clearSel}
                  style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.6)', color: '#9b89c4', border: '1px solid rgba(155,127,232,0.2)', fontSize: 11, cursor: 'pointer' }}>✕</button>
              </div>
            )}

            <button onClick={photos.length > 0 && selected.size === photos.length ? clearSel : selectAll}
              style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(155,127,232,0.2)', color: '#7c3aed', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {selected.size === photos.length && photos.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            <button onClick={onFaceSearch}
              style={{ padding: '7px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#9b7fe8,#c084fc)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(155,127,232,0.35)', display: 'flex', alignItems: 'center', gap: 5 }}>
              🔍 New Search
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {searching ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(155,127,232,0.2)', padding: '12px 24px', borderRadius: 50 }}>
                <div style={{ width: 18, height: 18, border: '2.5px solid rgba(155,127,232,0.3)', borderTop: '2.5px solid #9b7fe8', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>Searching with AI face recognition...</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.9)', padding: '7px 16px', borderRadius: 50, marginBottom: 14 }}>
                  <span style={{ fontSize: 14 }}>✨</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{photos.length} photos found · {guestName}</span>
                </div>
                <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 800, color: '#2d1b69', letterSpacing: '-.03em' }}>Your Event Photos</h1>
                <p style={{ fontSize: 13, color: '#9b89c4', marginTop: 6 }}>Double-click any photo to view full size</p>
              </>
            )}
          </div>

          {/* Empty state */}
          {!searching && photos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 100, height: 100, borderRadius: 28, background: 'rgba(155,127,232,0.1)', border: '1px solid rgba(155,127,232,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, margin: '0 auto 20px', animation: 'pulse 3s ease-in-out infinite' }}>📷</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2d1b69', marginBottom: 8 }}>No photos found</div>
              <div style={{ fontSize: 14, color: '#9b89c4', marginBottom: 24 }}>Try again with a clearer selfie in good lighting</div>
              <button onClick={onFaceSearch}
                style={{ padding: '13px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#9b7fe8,#c084fc)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(155,127,232,0.4)' }}>
                🔍 Try Again
              </button>
            </div>
          )}

          {/* ── FIXED: Proper responsive grid instead of CSS columns ── */}
          {photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {photos.map((photo, i) => (
                <ImageCard
                  key={photo.photo_id || i}
                  photo={photo}
                  index={i}
                  selected={selected.has(photo.photo_id)}
                  onSelect={() => toggle(photo.photo_id)}
                  onFullView={() => openModal(photo, i)}
                  onDownload={() => downloadOne(photo.url, `photo-${i + 1}.jpg`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── FIXED: Lightbox modal with prev/next, aspect ratio preserved ── */}
      {fullView && (
        <div
          onClick={() => setFullView(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,18,0.97)', backdropFilter: 'blur(28px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 60px', animation: 'zoomIn .2s ease' }}>

          {/* Close */}
          <button
            onClick={() => setFullView(null)}
            style={{ position: 'absolute', top: 20, right: 20, width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            ✕
          </button>

          {/* Counter */}
          <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            {fullViewIdx + 1} / {photos.length}
          </div>

          {/* Prev button */}
          <button
            onClick={e => { e.stopPropagation(); prevPhoto() }}
            disabled={fullViewIdx === 0}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 20, cursor: fullViewIdx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fullViewIdx === 0 ? 0.3 : 1, zIndex: 10 }}>
            ‹
          </button>

          {/* Image — proper aspect ratio, fits viewport */}
          <div onClick={e => e.stopPropagation()} style={{ animation: 'zoomIn .25s ease' }}>
            <img
              src={fullView.url}
              alt=""
              style={{ maxWidth: 'min(88vw, 1000px)', maxHeight: '78vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)', display: 'block' }}
            />
          </div>

          {/* Next button */}
          <button
            onClick={e => { e.stopPropagation(); nextPhoto() }}
            disabled={fullViewIdx === photos.length - 1}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 20, cursor: fullViewIdx === photos.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fullViewIdx === photos.length - 1 ? 0.3 : 1, zIndex: 10 }}>
            ›
          </button>

          {/* Bottom actions */}
          <div onClick={e => e.stopPropagation()} style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button
              onClick={() => downloadOne(fullView.url, `photo-${fullViewIdx + 1}.jpg`)}
              style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#9b7fe8,#c084fc)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(155,127,232,0.5)' }}>
              ⬇ Download
            </button>
            <button
              onClick={() => setFullView(null)}
              style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
export default function GuestPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  // Persist state in sessionStorage so closing download tab doesn't reset the page
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem(`owl_page_${slug}`) || 'landing'
    return 'landing'
  })
  const [guestInfo, setGuestInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = sessionStorage.getItem(`owl_guest_${slug}`)
      return s ? JSON.parse(s) : null
    }
    return null
  })
  const [photos, setPhotos] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = sessionStorage.getItem(`owl_photos_${slug}`)
      return s ? JSON.parse(s) : []
    }
    return []
  })

  function persistPage(p) { sessionStorage.setItem(`owl_page_${slug}`, p); setPage(p) }
  function persistGuest(g) { sessionStorage.setItem(`owl_guest_${slug}`, JSON.stringify(g)); setGuestInfo(g) }
  function persistPhotos(p) { sessionStorage.setItem(`owl_photos_${slug}`, JSON.stringify(p)); setPhotos(p) }

  useEffect(() => {
    getEventBySlug(slug).then(d => { if (d && d.name) setEvent(d) }).catch(() => {})
  }, [slug])

  async function handleCapture(blob) {
    setSearching(true)
    persistPage('gallery')
    try {
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
      const data = await searchFaces(slug, file)
      if (data.matches) {
        persistPhotos(data.matches)
      } else {
        setError(data.detail || 'No faces found. Try again.')
      }
    } catch (e) { console.error(e) }
    setSearching(false)
  }

  if (page === 'landing') return <GuestLanding event={event} onContinue={info => { persistGuest(info); persistPage('camera') }} />
  if (page === 'camera') return <CameraPage onCapture={handleCapture} onClose={() => persistPage('landing')} />
  return <GalleryPage photos={photos} guestName={guestInfo?.name || 'Guest'} searching={searching} onFaceSearch={() => persistPage('camera')} />
}
