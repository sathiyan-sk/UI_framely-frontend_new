'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getEvents, getPhotos, setCoverPhoto,
  getCollections, createCollection, deleteCollection,
  addPhotosToCollection, removePhotoFromCollection, getCollectionPhotos,
  deletePhoto,
} from '@/lib/api'

const CONCURRENT_UPLOADS = 3
const MAX_RETRIES        = 3
const COMPRESS_MAX_PX    = 1920
const UI_THROTTLE_MS     = 400
const API_URL            = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const QUALITY_PRESETS = [
  { label: 'High',   value: 0.92, desc: 'Best quality, larger file'  },
  { label: 'Medium', value: 0.80, desc: 'Balanced — recommended'     },
  { label: 'Low',    value: 0.65, desc: 'Smallest file, fast upload' },
]

// ─── design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#F5F4F1',
  surface:   '#FFFFFF',
  primary:   '#1A1814',
  secondary: '#6B6560',
  tertiary:  '#B0ABA4',
  border:    '#E8E4DE',
  amber:     '#C17D3C',
  amberLight:'#FDF3E7',
  sage:       '#7A8B76',
  rose:       '#C58A80',
  red:        '#DC2626',
  redLight:  'rgba(220,38,38,0.06)',
  green:     '#16A34A',
  greenLight:'rgba(22,163,74,0.08)',
}

const fonts = {
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'DM Sans', system-ui, sans-serif",
  mono:  "'DM Mono', 'Fira Code', monospace",
}

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function fmtDate(s) {
  if (!s) return null
  try { return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return null }
}
function fmtSize(b) {
  if (!b) return null
  if (b < 1024)    return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null }
function authH()   { return { Authorization: `Bearer ${getToken()}` } }
function jsonH()   { return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }

// ─── card style ───────────────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  ...extra,
})

