import { useNavigate } from "react-router-dom"
import { logout } from "../utils/logout"

export default function OrganiserDashboard() {
  const navigate = useNavigate()

  return (
    <div className="cont organiser">
      <div className="nav">
        <h1>Organiser Dashboard</h1>
        <a href="#" onClick={() => logout(navigate)}>
          Logout
        </a>
      </div>

      <div className="main">
        <h1>
          Welcome to <br />
          <span>Organiser Dashboard</span>
        </h1>

        <p>
          Welcome back to your event management console. Here you can browse all upcoming events in your area,
          secure your spot at featured gatherings, and manage your active and past event tickets.
        </p>

        <div className="card-container">
          <div className="card">
            <div className="card-details">
              <p className="text-title">Active Events</p>
              <p className="text-body">
                Explore all active events with complete details like date, location, and category.
              </p>
            </div>
            <button className="card-button">View Events</button>
          </div>

          <div className="card">
            <div className="card-details">
              <p className="text-title">Total Tickets Sold</p>
              <p className="text-body">
                See all sold tickets details for all events with ease.
              </p>
            </div>
            <button className="card-button">See More</button>
          </div>

          <div className="card">
            <div className="card-details">
              <p className="text-title">Revenue</p>
              <p className="text-body">
                View and manage all your active and past event tickets from one place.
              </p>
            </div>
            <button className="card-button">View Detail</button>
          </div>
        </div>
      </div>
    </div>
  )
}
