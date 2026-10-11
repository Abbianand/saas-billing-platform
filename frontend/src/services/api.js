
const API_URL = import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail

    throw new Error(message || `Request failed: ${response.status}`)
  }

  return data
}

export const api = {
  get(path) {
    return request(path)
  },

  post(path, body) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}