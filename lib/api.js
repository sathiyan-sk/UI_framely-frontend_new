const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export async function register(email, password, full_name) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name })
  })
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

export async function getEvents() {
  const res = await fetch(`${API_URL}/events/`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  })
  return res.json()
}

export async function createEvent(name) {
  const res = await fetch(`${API_URL}/events/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ name })
  })
  return res.json()
}

export async function getPhotos(eventId) {
  const res = await fetch(`${API_URL}/photos/${eventId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  })
  return res.json()
}

export async function uploadPhoto(eventId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/photos/${eventId}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  })
  return res.json()
}

export async function searchFaces(slug, file) {
  const formData = new FormData()
  formData.append('file', file)
  // const res = await fetch(`${API_URL}/search/${slug}`, { working
  const res = await fetch(`${API_URL}/api/search/${slug}`, {  
    method: 'POST',
    body: formData
  })
  return res.json()
}

export async function getEventBySlug(slug) {
  const res = await fetch(`${API_URL}/events/${slug}`)
  return res.json()
}
