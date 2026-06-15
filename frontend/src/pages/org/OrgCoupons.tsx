import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const OrgCoupons = () => {

  const [events, setEvents] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const res = await api.get("/events/my-events")
      const couponEvents = res.data.filter((e: any) => e.allowCoupon)
      setEvents(couponEvents)
    } catch (err) {
      console.error("Failed to load events", err)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-200">
        Events With Coupons
      </h1>

      {events.length === 0 && (
        <p className="text-slate-400">
          No events with coupons
        </p>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event.eventId}
            onClick={() => navigate(`/org/coupons/${event.eventId}`)}
            className="glass-card py-5 px-10 cursor-pointer hover:bg-white/10 transition"
          >
            <h2 className="text-lg font-semibold text-slate-200">
              {event.title}
            </h2>
            <p className="text-sm text-slate-400">
              Click to view coupons
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrgCoupons