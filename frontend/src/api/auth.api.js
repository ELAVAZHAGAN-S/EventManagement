import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
})

export const loginApi = ({ email, password, role }) => {
  return api.post("/auth/login", {
    email,
    password,
    role
  })
}

export const logoutApi = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("role")
  localStorage.removeItem("loginTime")
}
