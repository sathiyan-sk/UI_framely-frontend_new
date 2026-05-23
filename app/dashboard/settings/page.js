'use client'
import { useState, useEffect, useRef } from 'react'

const API_URL     = process.env.NEXT_PUBLIC_API_URL     || 'http://localhost:8000'
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

// ── Constants ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    key: 'starter', name: 'Starter', price: 0, priceLabel: 'Free', sub: 'forever free',
    storageNum: 10, storage: '10 GB', accentColor: '#6b7280',
    features: ['10,000 photos','10 GB storage','AI face recognition','Guest QR code','Unlimited events'],
  },
  {
    key: 'pro', name: 'Pro', price: 450, priceLabel: 'Rs.450', sub: 'per month',
    storageNum: 50, storage: '50 GB', accentColor: '#4b19c8', badge: 'MOST POPULAR',
    features: ['50,000 photos','50 GB storage','AI face recognition','Guest QR code','WhatsApp sharing','Priority processing'],
  },
  {
    key: 'elite', name: 'Elite', price: 900, priceLabel: 'Rs.900', sub: 'per month',
    storageNum: 100, storage: '100 GB', accentColor: '#D97736',
    features: ['1,00,000 photos','100 GB storage','AI face recognition','Guest QR code','WhatsApp sharing','Priority processing','Dedicated support'],
  },
]

const INDUSTRIES      = ['Photographer','Videographer','Event Management','Wedding Planner','Corporate Events','Sports Photography','Other']
const EVENTS_PER_YEAR = ['1-5','5-10','10-25','25-50','50+']
const WM_POSITIONS    = [
  { id:'top-left',      label:'Top Left'      },
  { id:'top-center',    label:'Top Center'    },
  { id:'top-right',     label:'Top Right'     },
  { id:'mid-left',      label:'Mid Left'      },
  { id:'mid-center',    label:'Center'        },
  { id:'mid-right',     label:'Mid Right'     },
  { id:'bottom-left',   label:'Bottom Left'   },
  { id:'bottom-center', label:'Bottom Center' },
  { id:'bottom-right',  label:'Bottom Right'  },
]

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:          '#F9F7F4',
  surface:     '#FFFFFF',
  primary:     '#3b82f6',
  secondary:   '#8B8680',
  tertiary:    '#B5B0A9',
  border:      '#EAE6E1',
  borderLight: '#F0EDE8',
  amber:       '#D97736',
  danger:      '#dc2626',
  success:     '#16a34a',
  line:        '#E0DBD3',
}

