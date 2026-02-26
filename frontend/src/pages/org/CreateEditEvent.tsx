import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orgService } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, User } from 'lucide-react';
import { DynamicCategoryForm } from './EventCategoryForms';
import BannerUpload from './BannerUpload';
import { EventTypeSelector, CommonTextField } from './EventFormComponents';
import { useForm, FormProvider } from 'react-hook-form';
import GuestEntryModal from './GuestEntryModal';

const CreateEditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    const [bookedVenues, setBookedVenues] = useState<any[]>([]);

    // Guest Modal State
    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

    const methods = useForm({
        defaultValues: {
            title: '',
            tagline: '',
            description: '',
            eventType: 'WEBINAR',
            eventFormat: 'ONSITE',
            status: 'PLANNED',
            bannerImageId: '',

            // Guests
            guests: [],

            // Logistics
            startDate: '',
            endDate: '',
            registrationOpenDate: '',
            registrationCloseDate: '',
            resultsDate: '',
            totalCapacity: '',

            // Audience & Goals
            targetAudience: '',
            eventGoals: '',

            // Site
            venueId: '',
            meetingUrl: '',

            // Tickets & Discounts
            ticketType: 'FREE',
            ticketPrice: 0,
            allowCoupon: false,
            couponCode: '',
            discountPercentage: 0,
            allowMembershipDiscount: false,

            // Others
            rulesAndGuidelines: '',
            rewardsAndPrizes: '',
            deliverablesRequired: '',
            judgingCriteria: '',
            customDetails: {},

            // Legacy/Unused or Defaulted
            ticketTiers: []
        }
    });

    const { handleSubmit, reset, watch, setValue, register } = methods;
    const watchStatus = watch('status');
    const watchEventFormat = watch('eventFormat');
    const watchTicketType = watch('ticketType');
    const watchAllowCoupon = watch('allowCoupon');
    const watchGuests = watch('guests') || [];
    const watchVenueId = watch('venueId');
    const watchMeetingUrl = watch('meetingUrl');

    // Determine if Launch is allowed
    const isLaunchAllowed = () => {
        if ((watchEventFormat === 'ONSITE' || watchEventFormat === 'HYBRID') && !watchVenueId) {
            return false;
        }
        if ((watchEventFormat === 'REMOTE' || watchEventFormat === 'HYBRID') && !watchMeetingUrl) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (isEditMode) {
            loadEventData();
        }
        loadBookedVenues();
    }, [id]);

    const loadBookedVenues = async () => {
        try {
            const bookings = await orgService.getMyVenueBookings();
            const uniqueVenues = bookings.reduce((acc: any[], booking: any) => {
                if (!acc.find((v: any) => v.venueId === booking.venueId)) {
                    acc.push(booking);
                }
                return acc;
            }, []);
            setBookedVenues(uniqueVenues);
        } catch (error) {
            console.error('Failed to load booked venues', error);
        }
    };

    const loadEventData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await orgService.getEventDetails(id);

            // Helper to format ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
            const formatDateForInput = (dateString: string | null | undefined) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                // Get local date-time string
                const offset = date.getTimezoneOffset();
                const localDate = new Date(date.getTime() - offset * 60 * 1000);
                return localDate.toISOString().slice(0, 16);
            };

            reset({
                ...data,
                venueId: data.venue?.venueId ? data.venue.venueId.toString() : (data.venueId ? data.venueId.toString() : ''),
                customDetails: data.customDetails || {},
                guests: data.guests || [],
                // Format dates for datetime-local input
                startDate: formatDateForInput(data.startDate),
                endDate: formatDateForInput(data.endDate),
                registrationOpenDate: formatDateForInput(data.registrationOpenDate),
                registrationCloseDate: formatDateForInput(data.registrationCloseDate),
                resultsDate: formatDateForInput(data.resultsDate),
                // Ensure defaults for new fields if they don't exist in old data
                ticketPrice: data.ticketPrice || 0,
                allowCoupon: data.allowCoupon || false,
                couponCode: data.couponCode || '',
                discountPercentage: data.discountPercentage || 0,
                allowMembershipDiscount: data.allowMembershipDiscount || false
            });
        } catch (error) {
            console.error('Failed to load event details', error);
            toast.error('Could not load event details');
            navigate('/org/events');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGuest = (guest: any) => {
        setValue('guests', [...watchGuests, guest] as any);
    };

    const handleRemoveGuest = (index: number) => {
        const updated = [...watchGuests];
        updated.splice(index, 1);
        setValue('guests', updated);
    };

    const onSubmit = async (data: any, eventStatus: string) => {
        setLoading(true);
        data.status = eventStatus;

        try {
            if (data.status === 'ACTIVE') {
                if ((data.eventFormat === 'ONSITE' || data.eventFormat === 'HYBRID') && !data.venueId) {
                    toast.error('To Launch: Please link a Booked Venue for Onsite/Hybrid events');
                    setLoading(false);
                    return;
                }
                if ((data.eventFormat === 'REMOTE' || data.eventFormat === 'HYBRID') && !data.meetingUrl) {
                    toast.error('To Launch: Please provide a meeting URL for Remote/Hybrid events');
                    setLoading(false);
                    return;
                }
            }

            const payload = {
                ...data,
                status: eventStatus,
                venueId: data.venueId ? parseInt(data.venueId) : null,
                totalCapacity: data.totalCapacity ? parseInt(data.totalCapacity.toString()) : null,
                ticketPrice: data.ticketType === 'PAID' ? parseFloat(data.ticketPrice) : 0,
                discountPercentage: data.allowCoupon ? parseFloat(data.discountPercentage) : 0,
            };

            if (isEditMode && id) {
                await orgService.updateEvent(id, payload);
                toast.success(data.status === 'ACTIVE' ? 'Event Launched Successfully!' : 'Event updated successfully');
            } else {
                await orgService.createEvent(payload);
                toast.success('Event Draft Created!');
            }
            navigate('/org/events');
        } catch (error: any) {
            console.error('Failed to save event', error);

            // Handle backend validation errors with detailed messages
            if (error.response?.data?.details) {
                const details = error.response.data.details;
                if (typeof details === 'object') {
                    // Show each field error
                    Object.entries(details).forEach(([field, message]) => {
                        toast.error(`${field}: ${message}`);
                    });
                } else {
                    toast.error(String(details));
                }
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to save event. Please check all fields.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <div className="p-8 text-center text-lg font-medium text-gray-500">Loading details...</div>;
    }

    return (
        <FormProvider {...methods}>
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <button onClick={() => navigate('/org/events')} className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Events
                </button>

                <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-slate-100">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${watchStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-slate-300'}`}>
                            {watchStatus === 'ACTIVE' ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                    </div>

                    <form className="p-8 space-y-12">

                        {/* 1. Banner */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-100 border-b border-white/10 pb-2">1. Banner Image</h3>
                            <BannerUpload />
                        </section>

                        {/* 2. Basic Info + Description */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-100 border-b border-white/10 pb-2">2. Event Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <CommonTextField name="title" label="Event Title" required placeholder="e.g. Annual Tech Summit 2025" />
                                </div>
                                <div className="md:col-span-1">
                                    <CommonTextField name="tagline" label="Tagline" placeholder="Short catchy phrase" />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Event Type</label>
                                    <EventTypeSelector />
                                </div>
                                <div className="md:col-span-2">
                                    <CommonTextField name="description" label="Description" type="textarea" required />
                                </div>
                            </div>

                            {/* Dynamic Fields based on Type */}
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <DynamicCategoryForm type={watch('eventType')} />
                            </div>
                        </section>

                        {/* 3. Guests */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-100 border-b border-white/10 pb-2">3. Guests / Speakers</h3>
                            <div className="flex flex-wrap gap-4 items-center">
                                {watchGuests.map((guest: any, idx: number) => (
                                    <div key={idx} className="relative group">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                                            {guest.photo ? (
                                                <img src={guest.photo} alt={guest.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                    <User size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGuest(idx)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                            {guest.name}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setIsGuestModalOpen(true)}
                                    className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>

                        </section>

                        {/* 4. Target & Outcomes */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-100 border-b border-white/10 pb-2">4. Audience & Outcomes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CommonTextField name="targetAudience" label="Target Audience" placeholder="e.g. Software Developers, Students" />
                                <CommonTextField name="eventGoals" label="What to expect? (Outcomes)" placeholder="e.g. Learn AI trends, Networking" />
                            </div>
                        </section>

                        {/* 5. Site & Logistics */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-100 border-b border-white/10 pb-2">5. Venue & Schedule</h3>

                            {/* Format Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Event Format</label>
                                <div className="flex gap-4">
                                    {['ONSITE', 'HYBRID', 'REMOTE'].map(fmt => (
                                        <label key={fmt} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors
                                            ${watchEventFormat === fmt ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'}`}>
                                            <input type="radio" value={fmt} {...register('eventFormat')} className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium">{fmt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Conditional Venue/Link */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                {(watchEventFormat === 'ONSITE' || watchEventFormat === 'HYBRID') && (
                                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                        <label className="block text-sm font-medium text-orange-300 mb-1">Select Booked Venue</label>
                                        <select {...register('venueId')} className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 bg-[#0f172a] text-slate-200">
                                            <option value="">-- Select from your bookings --</option>
                                            {bookedVenues.map((booking: any) => (
                                                <option key={booking.venueId} value={booking.venueId}>
                                                    {booking.venueName} (Booked: {new Date(booking.bookingDate).toLocaleDateString()})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {(watchEventFormat === 'REMOTE' || watchEventFormat === 'HYBRID') && (
                                    <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                                        <CommonTextField name="meetingUrl" label="Webinar / Meeting URL" placeholder="https://zoom.us/..." />
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CommonTextField name="startDate" label="Start Date & Time" type="datetime-local" />
                                <CommonTextField name="endDate" label="End Date & Time" type="datetime-local" />
                                <CommonTextField name="registrationOpenDate" label="Reg. Open Date" type="datetime-local" />
                                <CommonTextField name="registrationCloseDate" label="Reg. Close Date" type="datetime-local" />
                            </div>
                        </section>

                        {/* 6. Tickets & Pricing */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-100 border-b border-white/10 pb-2">6. Tickets & Pricing</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Ticket Type</label>
                                    <div className="flex gap-4">
                                        {['FREE', 'PAID'].map(type => (
                                            <label key={type} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors
                                                ${watchTicketType === type ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'}`}>
                                                <input type="radio" value={type} {...register('ticketType')} className="w-4 h-4 text-green-600" />
                                                <span className="font-medium">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {watchTicketType === 'PAID' && (
                                    <div className="w-full md:w-1/3 animate-in fade-in">
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Ticket Price (₹)</label>
                                        <input
                                            type="number"
                                            {...register('ticketPrice')}
                                            className="glass-input w-full"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pt-4">
                                    <CommonTextField name="totalCapacity" label="Total Seat Capacity" type="number" />
                                </div>
                            </div>
                        </section>

                        {/* 7. Discounts */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-100 border-b border-white/10 pb-2">7. Discounts & Coupons</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-4 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                    <input type="checkbox" {...register('allowCoupon')} className="w-5 h-5 text-blue-600 rounded" />
                                    <div>
                                        <span className="font-bold text-slate-200">Allow Coupon Code</span>
                                        <p className="text-xs text-slate-400">Enable promotional codes for ticket discounts</p>
                                    </div>
                                </label>

                                {watchAllowCoupon && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8 animate-in fade-in">
                                        <CommonTextField name="couponCode" label="Coupon Code" placeholder="e.g. EARLYBIRD25" />
                                        <CommonTextField name="discountPercentage" label="Discount Percentage (%)" type="number" />
                                    </div>
                                )}

                                <label className="flex items-center gap-3 p-4 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                    <input type="checkbox" {...register('allowMembershipDiscount')} className="w-5 h-5 text-blue-600 rounded" />
                                    <div>
                                        <span className="font-bold text-slate-200">Membership Discount</span>
                                        <p className="text-xs text-slate-400">Apply automated discount for premium members (Set by Admin)</p>
                                    </div>
                                </label>
                            </div>
                        </section>

                        {/* Footer Actions */}
                        <div className="pt-8 border-t border-white/10 flex justify-end gap-4 sticky bottom-0 bg-[#0f172a]/95 backdrop-blur py-4 z-10">
                            <button type="button" onClick={() => navigate('/org/events')} className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors">
                                Cancel
                            </button>
                            <button type="button" onClick={handleSubmit((data) => onSubmit(data, 'PLANNED'), (errors) => {
                                const firstError = Object.values(errors)[0];
                                if (firstError) toast.error((firstError as any).message || 'Please fill in required fields');
                            })} className="px-6 py-2.5 rounded-lg text-slate-300 font-bold border border-white/20 hover:bg-white/10 shadow-sm transition-all">
                                Save Draft
                            </button>
                            {isLaunchAllowed() && (
                                <button type="button" onClick={handleSubmit((data) => onSubmit(data, 'ACTIVE'), (errors) => {
                                    const firstError = Object.values(errors)[0];
                                    if (firstError) toast.error((firstError as any).message || 'Please fill in required fields');
                                })} className="px-8 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                    {isEditMode && watchStatus === 'ACTIVE' ? 'Update & Publish' : 'Launch Event'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                <GuestEntryModal
                    isOpen={isGuestModalOpen}
                    onClose={() => setIsGuestModalOpen(false)}
                    onSave={handleAddGuest}
                />
            </div>
        </FormProvider>
    );
};

export default CreateEditEvent;
