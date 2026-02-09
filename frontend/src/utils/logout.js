export const logout = (navigate) => {
  localStorage.clear()
  navigate("/")
}
