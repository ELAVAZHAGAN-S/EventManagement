import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Carousel from "../components/Carousel"
import { loginApi } from "../api/auth.api"

export default function AuthPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const forms = document.querySelectorAll(".form")

    forms.forEach(form => {
      form.onsubmit = async e => {
        e.preventDefault()

        const title = form.parentElement.querySelector(".title").textContent.trim()
        const inputs = form.querySelectorAll("input")
        const roleSelect = form.querySelector("select")

        let valid = true
        inputs.forEach(i => i.value.trim() === "" && (valid = false))
        if (roleSelect && roleSelect.value === "") valid = false

        if (!valid) {
          alert("Please fill all fields")
          return
        }

        if (title === "Create account") {
          alert("Account created successfully")
          return
        }

        const email = form.querySelector('input[type="email"]').value
        const password = form.querySelector('input[type="password"]').value
        const role = roleSelect.value

        try {
          const res = await loginApi({ email, password, role })
          const data = res.data

          localStorage.setItem("token", data.token)
          localStorage.setItem("role", data.role)
          localStorage.setItem("loginTime", Date.now())

          if (data.role === "admin") navigate("/admin")
          if (data.role === "user") navigate("/user")
          if (data.role === "organiser") navigate("/organiser")

        } catch (err) {
          alert("Login failed")
        }
      }
    })
  }, [navigate])

  return (
    <main>
      <Carousel />
    </main>
  )
}
