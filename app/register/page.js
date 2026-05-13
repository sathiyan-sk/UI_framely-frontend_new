'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { register } from '../../lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function RegisterInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'google_denied') setError('Google sign-in was cancelled.')
    if (err === 'token_failed') setError('Google sign-in failed. Please try again.')
    if (err === 'userinfo_failed') setError('Could not get Google account info. Please try again.')
  }, [searchParams])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (!agreed) { setError('Please agree to the terms and conditions'); return }
    setLoading(true)
    setError('')
    const data = await register(email, password, fullName)
    if (data.token) {
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } else {
      setError(data.detail || 'Registration failed')
    }
    setLoading(false)
  }

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google`
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e']

  const inputStyle = {
    width: '100%', padding: '12px 14px 12px 40px',
    border: '1.5px solid rgba(155,127,232,0.2)', borderRadius: 14,
    fontSize: 14, color: '#2d1b69', background: 'rgba(255,255,255,0.7)',
    outline: 'none', fontFamily: 'inherit', transition: 'border .15s', boxSizing: 'border-box'
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: 'linear-gradient(135deg,#ddd6fe 0%,#e9d5ff 20%,#fbcfe8 45%,#fde68a 70%,#fecdd3 85%,#ddd6fe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,220,200,0.45) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 60% 50% at 20% 70%, rgba(200,190,255,0.3) 0%, transparent 60%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 50% 40% at 80% 20%, rgba(251,207,232,0.3) 0%, transparent 60%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:460 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none' }}>
            <div style={{ width:42, height:42, borderRadius:14, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:18, boxShadow:'0 4px 16px rgba(155,127,232,0.4)' }}>P</div>
            <span style={{ fontSize:20, fontWeight:800, color:'#2d1b69', letterSpacing:'-.02em' }}>Framely</span>
          </Link>
        </div>

        <div style={{ background:'rgba(255,255,255,0.55)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.8)', borderRadius:28, padding:'36px 36px 32px', boxShadow:'0 8px 48px rgba(155,127,232,0.15), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <h1 style={{ fontSize:26, fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:6 }}>Create your account</h1>
            <p style={{ fontSize:14, color:'#9b89c4' }}>Start sharing photos with face recognition</p>
          </div>

          <button onClick={handleGoogleLogin}
            style={{ width:'100%', padding:'12px 16px', borderRadius:14, background:'rgba(255,255,255,0.9)', border:'1.5px solid rgba(155,127,232,0.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontSize:14, fontWeight:600, color:'#374151', marginBottom:16, transition:'all .15s', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.border='1.5px solid rgba(155,127,232,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.9)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.border='1.5px solid rgba(155,127,232,0.2)' }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google — no form needed
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:'rgba(155,127,232,0.15)' }} />
            <span style={{ fontSize:12, color:'#c4b5fd', fontWeight:600 }}>or register with email</span>
            <div style={{ flex:1, height:1, background:'rgba(155,127,232,0.15)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
                <span>⚠</span> {error}
              </div>
            )}

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#5b4a8a', marginBottom:7, display:'block' }}>Full name</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'#c4b5fd' }}>👤</span>
                <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Rakshan" required style={inputStyle}
                  onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                  onBlur={e=>e.target.style.border='1.5px solid rgba(155,127,232,0.2)'} />
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#5b4a8a', marginBottom:7, display:'block' }}>Email address</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'#c4b5fd' }}>✉</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle}
                  onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                  onBlur={e=>e.target.style.border='1.5px solid rgba(155,127,232,0.2)'} />
              </div>
            </div>

            <div style={{ marginBottom:8 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#5b4a8a', marginBottom:7, display:'block' }}>Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'#c4b5fd' }}>🔒</span>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 characters" required
                  style={{ ...inputStyle, paddingRight:44 }}
                  onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                  onBlur={e=>e.target.style.border='1.5px solid rgba(155,127,232,0.2)'} />
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', fontSize:14, color:'#c4b5fd', padding:0 }}>
                  {showPass?'🙈':'👁'}
                </button>
              </div>
            </div>

            {password.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                  {[1,2,3].map(i=>(
                    <div key={i} style={{ flex:1, height:4, borderRadius:4, background:i<=strength?strengthColor[strength]:'rgba(155,127,232,0.15)', transition:'background .2s' }} />
                  ))}
                </div>
                <span style={{ fontSize:11, color:strengthColor[strength], fontWeight:600 }}>{strengthLabel[strength]} password</span>
              </div>
            )}

            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#5b4a8a', marginBottom:7, display:'block' }}>Confirm password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'#c4b5fd' }}>🔒</span>
                <input type={showConfirm?'text':'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="••••••••" required
                  style={{ ...inputStyle, paddingRight:44, ...(confirmPassword && password !== confirmPassword ? { border:'1.5px solid rgba(239,68,68,0.5)' } : {}) }}
                  onFocus={e=>e.target.style.border='1.5px solid #9b7fe8'}
                  onBlur={e=>e.target.style.border=confirmPassword && password !== confirmPassword?'1.5px solid rgba(239,68,68,0.5)':'1.5px solid rgba(155,127,232,0.2)'} />
                <button type="button" onClick={()=>setShowConfirm(!showConfirm)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', fontSize:14, color:'#c4b5fd', padding:0 }}>
                  {showConfirm?'🙈':'👁'}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <span style={{ position:'absolute', right:40, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#22c55e' }}>✓</span>
                )}
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:24, cursor:'pointer' }} onClick={()=>setAgreed(!agreed)}>
              <div style={{ width:18, height:18, borderRadius:6, border:'1.5px solid rgba(155,127,232,0.4)', background:agreed?'linear-gradient(135deg,#9b7fe8,#c084fc)':'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, transition:'all .15s' }}>
                {agreed && <span style={{ color:'#fff', fontSize:11 }}>✓</span>}
              </div>
              <span style={{ fontSize:12, color:'#7c6aaa', lineHeight:1.6 }}>
                I agree to the{' '}
                <a href="#" onClick={e=>e.stopPropagation()} style={{ color:'#9b7fe8', textDecoration:'none', fontWeight:600 }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" onClick={e=>e.stopPropagation()} style={{ color:'#9b7fe8', textDecoration:'none', fontWeight:600 }}>Privacy Policy</a>
              </span>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:13, borderRadius:14, background:loading?'rgba(155,127,232,0.5)':'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', boxShadow:'0 6px 20px rgba(155,127,232,0.4)', transition:'all .2s', letterSpacing:'-.01em' }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.boxShadow='0 8px 28px rgba(155,127,232,0.55)' }}
              onMouseLeave={e=>{ if(!loading) e.currentTarget.style.boxShadow='0 6px 20px rgba(155,127,232,0.4)' }}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Creating account...
                </span>
              ) : 'Create account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:14, color:'#9b89c4', marginTop:20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color:'#9b7fe8', fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
        </p>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginTop:24 }}>
          {['🔒 SSL Secured','🇮🇳 India Hosted','✓ GDPR Safe'].map((b,i)=>(
            <span key={i} style={{ fontSize:11, color:'#c4b5fd', fontWeight:500 }}>{b}</span>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Register() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#ddd6fe 0%,#e9d5ff 20%,#fbcfe8 50%,#fde68a 80%,#ddd6fe 100%)' }}>
        <div style={{ width:48, height:48, border:'3px solid rgba(155,127,232,0.3)', borderTop:'3px solid #9b7fe8', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <RegisterInner />
    </Suspense>
  )
}
