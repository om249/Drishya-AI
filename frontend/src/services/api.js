
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/+$/, '')

/**
 * Centralized API client for Drishya.
 *
 * Handles:
 * - API base URL
 * - Authentication token
 * - JSON requests and responses
 * - File uploads (FormData)
 * - API and validation errors
 */

function getErrorMessage(body, fallback = 'Request failed') {
  const detail = body?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const location = item.loc?.filter(
          (part) => part !== 'body'
        ).join('.')

        return location
          ? `${location}: ${item.msg}`
          : item.msg
      })
      .join(', ')
  }

  if (typeof body?.message === 'string') {
    return body.message
  }

  return fallback
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('drishya_token')

  const headers = new Headers(options.headers || {})

  headers.set('Accept', 'application/json')

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData

  // Let the browser set the multipart boundary for file uploads.
  if (options.body !== undefined && !isFormData) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const responseText = await response.text()

  let body = null

  if (responseText) {
    try {
      body = JSON.parse(responseText)
    } catch {
      body = { detail: responseText }
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(body, `Request failed (${response.status})`)
    )
  }

  return body
}

export { API_BASE_URL }
