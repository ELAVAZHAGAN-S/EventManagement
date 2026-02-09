import { useNavigate } from "react-router-dom"
import { logout } from "../utils/logout"

export default function UserDashboard() {
  const navigate = useNavigate()

  return (
    <div className="cont user">
      <div className="nav">
        <h1>User Dashboard</h1>
        <a href="#" onClick={() => logout(navigate)}>
          Logout
        </a>
      </div>

      <div className="main">
        <h1>
          Welcome to <br />
          <span>User Dashboard</span>
        </h1>

        <p>
          Welcome back to your event management console. Here you can browse all upcoming events in your area,
          secure your spot at featured gatherings, and manage your active and past event tickets.
        </p>

        <div className="card-container">
          <div className="card">
            <div className="card-details">
              <p className="text-title">Browse Events</p>
              <p className="text-body">
                Explore all upcoming events with complete details like date, location, and category.
              </p>
            </div>
            <button className="card-button">View Events</button>
          </div>

          <div className="card">
            <div className="card-details">
              <p className="text-title">Book Tickets</p>
              <p className="text-body">
                Secure your spot instantly by booking tickets for your favorite events with ease.
              </p>
            </div>
            <button className="card-button">Book Now</button>
          </div>

          <div className="card">
            <div className="card-details">
              <p className="text-title">My Bookings</p>
              <p className="text-body">
                View and manage all your active and past event tickets from one place.
              </p>
            </div>
            <button className="card-button">View Tickets</button>
          </div>
        </div>
      </div>
    </div>
  )
}
