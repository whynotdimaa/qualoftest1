import { Navigate } from 'react-router-dom'

export const isAuthenticated = () => {
  const token = localStorage.getItem('access')
  if (!token) return false
  
  try {
    // Decode JWT token to check expiration
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const payload = JSON.parse(atob(parts[1]))
    const expiration = payload.exp * 1000 // Convert to milliseconds
    
    // Check if token is expired (with 10s buffer)
    return Date.now() < expiration - 10000
  } catch {
    return false
  }
}

export const PrivateRoute = ({ children }) => {
  const isAuth = isAuthenticated()
  return isAuth ? children : <Navigate to="/login" />
}