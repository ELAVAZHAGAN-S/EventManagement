import api from "./axios"

export const loginApi = (data) => {
  return api.post("/auth/login", data)
}
