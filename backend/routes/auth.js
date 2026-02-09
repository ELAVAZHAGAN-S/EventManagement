const express = require("express")
const jwt = require("jsonwebtoken")

const router = express.Router()

const users = [
  { id: 1, email: "user@test.com", password: "user123", role: "user" },
  { id: 2, email: "admin@test.com", password: "admin123", role: "admin" },
  { id: 3, email: "organiser@test.com", password: "organiser123", role: "organiser" }
]

router.post("/login", (req, res) => {
  const { email, password, role } = req.body

  const user = users.find(
    u => u.email === email && u.password === password && u.role === role
  )

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    "SECRET_KEY",
    { expiresIn: "1h" }
  )

  res.json({
    token,
    role: user.role
  })
})

module.exports = router
