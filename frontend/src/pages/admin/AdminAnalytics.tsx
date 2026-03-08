import { useEffect, useState } from "react"
import { adminService } from "../../services/api"
import {
    HiUserGroup,
    HiCalendar,
    HiChartBar,
    HiCurrencyDollar
} from "react-icons/hi2"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Tooltip,
    Legend,
    Filler
} from "chart.js"

import { Line, Pie, Bar } from "react-chartjs-2"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Tooltip,
    Legend,
    Filler
)

export default function AdminAnalytics() {

    const [analytics, setAnalytics] = useState<any>(null)
    const [topEvents, setTopEvents] = useState([])

    useEffect(() => {
        loadAnalytics()
        loadTopEvents()
    }, [])

    const loadTopEvents = async () => {
        try {
            const res = await adminService.getTopEvents()
            setTopEvents(res)
        } catch (e) {
            console.error(e)
        }
    }

    const loadAnalytics = async () => {
        try {
            const res = await adminService.getAnalytics()
            setAnalytics(res)
        } catch (e) {
            console.error(e)
        }
    }

    if (!analytics) return <div className="text-white">Loading...</div>

    const topEventsChart = {
        labels: topEvents.map((e: any) => e[0]),
        datasets: [
            {
                label: "Bookings",
                data: topEvents.map((e: any) => e[1]),
                backgroundColor: "rgba(139,92,246,0.8)",
                borderRadius: 6
            }
        ]
    }

    const hasPlatformData =
        analytics.totalUsers ||
        analytics.totalEvents ||
        analytics.totalBookings

    const hasEventData =
        analytics.activeEvents ||
        analytics.completedEvents

    const lineData = {
        labels: ["Users", "Events", "Bookings"],
        datasets: [
            {
                label: "Platform Growth",
                data: [
                    analytics?.totalUsers ?? 0,
                    analytics?.totalEvents ?? 0,
                    analytics?.totalBookings ?? 0
                ],
                borderColor: "#8b5cf6",
                backgroundColor: "rgba(139,92,246,0.2)",
                tension: 0.4,
                fill: true,
                pointRadius: 5
            }
        ]
    }

    const pieData = {
        labels: ["Active Events", "Completed Events"],
        datasets: [
            {
                data: [
                    analytics?.activeEvents ?? 0,
                    analytics?.completedEvents ?? 0
                ],
                backgroundColor: ["#8b5cf6", "#06b6d4"]
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#e2e8f0"
                }
            }
        },
        scales: {
            x: {
                ticks: { color: "#e2e8f0" },
                grid: { color: "rgba(255,255,255,0.1)" }
            },
            y: {
                ticks: { color: "#e2e8f0" },
                grid: { color: "rgba(255,255,255,0.1)" },
                beginAtZero: true
            }
        }
    }



    return (

        <div className="space-y-10">

            <h1 className="text-2xl font-bold text-white">
                Platform Analytics
            </h1>

            {/* KPI CARDS */}

            <div className="grid grid-cols-3 gap-6">

                <div className="glass p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm">Total Users</p>
                        <h2 className="text-2xl font-bold text-white">
                            {analytics.totalUsers}
                        </h2>
                    </div>
                    <HiUserGroup className="w-8 h-8 text-blue-400" />
                </div>

                <div className="glass p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm">Total Events</p>
                        <h2 className="text-2xl font-bold text-white">
                            {analytics.totalEvents}
                        </h2>
                    </div>
                    <HiCalendar className="w-8 h-8 text-violet-400" />
                </div>

                <div className="glass p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm">Organizations</p>
                        <h2 className="text-2xl font-bold text-white">
                            {analytics.totalOrgs}
                        </h2>
                    </div>
                    <HiChartBar className="w-8 h-8 text-cyan-400" />
                </div>

                <div className="glass p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm">Total Bookings</p>
                        <h2 className="text-2xl font-bold text-white">
                            {analytics.totalBookings}
                        </h2>
                    </div>
                    <HiChartBar className="w-8 h-8 text-green-400" />
                </div>

                <div className="glass p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm">Revenue</p>
                        <h2 className="text-2xl font-bold text-white">
                            ₹ {analytics.totalRevenue}
                        </h2>
                    </div>
                    <HiCurrencyDollar className="w-8 h-8 text-yellow-400" />
                </div>

                <div className="glass p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm">Active Events</p>
                        <h2 className="text-2xl font-bold text-white">
                            {analytics.activeEvents}
                        </h2>
                    </div>
                    <HiCalendar className="w-8 h-8 text-pink-400" />
                </div>

            </div>

            {/* LINE CHART */}

            <div className="grid grid-cols-2 gap-6">

                <div className="glass p-6 rounded-xl">
                    <h2 className="text-white font-semibold mb-4">
                        Platform Growth Overview
                    </h2>

                    <div className="h-[300px]">
                        {hasPlatformData ? (
                            <Line data={lineData} options={chartOptions} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">
                                No platform data yet
                            </div>
                        )}
                    </div>

                </div>

                <div className="glass p-6 rounded-xl">

                    <h2 className="text-white font-semibold mb-4">
                        Event Status Distribution
                    </h2>

                    <div className="h-[300px] flex items-center justify-center">
                        {hasEventData ? (
                            <Pie data={pieData} />
                        ) : (
                            <div className="text-slate-400">
                                No event statistics yet
                            </div>
                        )}
                    </div>

                </div>

            </div>
            <div className="glass p-6 rounded-xl">

                {topEvents.length > 0 ? (

                    <Bar
                        key={JSON.stringify(topEventsChart)}
                        data={topEventsChart}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                x: { ticks: { color: "#e2e8f0" } },
                                y: { ticks: { color: "#e2e8f0" }, beginAtZero: true }
                            }
                        }}
                    />

                ) : (

                    <div className="h-[350px] flex items-center justify-center text-slate-400">
                        No booking data yet
                    </div>

                )}
            </div>
        </div>

    )
}