import React from "react"

export default function CarouselItem({
  bgColor,
  title,
  selectedRole,
  buttonText,
  image,
  isSignup
}) {
  return (
    <article className="item">
      <div className="left" style={{ backgroundColor: bgColor }}>
        <div className="form-container">
          <p className="title">{title}</p>

          <form className="form">
            {isSignup && (
              <input type="text" className="input" placeholder="Name" />
            )}

            <input type="email" className="input" placeholder="Email or username" />
            <input type="password" className="input" placeholder="Password" />

            <select className="input" defaultValue={selectedRole}>
              <option value="">Select role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="organiser">Organiser</option>
            </select>

            <button className="form-btn">{buttonText}</button>
          </form>

          <p className="sign-up-label">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <span className="sign-up-link">
              {isSignup ? "Log in" : "Create Account"}
            </span>
          </p>
        </div>
      </div>
      {selectedRole === "user" && <figure className="image" style={{top: "50%"}}>
        <img src={image} width="400" height="400" />
      </figure>}
      {selectedRole !== "user" && <figure className="image">
        <img src={image} width="400" height="400" />
      </figure>}
    </article>
  )
}
