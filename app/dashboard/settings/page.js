'use client'
import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

const PLANS = [
  {
    key: 'starter', name: 'Starter', price: 0, priceLabel: 'Free',
    storageNum: 10, storage: '10 GB', color: '#6b7280',
    bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)',
    features: ['10,000 photos', '10 GB storage', 'AI face recognition', 'Guest QR code', 'Unlimited events'],
  },
  {
    key: 'pro', name: 'Pro', price: 450, priceLabel: '450', badge: 'Most Popular',
    storageNum: 50, storage: '50 GB', color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.3)',
    features: ['50,000 photos', '50 GB storage', 'AI face recognition', 'Guest QR code', 'WhatsApp sharing', 'Priority processing'],
  },
  {
    key: 'elite', name: 'Elite', price: 900, priceLabel: '900', badge: 'Best Value',
    storageNum: 100, storage: '100 GB', color: '#d97706',
    bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.3)',
    features: ['1,00,000 photos', '100 GB storage', 'AI face recognition', 'Guest QR code', 'WhatsApp sharing', 'Priority processing', 'Dedicated support'],
  },
]

const INDUSTRIES = ['Photographer', 'Videographer', 'Event Management', 'Wedding Planner', 'Corporate Events', 'Sports Photography', 'Other']
const EVENTS_PER_YEAR = ['1-5', '5-10', '10-25', '25-50', '50+']
const INDIAN_STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']

const glass = (extra) => Object.assign({
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: 20,
  boxShadow: '0 4px 24px rgba(100,80,180,0.07)',
}, extra || {})

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 13,
  color: '#2d1b69', background: 'rgba(255,255,255,0.7)',
  border: '1.5px solid rgba(155,127,232,0.2)', outline: 'none',
  fontFamily: 'inherit', transition: 'border .15s', boxSizing: 'border-box',
}

const lbl = { fontSize: 12, fontWeight: 600, color: '#7c6aaa', marginBottom: 6, display: 'block' }

