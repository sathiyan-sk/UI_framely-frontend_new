'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DashboardLayout({ children }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user,         setUser]         = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.full_name) setUser(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('#user-menu')) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function logout() {
    localStorage.removeItem('token')
    router.push('/')
  }

  const isActive = (href) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const initials    = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'P'
  const displayName = user?.full_name || 'Photographer'

  const sections = [
    {
      label: 'Workspace',
      items: [
        { href: '/dashboard',              label: 'Home',         icon: HomeIcon },
        { href: '/dashboard/events',       label: 'Events',       icon: EventIcon, badge: true },
        { href: '/dashboard/create-event', label: 'Create event', icon: PlusIcon },
      //  { href: '/dashboard/guests',       label: 'Guests',       icon: GuestsIcon },
      ],
    },
    {
      label: 'Insights',
      items: [
        { href: '/dashboard/analytics', label: 'Analytics', icon: AnalyticsIcon },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
      ],
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      display: 'flex',
    }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 200,
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #e5e5e5',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 10,
      }}>

        {/* Logo */}
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '20px 18px 22px',
          textDecoration: 'none',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" fill="#fff"/>
              <rect x="8"   y="1.5" width="4.5" height="4.5" rx="1" fill="#fff" opacity=".6"/>
              <rect x="1.5" y="8"   width="4.5" height="4.5" rx="1" fill="#fff" opacity=".6"/>
              <rect x="8"   y="8"   width="4.5" height="4.5" rx="1" fill="#fff" opacity=".35"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111111' }}>Framelyy</span>
        </Link>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {sections.map(sec => (
            <div key={sec.label} style={{ marginBottom: 4 }}>
              <div style={{
                fontSize: 10, fontWeight: 600, color: '#aaaaaa',
                letterSpacing: '.08em', textTransform: 'uppercase',
                padding: '14px 18px 5px',
              }}>
                {sec.label}
              </div>
              {sec.items.map(item => {
                const active = isActive(item.href)
                const Icon   = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '7px 14px 7px 18px',
                      fontSize: 13,
                      color: active ? '#111111' : '#666666',
                      fontWeight: active ? 500 : 400,
                      textDecoration: 'none',
                      background: active ? '#f0f0f0' : 'transparent',
                      borderRadius: 8,
                      margin: '1px 8px',
                      transition: 'all .12s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f5' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <Icon active={active} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        background: '#111111', color: '#fff',
                        fontSize: 10, fontWeight: 600,
                        padding: '1px 6px', borderRadius: 20,
                      }}>3</span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '14px 16px' }}>
          <div id="user-menu" style={{ position: 'relative' }}>
            <div
              onClick={() => setShowDropdown(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}
            >
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#111111',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>{initials}</div>
                )
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 11, color: '#888888', textTransform: 'capitalize' }}>
                  {user?.plan || 'starter'} plan
                </div>
              </div>
            </div>

            {showDropdown && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
                minWidth: 190, background: '#fff',
                border: '1px solid #e5e5e5', borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                overflow: 'hidden', zIndex: 100,
              }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111111' }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>{user?.email || ''}</div>
                  <div style={{ marginTop: 6, display: 'inline-block', padding: '2px 8px', borderRadius: 20, background: '#f5f5f5', fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'capitalize' }}>
                    {user?.plan || 'starter'} plan
                  </div>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#333', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Settings
                  </Link>
                  <div style={{ height: 1, background: '#f0f0f0' }} />
                  <button
                    onClick={logout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{
        flex: 1,
        marginLeft: 200,
        minHeight: '100vh',
        background: '#f5f5f5',
      }}>
        {/*
          Source padding: '32px 44px 60px'
          No maxWidth constraint here — let the grid inside page.js handle layout
        */}
        <div style={{
          padding: '32px 44px 60px',
          maxWidth: 1400,
          boxSizing: 'border-box',
        }}>
          {children}
        </div>
      </div>

    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function HomeIcon({ active }) {
  const c = active ? '#111111' : '#999999'
  return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke={c} strokeWidth="1.2"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke={c} strokeWidth="1.2"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke={c} strokeWidth="1.2"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke={c} strokeWidth="1.2"/></svg>
}
function EventIcon({ active }) {
  const c = active ? '#111111' : '#999999'
  return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><rect x="1" y="2.5" width="13" height="10" rx="1.8" stroke={c} strokeWidth="1.2"/><path d="M5 1v3M10 1v3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M1 6.5h13" stroke={c} strokeWidth="1.2"/></svg>
}
function PlusIcon({ active }) {
  const c = active ? '#111111' : '#999999'
  return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><circle cx="7.5" cy="7.5" r="6" stroke={c} strokeWidth="1.2"/><path d="M7.5 4.5v6M4.5 7.5h6" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>
}
function MediaIcon({ active }) {
  const c = active ? '#111111' : '#999999'
  return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><rect x="1" y="2" width="13" height="10" rx="1.8" stroke={c} strokeWidth="1.2"/><circle cx="5.5" cy="6.5" r="1.5" stroke={c} strokeWidth="1.1"/><path d="M1 10.5l3.5-3 2.5 2 3-3.5 3.5 3" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function GuestsIcon({ active }) {
  const c = active ? '#111111' : '#999999'
  return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><circle cx="5.5" cy="4.5" r="2.5" stroke={c} strokeWidth="1.2"/><path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="11" cy="5" r="2" stroke={c} strokeWidth="1.1"/><path d="M13 13c0-2-1.3-3.2-3-3.6" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>
}
function AnalyticsIcon({ active }) {
  const c = active ? '#111111' : '#999999'
  return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><path d="M1 12l3.5-4 3 2.5 3.5-5.5 2.5 2" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 14h13" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>
}
function SettingsIcon({ active }) {
  const c = active ? '#111111' : '#999999'
  return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><circle cx="7.5" cy="7.5" r="2" stroke={c} strokeWidth="1.2"/><path d="M7.5 1.5v2M7.5 11.5v2M1.5 7.5h2M11.5 7.5h2M3.2 3.2l1.4 1.4M10.4 10.4l1.4 1.4M3.2 11.8l1.4-1.4M10.4 4.6l1.4-1.4" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>
}
