import { useNavigate } from "react-router-dom"
import { logout } from "../utils/logout"

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="cont">
      <div className="nav">
        <h1>Admin Dashboard</h1>
        <a href="#" onClick={() => logout(navigate)}>
          Logout
        </a>
      </div>

      <div className="main">
        <h1>
          Welcome to <br />
          <span>Admin Dashboard</span>
        </h1>

        <p>
          Welcome back to your event management console. Here you can add and manage all of your events, and manage your active and past event earnings.
        </p>

        <div className="card-container">
          <div className="card">
            <div className="card-details">
              <p className="text-title">Manage Users</p>
              <p className="text-body">
                View and manage all your active and past event Users.
              </p>
            </div>
            <button className="card-button">View Users</button>
          </div>

          <div className="card">
            <div className="card-details">
              <p className="text-title">Manage Events</p>
              <p className="text-body">
                Explore all your events with complete details like date, location, and category.
              </p>
            </div>
            <button className="card-button">View Events</button>
          </div>

          <div className="card">
            <div className="card-details">
              <p className="text-title">Reports</p>
              <p className="text-body">
                View and manage all your active and past event reports.
              </p>
            </div>
            <button className="card-button">View Report</button>
          </div>
        </div>
      </div>
    </div>
  )
}