// ── Global CSS ────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

  .st-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: ${T.bg};
    color: ${T.primary};
    min-height: 100vh;
    padding: 36px 44px 64px;
    max-width: 1280px;
    margin: 0 auto;
  }
  .st-root * { box-sizing: border-box; }

  /* Inputs */
  .st-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid ${T.border}; border-radius: 8px;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: ${T.primary}; background: ${T.surface};
    outline: none; transition: border-color 140ms;
    appearance: none;
  }
  .st-input:focus { border-color: ${T.primary}; }
  .st-input:disabled { background: ${T.bg}; color: ${T.secondary}; cursor: not-allowed; }
  .st-select { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 5 5-5' stroke='%238B8680' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
  .st-label { display: block; font-size: 11px; font-weight: 600; color: ${T.secondary}; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 7px; font-family: 'DM Mono', monospace; }

  /* Cards */
  .st-card { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 12px; }

  /* Left nav */
  .st-nav-btn {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 8px;
    border: none; background: transparent;
    cursor: pointer; text-align: left;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px;
    color: ${T.secondary}; transition: background 120ms, color 120ms;
    position: relative;
  }
  .st-nav-btn:hover { background: ${T.bg}; color: ${T.primary}; }
  .st-nav-btn.active { background: ${T.bg}; color: ${T.primary}; font-weight: 600; }

  /* Buttons */
  .st-btn-primary {
    padding: 10px 22px; border-radius: 8px;
    background: ${T.primary}; color: #fff; border: none;
    font-size: 13.5px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    display: inline-flex; align-items: center; gap: 7px;
    transition: opacity 140ms;
  }
  .st-btn-primary:hover { opacity: 0.88; }
  .st-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .st-btn-primary.saved { background: #f0fdf4; color: ${T.success}; border: 1px solid rgba(22,163,74,0.2); }
  .st-btn-outline {
    padding: 9px 16px; border-radius: 8px;
    background: ${T.surface}; color: ${T.secondary};
    border: 1px solid ${T.border};
    font-size: 13px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    display: inline-flex; align-items: center; gap: 6px;
    transition: background 120ms;
  }
  .st-btn-outline:hover { background: ${T.bg}; }

  /* Toggle */
  .st-toggle { width: 44px; height: 24px; border-radius: 12px; position: relative; cursor: pointer; transition: background 200ms; border: none; padding: 0; flex-shrink: 0; }
  .st-toggle .knob { position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 200ms; box-shadow: 0 1px 4px rgba(0,0,0,0.18); }

  /* Pill selector */
  .st-pill { padding: 6px 14px; border-radius: 20px; border: 1px solid ${T.border}; background: ${T.surface}; font-size: 12.5px; color: ${T.secondary}; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 140ms; }
  .st-pill.active { background: ${T.primary}; color: #fff; border-color: ${T.primary}; }

  /* Feature check row */
  .st-feature { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: ${T.secondary}; margin-bottom: 9px; }
  .st-feature svg { flex-shrink: 0; }

  /* Segment control (size picker) */
  .st-seg { display: flex; border: 1px solid ${T.border}; border-radius: 8px; overflow: hidden; }
  .st-seg-btn { flex: 1; padding: 9px 0; border: none; background: ${T.surface}; color: ${T.secondary}; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: background 120ms; border-right: 1px solid ${T.border}; }
  .st-seg-btn:last-child { border-right: none; }
  .st-seg-btn.active { background: ${T.primary}; color: #fff; font-weight: 600; }

  /* Position grid button */
  .st-pos-btn { padding: 11px 6px; border-radius: 8px; border: 1px solid ${T.border}; background: ${T.surface}; color: ${T.secondary}; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 140ms; text-align: center; }
  .st-pos-btn:hover { border-color: ${T.primary}; color: ${T.primary}; }
  .st-pos-btn.active { background: ${T.primary}; color: #fff; border-color: ${T.primary}; font-weight: 600; }

  /* Progress bar */
  .st-progress { height: 5px; background: ${T.bg}; border-radius: 99px; overflow: hidden; }
  .st-progress-fill { height: 100%; border-radius: 99px; background: ${T.primary}; transition: width 400ms; }

  /* Range input */
  input[type=range] { width: 100%; accent-color: ${T.primary}; cursor: pointer; }

  /* Plan card */
  .plan-card { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 12px; padding: 24px; position: relative; }
  .plan-card.current { border: 2px solid ${T.amber}; }
  .plan-card.popular-ring { border: 1px solid ${T.border}; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 240ms ease; }
`

// ── WatermarkPreview ──────────────────────────────────────────────────────────
function WatermarkPreview({ branding, logoPreview }) {
  const pos     = branding.watermark_position || 'bottom-right'
  const mx      = (branding.watermark_margin_x ?? 3) + '%'
  const my      = (branding.watermark_margin_y ?? 3) + '%'
  const opacity = (branding.watermark_opacity ?? 80) / 100
  const sizeMap = { small: '12%', medium: '20%', large: '30%' }
  const logoW   = sizeMap[branding.watermark_size] || '20%'

  const style = { position:'absolute', width:logoW, maxWidth:logoW, opacity, objectFit:'contain', transition:'all .25s ease' }
  if (pos==='top-left')      { style.top=my;    style.left='50%'; style.transform='translateX(-50%)'; style.left=mx; style.transform='none' }
  if (pos==='top-center')    { style.top=my;    style.left='50%'; style.transform='translateX(-50%)' }
  if (pos==='top-right')     { style.top=my;    style.right=mx;   style.transform='none' }
  if (pos==='mid-left')      { style.top='50%'; style.left=mx;    style.transform='translateY(-50%)' }
  if (pos==='mid-center')    { style.top='50%'; style.left='50%'; style.transform='translate(-50%,-50%)' }
  if (pos==='mid-right')     { style.top='50%'; style.right=mx;   style.transform='translateY(-50%)' }
  if (pos==='bottom-left')   { style.bottom=my; style.left=mx;    style.transform='none' }
  if (pos==='bottom-center') { style.bottom=my; style.left='50%'; style.transform='translateX(-50%)' }
  if (pos==='bottom-right')  { style.bottom=my; style.right=mx;   style.transform='none' }

  const posLabel = pos.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="st-card" style={{ padding:'20px' }}>
      <div style={{ marginBottom:14 }}>
        <span style={{ fontSize:15,fontWeight:600,color:T.primary,fontFamily:"'Playfair Display',serif",letterSpacing:'-0.02em' }}>Live Preview</span>
        <span style={{ fontSize:12,color:T.secondary,marginLeft:8,fontStyle:'italic' }}>— updates instantly</span>
      </div>
      <div style={{ position:'relative',width:'100%',paddingBottom:'56.25%',borderRadius:10,overflow:'hidden',background:'#c9d6e3' }}>
        <div style={{ position:'absolute',inset:0 }}>
          <svg width="100%" height="100%" viewBox="0 0 560 315" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="sBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9d6e3"/><stop offset="40%" stopColor="#e8ddd0"/><stop offset="100%" stopColor="#b8c4a8"/>
              </linearGradient>
              <linearGradient id="sGnd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8a9e7a"/><stop offset="100%" stopColor="#6b7d5a"/>
              </linearGradient>
            </defs>
            <rect width="560" height="315" fill="url(#sBg)"/>
            <ellipse cx="120" cy="70" rx="80" ry="30" fill="rgba(255,255,255,0.6)"/>
            <ellipse cx="100" cy="65" rx="55" ry="25" fill="rgba(255,255,255,0.7)"/>
            <ellipse cx="380" cy="50" rx="100" ry="35" fill="rgba(255,255,255,0.55)"/>
            <rect x="0" y="220" width="560" height="95" fill="url(#sGnd)"/>
            <ellipse cx="200" cy="215" rx="18" ry="22" fill="rgba(60,40,20,0.7)"/>
            <rect x="186" y="215" width="28" height="55" rx="8" fill="rgba(60,40,20,0.65)"/>
            <ellipse cx="260" cy="210" rx="16" ry="20" fill="rgba(60,40,20,0.7)"/>
            <rect x="247" y="210" width="26" height="60" rx="8" fill="rgba(80,50,30,0.6)"/>
            <circle cx="480" cy="60" r="28" fill="rgba(255,220,100,0.5)"/>
            <circle cx="480" cy="60" r="18" fill="rgba(255,235,120,0.7)"/>
          </svg>
          {branding.watermark_enabled ? (
            logoPreview
              ? <img src={logoPreview} alt="wm" style={style}/>
              : <div style={{ ...style, width:undefined, fontSize:11, fontWeight:700, color:`rgba(255,255,255,${opacity})`, background:'rgba(0,0,0,0.35)', padding:'4px 10px', borderRadius:5, whiteSpace:'nowrap', backdropFilter:'blur(4px)' }}>Your Studio Name</div>
          ) : (
            <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <div style={{ fontSize:11,color:'rgba(255,255,255,0.5)',fontWeight:600,background:'rgba(0,0,0,0.3)',padding:'5px 12px',borderRadius:20 }}>Watermark disabled</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop:10,fontSize:11.5,color:T.secondary,textAlign:'center',fontFamily:"'DM Mono',monospace" }}>
        Position: <strong style={{ color:T.primary }}>{posLabel}</strong>
        &nbsp;·&nbsp;Size: <strong style={{ color:T.primary }}>{branding.watermark_size}</strong>
        &nbsp;·&nbsp;Opacity: <strong style={{ color:T.primary }}>{branding.watermark_opacity}%</strong>
      </div>
    </div>
  )
}

// ── Check icon ────────────────────────────────────────────────────────────────
function Check({ color = T.secondary }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="7" stroke={color} strokeWidth="1.2" fill="none"/>
      <path d="M4.5 7.5l2 2 4-4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab,          setTab]          = useState('profile')
  const [planData,     setPlanData]     = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [payLoading,   setPayLoading]   = useState('')
  const [successMsg,   setSuccessMsg]   = useState('')
  const [errorMsg,     setErrorMsg]     = useState('')
  const [brandingSaving, setBrandingSaving] = useState(false)
  const [brandingSaved,  setBrandingSaved]  = useState(false)
  const [logoPreview,  setLogoPreview]  = useState(null)
  const [logoFile,     setLogoFile]     = useState(null)
  const logoInputRef = useRef(null)

  const [profile, setProfile] = useState({
    full_name: '', email: '', phone: '', company_name: '', industry: '', events_per_year: '', avatar_url: '',
  })
  const [branding, setBranding] = useState({
    logo_url: null, watermark_position: 'bottom-right', watermark_enabled: false,
    watermark_opacity: 80, watermark_size: 'medium', watermark_margin_x: 3, watermark_margin_y: 3,
  })

  useEffect(() => { fetchProfile(); fetchPlan() }, [])
  useEffect(() => {
    if (tab === 'plan' && !window.Razorpay) {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(s)
    }
  }, [tab])

  async function fetchProfile() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(API_URL + '/auth/me', { headers: { Authorization: 'Bearer ' + token } })
      const d   = await res.json()
      if (d.email) {
        setProfile(p => ({ ...p, full_name: d.full_name||'', email: d.email||'', phone: d.phone||'', company_name: d.company_name||'', industry: d.industry||'', events_per_year: d.events_per_year||'', avatar_url: d.avatar_url||'' }))
        if (d.logo_url !== undefined) {
          const pu = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''
          setBranding({ logo_url: d.logo_url||null, watermark_position: d.watermark_position||'bottom-right', watermark_enabled: d.watermark_enabled||false, watermark_opacity: d.watermark_opacity??80, watermark_size: d.watermark_size||'medium', watermark_margin_x: d.watermark_margin_x??3, watermark_margin_y: d.watermark_margin_y??3 })
          if (d.logo_url) setLogoPreview(d.logo_url.startsWith('http') ? d.logo_url : `${pu}/${d.logo_url}`)
        }
      }
    } catch (e) { console.error(e) }
  }

  async function fetchPlan() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(API_URL + '/payments/my-plan', { headers: { Authorization: 'Bearer ' + token } })
      setPlanData(await res.json())
    } catch (e) { console.error(e) }
  }

  async function saveProfile() {
    setSaving(true)
    const token = localStorage.getItem('token')
    try {
      await fetch(API_URL + '/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ full_name: profile.full_name, phone: profile.phone }),
      })
    } catch (e) { console.error(e) }
    setSaved(true); setTimeout(() => setSaved(false), 2500); setSaving(false)
  }

  function handleLogoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)) { alert('Please upload a PNG, JPG, WebP or SVG file.'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB.'); return }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function saveBranding() {
    setBrandingSaving(true)
    const token = localStorage.getItem('token')
    try {
      let logoKey = branding.logo_url
      if (logoFile) {
        const pr = await fetch(API_URL + '/auth/logo-upload-url', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ filename: logoFile.name, content_type: logoFile.type }),
        })
        if (pr.ok) {
          const { upload_url, logo_key } = await pr.json()
          await fetch(upload_url, { method: 'PUT', headers: { 'Content-Type': logoFile.type }, body: logoFile })
          logoKey = logo_key
        }
      }
      await fetch(API_URL + '/auth/update-branding', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ logo_url: logoKey, watermark_position: branding.watermark_position, watermark_enabled: branding.watermark_enabled, watermark_opacity: branding.watermark_opacity, watermark_size: branding.watermark_size, watermark_margin_x: branding.watermark_margin_x, watermark_margin_y: branding.watermark_margin_y }),
      })
      setBranding(b => ({ ...b, logo_url: logoKey }))
      setLogoFile(null)
      setBrandingSaved(true); setTimeout(() => setBrandingSaved(false), 2500)
    } catch (e) { console.error(e); alert('Failed to save branding.') }
    setBrandingSaving(false)
  }

  async function upgrade(planKey) {
    setPayLoading(planKey); setErrorMsg('')
    const token = localStorage.getItem('token')
    try {
      const r     = await fetch(API_URL + '/payments/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ plan: planKey }),
      })
      const order = await r.json()
      const opts  = {
        key: RAZORPAY_KEY, amount: order.amount, currency: 'INR',
        name: 'Framelyy', description: order.plan_name + ' Plan', order_id: order.order_id,
        prefill: { name: order.photographer_name, email: order.photographer_email },
        theme: { color: '#1A1814' },
        handler: async function(resp) {
          const v = await fetch(API_URL + '/payments/verify-payment', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ ...resp, plan: planKey }),
          })
          const result = await v.json()
          if (result.success) { setSuccessMsg('Plan activated!'); fetchPlan() }
          else setErrorMsg('Verification failed.')
          setPayLoading('')
        },
        modal: { ondismiss: () => setPayLoading('') },
      }
      new window.Razorpay(opts).open()
    } catch (e) { setErrorMsg('Payment failed. Try again.'); setPayLoading('') }
  }

  const curPlan    = PLANS.find(p => p.key === (planData?.current_plan)) || PLANS[0]
  const pct        = planData ? Math.min((planData.photos_used / planData.photos_limit) * 100, 100) : 0
  const gb         = planData ? (planData.storage_used_bytes / Math.pow(1024, 3)).toFixed(2) : '0.00'
  const storagePct = Math.min((parseFloat(gb) / curPlan.storageNum) * 100, 100)

  const NAV_ITEMS = [
    { id:'profile',  label:'Profile',   svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { id:'branding', label:'Branding',  svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/></svg> },
    { id:'plan',     label:'My Plan',   svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l1.5 3h3.5l-2.8 2 1 3.5L7 8.5l-3.2 1.5 1-3.5L2 4.5h3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
    { id:'billing',  label:'Invoices',  svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  ]

  return (
    <div className="st-root">
      <style>{css}</style>
      <div className="db-page-container">

      {/* Page heading */}
      <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(28px, 5vw, 36px)', fontWeight:400, letterSpacing:'-0.02em', margin:'0 0 6px', lineHeight:1.1 }}>Settings</h1>
        <p style={{ fontSize:14, color:T.secondary, margin:0 }}>Manage your account, subscription and branding</p>
      </div>

        <div className="st-settings-layout">

        {/* ── Left nav ── */}
          <div className="st-sidebar-nav">
          <div className="st-card" style={{ padding:6 }}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`st-nav-btn${tab===item.id?' active':''}`} onClick={()=>setTab(item.id)}>
                <span style={{ color: tab===item.id ? T.primary : T.tertiary }}>{item.svg}</span>
                {item.label}
                {tab===item.id && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:T.amber }} />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
          <div className="st-content-area">
          {/* ════════ PROFILE ════════ */}
          {tab==='profile' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Avatar card */}
              <div className="st-card" style={{ padding:'22px 28px', display:'flex', alignItems:'center', gap:20 }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#6b8f71', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, border:`3px solid ${T.surface}`, boxShadow:`0 0 0 1px ${T.border}` }}>
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                    : <span style={{ color:'#fff', fontSize:22, fontWeight:600, fontFamily:"'DM Serif Display',serif" }}>{profile.full_name ? profile.full_name[0].toUpperCase() : 'P'}</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:22, fontWeight:400, marginBottom:3, letterSpacing:'-0.01em' }}>{profile.full_name || 'Your Name'}</div>
                  <div style={{ fontSize:13, color:T.secondary, marginBottom:10 }}>{profile.email}</div>
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:4, border:`1px solid ${T.amber}`, color:T.amber, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:"'DM Mono',monospace" }}>
                    {curPlan.name} Plan
                  </span>
                </div>
                <button
                  className={`st-btn-primary${saved?' saved':''}`}
                  onClick={saveProfile}
                  disabled={saving}
                >
                  {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>

              {/* 2-col form */}
              <div className="db-settings-2col">
                {/* Personal Details */}
                <div className="st-card" style={{ padding:'22px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke={T.secondary} strokeWidth="1.3"/><path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke={T.secondary} strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <span style={{ fontSize:14, fontWeight:600, color:T.primary }}>Personal Details</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div>
                      <label className="st-label">Full Name</label>
                      <input className="st-input" value={profile.full_name} onChange={e=>setProfile(p=>({...p,full_name:e.target.value}))} placeholder="Your Name"/>
                    </div>
                    <div>
                      <label className="st-label">Email Address</label>
                      <input className="st-input" value={profile.email} disabled style={{ background:T.bg }}/>
                      <div style={{ fontSize:11.5, color:'#f87171', marginTop:5, fontStyle:'italic' }}>Email cannot be changed</div>
                    </div>
                    <div>
                      <label className="st-label">Mobile Number</label>
                      <input className="st-input" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210"/>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="st-card" style={{ padding:'22px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="5" width="10" height="7.5" rx="1" stroke={T.secondary} strokeWidth="1.3"/><path d="M5 5V3.5a2 2 0 014 0V5" stroke={T.secondary} strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <span style={{ fontSize:14, fontWeight:600, color:T.primary }}>Business Details</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div>
                      <label className="st-label">Studio Name</label>
                      <input className="st-input" value={profile.company_name} onChange={e=>setProfile(p=>({...p,company_name:e.target.value}))} placeholder="Your Studio"/>
                    </div>
                    <div>
                      <label className="st-label">Industry</label>
                      <select className="st-input st-select" value={profile.industry} onChange={e=>setProfile(p=>({...p,industry:e.target.value}))}>
                        <option value="">Select Industry</option>
                        {INDUSTRIES.map(i=><option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="st-label">Events per Year</label>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:2 }}>
                        {EVENTS_PER_YEAR.map(opt => (
                          <button key={opt} className={`st-pill${profile.events_per_year===opt?' active':''}`} onClick={()=>setProfile(p=>({...p,events_per_year:opt}))}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ BRANDING ════════ */}
          {tab==='branding' && (
            <div className="fade-up">
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div>
                  <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:26, fontWeight:400, letterSpacing:'-0.02em', margin:'0 0 4px' }}>Watermark &amp; Branding</h2>
                  <p style={{ fontSize:13, color:T.secondary, margin:0 }}>Logo applied to all new uploads. Existing photos are not affected.</p>
                </div>
                <button className={`st-btn-primary${brandingSaved?' saved':''}`} onClick={saveBranding} disabled={brandingSaving}>
                  {brandingSaved ? '✓ Saved' : brandingSaving ? 'Saving…' : 'Save Branding'}
                </button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:20, alignItems:'start' }}>

                {/* Left column */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                  {/* Logo upload */}
                  <div className="st-card" style={{ padding:'20px 22px' }}>
                    <div style={{ fontSize:15, fontWeight:600, color:T.primary, marginBottom:3 }}>Studio Logo</div>
                    <div style={{ fontSize:12, color:T.secondary, marginBottom:16 }}>PNG with transparent background recommended · Max 2MB</div>
                    <div
                      onClick={()=>logoInputRef.current?.click()}
                      style={{ width:'100%', aspectRatio:'3/2', borderRadius:8, border:`1.5px dashed ${T.border}`, background:T.bg, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', marginBottom:12, transition:'border-color 140ms' }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=T.primary}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}
                    >
                      {logoPreview
                        ? <img src={logoPreview} alt="logo" style={{ maxWidth:'80%', maxHeight:'80%', objectFit:'contain' }}/>
                        : <div style={{ textAlign:'center' }}>
                            <div style={{ marginBottom:8 }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3v14M5 10l7-7 7 7" stroke={T.tertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 21h18" stroke={T.tertiary} strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </div>
                            <div style={{ fontSize:12, color:T.secondary, fontWeight:500 }}>logo</div>
                          </div>}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoSelect} style={{ display:'none' }}/>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="st-btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={()=>logoInputRef.current?.click()}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6.5h5M6.5 4v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        {logoPreview ? 'Change Logo' : 'Change Logo'}
                      </button>
                      {logoPreview && (
                        <button className="st-btn-outline" style={{ color:T.danger, borderColor:'rgba(220,38,38,0.2)' }} onClick={()=>{setLogoPreview(null);setLogoFile(null);setBranding(b=>({...b,logo_url:null}))}}>
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enable watermark toggle */}
                  <div className="st-card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:T.primary, marginBottom:3 }}>Enable Watermark</div>
                      <div style={{ fontSize:12, color:T.secondary }}>Apply to all new uploads</div>
                    </div>
                    <button
                      className="st-toggle"
                      style={{ background: branding.watermark_enabled ? T.primary : T.border }}
                      onClick={()=>setBranding(b=>({...b,watermark_enabled:!b.watermark_enabled}))}
                    >
                      <div className="knob" style={{ left: branding.watermark_enabled ? 23 : 3 }}/>
                    </button>
                  </div>

                  {/* Watermark options */}
                  <div className="st-card" style={{ padding:'20px 22px', opacity: branding.watermark_enabled?1:0.45, pointerEvents: branding.watermark_enabled?'auto':'none', transition:'opacity .2s' }}>
                    <div style={{ fontSize:14, fontWeight:600, color:T.primary, marginBottom:18 }}>Watermark Options</div>

                    {/* Size */}
                    <div style={{ marginBottom:18 }}>
                      <label className="st-label">Size</label>
                      <div className="st-seg">
                        {['small','medium','large'].map(s=>(
                          <button key={s} className={`st-seg-btn${branding.watermark_size===s?' active':''}`} onClick={()=>setBranding(b=>({...b,watermark_size:s}))} style={{ textTransform:'capitalize' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity */}
                    <div style={{ marginBottom:18 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                        <label className="st-label" style={{ margin:0 }}>Opacity</label>
                        <span style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:"'DM Mono',monospace" }}>{branding.watermark_opacity}%</span>
                      </div>
                      <input type="range" min="10" max="100" value={branding.watermark_opacity} onChange={e=>setBranding(b=>({...b,watermark_opacity:Number(e.target.value)}))}/>
                    </div>

                    {/* H margin */}
                    <div style={{ marginBottom:18 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                        <label className="st-label" style={{ margin:0 }}>Horizontal Margin</label>
                        <span style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:"'DM Mono',monospace" }}>{branding.watermark_margin_x}%</span>
                      </div>
                      <input type="range" min="0" max="20" value={branding.watermark_margin_x} onChange={e=>setBranding(b=>({...b,watermark_margin_x:Number(e.target.value)}))}/>
                    </div>

                    {/* V margin */}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                        <label className="st-label" style={{ margin:0 }}>Vertical Margin</label>
                        <span style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:"'DM Mono',monospace" }}>{branding.watermark_margin_y}%</span>
                      </div>
                      <input type="range" min="0" max="20" value={branding.watermark_margin_y} onChange={e=>setBranding(b=>({...b,watermark_margin_y:Number(e.target.value)}))}/>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {/* Position grid */}
                  <div className="st-card" style={{ padding:'20px 22px' }}>
                    <div style={{ fontSize:15, fontWeight:600, color:T.primary, marginBottom:16 }}>Watermark Position</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                      {WM_POSITIONS.map(pos => (
                        <button key={pos.id} className={`st-pos-btn${branding.watermark_position===pos.id?' active':''}`} onClick={()=>setBranding(b=>({...b,watermark_position:pos.id}))}>{pos.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Live preview */}
                  <WatermarkPreview branding={branding} logoPreview={logoPreview}/>
                </div>
              </div>

              {/* Warning note */}
              <div style={{ marginTop:16, padding:'14px 18px', borderRadius:10, background:'#fffbeb', border:'1px solid rgba(217,119,54,0.25)', fontSize:12.5, color:'#92400e', lineHeight:1.65 }}>
                <strong>Note:</strong> Watermark applies to both thumbnail and original during upload processing. Only photos uploaded <strong>after</strong> enabling will have the watermark. Face detection runs on the clean image before watermarking — so AI recognition is not affected.
              </div>
            </div>
          )}

          {/* ════════ MY PLAN ════════ */}
          {tab==='plan' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {successMsg && <div style={{ padding:'12px 16px', borderRadius:8, background:'#f0fdf4', border:'1px solid rgba(22,163,74,0.2)', fontSize:13, color:T.success }}>{successMsg}</div>}
              {errorMsg   && <div style={{ padding:'12px 16px', borderRadius:8, background:'#fef2f2', border:'1px solid rgba(220,38,38,0.2)', fontSize:13, color:T.danger }}>{errorMsg}</div>}

              {/* Active plan banner */}
              <div className="st-card" style={{ padding:'24px 28px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:T.secondary, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:"'DM Mono',monospace", marginBottom:12 }}>Active Plan</div>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:30, fontWeight:700, color:T.amber, letterSpacing:'-0.02em' }}>{curPlan.name}</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:4, border:`1px solid ${T.border}`, color:T.secondary, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:"'DM Mono',monospace" }}>
                      {planData?.current_plan==='starter' ? 'Free Forever' : 'Active'}
                    </span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:26, fontWeight:700, color:T.amber }}>
                      {curPlan.price===0 ? 'Free' : `Rs. ${curPlan.price.toLocaleString()}`}
                    </span>
                    {curPlan.price>0 && <span style={{ fontSize:13, color:T.secondary, marginLeft:5 }}>per month</span>}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                  {[
                    { label:'Photos Used', val:`${planData?.photos_used||0} / ${planData?.photos_limit?.toLocaleString()||'1,000'}`, pct },
                    { label:'Storage',     val:`${gb} GB / ${curPlan.storage}`, pct: storagePct },
                  ].map(s=>(
                    <div key={s.label}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                        <span style={{ fontSize:13, color:T.secondary }}>{s.label}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:"'DM Mono',monospace" }}>{s.val}</span>
                      </div>
                      <div className="st-progress">
                        <div className="st-progress-fill" style={{ width:`${s.pct}%`, background: s.pct>80?'#ef4444':T.primary }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan cards */}
                <div className="db-plans-grid">
                {PLANS.map(plan => {
                  const isCurrent = planData?.current_plan === plan.key
                  const isPopular = plan.badge

                  return (
                    <div key={plan.key} style={{ position:'relative' }}>
                      {/* Most popular badge — above card */}
                      {isPopular && !isCurrent && (
                        <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', zIndex:2, background:T.amber, color:'#fff', fontSize:9, fontWeight:800, padding:'3px 12px', borderRadius:20, letterSpacing:'0.08em', whiteSpace:'nowrap', fontFamily:"'DM Mono',monospace" }}>
                          {plan.badge}
                        </div>
                      )}
                      <div className={`plan-card${isCurrent?' current':''}`} style={{ border: isCurrent ? `2px solid ${T.amber}` : `1px solid ${T.border}` }}>
                        {isCurrent && (
                          <div style={{ position:'absolute', top:12, right:12, fontSize:9, fontWeight:800, padding:'2px 8px', borderRadius:4, color:T.amber, border:`1px solid ${T.amber}`, fontFamily:"'DM Mono',monospace", letterSpacing:'0.06em' }}>CURRENT</div>
                        )}

                        <div style={{ fontSize:13, color:T.secondary, marginBottom:6 }}>{plan.name}</div>
                        <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:32, fontWeight:700, color:T.primary, letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:2 }}>
                          {plan.price===0 ? 'Free' : plan.priceLabel}
                        </div>
                        <div style={{ fontSize:12, color:T.secondary, marginBottom:18 }}>{plan.sub}</div>

                        <div style={{ marginBottom:20 }}>
                          {plan.features.map((f,i)=>(
                            <div key={i} className="st-feature">
                              <Check color={isCurrent ? T.amber : T.secondary}/>
                              {f}
                            </div>
                          ))}
                        </div>

                        {isCurrent ? (
                          <button style={{ width:'100%', padding:'10px', borderRadius:8, border:`1px solid ${T.amber}`, background:'transparent', color:T.amber, fontSize:13, fontWeight:600, cursor:'default', fontFamily:"'DM Sans',sans-serif" }}>Active Plan</button>
                        ) : plan.price===0 ? (
                          <button style={{ width:'100%', padding:'10px', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', color:T.secondary, fontSize:13, cursor:'default', fontFamily:"'DM Sans',sans-serif" }}>Free tier</button>
                        ) : (
                          <button
                            onClick={()=>upgrade(plan.key)}
                            disabled={!!payLoading}
                            className="st-btn-primary"
                            style={{ width:'100%', justifyContent:'center', opacity:payLoading===plan.key?0.6:1 }}
                          >
                            {payLoading===plan.key ? 'Processing…' : `Upgrade to ${plan.name}`}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ════════ INVOICES ════════ */}
          {tab==='billing' && (
            <div className="fade-up">
              <div className="st-card" style={{ padding:'64px 40px', textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:12, background:T.bg, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="16" height="18" rx="2" stroke={T.secondary} strokeWidth="1.4"/><path d="M7 7h8M7 11h8M7 15h5" stroke={T.secondary} strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:100, fontWeight:400, color:T.primary, marginBottom:6 }}>No invoices yet</p>
                <p style={{ fontSize:13, color:T.secondary, lineHeight:1.6 }}>Your payment will appear here once you upgrade your plan.</p>
              </div>
            </div>
          )}

        </div> 
      </div>
      </div>
    </div>
  )
}
