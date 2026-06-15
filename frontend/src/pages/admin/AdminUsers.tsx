import { useEffect, useState } from "react"
import {
    HiUser,
    HiTrash,
    HiMagnifyingGlass,
    HiFunnel,
    HiSparkles
} from "react-icons/hi2"

import { adminService } from "../../services/api"
import toast from "react-hot-toast"

export default function AdminUsers() {

    const [users, setUsers] = useState<any[]>([])
    const [filteredUsers, setFilteredUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        loadUsers()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [users, searchTerm, roleFilter, statusFilter])

    const loadUsers = async () => {
        try {
            const res = await adminService.getAllUsers()
            setUsers(res)
            setFilteredUsers(res)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load users")
        }
        finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {

        let data = [...users]

        if (roleFilter) {
            data = data.filter(u => u.role === roleFilter)
        }

        if (statusFilter) {
            data = data.filter(u => statusFilter === "ACTIVE" ? u.isActive : !u.isActive)
        }

        if (searchTerm) {
            data = data.filter(u =>
                u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredUsers(data)
    }

    const deleteUser = async (id: number) => {
        if (!confirm("Delete this user?")) return

        try {
            await adminService.deleteUser(id)
            toast.success("User deleted")
            loadUsers()
        } catch {
            toast.error("Failed to delete user")
        }
    }

    const toggleStatus = async (id: number) => {
        try {
            await adminService.toggleUserStatus(id)
            toast.success("User status updated")
            loadUsers()
        } catch {
            toast.error("Failed to update status")
        }
    }

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
        )
    }

    return (

        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <HiSparkles className="w-6 h-6 text-amber-200" />
                        User Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage platform users
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">

                    <div className="relative flex-1 md:w-64">
                        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="glass-input w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <select
                            className="glass-input pl-10 pr-8 appearance-none"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="ORGANIZATION">Organization</option>
                            <option value="USER">User</option>
                        </select>
                    </div>

                    <select
                        className="glass-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DISABLED">Disabled</option>
                    </select>

                </div>

            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 text-center border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">

                            {filteredUsers.map(user => (
                                <tr key={user.userId} className="hover:bg-white/5 transition-colors">

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300">
                                                <HiUser className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-100">
                                                    {user.fullName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    ID: {user.userId}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center text-slate-300">
                                        {user.email}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 text-xs rounded-lg border bg-violet-500/20 text-violet-300 border-violet-500/30">
                                            {user.role}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">

                                        <span className={`px-2 py-1 text-xs rounded-lg border ${user.isActive
                                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                                : "bg-red-500/20 text-red-300 border-red-500/30"
                                            }`}>

                                            {user.isActive ? "Active" : "Disabled"}

                                        </span>

                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            {user.role !== "ADMIN" && (
                                                <>

                                                    <button
                                                        onClick={() => toggleStatus(user.userId)}
                                                        className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30"
                                                    >
                                                        Toggle
                                                    </button>

                                                    <button
                                                        onClick={() => deleteUser(user.userId)}
                                                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <HiTrash className="w-5 h-5" />
                                                    </button>

                                                </>
                                            )}

                                            {user.role === "ADMIN" && (
                                                <span className="text-slate-500 text-sm">
                                                    Protected
                                                </span>
                                            )}

                                        </div>

                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                        <HiUser className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">
                            No users found
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}