// ═══════════════════════════════════════════════════════════════════════════════
// QRCode
// ═══════════════════════════════════════════════════════════════════════════════
function QRCode({ url, size = 160 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!url || !ref.current) return
    import('qrcode').then(lib =>
      lib.default.toCanvas(ref.current, url, {
        width: size, margin: 2,
        color: { dark: '#1A1814', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
    )
  }, [url, size])
  return <canvas ref={ref} style={{ borderRadius: 8, display: 'block' }} width={size} height={size} />
}

// ═══════════════════════════════════════════════════════════════════════════════
// PhotoMenu — portal dropdown
// ═══════════════════════════════════════════════════════════════════════════════
function PhotoMenu({ photo, collections, colPhotoIds, onMakeCover, onDelete, onAddToCol, onRemoveFromCol }) {
  const [open,    setOpen]    = useState(false)
  const [colOpen, setColOpen] = useState(false)
  const [pos,     setPos]     = useState({ top: 0, left: 0 })
  const btnRef                = useRef(null)
  const menuRef               = useRef(null)
  const MENU_W = 200
  const MENU_H = 128

  useEffect(() => {
    if (!open) { setColOpen(false); return }
    function handler(e) {
      const clickedBtn  = btnRef.current?.contains(e.target)
      const clickedMenu = menuRef.current?.contains(e.target)
      if (!clickedBtn && !clickedMenu) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [open])

  function handleOpen(e) {
    e.stopPropagation()
    if (open) { setOpen(false); return }
    const btn = btnRef.current.getBoundingClientRect()
    const vw  = window.innerWidth
    const vh  = window.innerHeight
    let left  = btn.right - MENU_W
    if (left < 8) left = 8
    if (left + MENU_W > vw - 8) left = vw - MENU_W - 8
    let top = btn.top - MENU_H - 6
    if (top < 8) top = btn.bottom + 6
    if (top + MENU_H > vh - 8) top = vh - MENU_H - 8
    setPos({ top, left })
    setOpen(true)
  }

  const itemStyle = {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 14px', border: 'none', background: 'transparent',
    cursor: 'pointer', textAlign: 'left',
    fontFamily: fonts.sans, fontSize: 13,
    transition: 'background .1s',
  }

  const dropdown = open && typeof document !== 'undefined' && createPortal(
    <div ref={menuRef} style={{
      position: 'fixed', top: pos.top, left: pos.left, zIndex: 99999,
      background: C.surface, borderRadius: 10,
      border: `1px solid ${C.border}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      minWidth: MENU_W, overflow: 'visible',
    }}>
      <button style={itemStyle}
        onClick={e => { e.stopPropagation(); onMakeCover(photo); setOpen(false) }}
        onMouseEnter={e => e.currentTarget.style.background = C.bg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span style={{ color: C.primary, fontWeight: 500 }}>Make Cover</span>
      </button>

      <div style={{ position: 'relative' }}
        onMouseEnter={() => setColOpen(true)}
        onMouseLeave={() => setColOpen(false)}
      >
        <button style={itemStyle}
          onMouseEnter={e => e.currentTarget.style.background = C.bg}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <span style={{ color: C.primary, fontWeight: 500, flex: 1 }}>Add to Collection</span>
          <span style={{ color: C.tertiary, fontSize: 11 }}>›</span>
        </button>
        {colOpen && (
          <div style={{
            position: 'absolute', top: 0, right: '100%', marginRight: 4,
            background: C.surface, borderRadius: 10,
            border: `1px solid ${C.border}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            minWidth: 170, overflow: 'hidden',
          }}>
            {collections.length === 0
              ? <div style={{ padding: '10px 14px', fontSize: 12, color: C.tertiary, fontStyle: 'italic', fontFamily: fonts.sans }}>No collections yet</div>
              : collections.map(col => {
                  const inCol = colPhotoIds[col.id]?.has(photo.id)
                  return (
                    <button key={col.id}
                      onClick={e => { e.stopPropagation(); inCol ? onRemoveFromCol(photo, col) : onAddToCol(photo, col); setOpen(false) }}
                      style={{ ...itemStyle }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      <span style={{ fontSize: 13, fontWeight: inCol ? 700 : 500, color: inCol ? C.amber : C.primary, flex: 1 }}>{col.name}</span>
                      {inCol && <span style={{ fontSize: 11, color: C.amber }}>✓</span>}
                    </button>
                  )
                })
            }
          </div>
        )}
      </div>

      <div style={{ height: 1, background: C.border, margin: '2px 0' }} />

      <button style={itemStyle}
        onClick={e => { e.stopPropagation(); onDelete(photo); setOpen(false) }}
        onMouseEnter={e => e.currentTarget.style.background = C.redLight}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        <span style={{ color: C.red, fontWeight: 500 }}>Delete</span>
      </button>
    </div>,
    document.body
  )

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button ref={btnRef} onClick={handleOpen}
        style={{
          width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
          background: open ? C.bg : C.surface,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.secondary, fontSize: 16, lineHeight: 1, fontWeight: 700,
          transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.secondary }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? C.bg : C.surface; e.currentTarget.style.borderColor = C.border }}
      >⋮</button>
      {dropdown}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PhotoCard
// ═══════════════════════════════════════════════════════════════════════════════
function PhotoCard({ photo, index, isCover, selected,
                     onOpen, onDownload, onToggleSelect,
                     collections, colPhotoIds,
                     onMakeCover, onDelete, onAddToCol, onRemoveFromCol }) {
  const [hovered,  setHovered]  = useState(false)
  const [imgError, setImgError] = useState(false)

  const filename = photo.storage_key?.split('/').pop()?.split('_').slice(1).join('_')
                || photo.storage_key?.split('/').pop() || 'photo.jpg'
  const hue = (index * 47) % 360

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10,
        background: C.surface,
        border: `1px solid ${isCover ? C.amber : selected ? C.primary : hovered ? '#C8C3BC' : C.border}`,
        boxShadow: isCover
          ? `0 0 0 2px ${C.amber}33`
          : hovered
          ? '0 4px 20px rgba(0,0,0,0.08)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all .2s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
      }}
    >
      {/* Cover badge */}
      {isCover && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 4,
          background: C.amber,
          borderRadius: 4, padding: '2px 7px',
          fontSize: 9, fontWeight: 700, color: '#fff',
          fontFamily: fonts.mono, letterSpacing: '.06em',
          pointerEvents: 'none',
        }}>★ COVER</div>
      )}

      {/* Checkbox */}
      <div
        onClick={e => { e.stopPropagation(); onToggleSelect(photo.id) }}
        style={{
          position: 'absolute', top: 10, left: 10, zIndex: 5,
          width: 20, height: 20, borderRadius: 4,
          background: selected ? C.primary : C.surface,
          border: `1.5px solid ${selected ? C.primary : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered || selected ? 1 : 0,
          transition: 'opacity .15s, background .15s',
          cursor: 'pointer',
        }}
      >
        {selected && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Image area */}
      <div
        onClick={() => onOpen(photo)}
        style={{
          position: 'relative', aspectRatio: '4/3',
          overflow: 'hidden',
          borderRadius: '10px 10px 0 0',
          background: `hsl(${hue},10%,94%)`,
          cursor: 'pointer',
        }}
      >
        {!imgError && photo.thumb_url ? (
          <img
            src={photo.thumb_url} alt={filename} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s', transform: hovered ? 'scale(1.05)' : 'scale(1)', display: 'block' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: 10, color: C.tertiary, fontFamily: fonts.mono }}>No preview</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '9px 11px 11px', borderRadius: '0 0 10px 10px' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6, fontFamily: fonts.mono }} title={filename}>
          {filename}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {fmtSize(photo.file_size_bytes) && (
            <span style={{ fontSize: 10, color: C.secondary, background: C.bg, padding: '1px 6px', borderRadius: 4, fontFamily: fonts.mono }}>
              {fmtSize(photo.file_size_bytes)}
            </span>
          )}
          {fmtDate(photo.created_at) && (
            <span style={{ fontSize: 10, color: C.secondary, background: C.bg, padding: '1px 6px', borderRadius: 4, fontFamily: fonts.mono }}>
              {fmtDate(photo.created_at)}
            </span>
          )}

          <div style={{
            marginLeft: 'auto', display: 'flex', gap: 3, alignItems: 'center',
            opacity: hovered ? 1 : 0, transition: 'opacity .18s',
          }}>
            {/* View */}
            <button onClick={e => { e.stopPropagation(); onOpen(photo) }} title="View"
              style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = C.surface}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2">
                <circle cx="12" cy="12" r="3" /><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              </svg>
            </button>

            {/* Download */}
            <button onClick={e => { e.stopPropagation(); onDownload(photo) }} title="Download"
              style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = C.surface}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>

            <PhotoMenu
              photo={photo} collections={collections} colPhotoIds={colPhotoIds}
              onMakeCover={onMakeCover} onDelete={onDelete}
              onAddToCol={onAddToCol} onRemoveFromCol={onRemoveFromCol}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PhotoViewer (lightbox)
// ═══════════════════════════════════════════════════════════════════════════════
function PhotoViewer({ photos, startIndex, onClose, onDownload }) {
  const [idx, setIdx] = useState(startIndex)

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, photos.length - 1))
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(i - 1, 0))
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length, onClose])

  const photo    = photos[idx]
  const filename = photo.storage_key?.split('/').pop()?.split('_').slice(1).join('_') || 'photo.jpg'

  if (typeof window === 'undefined') return null
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'rgba(10,8,6,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Top bar */}
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: fonts.mono }}>{idx + 1} / {photos.length} — {filename}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onDownload(photo)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.sans }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      </div>

      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i - 1) }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
      )}

      <img
        src={photo.url || photo.thumb_url} alt={filename}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', width: 'auto', height: 'auto', borderRadius: 8, objectFit: 'contain', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', flexShrink: 0 }}
      />

      {idx < photos.length - 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i + 1) }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      )}

      {photos.length <= 20 && (
        <div style={{ position: 'absolute', bottom: 16, display: 'flex', gap: 5 }}>
          {photos.map((_, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
              style={{ width: i === idx ? 16 : 5, height: 5, borderRadius: 3, background: i === idx ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all .2s', cursor: 'pointer' }} />
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// UploadProgressBar
// ═══════════════════════════════════════════════════════════════════════════════
function UploadProgressBar({ progressRef, uploading, onClear }) {
  const [snap, setSnap] = useState({ done: 0, total: 0, errors: 0, dupes: 0, avgSaving: 0 })
  useEffect(() => {
    const id = setInterval(() => setSnap({ ...progressRef.current }), UI_THROTTLE_MS)
    return () => clearInterval(id)
  }, [progressRef])

  const pct = snap.total > 0 ? Math.round((snap.done / snap.total) * 100) : 0

  return (
    <div style={{ ...card(), padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: uploading ? C.amber : C.green, flexShrink: 0, ...(uploading ? { animation: 'egpulse 1s ease-in-out infinite' } : {}) }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: fonts.sans }}>
            {uploading ? 'Uploading photos…' : 'Upload complete — loading gallery…'}
          </span>
        </div>
        {!uploading && <button onClick={onClear} style={{ fontSize: 11, color: C.tertiary, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: fonts.sans }}>Clear</button>}
      </div>
      <div style={{ height: 4, background: C.bg, borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: 4, width: `${pct}%`, borderRadius: 4, background: uploading ? C.amber : C.green, transition: `width ${UI_THROTTLE_MS}ms ease-out` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: C.secondary, fontFamily: fonts.mono }}>
          {snap.done} / {snap.total}
          {snap.dupes  > 0 && <span style={{ color: C.amber }}> · {snap.dupes} skipped</span>}
          {snap.errors > 0 && <span style={{ color: C.red }}> · {snap.errors} failed</span>}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: uploading ? C.amber : C.green, fontFamily: fonts.mono }}>{pct}%</span>
      </div>
      {snap.avgSaving > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: C.green, fontWeight: 600, fontFamily: fonts.mono }}>↓ {snap.avgSaving}% avg size saved by compression</div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CompressionModal
// ═══════════════════════════════════════════════════════════════════════════════
function CompressionModal({ files, userPlan, collections = [], defaultCollectionId = null, onConfirm, onCancel }) {
  const isPaid       = userPlan !== 'starter'
  const [compress,   setCompress]   = useState(true)
  const [qualityIdx, setQualityIdx] = useState(1)
  const [colMode,   setColMode]   = useState(defaultCollectionId ? `existing:${defaultCollectionId}` : 'none')
  const [newColName, setNewColName] = useState('')

  const totalSize = files.reduce((s, f) => s + f.size, 0)
  const ratio     = compress ? [0.35, 0.20, 0.12][qualityIdx] : 1
  const estSize   = totalSize * ratio
  const selectedQ = QUALITY_PRESETS[qualityIdx]

  function buildCollectionIntent() {
    if (colMode === 'none') return { collectionId: null, newCollectionName: null }
    if (colMode === 'new')  return { collectionId: null, newCollectionName: newColName.trim() || null }
    const id = colMode.replace('existing:', '')
    return { collectionId: id, newCollectionName: null }
  }

  const canSubmit = colMode !== 'new' || newColName.trim().length > 0

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: fonts.sans }}>
      <div style={{ width: '100%', maxWidth: 480, background: C.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.14)' }}>
        {/* Header */}
        <div style={{ background: C.primary, padding: '20px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: fonts.serif, marginBottom: 2 }}>Upload {files.length} photo{files.length > 1 ? 's' : ''}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: fonts.mono }}>{fmtSize(totalSize)} total</div>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Collection picker */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.secondary, marginBottom: 10, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: fonts.mono }}>Add to Collection</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <ColOption selected={colMode === 'none'} onClick={() => setColMode('none')} icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              } label="No collection" sub="Photos appear under All" />
              {collections.map(col => (
                <ColOption key={col.id} selected={colMode === `existing:${col.id}`} onClick={() => setColMode(`existing:${col.id}`)} icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                } label={col.name} sub={`${col.photo_count || 0} photos`} />
              ))}
              <ColOption selected={colMode === 'new'} onClick={() => setColMode('new')} icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              } label="Create new collection" sub="Name it below" />
              {colMode === 'new' && (
                <input autoFocus value={newColName} onChange={e => setNewColName(e.target.value)}
                  placeholder="e.g. Reception, Mehendi, Baraat…"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.primary, outline: 'none', boxSizing: 'border-box', fontFamily: fonts.sans }}
                  onFocus={e => e.target.style.borderColor = C.amber}
                  onBlur={e => e.target.style.borderColor  = C.border} />
              )}
            </div>
          </div>

          {/* Compress toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', borderRadius: 10, background: compress ? C.amberLight : C.bg, border: `1px solid ${compress ? C.amber + '55' : C.border}`, marginBottom: 14, transition: 'all .2s' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, marginBottom: 2 }}>Compress images</div>
              <div style={{ fontSize: 11, color: C.secondary }}>{isPaid ? 'Paid plan — you can upload originals' : 'Free plan — compression required'}</div>
            </div>
            <div onClick={() => isPaid && setCompress(v => !v)} style={{ width: 42, height: 23, borderRadius: 12, background: compress ? C.primary : C.border, position: 'relative', cursor: isPaid ? 'pointer' : 'not-allowed', opacity: isPaid ? 1 : 0.5, flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2.5, left: compress ? 21 : 2.5, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>

          {/* Quality picker */}
          {compress && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.secondary, marginBottom: 10, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: fonts.mono }}>Compression Quality</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {QUALITY_PRESETS.map((p, i) => (
                  <button key={p.label} onClick={() => setQualityIdx(i)} style={{ padding: '10px 8px', borderRadius: 8, border: `1.5px solid ${qualityIdx === i ? C.primary : C.border}`, cursor: 'pointer', background: qualityIdx === i ? C.primary : C.surface, transition: 'all .15s' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: qualityIdx === i ? '#fff' : C.primary, marginBottom: 2 }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: qualityIdx === i ? 'rgba(255,255,255,0.6)' : C.secondary, lineHeight: 1.4 }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size estimate */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: C.greenLight, border: `1px solid ${C.green}22`, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: C.secondary }}>Estimated upload size</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFamily: fonts.mono }}>
              {compress ? `~${fmtSize(estSize)} (↓ ~${Math.round((1 - ratio) * 100)}%)` : fmtSize(totalSize)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 13, fontWeight: 600, color: C.secondary, cursor: 'pointer', fontFamily: fonts.sans }}>Cancel</button>
            <button
              disabled={!canSubmit}
              onClick={() => onConfirm({ compress, quality: compress ? selectedQ.value : null, ...buildCollectionIntent() })}
              style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: canSubmit ? C.primary : C.bg, fontSize: 13, fontWeight: 700, color: canSubmit ? '#fff' : C.tertiary, cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: fonts.sans }}>
              Start Upload →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ColOption({ selected, onClick, icon, label, sub }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: `1px solid ${selected ? C.primary : C.border}`, background: selected ? C.bg : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: fonts.sans }}>
      <span style={{ color: selected ? C.primary : C.tertiary, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? C.primary : C.secondary }}>{label}</div>
        <div style={{ fontSize: 11, color: C.tertiary }}>{sub}</div>
      </div>
      <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${selected ? C.primary : C.border}`, background: selected ? C.primary : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DeleteConfirmModal
// ═══════════════════════════════════════════════════════════════════════════════
function DeleteConfirmModal({ photo, onConfirm, onCancel }) {
  const filename = photo?.storage_key?.split('/').pop()?.split('_').slice(1).join('_') || 'this photo'
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: fonts.sans }}>
      <div style={{ background: C.surface, borderRadius: 14, padding: '24px', maxWidth: 360, width: '100%', border: `1px solid ${C.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.primary, marginBottom: 8, fontFamily: fonts.serif }}>Delete photo?</div>
        <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.7, marginBottom: 24 }}>
          <span style={{ color: C.primary, fontWeight: 600, fontFamily: fonts.mono }}>{filename}</span> will be permanently removed from storage and all collections.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 13, fontWeight: 600, color: C.secondary, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: C.red, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AddCollectionModal
// ═══════════════════════════════════════════════════════════════════════════════
function AddCollectionModal({ onConfirm, onCancel }) {
  const [name, setName] = useState('')
  const ref = useRef(null)
  useEffect(() => { setTimeout(() => ref.current?.focus(), 50) }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: fonts.sans }}>
      <div style={{ background: C.surface, borderRadius: 14, padding: '24px', maxWidth: 340, width: '100%', border: `1px solid ${C.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.primary, marginBottom: 4, fontFamily: fonts.serif }}>New Collection</div>
        <div style={{ fontSize: 12, color: C.tertiary, marginBottom: 16 }}>Group photos by ceremony or moment</div>
        <input
          ref={ref} value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onConfirm(name.trim())}
          placeholder="e.g. Reception, Mehendi, Baraat…"
          style={{ width: '100%', padding: '10px 13px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.primary, outline: 'none', marginBottom: 18, boxSizing: 'border-box', fontFamily: fonts.sans }}
          onFocus={e => e.target.style.borderColor = C.amber}
          onBlur={e => e.target.style.borderColor  = C.border}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 13, fontWeight: 600, color: C.secondary, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => name.trim() && onConfirm(name.trim())} disabled={!name.trim()} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: name.trim() ? C.primary : C.bg, fontSize: 13, fontWeight: 700, color: name.trim() ? '#fff' : C.tertiary, cursor: name.trim() ? 'pointer' : 'not-allowed' }}>
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function EventDetail() {
  const { id }   = useParams()
  const fileRef  = useRef(null)
  const userPlan = 'paid' // TODO: replace with real auth context

  const [event,       setEvent]       = useState(null)
  const [photos,      setPhotos]      = useState([])
  const [collections, setCollections] = useState([])
  const [colPhotoIds, setColPhotoIds] = useState({})
  const [loading,     setLoading]     = useState(true)

  const [uploading,    setUploading]    = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [pendingFiles, setPendingFiles] = useState(null)
  const [showModal,    setShowModal]    = useState(false)
  const progressRef = useRef({ done: 0, total: 0, errors: 0, dupes: 0, savingSum: 0, savingCount: 0, avgSaving: 0 })

  const [activeSection,    setActiveSection]    = useState('all')
  const [searchQuery,      setSearchQuery]      = useState('')
  const [viewMode,         setViewMode]         = useState('grid')
  const [visibleCount,     setVisibleCount]     = useState(30)
  const [copied,           setCopied]           = useState(false)
  const [selectedIds,      setSelectedIds]      = useState(new Set())
  const [viewerIndex,      setViewerIndex]      = useState(null)
  const [deleteTarget,     setDeleteTarget]     = useState(null)
  const [showAddCol,       setShowAddCol]       = useState(false)

  const [coverPhotoId, setCoverPhotoId] = useState(null)
  const [coverUrl,     setCoverUrl]     = useState(null)
  const [coverSaving,  setCoverSaving]  = useState(false)

  const [guestUpload,   setGuestUpload]   = useState(false)
  const [publicGallery, setPublicGallery] = useState(false)
  const [togglingFeat,  setTogglingFeat]  = useState(null)
  const [showEventSettings, setShowEventSettings] = useState(false)
  const [settingsSaving,    setSettingsSaving]    = useState(false)
  const [settingsSaved,     setSettingsSaved]      = useState(false)
  const [eventName,         setEventName]          = useState('')
  const [eventExpiry,       setEventExpiry]        = useState('')
  const [showDeleteEvent,   setShowDeleteEvent]    = useState(false)
  const [deletingEvent,     setDeletingEvent]      = useState(false)

  useEffect(() => { if (id) loadAll() }, [id])
  useEffect(() => { setVisibleCount(30) }, [activeSection, searchQuery])

  async function loadAll() {
    await Promise.all([loadEvent(), loadPhotos(), loadCollections()])
  }

  async function loadEvent() {
    try {
      const evs = await getEvents()
      if (Array.isArray(evs)) {
        const ev = evs.find(e => e.id === id)
        if (ev) {
          setEvent(ev)
          setCoverPhotoId(ev.cover_photo_id || null)
          setCoverUrl(ev.cover_url || null)
          setGuestUpload(ev.guest_upload_enabled || false)
          setPublicGallery(ev.public_gallery || false)
          setEventName(ev.name || '')
          setEventExpiry(ev.end_date ? ev.end_date.slice(0, 10) : '')
        }
      }
    } catch (e) { console.error('loadEvent', e) }
  }

  async function loadPhotos() {
    try {
      const data = await getPhotos(id)
      if (Array.isArray(data)) setPhotos(data)
    } catch (e) { console.error('loadPhotos', e) }
    setLoading(false)
  }

  async function loadCollections() {
    try {
      const data = await getCollections(id)
      if (!Array.isArray(data)) return
      setCollections(data)
      const map = {}
      await Promise.all(data.map(async col => {
        try {
          const r = await getCollectionPhotos(id, col.id)
          map[col.id] = new Set(r.photo_ids || [])
        } catch { map[col.id] = new Set() }
      }))
      setColPhotoIds(map)
    } catch (e) { console.error('loadCollections', e) }
  }

  async function handleMakeCover(photo) {
    setCoverSaving(true)
    try {
      const data = await setCoverPhoto(id, photo.id)
      if (data.cover_photo_id) { setCoverPhotoId(data.cover_photo_id); setCoverUrl(data.cover_url) }
    } catch (e) { console.error('makeCover', e) }
    setCoverSaving(false)
  }

  async function handleToggleFeature(feature, value) {
    setTogglingFeat(feature)
    try {
      const res = await fetch(`${API_URL}/events/${id}/settings`, {
        method: 'PATCH', headers: jsonH(),
        body: JSON.stringify(feature === 'guest' ? { guest_upload_enabled: value } : { public_gallery: value }),
      })
      const data = await res.json()
      if (data.id) {
        if (feature === 'guest')  setGuestUpload(data.guest_upload_enabled)
        if (feature === 'public') setPublicGallery(data.public_gallery)
      }
    } catch (e) { console.error('toggle feature failed', e) }
    setTogglingFeat(null)
  }

  async function saveEventSettings() {
    setSettingsSaving(true)
    try {
      await fetch(`${API_URL}/events/${id}/settings`, {
        method: 'PATCH', headers: jsonH(),
        body: JSON.stringify({ guest_upload_enabled: guestUpload, public_gallery: publicGallery }),
      })
      await fetch(`${API_URL}/events/${id}/update`, {
        method: 'PATCH', headers: jsonH(),
        body: JSON.stringify({ name: eventName, end_date: eventExpiry || null }),
      }).catch(() => {})
      setSettingsSaved(true)
      setTimeout(() => { setSettingsSaved(false); setShowEventSettings(false) }, 1200)
    } catch (e) { console.error('saveEventSettings', e) }
    setSettingsSaving(false)
  }

  async function handleDeleteEvent() {
    setDeletingEvent(true)
    try {
      const res = await fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: jsonH() })
      if (res.ok) window.location.href = '/dashboard/events'
    } catch (e) { console.error('deleteEvent', e) }
    setDeletingEvent(false)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deletePhoto(id, deleteTarget.id)
      setPhotos(prev => prev.filter(p => p.id !== deleteTarget.id))
      if (deleteTarget.id === coverPhotoId) { setCoverPhotoId(null); setCoverUrl(null) }
      setColPhotoIds(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(cid => { next[cid] = new Set([...next[cid]].filter(pid => pid !== deleteTarget.id)) })
        return next
      })
      setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n })
    } catch (e) { console.error('deletePhoto', e) }
    setDeleteTarget(null)
  }

  async function handleCreateCollection(name) {
    setShowAddCol(false)
    try {
      const col = await createCollection(id, name)
      if (col.id) { setCollections(prev => [...prev, col]); setColPhotoIds(prev => ({ ...prev, [col.id]: new Set() })) }
    } catch (e) { console.error('createCollection', e) }
  }

  async function handleDeleteCollection(col) {
    try {
      await deleteCollection(id, col.id)
      setCollections(prev => prev.filter(c => c.id !== col.id))
      setColPhotoIds(prev => { const n = { ...prev }; delete n[col.id]; return n })
      if (activeSection === col.id) setActiveSection('all')
    } catch (e) { console.error('deleteCollection', e) }
  }

  async function handleAddToCol(photo, col) {
    try {
      await addPhotosToCollection(id, col.id, [photo.id])
      setColPhotoIds(prev => ({ ...prev, [col.id]: new Set([...(prev[col.id] || []), photo.id]) }))
      setCollections(prev => prev.map(c => c.id === col.id ? { ...c, photo_count: (c.photo_count || 0) + 1 } : c))
    } catch (e) { console.error('addToCol', e) }
  }

  async function handleRemoveFromCol(photo, col) {
    try {
      await removePhotoFromCollection(id, col.id, photo.id)
      setColPhotoIds(prev => { const n = { ...prev }; n[col.id] = new Set([...n[col.id]].filter(pid => pid !== photo.id)); return n })
      setCollections(prev => prev.map(c => c.id === col.id ? { ...c, photo_count: Math.max(0, (c.photo_count || 1) - 1) } : c))
    } catch (e) { console.error('removeFromCol', e) }
  }

  async function compressImage(file, quality) {
    return new Promise(resolve => {
      if (/\.(heic|heif)$/i.test(file.name)) { resolve(new Blob([file], { type: file.type })); return }
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let w = img.naturalWidth, h = img.naturalHeight
        const m = Math.max(w, h)
        if (m > COMPRESS_MAX_PX) { const s = COMPRESS_MAX_PX / m; w = Math.round(w * s); h = Math.round(h * s) }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(new Blob([file], { type: 'image/jpeg' })); return }
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h)
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => resolve(blob || new Blob([file], { type: 'image/jpeg' })), 'image/jpeg', quality)
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve(new Blob([file], { type: 'image/jpeg' })) }
      img.src = url
    })
  }

  async function computeHash(blob) {
    try {
      const buf = await blob.arrayBuffer()
      const h   = await crypto.subtle.digest('SHA-256', buf)
      return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('')
    } catch { return `${blob.size}_${Date.now()}_${Math.random().toString(36).slice(2)}` }
  }

  async function uploadSingleFile(file, compressOpts) {
    let payload, savingPct
    if (compressOpts.compress) {
      const blob = await compressImage(file, compressOpts.quality)
      savingPct  = Math.max(0, Math.round((1 - blob.size / file.size) * 100))
      payload    = blob
    } else {
      payload = new Blob([file], { type: file.type }); savingPct = 0
    }
    const fileHash    = await computeHash(payload)
    const contentType = compressOpts.compress ? 'image/jpeg' : (file.type || 'image/jpeg')

    const presignRes = await fetch(`${API_URL}/photos/${id}/presign`, {
      method: 'POST', headers: jsonH(),
      body: JSON.stringify({
        filename: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
        file_hash: fileHash, file_size: payload.size, content_type: contentType,
        collection_id: compressOpts.collectionId || null,
        new_collection_name: compressOpts.newCollectionName || null,
      }),
    })
    if (presignRes.status === 402) { const e = await presignRes.json().catch(() => ({})); throw new Error(e.detail?.code || 'quota_exceeded') }
    if (!presignRes.ok) throw new Error(`presign_${presignRes.status}`)
    const pdata = await presignRes.json()
    if (pdata.status === 'duplicate') return { status: 'duplicate' }

    const { photo_id, upload_url } = pdata

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', upload_url, true)
      xhr.setRequestHeader('Content-Type', contentType)
      xhr.onload    = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`r2_${xhr.status}`))
      xhr.onerror   = () => reject(new Error('network_error'))
      xhr.timeout   = 300000
      xhr.ontimeout = () => reject(new Error('upload_timeout'))
      xhr.send(payload)
    })

    const confirmRes = await fetch(`${API_URL}/photos/${id}/confirm/${photo_id}`, {
      method: 'POST', headers: jsonH(),
      body: JSON.stringify({ collection_id: compressOpts.collectionId || null, new_collection_name: compressOpts.newCollectionName || null }),
    })
    if (!confirmRes.ok) throw new Error(`confirm_${confirmRes.status}`)
    const confirmData = await confirmRes.json()
    return { status: 'done', saving: savingPct, collection_id: confirmData.collection_id || null }
  }

  function handleFileSelect(e) {
    const raw = Array.from(e.target.files || [])
    if (fileRef.current) fileRef.current.value = ''
    if (!raw.length) return
    const seen = new Set()
    const files = raw.filter(f => { const k = `${f.name}_${f.size}`; if (seen.has(k)) return false; seen.add(k); return true })
    setPendingFiles(files); setShowModal(true)
  }

  function handleModalConfirm(compressOpts) {
    const files = pendingFiles
    setShowModal(false); setPendingFiles(null)
    startUpload(files, compressOpts)
  }

  async function startUpload(files, compressOpts) {
    progressRef.current = { done: 0, total: files.length, errors: 0, dupes: 0, savingSum: 0, savingCount: 0, avgSaving: 0 }
    setShowProgress(true); setUploading(true)

    let pollBusy = false
    const poll = setInterval(async () => {
      if (pollBusy) return; pollBusy = true; await loadPhotos(); pollBusy = false
    }, 4000)

    try {
      for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
        const batch = files.slice(i, i + CONCURRENT_UPLOADS)
        await Promise.allSettled(batch.map(async file => {
          let lastErr
          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
              const r = await uploadSingleFile(file, compressOpts)
              if (r.status === 'duplicate') { progressRef.current.dupes++; progressRef.current.done++ }
              else {
                progressRef.current.done++
                if (r.saving > 0) { progressRef.current.savingSum += r.saving; progressRef.current.savingCount += 1; progressRef.current.avgSaving = Math.round(progressRef.current.savingSum / progressRef.current.savingCount) }
              }
              return
            } catch (err) {
              lastErr = err
              if (err.message?.includes('quota')) { progressRef.current.errors++; progressRef.current.done++; return }
              if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, 1500 * attempt))
            }
          }
          progressRef.current.errors++; progressRef.current.done++
          console.error(`Upload failed: ${file.name}`, lastErr?.message)
        }))
      }
    } finally { clearInterval(poll) }

    await loadPhotos()
    await loadCollections()
    setUploading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/guest/${event?.slug}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function downloadQR() {
    import('qrcode').then(lib => {
      const c = document.createElement('canvas')
      const u = `${window.location.origin}/guest/${event?.slug}`
      lib.default.toCanvas(c, u, { width: 512, margin: 3, color: { dark: '#1A1814', light: '#fff' }, errorCorrectionLevel: 'H' }, () => {
        const a = document.createElement('a')
        a.href = c.toDataURL('image/png'); a.download = `${event?.slug || 'event'}-qr.png`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
      })
    })
  }

  function shareWhatsApp() {
    const u = `${window.location.origin}/guest/${event?.slug}`
    window.open(`https://wa.me/?text=${encodeURIComponent(`Find your photos from ${event?.name}! 📸\n${u}`)}`, '_blank')
  }

  function handleOpen(photo) {
    const idx = readyPhotos.findIndex(p => p.id === photo.id)
    setViewerIndex(idx >= 0 ? idx : 0)
  }

  function handleDownload(photo) {
    const url      = photo.url || photo.thumb_url
    const filename = photo.storage_key?.split('/').pop()?.split('_').slice(1).join('_') || 'photo.jpg'
    const proxyUrl = `${API_URL}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
    const a = document.createElement('a')
    a.href = proxyUrl; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  function toggleSelect(photoId) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(photoId) ? n.delete(photoId) : n.add(photoId); return n })
  }

  const readyPhotos  = photos.filter(p => p.status === 'ready')
  const processing   = photos.filter(p => p.status === 'pending' || p.status === 'processing').length
  const failed       = photos.filter(p => p.status === 'failed').length
  const guestUrl     = event && typeof window !== 'undefined' ? `${window.location.origin}/guest/${event.slug}` : ''
  const isColSection = activeSection !== 'all' && activeSection !== 'processing' && activeSection !== 'failed'

  const filteredPhotos = photos.filter(p => {
    if (activeSection === 'all')        return p.status === 'ready'
    if (activeSection === 'processing') return p.status === 'pending' || p.status === 'processing'
    if (activeSection === 'failed')     return p.status === 'failed'
    return p.status === 'ready' && colPhotoIds[activeSection]?.has(p.id)
  }).filter(p => !searchQuery || p.storage_key?.toLowerCase().includes(searchQuery.toLowerCase()))

  const visiblePhotos = filteredPhotos.slice(0, visibleCount)
  const hasMore       = visibleCount < filteredPhotos.length

  const sectionLabel = activeSection === 'all'        ? 'All Photos'
                     : activeSection === 'processing'  ? 'In Queue'
                     : activeSection === 'failed'      ? 'Failed'
                     : collections.find(c => c.id === activeSection)?.name || ''

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: fonts.sans }}>

      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');
        @keyframes egpulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes egspin  { to{transform:rotate(360deg)} }
        @keyframes egfloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        * { box-sizing: border-box; }
        input, button, select, textarea { font-family: inherit; }
      `}</style>

      {/* ── Modals ── */}
      {showModal && pendingFiles && (
        <CompressionModal
          files={pendingFiles} userPlan={userPlan} collections={collections}
          defaultCollectionId={isColSection ? activeSection : null}
          onConfirm={handleModalConfirm}
          onCancel={() => { setShowModal(false); setPendingFiles(null) }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal photo={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
      )}
      {showAddCol && (
        <AddCollectionModal onConfirm={handleCreateCollection} onCancel={() => setShowAddCol(false)} />
      )}

      {/* ── Event Settings Modal ── */}
      {showEventSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: fonts.sans }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: '28px', width: '100%', maxWidth: 540, border: `1px solid ${C.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.primary, fontFamily: fonts.serif }}>Event Settings</div>
                <div style={{ fontSize: 12, color: C.tertiary, marginTop: 2 }}>Configure this event</div>
              </div>
              <button onClick={() => setShowEventSettings(false)} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 15, color: C.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.secondary, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: fonts.mono }}>Event Name</label>
              <input value={eventName} onChange={e => setEventName(e.target.value)}
                style={{ width: '100%', padding: '10px 13px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.primary, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = C.amber}
                onBlur={e => e.target.style.borderColor = C.border} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.secondary, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: fonts.mono }}>Data Expiry Date</label>
              <input type="date" value={eventExpiry} onChange={e => setEventExpiry(e.target.value)}
                style={{ width: '100%', padding: '10px 13px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.primary, outline: 'none', cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = C.amber}
                onBlur={e => e.target.style.borderColor = C.border} />
              <div style={{ fontSize: 10, color: C.tertiary, marginTop: 4, fontFamily: fonts.mono }}>Event unpublishes automatically on this date</div>
            </div>

            <div style={{ height: 1, background: C.border, marginBottom: 20 }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: fonts.mono }}>Guest Access</div>

            {/* Guest Upload */}
            <SettingsToggle label="Guest Uploads" sub="Allow guests to upload their own photos" value={guestUpload} onChange={v => setGuestUpload(v)} color={C.green} />
            {/* Public Gallery */}
            <SettingsToggle label="Public Gallery" sub="Guests see all photos without taking a selfie" value={publicGallery} onChange={v => setPublicGallery(v)} color={C.primary} />

            <div style={{ height: 1, background: C.border, margin: '20px 0' }} />

            {/* Danger zone */}
            <div style={{ padding: '16px', borderRadius: 10, background: C.redLight, border: `1px solid ${C.red}22`, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: fonts.mono }}>Danger Zone</div>
              <div style={{ fontSize: 12, color: C.secondary, marginBottom: 12 }}>Permanently delete this event and all its photos. Cannot be undone.</div>
              {!showDeleteEvent
                ? <button onClick={() => setShowDeleteEvent(true)} style={{ padding: '7px 14px', borderRadius: 7, border: `1px solid ${C.red}44`, background: 'transparent', fontSize: 12, fontWeight: 600, color: C.red, cursor: 'pointer' }}>Delete Event</button>
                : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>Are you sure?</span>
                    <button onClick={handleDeleteEvent} disabled={deletingEvent}
                      style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: C.red, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', opacity: deletingEvent ? 0.6 : 1 }}>
                      {deletingEvent ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                    <button onClick={() => setShowDeleteEvent(false)} style={{ padding: '7px 12px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 12, color: C.secondary, cursor: 'pointer' }}>Cancel</button>
                  </div>
                )
              }
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowEventSettings(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 13, color: C.secondary, cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={saveEventSettings} disabled={settingsSaving}
                style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: settingsSaved ? C.greenLight : C.primary, fontSize: 13, fontWeight: 700, color: settingsSaved ? C.green : '#fff', cursor: 'pointer', transition: 'all .2s', border: settingsSaved ? `1px solid ${C.green}44` : 'none' }}>
                {settingsSaved ? '✓ Saved!' : settingsSaving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {viewerIndex !== null && (
        <PhotoViewer photos={readyPhotos} startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)} onDownload={handleDownload} />
      )}

      {/* ── Selection bar ── */}
      {selectedIds.size > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 500, display: 'flex', alignItems: 'center', gap: 10, background: C.primary, borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: fonts.mono }}>{selectedIds.size} selected</span>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />
          <button onClick={() => readyPhotos.filter(p => selectedIds.has(p.id)).forEach(handleDownload)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.sans }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download all
          </button>
          <button onClick={() => setSelectedIds(new Set())} style={{ padding: '6px 11px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: fonts.sans }}>Clear</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ══════════════════════════════════════════════════
            TOPBAR
        ══════════════════════════════════════════════════ */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 24px', flexShrink: 0 }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Back link */}
            <Link href="/dashboard/events" style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.secondary, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Events
            </Link>
            <div style={{ width: 1, height: 16, background: C.border }} />

            {/* Event name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.primary, fontFamily: fonts.serif, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event?.name || 'Loading…'}</div>
              <div style={{ fontSize: 11, color: C.tertiary, fontFamily: fonts.mono }}>/{event?.slug}</div>
            </div>

            {/* Published badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: event?.is_published ? C.greenLight : C.bg, border: `1px solid ${event?.is_published ? C.green + '33' : C.border}` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: event?.is_published ? C.green : C.tertiary }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: event?.is_published ? C.green : C.secondary, fontFamily: fonts.mono }}>{event?.is_published ? 'Published' : 'Unpublished'}</span>
            </div>

            {/* Photo count */}
            <div style={{ padding: '4px 10px', borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.secondary, fontFamily: fonts.mono }}>{photos.length} photos</div>

            {/* Share */}
            <button onClick={copyLink} style={{ padding: '7px 16px', borderRadius: 8, background: copied ? C.greenLight : C.surface, color: copied ? C.green : C.primary, border: `1px solid ${copied ? C.green + '44' : C.border}`, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              {copied ? (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Share</>
              )}
            </button>

            {/* Settings */}
            <button onClick={() => setShowEventSettings(true)} style={{ width: 36, height: 36, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = C.surface}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>

            {/* Upload */}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ padding: '7px 18px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp,image/heic" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>

          {/* ══════════════════════════════════════════════════
              LEFT SIDEBAR
          ══════════════════════════════════════════════════ */}
          <div style={{ width: 232, flexShrink: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, borderRight: `1px solid ${C.border}`, background: C.surface }}>

            {/* Cover card */}
            <div style={{ ...card(), overflow: 'hidden' }}>
              <div style={{ height: 110, position: 'relative', overflow: 'hidden' }}>
                {coverUrl
                  ? <img src={coverUrl} alt="Event cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (
                    <div style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Hatched diagonal pattern like inspiration */}
                      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                        <defs>
                          <pattern id="hatch-s" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="12" stroke={C.border} strokeWidth="1.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#hatch-s)`} />
                      </svg>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5" style={{ position: 'relative', zIndex: 1 }}>
                        <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )
                }
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 10px 8px', background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }}>
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 3, background: 'rgba(255,255,255,0.9)', color: C.primary, fontWeight: 600, fontFamily: fonts.mono }}>
                    {coverSaving ? 'Saving…' : coverUrl ? '✎ Change via ⋮' : 'Set cover via ⋮'}
                  </span>
                </div>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {[{ n: readyPhotos.length, l: 'Photos' }, { n: 0, l: 'Videos' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '7px 0', background: C.bg, borderRadius: 7, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, fontFamily: fonts.serif }}>{String(s.n).padStart(2, '0')}</div>
                      <div style={{ fontSize: 10, color: C.secondary, fontFamily: fonts.mono, letterSpacing: '.04em' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAddCol(true)} style={{ width: '100%', padding: '7px', borderRadius: 7, border: `1px dashed ${C.border}`, background: 'transparent', fontSize: 12, color: C.secondary, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.secondary }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Collection
                </button>
              </div>
            </div>

            {/* Nav */}
            <div style={{ ...card(), padding: '12px' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.tertiary, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 8, paddingLeft: 6, fontFamily: fonts.mono }}>Library</div>

              <NavItem id="all" label="All Photos" icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              } count={readyPhotos.length} active={activeSection === 'all'} onClick={() => setActiveSection('all')} />

              {collections.length > 0 && (
                <div style={{ fontSize: 9, fontWeight: 600, color: C.tertiary, textTransform: 'uppercase', letterSpacing: '.09em', marginTop: 10, marginBottom: 6, paddingLeft: 6, fontFamily: fonts.mono }}>Collections</div>
              )}

              {collections.map(col => (
                <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                  <button onClick={() => setActiveSection(col.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 7, border: 'none', background: activeSection === col.id ? C.bg : 'transparent', cursor: 'pointer', minWidth: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={activeSection === col.id ? C.amber : C.tertiary} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span style={{ fontSize: 13, fontWeight: activeSection === col.id ? 600 : 400, color: activeSection === col.id ? C.primary : C.secondary, flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.name}</span>
                    <span style={{ fontSize: 10, fontFamily: fonts.mono, color: C.tertiary }}>{col.photo_count || 0}</span>
                  </button>
                  <button onClick={() => handleDeleteCollection(col)} title="Delete"
                    style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.tertiary }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.redLight; e.currentTarget.style.color = C.red }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.tertiary }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}

              {collections.length === 0 && (
                <div style={{ fontSize: 11, color: C.tertiary, padding: '4px 9px', fontStyle: 'italic' }}>No collections yet</div>
              )}

              <div style={{ height: 1, background: C.border, margin: '10px 0' }} />
              <div style={{ fontSize: 9, fontWeight: 600, color: C.tertiary, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 6, paddingLeft: 6, fontFamily: fonts.mono }}>Status</div>

              <NavItem id="processing" label="In Queue" icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              } count={processing} active={activeSection === 'processing'} onClick={() => processing > 0 && setActiveSection('processing')} muted={processing === 0} />
              <NavItem id="failed" label="Failed" icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              } count={failed} active={activeSection === 'failed'} onClick={() => failed > 0 && setActiveSection('failed')} muted={failed === 0} />

              <button onClick={loadPhotos} style={{ width: '100%', marginTop: 8, padding: '6px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 11, fontWeight: 500, color: C.secondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Refresh
              </button>
            </div>

            {/* Event quick toggles */}
            <div style={{ ...card(), padding: '12px 14px' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.tertiary, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10, fontFamily: fonts.mono }}>Settings</div>
              <SettingsToggle label="Guest Uploads" sub="Allow guest uploads" value={guestUpload} onChange={v => !togglingFeat && handleToggleFeature('guest', v)} color={C.green} loading={togglingFeat === 'guest'} compact />
              <div style={{ marginTop: 8 }}>
                <SettingsToggle label="Public Gallery" sub="No selfie required" value={publicGallery} onChange={v => !togglingFeat && handleToggleFeature('public', v)} color={C.primary} loading={togglingFeat === 'public'} compact />
              </div>
            </div>

            {/* QR panel */}
            <div style={{ ...card(), padding: '12px 14px' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.tertiary, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10, fontFamily: fonts.mono }}>Guest QR</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, background: C.bg, borderRadius: 8, padding: 8, border: `1px solid ${C.border}` }}>
                {guestUrl
                  ? <QRCode url={guestUrl} size={148} />
                  : <div style={{ width: 148, height: 148, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 22, height: 22, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.primary}`, borderRadius: '50%', animation: 'egspin .8s linear infinite' }} /></div>
                }
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '5px 8px', fontSize: 9, color: C.secondary, wordBreak: 'break-all', lineHeight: 1.5, marginBottom: 8, fontFamily: fonts.mono }}>{guestUrl}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <button onClick={copyLink} style={{ width: '100%', padding: '7px', borderRadius: 7, background: copied ? C.greenLight : C.primary, color: copied ? C.green : '#fff', border: copied ? `1px solid ${C.green}33` : 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.sans }}>
                  {copied ? '✓ Link Copied!' : 'Copy Guest Link'}
                </button>
                <button onClick={downloadQR} style={{ width: '100%', padding: '7px', borderRadius: 7, background: 'transparent', border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 500, color: C.secondary, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >Download QR</button>
                <button onClick={shareWhatsApp} style={{ width: '100%', padding: '7px', borderRadius: 7, background: 'transparent', border: `1px solid rgba(37,211,102,0.25)`, fontSize: 11, fontWeight: 500, color: '#128C7E', cursor: 'pointer' }}>WhatsApp Share</button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              MAIN CONTENT
          ══════════════════════════════════════════════════ */}
          <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

            {/* Upload progress */}
            {showProgress && (
              <UploadProgressBar progressRef={progressRef} uploading={uploading} onClear={() => {
                setShowProgress(false)
                progressRef.current = { done: 0, total: 0, errors: 0, dupes: 0, savingSum: 0, savingCount: 0, avgSaving: 0 }
              }} />
            )}

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.tertiary} strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by filename…"
                  style={{ width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.primary, background: C.surface, outline: 'none', fontFamily: fonts.sans }}
                  onFocus={e => e.target.style.borderColor = C.amber}
                  onBlur={e => e.target.style.borderColor  = C.border} />
              </div>

              {/* Section label */}
              <div style={{ fontSize: 11, color: C.secondary, fontFamily: fonts.mono, whiteSpace: 'nowrap' }}>
                {sectionLabel} <span style={{ color: C.tertiary }}>·</span> {filteredPhotos.length}
              </div>

              <div style={{ flex: 1 }} />

              {/* View toggle */}
              <div style={{ display: 'flex', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, gap: 2 }}>
                {[
                  { v: 'grid', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                  { v: 'list', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
                ].map(m => (
                  <button key={m.v} onClick={() => setViewMode(m.v)} style={{ width: 28, height: 26, borderRadius: 6, border: 'none', background: viewMode === m.v ? C.primary : 'transparent', color: viewMode === m.v ? '#fff' : C.tertiary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>{m.icon}</button>
                ))}
              </div>

              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ padding: '7px 16px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload
              </button>
            </div>

            {/* ── Photo area ── */}
            {loading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.primary}`, borderRadius: '50%', animation: 'egspin .8s linear infinite', margin: '0 auto 14px' }} />
                  <div style={{ fontSize: 13, color: C.tertiary, fontFamily: fonts.mono }}>Loading photos…</div>
                </div>
              </div>

            ) : filteredPhotos.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <div style={{ textAlign: 'center', maxWidth: 320 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 16, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'egfloat 3s ease-in-out infinite' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5">
                      {isColSection
                        ? <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        : <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>
                      }
                    </svg>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: C.primary, marginBottom: 8, fontFamily: fonts.serif }}>
                    {searchQuery ? 'No photos match' : isColSection ? 'Collection is empty' : 'No photos yet'}
                  </div>
                  <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.7, marginBottom: 20 }}>
                    {searchQuery ? 'Try a different search term'
                      : isColSection ? 'Hover a photo and use ⋮ → Add to Collection'
                      : 'Upload your event photos to get started'}
                  </div>
                  {!searchQuery && !isColSection && (
                    <button onClick={() => fileRef.current?.click()} style={{ padding: '10px 24px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upload Photos</button>
                  )}
                </div>
              </div>

            ) : viewMode === 'grid' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                  {visiblePhotos.map((photo, i) => (
                    <PhotoCard
                      key={photo.id} photo={photo} index={i}
                      isCover={photo.id === coverPhotoId}
                      selected={selectedIds.has(photo.id)}
                      onOpen={handleOpen} onDownload={handleDownload} onToggleSelect={toggleSelect}
                      collections={collections} colPhotoIds={colPhotoIds}
                      onMakeCover={handleMakeCover} onDelete={setDeleteTarget}
                      onAddToCol={handleAddToCol} onRemoveFromCol={handleRemoveFromCol}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
                    <button onClick={() => setVisibleCount(v => v + 30)} style={{ padding: '9px 24px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, fontWeight: 500, color: C.secondary, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = C.surface}
                    >
                      Load more · {filteredPhotos.length - visibleCount} remaining
                    </button>
                  </div>
                )}
              </>

            ) : (
              /* List view */
              <div style={{ ...card(), overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 90px 110px', background: C.primary, padding: '10px 16px' }}>
                  {['#', 'Filename', 'Status', 'Size', 'Date'].map(h => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '.07em', fontFamily: fonts.mono }}>{h}</div>
                  ))}
                </div>
                {filteredPhotos.map((p, i) => {
                  const fn = p.storage_key?.split('/').pop()?.split('_').slice(1).join('_') || '—'
                  const statusColor = p.status === 'ready' ? C.green : p.status === 'failed' ? C.red : C.amber
                  return (
                    <div key={p.id}
                      style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 90px 110px', padding: '10px 16px', borderBottom: `1px solid ${C.border}`, transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontSize: 11, color: C.tertiary, fontFamily: fonts.mono }}>{i + 1}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.thumb_url
                          ? <img src={p.thumb_url} alt="" loading="lazy" style={{ width: 30, height: 30, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                          : <div style={{ width: 30, height: 30, borderRadius: 5, flexShrink: 0, background: C.bg, border: `1px solid ${C.border}` }} />}
                        <span style={{ fontSize: 12, color: C.primary, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: fonts.mono }}>{fn}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: statusColor + '15', color: statusColor, fontFamily: fonts.mono }}>{p.status}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.secondary, fontFamily: fonts.mono }}>{fmtSize(p.file_size_bytes) || '—'}</div>
                      <div style={{ fontSize: 11, color: C.secondary, fontFamily: fonts.mono }}>{fmtDate(p.created_at) || '—'}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ id, label, icon, count, active, onClick, muted }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 9px', borderRadius: 7, border: 'none',
      background: active ? C.bg : 'transparent',
      cursor: muted ? 'default' : 'pointer', marginBottom: 1, opacity: muted ? 0.4 : 1,
      fontFamily: fonts.sans,
    }}>
      <span style={{ color: active ? C.amber : C.tertiary, display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? C.primary : C.secondary, flex: 1, textAlign: 'left' }}>{label}</span>
      <span style={{ fontSize: 10, fontFamily: fonts.mono, color: C.tertiary }}>{count}</span>
    </button>
  )
}

// ─── SettingsToggle ───────────────────────────────────────────────────────────
function SettingsToggle({ label, sub, value, onChange, color, loading, compact }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: compact ? '8px 0' : '12px 14px', ...(compact ? {} : { borderRadius: 10, background: value ? color + '08' : C.bg, border: `1px solid ${value ? color + '30' : C.border}`, marginBottom: 8, transition: 'all .2s' }) }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 500, color: C.primary, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.tertiary }}>{sub}</div>
      </div>
      <div onClick={() => !loading && onChange(!value)}
        style={{ width: 36, height: 20, borderRadius: 10, background: value ? color : C.border, position: 'relative', cursor: loading ? 'not-allowed' : 'pointer', flexShrink: 0, marginLeft: 12, opacity: loading ? 0.5 : 1, transition: 'background .2s' }}>
        <div style={{ position: 'absolute', top: 2, left: value ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  )
}

