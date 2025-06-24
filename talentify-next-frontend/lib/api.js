const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export async function updateTalent(id, data) {
  const res = await fetch(`${API_BASE}/api/talents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('Failed to update talent')
  }
  return res.json()
}
