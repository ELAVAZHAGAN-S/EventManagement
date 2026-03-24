import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Users, User, Share2, Search, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import PaymentLoader from '../../components/layout/Loader'
import { userService, bookingService } from '../../services/api';
import SeatSelectionModal from './SeatSelectionModal';

interface EnrollmentModalProps {
    event: any;
    ticketTypes: any[];
    onClose: () => void;
    onSuccess: () => void;
    initialGroupCode?: string;
}

const EnrollmentModal = ({ event, ticketTypes, onClose, onSuccess, initialGroupCode }: EnrollmentModalProps) => {
    const validTickets = ticketTypes?.filter(t => (t.price ?? 0) > 0) || [];
    const defaultTicket = validTickets.length ? (validTickets[0].ticketTypeId || validTickets[0].id) : null;
    const [razorpayLoading, setRazorpayLoading] = useState(false);
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            attendeeName: '',
            contactNumber: '',
            attendeeAge: '',
            companyName: '',
            jobTitle: '',
            dietaryRestrictions: '',
            accessibilityNeeds: '',
            bookingType: 'SOLO',
            groupCode: initialGroupCode || '',
            ticketTierId: defaultTicket,
            consent: false
        }
    });

    const [bookingType, setBookingType] = useState<'SOLO' | 'GROUP'>('SOLO');
    const [result, setResult] = useState<any>(null);
    const [showSeatModal, setShowSeatModal] = useState(false);
    const [bookedSeats, setBookedSeats] = useState<number[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
    const [couponCode, setCouponCode] = useState("")
    const [discount, setDiscount] = useState(0)
    const [couponValid, setCouponValid] = useState(false)

    // Profile & Group States
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [invitedMembers, setInvitedMembers] = useState<any[]>([]); // Array of User objects
    const [profileLoading, setProfileLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    // Bill & Promo States
    const [showBillSummary, setShowBillSummary] = useState(false);
    // We need to store valid data to use after payment
    const [pendingFormData, setPendingFormData] = useState<any>(null);

    // Fetch Profile on Mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const user = await userService.getProfile();
                setCurrentUser(user);

                // Auto-fill form
                setValue("attendeeName", user.fullName || '');
                setValue("contactNumber", user.phoneNumber || '');
                setValue("companyName", user.companyName || '');
                setValue("jobTitle", user.jobTitle || ''); // If added to profile later

                // Check for blocking
                if (bookingType === 'SOLO') {
                    if (!user.fullName || !user.phoneNumber) {
                        const missing = [];
                        if (!user.fullName) missing.push("Full Name");
                        if (!user.phoneNumber) missing.push("Contact Number");
                        toast.error(`Please complete your profile: Missing ${missing.join(', ')}`);
                        // Ideally redirect or show button to profile
                    }
                }
            } catch (e) {
                toast.error("Failed to load profile");
            } finally {
                setProfileLoading(false);
            }
        };
        loadProfile();
    }, [bookingType, setValue]);

    const handleUserSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            // Debounce ideally, but for now direct call
            const results = await userService.searchUsers(query);
            setSearchResults(results.filter((u: any) => u.userId !== currentUser?.userId && !invitedMembers.find(m => m.userId === u.userId)));
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }
    };

    const addMember = (user: any) => {
        setInvitedMembers([...invitedMembers, user]);
        setSearchResults([]);
        setSearchQuery('');
        toast.success(`${user.fullName || user.email} added to group`);
    };

    const removeMember = (userId: number) => {
        setInvitedMembers(invitedMembers.filter(m => m.userId !== userId));
    };

    const handleOpenSeatSelection = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        try {
            const seats = await bookingService.getBookedSeats(event.eventId);
            setBookedSeats(seats);
            setShowSeatModal(true);
        } catch (error) {
            toast.error("Failed to load seat availability");
        }
    };

    const onSubmit = async (data: any) => {

        if (validTickets.length > 0 && !data.ticketTierId) {
            toast.error("Please select a ticket type");
            return;
        }

        if (event.eventFormat === 'ONSITE' && !selectedSeat) {
            toast.error("Please select a seat first");
            return;
        }

        if (!showBillSummary) {
            setPendingFormData(data);
            setShowBillSummary(true);
            return;
        }

        await startRazorpayPayment(data);
    };

    const startRazorpayPayment = async (data: any) => {
        try {
            const ticket = validTickets.find(
                t => String(t.ticketTypeId || t.id) === String(data.ticketTierId)
            );

            const baseAmount = ticket ? ticket.price : (event.ticketPrice || 0)

            const amount = couponValid
                ? baseAmount - (baseAmount * discount) / 100
                : baseAmount

            const res = await fetch("http://localhost:8080/api/payment/create-order?amount=" + amount, {
                method: "POST"
            });

            const order = await res.json();

            const options = {
                key: "your_key_id",
                amount: order.amount,
                currency: "INR",
                name: "EventMate",
                description: "Event Booking",
                order_id: order.id,

                handler: async function (_response: any) {
                    setRazorpayLoading(true);

                    await processEnrollment(data);

                    setRazorpayLoading(false);
                    toast.success("Payment Successful & Booking Confirmed");
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            toast.error("Payment Failed");
        }
    };

    const validateCoupon = async () => {
        if (!couponCode) return

        try {
            const res = await fetch(
                `http://localhost:8080/api/coupons/validate?code=${couponCode}&eventId=${event.eventId}`
            )

            const data = await res.json()

            if (data.valid) {
                setDiscount(data.discount)
                setCouponValid(true)
                toast.success(`Coupon Applied (${data.discount}% OFF)`)
            } else {
                setDiscount(0)
                setCouponValid(false)
                toast.error("Invalid Coupon")
            }

        } catch {
            toast.error("Coupon validation failed")
        }
    }

    const processEnrollment = async (data: any) => {
        try {
            const payload = {
                eventId: event.eventId,
                ticketTypeId: data.ticketTierId ? Number(data.ticketTierId) : null,
                bookingType,
                attendeeAge: data.attendeeAge ? Number(data.attendeeAge) : 18,
                seatNumber: selectedSeat,
                invitedUsers: invitedMembers.map(m => m.email),
                couponCode: couponValid ? couponCode : null,
                attendeeName: data.attendeeName,
                contactNumber: data.contactNumber,
                dietaryRestrictions: data.dietaryRestrictions,
                companyName: data.companyName,
                jobTitle: data.jobTitle
            };

            console.log("Submitting enrollment payload:", payload);

            const res = await bookingService.enroll(payload);
            setResult(res);
            toast.success("Enrollment Successful!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Enrollment failed");
        }
    };

    if (razorpayLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/80">
                <PaymentLoader />
            </div>
        );
    }

    if (result) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="glass-card w-full max-w-md p-6 relative animate-fadeIn text-white">
                    <button onClick={onSuccess} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white text-glow">You're In!</h2>
                        <p className="text-slate-300">Your ticket has been confirmed and sent to your email.</p>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-400">Event</span>
                                <span className="font-medium text-white">{event.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-400">Ticket ID</span>
                                <span className="font-mono font-bold text-blue-400">{result.ticketCode}</span>
                            </div>
                        </div>

                        {bookingType === 'GROUP' && result.groupCode && (
                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                <p className="text-sm text-blue-300 font-medium mb-2">Invite Friends to your Group</p>
                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded border border-white/10">
                                    <code className="flex-1 text-sm font-mono text-slate-300">{result.groupCode}</code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`http://localhost:5173/events/${event.eventId}?group=${result.groupCode}`);
                                            toast.success("Invite link copied!");
                                        }}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                </div>
                                <p className="text-xs text-blue-400/80 mt-2">Share this code or link with friends!</p>
                            </div>
                        )}

                        <button onClick={onSuccess} className="w-full btn-glow text-white shadow-lg">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showSeatModal) {
        return (
            <SeatSelectionModal
                totalCapacity={event.totalCapacity}
                bookedSeats={bookedSeats}
                onClose={() => setShowSeatModal(false)}
                onConfirm={(seat) => {
                    setSelectedSeat(seat);
                    setShowSeatModal(false);
                    toast.success(`Seat ${seat} selected!`);
                }}
            />
        );
    }

    // Bill Summary UI
    if (showBillSummary) {
        const ticket = validTickets.find(
            t => String(t.ticketTypeId || t.id) === String(pendingFormData?.ticketTierId)
        );

        const basePrice = ticket ? ticket.price : (event.ticketPrice || 0)

        const finalPrice = couponValid
            ? basePrice - (basePrice * discount) / 100
            : basePrice

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="glass-card w-full max-w-md p-6 relative animate-fadeIn text-white">
                    <button onClick={() => setShowBillSummary(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                        <X size={24} />
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-6 text-glow">Payment Summary</h2>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-slate-300">
                            <span>Ticket ({ticket?.typeName || 'Standard'})</span>
                            <span>₹{finalPrice.toFixed(2)}</span>
                        </div>

                        <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-bold text-lg text-white">
                            <span>Total Payable</span>
                            <span>₹{finalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Promo Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter Coupon Code"
                                className="flex-1 glass-input uppercase"
                                disabled={!event.allowCoupon}
                            />

                            <button
                                type="button"
                                onClick={validateCoupon}
                                className="px-3 bg-blue-600 text-white rounded"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => startRazorpayPayment(pendingFormData)}
                        className="w-full btn-glow text-white shadow-lg"
                    >
                        Proceed to Payment
                    </button>

                    <button
                        onClick={() => setShowBillSummary(false)}
                        className="w-full mt-3 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto animate-fadeIn text-white">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400 mb-6 text-glow">Complete Registration</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Booking Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setBookingType('SOLO')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${bookingType === 'SOLO'
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <User size={24} />
                            <span className="font-bold">Solo</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBookingType('GROUP')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${bookingType === 'GROUP'
                                ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <Users size={24} />
                            <span className="font-bold">Group</span>
                        </button>
                    </div>

                    {/* Seat Selection Button or Display */}
                    {event.eventFormat === 'ONSITE' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Seat Assignment</label>
                            {!selectedSeat ? (
                                <button
                                    type="button" // Important: Prevent Submit
                                    onClick={handleOpenSeatSelection}
                                    className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                    Select Your Seat
                                </button>
                            ) : (
                                <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Selected Seat</p>
                                            <p className="text-lg font-bold text-gray-900">Seat {selectedSeat}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSeat(null)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ticket Type Selection */}
                    {validTickets.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Select Ticket</label>
                            <div className="grid grid-cols-1 gap-3">
                                {validTickets.map((t) => (
                                    <label key={t.ticketTypeId || t.id} className="relative flex items-center p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                        <input
                                            type="radio"
                                            value={t.ticketTypeId || t.id}
                                            {...register("ticketTierId", validTickets.length > 0 ? { required: "Please select a ticket" } : {})}
                                            className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-white/20 bg-white/10"
                                        />
                                        <div className="ml-3 flex flex-1 justify-between items-center">
                                            <div>
                                                <span className="block text-sm font-medium text-white">{t.typeName || t.name}</span>
                                                {t.description && <span className="block text-xs text-slate-400">{t.description}</span>}
                                            </div>
                                            <span className="block text-sm font-bold text-blue-300">
                                                ₹{t.price.toLocaleString()}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.ticketTierId && <p className="text-xs text-red-400 mt-1">{String(errors.ticketTierId.message)}</p>}
                        </div>
                    )}

                    {bookingType === 'GROUP' && !initialGroupCode && (
                        <div className="glass-card bg-blue-500/10 border-blue-500/20 p-4 rounded-xl text-sm text-blue-200 shadow-lg shadow-blue-500/10">
                            You are creating a new group. You'll get an invite link after registration to share with friends.
                        </div>
                    )}

                    {initialGroupCode && (
                        <div className="glass-card bg-green-500/10 border-green-500/20 p-4 rounded-xl text-sm text-green-300 font-medium flex items-center gap-2 shadow-lg shadow-green-500/10">
                            <Users size={16} />
                            Joining Group: {initialGroupCode}
                        </div>
                    )}

                    {/* Dynamic Sections Based on Booking Type */}
                    {bookingType === 'SOLO' && (
                        profileLoading ? (
                            <div className="p-8 flex justify-center text-blue-400">
                                <Loader className="animate-spin" size={24} />
                            </div>
                        ) : currentUser && (
                            <div className="glass-card bg-white/5 border-white/10 p-4 rounded-xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-linear-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                        {currentUser.fullName ? currentUser.fullName.charAt(0) : <User size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-white">{currentUser.fullName || <span className="text-red-400 italic">Name Missing</span>}</p>
                                        <p className="text-sm text-slate-400">{currentUser.email}</p>
                                        <p className="text-xs text-slate-500">{currentUser.phoneNumber || <span className="text-red-400 italic">No Contact</span>}</p>
                                    </div>
                                    {(!currentUser.fullName || !currentUser.phoneNumber) && (
                                        <button type="button" onClick={() => window.location.href = '/profile'} className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full font-bold hover:bg-red-500/30 border border-red-500/30">
                                            Update Profile
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Age (Optional)</label>
                                        <input type="number" {...register("attendeeAge")} className="w-full glass-input" placeholder="Age (Optional)" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Dietary (Optional)</label>
                                        <input {...register("dietaryRestrictions")} className="w-full glass-input" placeholder="None" />
                                    </div>
                                </div>

                                {(!currentUser.fullName || !currentUser.phoneNumber) ? (
                                    <div className="text-xs text-red-400 flex items-center gap-1 mt-2">
                                        <AlertCircle size={12} /> Profile update required to proceed.
                                    </div>
                                ) : (
                                    <div className="text-xs text-green-400 flex items-center gap-1 mt-2">
                                        <CheckCircle size={12} /> Profile Verified
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {bookingType === 'GROUP' && (
                        <div className="space-y-4">
                            {/* Organizer Card */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-70">
                                <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded text-gray-600">Organizer</span>
                                <span className="text-sm font-medium">{currentUser?.fullName} (You)</span>
                            </div>

                            {/* Member Search */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Add Group Members</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleUserSearch(e.target.value)}
                                            className="w-full pl-10 pr-10 glass-input"
                                            placeholder="Search by username or email..."
                                        />
                                        {searching && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <Loader className="h-4 w-4 text-blue-400 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {searchResults.map(user => (
                                            <button
                                                key={user.userId}
                                                type="button"
                                                onClick={() => addMember(user)}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                        {user.fullName ? user.fullName.charAt(0) : '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user.fullName || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Add +</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Added Members List */}
                            {invitedMembers.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400">Invited Members ({invitedMembers.length})</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {invitedMembers.map(member => (
                                            <div key={member.userId} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 text-xs font-bold border border-blue-500/30">
                                                        {member.fullName ? member.fullName.charAt(0) : '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{member.fullName}</p>
                                                        <p className="text-xs text-slate-400">{member.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(member.userId)}
                                                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Your Age</label>
                                    <input type="number" {...register("attendeeAge")} className="w-full px-3 py-1.5 text-sm border rounded-lg glass-input" placeholder="Age" />
                                </div>
                            </div>

                            <p className="text-xs text-center text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                                Invitation emails will be sent to all added members. You will pay for the total tickets.
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                        <input
                            type="checkbox"
                            id="consent"
                            {...register("consent", { required: "You must agree to the terms" })}
                            className="mt-1 w-4 h-4 text-purple-500 rounded border-white/20 bg-white/10 focus:ring-purple-500 focus:ring-offset-0"
                        />
                        <label htmlFor="consent" className="text-sm text-slate-300 leading-relaxed cursor-pointer">
                            I agree to the <span className="text-blue-400 hover:text-blue-300 hover:underline">Terms of Service</span> and <span className="text-blue-400 hover:text-blue-300 hover:underline">Privacy Policy</span>. I consent to receive event communications.
                        </label>
                    </div>
                    {errors.consent && <p className="text-xs text-red-500 mt-1">{String(errors.consent.message)}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-glow text-white shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnrollmentModal;