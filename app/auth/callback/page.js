'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCallbackInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      router.push('/login?error=' + error)
      return
    }
    if (token) {
      localStorage.setItem('token', token)
      router.push('/dashboard')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#ddd6fe 0%,#e9d5ff 20%,#fbcfe8 50%,#fde68a 80%,#ddd6fe 100%)',
      fontFamily: "'Inter',system-ui,sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(155,127,232,0.3)', borderTop: '3px solid #9b7fe8', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#7c6aaa', fontSize: 15, fontWeight: 600 }}>Signing you in...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#ddd6fe 0%,#e9d5ff 20%,#fbcfe8 50%,#fde68a 80%,#ddd6fe 100%)'
      }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(155,127,232,0.3)', borderTop: '3px solid #9b7fe8', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  )
}
