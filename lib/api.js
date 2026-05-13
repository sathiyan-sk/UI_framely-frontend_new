const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}
function authHeaders() { return { 'Authorization': `Bearer ${getToken()}` } }
function jsonHeaders() { return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function register(email, password, full_name) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name })
  })
  return res.json()
}
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

// ── Events ────────────────────────────────────────────────────────────────────
export async function getEvents() {
  const res = await fetch(`${API_URL}/events/`, { headers: authHeaders() })
  return res.json()
}
export async function createEvent(name) {
  const res = await fetch(`${API_URL}/events/`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ name })
  })
  return res.json()
}

// ── Cover Photo ───────────────────────────────────────────────────────────────
export async function setCoverPhoto(eventId, photoId) {
  const res = await fetch(`${API_URL}/events/${eventId}/cover`, {
    method: 'PATCH', headers: jsonHeaders(), body: JSON.stringify({ photo_id: photoId })
  })
  return res.json()
}
export async function removeCoverPhoto(eventId) {
  const res = await fetch(`${API_URL}/events/${eventId}/cover`, {
    method: 'DELETE', headers: authHeaders()
  })
  return res.json()
}

// ── Photos ────────────────────────────────────────────────────────────────────
export async function getPhotos(eventId) {
  const res = await fetch(`${API_URL}/photos/${eventId}`, { headers: authHeaders() })
  return res.json()
}
export async function uploadPhoto(eventId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/photos/${eventId}/upload`, {
    method: 'POST', headers: authHeaders(), body: formData
  })
  return res.json()
}
export async function deletePhoto(eventId, photoId) {
  const res = await fetch(`${API_URL}/photos/${eventId}/${photoId}`, {
    method: 'DELETE', headers: authHeaders()
  })
  if (!res.ok) throw new Error(`delete_${res.status}`)
  return res.json()
}

// ── Collections ───────────────────────────────────────────────────────────────
export async function getCollections(eventId) {
  const res = await fetch(`${API_URL}/photos/${eventId}/collections`, { headers: authHeaders() })
  return res.json()
}
export async function createCollection(eventId, name) {
  const res = await fetch(`${API_URL}/photos/${eventId}/collections`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ name })
  })
  return res.json()
}
export async function deleteCollection(eventId, collectionId) {
  const res = await fetch(`${API_URL}/photos/${eventId}/collections/${collectionId}`, {
    method: 'DELETE', headers: authHeaders()
  })
  return res.json()
}
export async function addPhotosToCollection(eventId, collectionId, photoIds) {
  const res = await fetch(`${API_URL}/photos/${eventId}/collections/${collectionId}/photos`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ photo_ids: photoIds })
  })
  return res.json()
}
export async function removePhotoFromCollection(eventId, collectionId, photoId) {
  const res = await fetch(`${API_URL}/photos/${eventId}/collections/${collectionId}/photos/${photoId}`, {
    method: 'DELETE', headers: authHeaders()
  })
  return res.json()
}
export async function getCollectionPhotos(eventId, collectionId) {
  const res = await fetch(`${API_URL}/photos/${eventId}/collections/${collectionId}/photos`, {
    headers: authHeaders()
  })
  return res.json()
}

// ── Search / Guest ────────────────────────────────────────────────────────────
export async function searchFaces(slug, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/search/${slug}`, { method: 'POST', body: formData })
  return res.json()
}
export async function getEventBySlug(slug) {
  const res = await fetch(`${API_URL}/events/${slug}`)
  return res.json()
}