export default function SettingsPage() {
  const [tab, setTab] = useState('profile')
  const [planData, setPlanData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [payLoading, setPayLoading] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [profile, setProfile] = useState({
    full_name: '', email: '', phone: '', state: '', city: '',
    company_name: '', industry: '', events_per_year: '',
    billing_company: '', gstin: '', avatar_url: '',
  })

  useEffect(() => {
    fetchProfile()
    fetchPlan()
  }, [])

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
      const d = await res.json()
      if (d.email) setProfile(p => Object.assign({}, p, { full_name: d.full_name || '', email: d.email || '', avatar_url: d.avatar_url || '' }))
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
    await new Promise(r => setTimeout(r, 700))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  async function upgrade(planKey) {
    setPayLoading(planKey)
    setErrorMsg('')
    const token = localStorage.getItem('token')
    try {
      const r = await fetch(API_URL + '/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ plan: planKey }),
      })
      const order = await r.json()
      const opts = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: 'INR',
        name: 'PhotoOwl',
        description: order.plan_name + ' Plan',
        order_id: order.order_id,
        prefill: { name: order.photographer_name, email: order.photographer_email },
        theme: { color: '#9b7fe8' },
        handler: async function(resp) {
          const v = await fetch(API_URL + '/payments/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify(Object.assign({}, resp, { plan: planKey })),
          })
          const result = await v.json()
          if (result.success) { setSuccessMsg('Plan activated!'); fetchPlan() }
          else setErrorMsg('Verification failed.')
          setPayLoading('')
        },
        modal: { ondismiss: function() { setPayLoading('') } },
      }
      new window.Razorpay(opts).open()
    } catch (e) {
      setErrorMsg('Payment failed. Try again.')
      setPayLoading('')
    }
  }

  const curPlan = PLANS.find(p => p.key === (planData && planData.current_plan)) || PLANS[0]
  const pct = planData ? Math.min((planData.photos_used / planData.photos_limit) * 100, 100) : 0
  const gb = planData ? (planData.storage_used_bytes / Math.pow(1024, 3)).toFixed(2) : '0'

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'plan', label: 'My Plan', icon: '⭐' },
    { id: 'billing', label: 'Invoices', icon: '🧾' },
  ]

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2d1b69', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#9b89c4' }}>Manage your account, subscription and billing</p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        <div style={{ width: 175, flexShrink: 0 }}>
          <div style={glass({ padding: 8, borderRadius: 18 })}>
            {tabs.map(function(t) {
              return (
                <button key={t.id} onClick={function() { setTab(t.id) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, border: 'none', background: tab === t.id ? 'linear-gradient(135deg,rgba(155,127,232,0.18),rgba(192,132,252,0.12))' : 'transparent', cursor: 'pointer', marginBottom: 3, textAlign: 'left' }}>
                  <span style={{ fontSize: 15 }}>{t.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? '#2d1b69' : '#9b89c4' }}>{t.label}</span>
                  {tab === t.id && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#9b7fe8' }} />}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>

          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={glass({ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20 })}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#9b7fe8,#c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 6px 20px rgba(155,127,232,0.35)', border: '3px solid rgba(255,255,255,0.9)' }}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <span style={{ color: '#fff', fontSize: 26, fontWeight: 800 }}>{profile.full_name ? profile.full_name[0].toUpperCase() : 'P'}</span>
                    }
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2d1b69', marginBottom: 2 }}>{profile.full_name || 'Your Name'}</div>
                  <div style={{ fontSize: 13, color: '#9b89c4', marginBottom: 8 }}>{profile.email}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: curPlan.bg, border: '1px solid ' + curPlan.border, color: curPlan.color }}>{curPlan.name} Plan</span>
                </div>
                <button onClick={saveProfile} disabled={saving} style={{ padding: '11px 24px', borderRadius: 12, background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg,#9b7fe8,#c084fc)', color: saved ? '#15803d' : '#fff', border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
                  {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                <div style={glass({ padding: '22px 24px' })}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(155,127,232,0.1)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(155,127,232,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👤</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#2d1b69' }}>Personal Details</div>
                      <div style={{ fontSize: 11, color: '#9b89c4' }}>Your basic information</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <div>
                      <label style={lbl}>Full Name</label>
                      <input style={inp} value={profile.full_name} onChange={function(e) { setProfile(function(p) { return Object.assign({}, p, { full_name: e.target.value }) }) }} placeholder="Rahul Sharma" onFocus={function(e) { e.target.style.border = '1.5px solid #9b7fe8' }} onBlur={function(e) { e.target.style.border = '1.5px solid rgba(155,127,232,0.2)' }} />
                    </div>
                    <div>
                      <label style={lbl}>Email Address</label>
                      <input style={Object.assign({}, inp, { background: 'rgba(155,127,232,0.05)', color: '#9b89c4', cursor: 'not-allowed' })} value={profile.email} disabled placeholder="you@example.com" />
                      <div style={{ fontSize: 10, color: '#c4b5fd', marginTop: 3 }}>Email cannot be changed</div>
                    </div>
                    <div>
                      <label style={lbl}>Mobile Number</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={Object.assign({}, inp, { width: 50, padding: '11px 8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>🇮🇳</div>
                        <input style={Object.assign({}, inp, { flex: 1 })} value={profile.phone} onChange={function(e) { setProfile(function(p) { return Object.assign({}, p, { phone: e.target.value }) }) }} placeholder="+91 98765 43210" onFocus={function(e) { e.target.style.border = '1.5px solid #9b7fe8' }} onBlur={function(e) { e.target.style.border = '1.5px solid rgba(155,127,232,0.2)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={lbl}>State</label>
                        <select style={Object.assign({}, inp, { cursor: 'pointer' })} value={profile.state} onChange={function(e) { setProfile(function(p) { return Object.assign({}, p, { state: e.target.value }) }) }}>
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(function(s) { return <option key={s} value={s}>{s}</option> })}
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>City</label>
                        <input style={inp} value={profile.city} onChange={function(e) { setProfile(function(p) { return Object.assign({}, p, { city: e.target.value }) }) }} placeholder="Bengaluru" onFocus={function(e) { e.target.style.border = '1.5px solid #9b7fe8' }} onBlur={function(e) { e.target.style.border = '1.5px solid rgba(155,127,232,0.2)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={glass({ padding: '22px 24px' })}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(155,127,232,0.1)' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(155,127,232,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🏢</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#2d1b69' }}>Company Details</div>
                        <div style={{ fontSize: 11, color: '#9b89c4' }}>Your business information</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      <div>
                        <label style={lbl}>Company / Studio Name</label>
                        <input style={inp} value={profile.company_name} onChange={function(e) { setProfile(function(p) { return Object.assign({}, p, { company_name: e.target.value }) }) }} placeholder="Varalakshmi Photography" onFocus={function(e) { e.target.style.border = '1.5px solid #9b7fe8' }} onBlur={function(e) { e.target.style.border = '1.5px solid rgba(155,127,232,0.2)' }} />
                      </div>
                      <div>
                        <label style={lbl}>Industry</label>
                        <select style={Object.assign({}, inp, { cursor: 'pointer' })} value={profile.industry} onChange={function(e) { setProfile(function(p) { return Object.assign({}, p, { industry: e.target.value }) }) }}>
                          <option value="">Select Industry</option>
                          {INDUSTRIES.map(function(i) { return <option key={i} value={i}>{i}</option> })}
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>Events per Year</label>
                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                          {EVENTS_PER_YEAR.map(function(opt) {
                            const active = profile.events_per_year === opt
                            return (
                              <button key={opt} onClick={function() { setProfile(function(p) { return Object.assign({}, p, { events_per_year: opt }) }) }} style={{ padding: '6px 13px', borderRadius: 20, border: '1.5px solid ' + (active ? '#9b7fe8' : 'rgba(155,127,232,0.2)'), background: active ? 'rgba(155,127,232,0.12)' : 'rgba(255,255,255,0.6)', color: active ? '#7c3aed' : '#9b89c4', fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={glass({ padding: '22px 24px' })}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid rgba(155,127,232,0.1)' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(155,127,232,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🧾</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#2d1b69' }}>Billing Details</div>
                        <div style={{ fontSize: 11, color: '#9b89c4' }}>For GST invoices</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      <div>
                        <label style={lbl}>Company Name (as per GST)</label>
                        <input style={inp} value={profile.billing_company} onChange={function(e) { setProfile(function(p) { return Object.assign({}, p, { billing_company: e.target.value }) }) }} placeholder="Your Company Pvt Ltd" onFocus={function(e) { e.target.style.border = '1.5px solid #9b7fe8' }} onBlur={function(e) { e.target.style.border = '1.5px solid rgba(155,127,232,0.2)' }} />
                      </div>
                      <div>
                        <label style={lbl}>GST / VAT Number (optional)</label>
                        <input style={inp} value={profile.gstin} onChange={function(e) { setProfile(function(p) { return Object.assign({}, p, { gstin: e.target.value.toUpperCase() }) }) }} placeholder="22AAAAA0000A1Z5" onFocus={function(e) { e.target.style.border = '1.5px solid #9b7fe8' }} onBlur={function(e) { e.target.style.border = '1.5px solid rgba(155,127,232,0.2)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {successMsg && <div style={glass({ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 13, fontWeight: 600, color: '#15803d' })}>{successMsg}</div>}
              {errorMsg && <div style={glass({ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#dc2626' })}>{errorMsg}</div>}

              <div style={glass({ padding: '24px 26px', border: '2px solid ' + curPlan.border })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9b89c4', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>Active Plan</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: curPlan.color, marginBottom: 3 }}>{curPlan.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: curPlan.color, color: '#fff' }}>
                      {planData && planData.current_plan === 'starter' ? 'Free Forever' : 'Active'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: curPlan.color }}>{curPlan.price === 0 ? 'Free' : ('Rs. ' + curPlan.priceLabel)}</div>
                    {curPlan.price > 0 && <div style={{ fontSize: 11, color: '#9b89c4' }}>per month</div>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#5b4a8a' }}>Photos Used</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2d1b69' }}>{planData ? ((planData.photos_used || 0) + ' / ' + planData.photos_limit) : '...'}</span>
                    </div>
                    <div style={{ height: 7, background: 'rgba(155,127,232,0.12)', borderRadius: 7, overflow: 'hidden' }}>
                      <div style={{ height: 7, width: pct + '%', background: pct > 80 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,' + curPlan.color + ',#c084fc)', borderRadius: 7 }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#5b4a8a' }}>Storage</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2d1b69' }}>{gb + ' GB / ' + curPlan.storage}</span>
                    </div>
                    <div style={{ height: 7, background: 'rgba(155,127,232,0.12)', borderRadius: 7, overflow: 'hidden' }}>
                      <div style={{ height: 7, width: (Math.min((parseFloat(gb) / curPlan.storageNum) * 100, 100)) + '%', background: 'linear-gradient(90deg,' + curPlan.color + ',#c084fc)', borderRadius: 7 }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {PLANS.map(function(plan) {
                  const isCurrent = planData && planData.current_plan === plan.key
                  return (
                    <div key={plan.key} style={glass({ padding: '20px', border: isCurrent ? ('2px solid ' + plan.color) : '1px solid rgba(255,255,255,0.8)', position: 'relative' })}>
                      {plan.badge && !isCurrent && (
                        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: plan.color, color: '#fff', whiteSpace: 'nowrap' }}>{plan.badge}</div>
                      )}
                      {isCurrent && (
                        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: plan.bg, color: plan.color, border: '1px solid ' + plan.border }}>Current</div>
                      )}
                      <div style={{ fontSize: 15, fontWeight: 800, color: plan.color, marginBottom: 3 }}>{plan.name}</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#2d1b69', marginBottom: 2 }}>{plan.price === 0 ? 'Free' : ('Rs.' + plan.priceLabel)}</div>
                      <div style={{ fontSize: 11, color: '#9b89c4', marginBottom: 14 }}>{plan.price === 0 ? 'forever free' : 'per month'}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                        {plan.features.map(function(f, i) {
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ width: 14, height: 14, borderRadius: '50%', background: plan.bg, border: '1px solid ' + plan.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: plan.color, flexShrink: 0 }}>✓</span>
                              <span style={{ fontSize: 11, color: '#5b4a8a' }}>{f}</span>
                            </div>
                          )
                        })}
                      </div>
                      {isCurrent ? (
                        <div style={{ padding: '9px', borderRadius: 10, background: plan.bg, border: '1px solid ' + plan.border, fontSize: 12, fontWeight: 700, color: plan.color, textAlign: 'center' }}>Active Plan</div>
                      ) : plan.price === 0 ? (
                        <div style={{ padding: '9px', borderRadius: 10, background: 'rgba(107,114,128,0.06)', fontSize: 11, color: '#9b89c4', textAlign: 'center' }}>Free tier</div>
                      ) : (
                        <button onClick={function() { upgrade(plan.key) }} disabled={!!payLoading} style={{ width: '100%', padding: '10px', borderRadius: 10, background: payLoading === plan.key ? 'rgba(155,127,232,0.4)' : 'linear-gradient(135deg,' + plan.color + ',#c084fc)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: payLoading ? 'not-allowed' : 'pointer' }}>
                          {payLoading === plan.key ? 'Processing...' : 'Upgrade to ' + plan.name}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, paddingTop: 6 }}>
                {['Secured by Razorpay', 'UPI / Cards / Net Banking', 'Cancel anytime', 'GST Invoice included'].map(function(b, i) {
                  return <span key={i} style={{ fontSize: 11, color: '#c4b5fd' }}>{b}</span>
                })}
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div style={glass({ padding: '32px', textAlign: 'center' })}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2d1b69', marginBottom: 6 }}>No invoices yet</div>
              <div style={{ fontSize: 13, color: '#9b89c4' }}>Your payment history will appear here</div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
