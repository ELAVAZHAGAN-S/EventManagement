import React from "react"

export default function DashboardCard({
  title,
  description,
  buttonText
}) {
  return (
    <div className="card">
      <div className="card-details">
        <p className="text-title">{title}</p>
        <p className="text-body">{description}</p>
      </div>
      <button className="card-button">{buttonText}</button>
    </div>
  )
}
