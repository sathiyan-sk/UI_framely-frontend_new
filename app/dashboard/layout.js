'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
  }, [])

  function logout() {
    localStorage.removeItem('token')
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard',          icon: '⊞', label: 'Home' },
    { href: '/dashboard/events',   icon: '◷', label: 'Events' },
    { href: '/dashboard/analytics',icon: '▦', label: 'Analytics' },
    { href: '/dashboard/media',    icon: '⊡', label: 'Media' },
    { href: '/dashboard/settings', icon: '⚙', label: 'Settings' },
  ]

  const isActive = (href) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href)

  const glass = {
    background: 'rgba(255,255,255,0.28)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.55)',
    boxShadow: '0 4px 24px rgba(100,80,180,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#e8e4f8 0%,#d4d0f5 15%,#e2d4f0 30%,#f5d6e8 50%,#fce4d6 65%,#e8d4f0 80%,#d8e0f8 100%)',
      fontFamily: "'Inter',system-ui,sans-serif",
      padding: 16,
      position: 'relative',
    }}>
      {/* Background blobs — decorative only */}
      {[{w:400,h:400,bg:'#c4b5fd',t:-80,l:-60},{w:300,h:300,bg:'#fbcfe8',t:100,r:-40},{w:350,h:350,bg:'#bfdbfe',b:-60,l:200}].map((b,i)=>(
        <div key={i} style={{ position:'fixed', width:b.w, height:b.h, background:b.bg, borderRadius:'50%', filter:'blur(60px)', opacity:0.3, pointerEvents:'none', top:b.t, left:b.l, right:b.r, bottom:b.b, zIndex:0 }} />
      ))}

      <div style={{ ...glass, borderRadius: 22, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* ── TOPBAR — renders once, stays across all pages ── */}
        <div style={{ display:'flex', alignItems:'center', padding:'14px 22px', borderBottom:'1px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', gap:12, flexShrink:0 }}>
          <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
            <div style={{ width:38, height:38, borderRadius:14, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:16, boxShadow:'0 4px 14px rgba(155,127,232,0.4)', flexShrink:0 }}>P</div>
            <span style={{ fontSize:18, fontWeight:700, color:'#2d1b69', letterSpacing:'-.02em' }}>Framely</span>
          </Link>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:12, background:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6b5b95', fontSize:18 }}>🔔</div>
            <Link href="/dashboard/settings" style={{ width:36, height:36, borderRadius:12, background:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6b5b95', fontSize:16, textDecoration:'none' }}>⚙</Link>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px 6px 6px', background:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.6)', borderRadius:20, cursor:'pointer' }} onClick={logout}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700 }}>P</div>
              <span style={{ fontSize:13, fontWeight:600, color:'#2d1b69' }}>Photographer</span>
              <span style={{ fontSize:11, color:'#8b7ab5' }}>▾</span>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', minHeight:'calc(100vh - 67px - 32px)' }}>

          {/* ── SIDEBAR — renders once, active state updates via pathname ── */}
          <div style={{ width:88, background:'rgba(255,255,255,0.18)', borderRight:'1px solid rgba(255,255,255,0.35)', display:'flex', flexDirection:'column', alignItems:'center', padding:'18px 0 20px', gap:4, flexShrink:0 }}>
            {navItems.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} style={{
                  width:68, borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center',
                  padding:'10px 6px 8px', border: active ? '1px solid rgba(155,127,232,0.3)' : '1px solid transparent',
                  background: active ? 'linear-gradient(135deg,rgba(155,127,232,0.22),rgba(192,132,252,0.15))' : 'transparent',
                  color: active ? '#4b0082' : '#9b89c4', fontSize:11, fontWeight: active ? 600 : 400,
                  gap:5, textDecoration:'none', transition:'all .18s',
                  boxShadow: active ? '0 2px 12px rgba(155,127,232,0.15)' : 'none'
                }}>
                  <span style={{ fontSize:20 }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
            <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', alignItems:'center', gap:10, paddingTop:16 }}>
              <div onClick={logout} title="Logout" style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#c084fc,#9b7fe8)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 10px rgba(155,127,232,0.35)' }}>↪</div>
            </div>
          </div>

          {/* ── PAGE CONTENT — only this part changes on navigation ── */}
          <div style={{ flex:1, padding:18, overflowY:'auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
