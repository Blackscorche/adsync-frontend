export const logout = () => {
  // Clear localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Clear cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

  // Redirect to login
  window.location.href = '/login'
}

export const getUser = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const isAuthenticated = () => {
  return !!getToken()
}