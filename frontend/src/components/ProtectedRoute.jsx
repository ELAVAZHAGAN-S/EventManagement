import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token")
  const userRole = localStorage.getItem("role")
  const loginTime = localStorage.getItem("loginTime")

  if (!token || !loginTime) {
    return <Navigate to="/" replace />
  }

  const SESSION_TIME = 30 * 60 * 1000
  const now = Date.now()
  const expired = now - Number(loginTime) > SESSION_TIME

  if (expired) {
    localStorage.clear()
    return <Navigate to="/" replace />
  }

  if (role && role !== userRole) {
    return <Navigate to="/" replace />
  }

  return children
}
