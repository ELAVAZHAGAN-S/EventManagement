import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"

const EventCoupons = () => {
  const { eventId } = useParams()
  const [coupons, setCoupons] = useState<any[]>([])
  useEffect(() => {
    loadCoupons()
  }, [])
  const loadCoupons = async () => {
    try {
      const res = await api.get(`/coupons/event/${eventId}`)
      setCoupons(res.data)
    } catch (err) {
      console.error("Failed to load coupons", err)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert("Coupon copied")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-200">
        Event Coupons
      </h1>

      <div className="grid gap-3">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="glass-card py-5 px-10 flex justify-between items-center"
          >
            <div>
              <p className="font-mono text-slate-200 text-lg">
                {coupon.code}
              </p>
              <p className="text-sm text-slate-400">
                {coupon.isUsed ? "Used" : "Available"}
              </p>
            </div>
            {!coupon.isUsed && (
              <button
                onClick={() => copyCode(coupon.code)}
                className="px-5 py-2 bg-amber-200 cursor-pointer text-black rounded-lg hover:bg-amber-100"
              >
                Copy
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventCoupons