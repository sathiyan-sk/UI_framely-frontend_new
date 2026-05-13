'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function fmtGB(bytes) { return (bytes / (1024 ** 3)).toFixed(2) + ' GB' }
function fmtINR(r)    { return '₹' + r.toLocaleString('en-IN') }
function fmtDate(s)   {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

const PLAN_COLOR = {
  elite:   { bg: 'rgba(217,119,6,0.2)',    text: '#fbbf24' },
  pro:     { bg: 'rgba(124,58,237,0.2)',   text: '#c084fc' },
  starter: { bg: 'rgba(107,114,128,0.12)', text: 'rgba(255,255,255,0.4)' },
}

const glass = (extra = {}) => ({
  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  ...extra,
})

export default function AdminPage() {
  const router = useRouter()

  const [stats,         setStats]         = useState(null)
  const [revenue,       setRevenue]       = useState(null)
  const [r2,            setR2]            = useState(null)
  const [photographers, setPhotographers] = useState([])
  const [total,         setTotal]         = useState(0)
  const [page,          setPage]          = useState(1)
  const [search,        setSearch]        = useState('')
  const [planFilter,    setPlanFilter]    = useState('')
  const [loading,       setLoading]       = useState(true)
  const [pgLoading,     setPgLoading]     = useState(false)
  const [error,         setError]         = useState('')
  const [activeTab,     setActiveTab]     = useState('overview')

  const LIMIT = 20

  function authH() {
    return { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }

  useEffect(() => { loadOverview() }, [])

  async function loadOverview() {
    setLoading(true)
    try {
      const [s, r, r2res] = await Promise.all([
        fetch(`${API_URL}/admin/stats`,    { headers: authH() }).then(r => r.json()),
        fetch(`${API_URL}/admin/revenue`,  { headers: authH() }).then(r => r.json()),
        fetch(`${API_URL}/admin/r2-usage`, { headers: authH() }).then(r => r.json()),
      ])
      if (s.detail?.includes('Admin') || s.detail?.includes('Unauthorized')) {
        setError('You do not have admin access.')
        router.push('/dashboard')
        return
      }
      setStats(s); setRevenue(r); setR2(r2res)
    } catch { setError('Failed to load admin data.') }
    setLoading(false)
  }

  const loadPhotographers = useCallback(async () => {
    setPgLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(LIMIT),
        ...(search     ? { search }          : {}),
        ...(planFilter ? { plan: planFilter } : {}),
      })
      const res  = await fetch(`${API_URL}/admin/photographers?${params}`, { headers: authH() })
      const data = await res.json()
      setPhotographers(data.photographers || [])
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    setPgLoading(false)
  }, [page, search, planFilter])

  useEffect(() => {
    if (activeTab === 'photographers') loadPhotographers()
  }, [activeTab, loadPhotographers])

  useEffect(() => { setPage(1) }, [search, planFilter])

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a0a3d,#2d1b69)', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{error}</div>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a0a3d,#2d1b69)', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(155,127,232,0.2)', borderTop: '3px solid #9b7fe8', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Loading admin panel…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview',      label: '📊 Overview'  },
    { id: 'photographers', label: '👥 Users'      },
    { id: 'revenue',       label: '💰 Revenue'    },
    { id: 'storage',       label: '☁ Storage'     },
  ]

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1a0a3d 0%,#2d1b69 50%,#4b0082 100%)', fontFamily: "'Inter',system-ui,sans-serif", padding: '20px 24px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(192,132,252,0.7)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>🔐 Admin Panel</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-.03em' }}>Framely Control Centre</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
            {stats ? `${stats.photographers.total} users · ${stats.events.total} events · ${stats.photos.total.toLocaleString()} photos` : ''}
          </div>
        </div>
        <button onClick={() => router.push('/dashboard')}
          style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          ← Back to App
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: activeTab === t.id ? 'rgba(155,127,232,0.35)' : 'transparent', color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { icon: '👥', label: 'Total Users',   value: stats.photographers.total.toLocaleString(),   sub: `+${stats.photographers.new_30d} this month`, color: '#c084fc' },
              { icon: '📅', label: 'Total Events',  value: stats.events.total.toLocaleString(),           sub: `${stats.events.active} published`,            color: '#60a5fa' },
              { icon: '📸', label: 'Photos Stored', value: stats.photos.total.toLocaleString(),           sub: `${stats.photos.faces.toLocaleString()} faces`, color: '#34d399' },
              { icon: '☁',  label: 'R2 Storage',    value: `${stats.storage.total_gb} GB`,               sub: 'across all users',                             color: '#f472b6' },
            ].map(kpi => (
              <div key={kpi.label} style={glass({ padding: '22px' })}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{kpi.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: kpi.color, lineHeight: 1, marginBottom: 6 }}>{kpi.value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>{kpi.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          <div style={glass({ padding: '22px 24px' })}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>Users by Plan</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { key: 'starter', label: 'Starter (Free)', color: '#9ca3af' },
                { key: 'pro',     label: 'Pro (₹450/mo)',  color: '#c084fc' },
                { key: 'elite',   label: 'Elite (₹900/mo)',color: '#f472b6' },
              ].map(p => {
                const count = stats.photographers.by_plan[p.key] || 0
                const pct   = stats.photographers.total > 0 ? Math.round((count / stats.photographers.total) * 100) : 0
                return (
                  <div key={p.key} style={{ padding: '18px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: p.color }}>{count}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{p.label}</div>
                    <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: 4, width: `${pct}%`, background: p.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{pct}% of users</div>
                  </div>
                )
              })}
            </div>
          </div>

          {revenue && (
            <div style={glass({ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 32 })}>
              <div style={{ fontSize: 36 }}>💰</div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Monthly Recurring Revenue</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#34d399' }}>{fmtINR(revenue.mrr_rupees)}</div>
              </div>
              <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Paid Users</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#c084fc' }}>{revenue.total_paid}</div>
              </div>
              {revenue.expiring_soon_7d > 0 && <>
                <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>⚠ Expiring in 7d</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>{revenue.expiring_soon_7d}</div>
                </div>
              </>}
            </div>
          )}
        </div>
      )}

      {/* ── USERS ── */}
      {activeTab === 'photographers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Search + Filter */}
          <div style={glass({ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' })}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 380 }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.border = '1px solid rgba(155,127,232,0.5)'}
                onBlur={e => e.target.style.border  = '1px solid rgba(255,255,255,0.15)'}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['', 'All Plans'], ['starter', 'Starter'], ['pro', 'Pro'], ['elite', 'Elite']].map(([val, lbl]) => (
                <button key={val} onClick={() => setPlanFilter(val)}
                  style={{ padding: '7px 14px', borderRadius: 9, border: `1px solid ${planFilter === val ? 'rgba(155,127,232,0.5)' : 'rgba(255,255,255,0.12)'}`, background: planFilter === val ? 'rgba(155,127,232,0.25)' : 'transparent', color: planFilter === val ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: planFilter === val ? 700 : 500, cursor: 'pointer', transition: 'all .15s' }}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              {total} user{total !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Table */}
          <div style={glass({ overflow: 'hidden' })}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 90px 80px 90px 100px 110px', padding: '10px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Name', 'Email', 'Plan', 'Events', 'Photos', 'Storage', 'Joined'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{h}</div>
              ))}
            </div>

            {pgLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ width: 28, height: 28, border: '2px solid rgba(155,127,232,0.2)', borderTop: '2px solid #9b7fe8', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : photographers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                No users found{search ? ` matching "${search}"` : ''}
              </div>
            ) : photographers.map((p, i) => {
              const pc = PLAN_COLOR[p.plan] || PLAN_COLOR.starter
              return (
                <div key={p.id}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 90px 80px 90px 100px 110px', padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${(i*47)%360},40%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {p.full_name ? p.full_name[0].toUpperCase() : '?'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                      {p.full_name || '—'}
                      {p.is_admin && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 20, background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>ADMIN</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', alignSelf: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
                  <div style={{ alignSelf: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: pc.bg, color: pc.text, textTransform: 'capitalize' }}>{p.plan}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', alignSelf: 'center' }}>{p.event_count}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', alignSelf: 'center' }}>{p.photo_count.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', alignSelf: 'center' }}>{p.storage_used_gb.toFixed(2)} GB</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', alignSelf: 'center' }}>{fmtDate(p.created_at)}</div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <button onClick={() => setPage(1)} disabled={page === 1}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: page === 1 ? 'rgba(255,255,255,0.2)' : '#fff', fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>«</button>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: page === 1 ? 'rgba(255,255,255,0.2)' : '#fff', fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>‹ Prev</button>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: '6px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8 }}>
                Page {page} of {totalPages} · {total} users
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: page >= totalPages ? 'rgba(255,255,255,0.2)' : '#fff', fontSize: 12, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>Next ›</button>
              <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: page >= totalPages ? 'rgba(255,255,255,0.2)' : '#fff', fontSize: 12, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>»</button>
            </div>
          )}
        </div>
      )}

      {/* ── REVENUE ── */}
      {activeTab === 'revenue' && revenue && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { label: 'Monthly Recurring Revenue', value: fmtINR(revenue.mrr_rupees), icon: '💰', color: '#34d399' },
              { label: 'Paid Subscribers',           value: revenue.total_paid,         icon: '👥', color: '#c084fc' },
              { label: 'Expiring in 7 Days',         value: revenue.expiring_soon_7d,   icon: '⚠', color: '#fbbf24' },
            ].map(kpi => (
              <div key={kpi.label} style={glass({ padding: '26px' })}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{kpi.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>{kpi.label}</div>
              </div>
            ))}
          </div>
          <div style={glass({ padding: '22px 24px' })}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>Plan Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Pro Subscribers',   count: revenue.pro_subscribers,   price: 450, color: '#c084fc' },
                { label: 'Elite Subscribers', count: revenue.elite_subscribers, price: 900, color: '#f472b6' },
              ].map(p => (
                <div key={p.label} style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: p.color }}>{p.count}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6, fontWeight: 600 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>₹{p.price}/mo → <span style={{ color: '#34d399', fontWeight: 700 }}>{fmtINR(p.count * p.price)} MRR</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STORAGE ── */}
      {activeTab === 'storage' && r2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { label: 'Total R2 Storage',   value: `${r2.total_size_gb} GB`,        icon: '☁', color: '#60a5fa' },
              { label: 'Total Photos in R2', value: r2.total_photos.toLocaleString(), icon: '📸', color: '#34d399' },
              { label: 'R2 Bucket',          value: r2.r2_bucket,                    icon: '🪣', color: '#c084fc' },
            ].map(kpi => (
              <div key={kpi.label} style={glass({ padding: '26px' })}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{kpi.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>{kpi.label}</div>
              </div>
            ))}
          </div>
          <div style={glass({ padding: '22px 24px' })}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>Top 5 Storage Consumers</div>
            {r2.top_consumers.map((u, i) => {
              const pc    = PLAN_COLOR[u.plan] || PLAN_COLOR.starter
              const maxGB = r2.top_consumers[0]?.used_gb || 1
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(155,127,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#c084fc', flexShrink: 0 }}>{i+1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{u.email}</div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: 4, width: `${(u.used_gb / maxGB)*100}%`, background: '#60a5fa', borderRadius: 4 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: pc.bg, color: pc.text }}>{u.plan}</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa', minWidth: 72, textAlign: 'right' }}>{u.used_gb} GB</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
