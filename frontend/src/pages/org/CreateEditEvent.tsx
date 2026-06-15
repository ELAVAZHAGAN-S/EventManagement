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

type TicketTier = {
    name: string
    price: number
    capacity: number
    description: string
}

const CreateEditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    const [venues, setVenues] = useState<any[]>([])
    const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
        {
            name: "",
            price: 0,
            capacity: 0,
            description: ""
        }
    ])
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
            ticketType: 'PAID',
            ticketPrice: 0,
            allowCoupon: false,
            couponCount: 50,
            discountPercentage: 0,
            allowMembershipDiscount: false,

            // Others
            rulesAndGuidelines: '',
            rewardsAndPrizes: '',
            deliverablesRequired: '',
            judgingCriteria: '',
            customDetails: {},

            // Legacy/Unused or Defaulted
            ticketTiers: ticketTiers
        }
    });

    const addTicketTier = () => {
        setTicketTiers([
            ...ticketTiers,
            { name: "", price: 0, capacity: 0, description: "" }
        ])
    }

    const removeTicketTier = (index: number) => {
        const updated = [...ticketTiers]
        updated.splice(index, 1)
        setTicketTiers(updated)
    }

    const updateTicketTier = (
        index: number,
        field: keyof TicketTier,
        value: string | number
    ) => {
        const updated = [...ticketTiers]
        updated[index] = {
            ...updated[index],
            [field]: value
        }
        setTicketTiers(updated)
    }

    const { handleSubmit, reset, watch, setValue, register } = methods;
    const watchStatus = watch('status');
    const watchEventFormat = watch('eventFormat');
    const watchAllowCoupon = watch('allowCoupon');
    const watchGuests = watch('guests') || [];
    const watchVenueId = watch('venueId');
    const watchMeetingUrl = watch('meetingUrl');

    useEffect(() => {
        if (!watchAllowCoupon) {
            setValue("couponCount", 0)
            setValue("discountPercentage", 0)
        }
    }, [watchAllowCoupon])

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
        loadVenues();
    }, [id]);

    const loadVenues = async () => {
        try {
            const res = await orgService.getAllVenues()
            setVenues(res)
        } catch {
            toast.error("Failed to load venues")
        }
    }

    const loadEventData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await orgService.getEventDetails(id);
            if (data.ticketTiers) {
                setTicketTiers(data.ticketTiers)
            }

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
                startDate: formatDateForInput(data.startDate),
                endDate: formatDateForInput(data.endDate),
                registrationOpenDate: formatDateForInput(data.registrationOpenDate),
                registrationCloseDate: formatDateForInput(data.registrationCloseDate),
                resultsDate: formatDateForInput(data.resultsDate),
                ticketPrice: data.ticketPrice || 0,
                allowCoupon: data.allowCoupon || false,
                couponCount: data.couponCount || 50,
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
                couponCount: data.allowCoupon ? data.couponCount : 0,
                ticketTiers: ticketTiers
            };

            let createdEvent;

            if (isEditMode && id) {
            await orgService.updateEvent(id, payload);
            toast.success(data.status === 'ACTIVE' ? 'Event Launched Successfully!' : 'Event updated successfully');
            } else {
            createdEvent = await orgService.createEvent(payload);

            if (payload.venueId) {
                await orgService.bookVenue({
                    venueId: payload.venueId,
                    eventId: createdEvent.eventId,
                    bookingStartDate: payload.startDate,
                    bookingEndDate: payload.endDate
                });
            }

            toast.success('Event + Venue booked successfully!');
            }
            navigate('/org/events');
        } catch (error: any) {
            console.error('Failed to save event', error);

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
                <button onClick={() => navigate('/org/events')} className="flex items-center text-gray-400 hover:text-gray-700 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Events
                </button>

                <div className="glass-card overflow-hidden">
                    <div className="py-8 px-12 border-b border-white/10 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${watchStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-slate-300'}`}>
                            {watchStatus === 'ACTIVE' ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                    </div>

                    <form className="py-8 px-12 space-y-12">
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-amber-200 border-b border-white/20 pb-2">1. Banner Image</h3>
                            <BannerUpload />
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-amber-200 border-b border-white/20 pb-2">2. Event Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <CommonTextField name="title" label="Event Title" required placeholder="e.g. Annual Tech Summit 2025" />
                                </div>
                                <div className="md:col-span-1">
                                    <CommonTextField name="tagline" label="Tagline" placeholder="Short catchy phrase" />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-amber-200 mb-1">Event Type</label>
                                    <EventTypeSelector />
                                </div>
                                <div className="md:col-span-2">
                                    <CommonTextField name="description" placeholder="Enter event description" label="Description" type="textarea" required />
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-4xl border border-white/10">
                                <DynamicCategoryForm type={watch('eventType')} />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-amber-200 border-b border-white/20 pb-2">3. Guests / Speakers</h3>
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

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-amber-200 border-b border-white/20 pb-2">4. Audience & Outcomes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CommonTextField name="targetAudience" label="Target Audience" placeholder="e.g. Software Developers, Students" />
                                <CommonTextField name="eventGoals" label="What to expect? (Outcomes)" placeholder="e.g. Learn AI trends, Networking" />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-amber-200 border-b border-white/20 pb-2">5. Venue & Schedule</h3>

                            <div>
                                <label className="block text-sm font-medium text-amber-200 mb-2">Event Format</label>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                {(watchEventFormat === 'ONSITE' || watchEventFormat === 'HYBRID') && (
                                    <div className="p-4">
                                        <label className="block text-sm font-medium text-amber-200 mb-1">Select Booked Venue</label>
                                        <select {...register('venueId')} className="w-full px-4 py-2 glass-input appearance-none">
                                            <option value=""> Select Venue</option>
                                            {venues.map((v: any) => (
                                                <option key={v.venueId} value={v.venueId}>
                                                    {v.name} ({v.city})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {(watchEventFormat === 'REMOTE' || watchEventFormat === 'HYBRID') && (
                                    <div className="p-4">
                                        <CommonTextField name="meetingUrl" label="Webinar / Meeting URL" placeholder="https://zoom.us/..." />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CommonTextField name="registrationOpenDate" label="Reg. Open Date" type="datetime-local" />
                                <CommonTextField name="registrationCloseDate" label="Reg. Close Date" type="datetime-local" />
                                <CommonTextField name="startDate" label="Event Start Date & Time" type="datetime-local" />
                                <CommonTextField name="endDate" label="Event End Date & Time" type="datetime-local" />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-amber-200 border-b border-white/10 pb-2">6. Tickets & Pricing</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-full animate-in fade-in">
                                    <label className="block text-sm font-medium text-amber-200 mb-1">Ticket Price (₹)</label>
                                    <input
                                        type="number"
                                        {...register('ticketPrice')}
                                        className="glass-input w-full"
                                    />
                                </div>
                                <div className="w-full">
                                    <CommonTextField name="totalCapacity" placeholder="0" label="Total Seat Capacity" type="number" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-amber-200 border-b border-white/10 pb-2">
                                Ticket Types
                            </h3>

                            {ticketTiers.map((tier, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-white/5 border border-white/10 rounded-4xl space-y-4 animate-in fade-in"
                                >

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                        <div>
                                            <label className="block text-sm font-medium text-amber-200 mb-1">
                                                Ticket Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Early Bird"
                                                value={tier.name}
                                                onChange={(e) =>
                                                    updateTicketTier(index, "name", e.target.value)
                                                }
                                                className="glass-input w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-amber-200 mb-1">
                                                Price (₹)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={tier.price}
                                                onChange={(e) =>
                                                    updateTicketTier(index, "price", Number(e.target.value))
                                                }
                                                className="glass-input w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-amber-200 mb-1">
                                                Capacity
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Number of Tickets"
                                                value={tier.capacity}
                                                onChange={(e) =>
                                                    updateTicketTier(index, "capacity", Number(e.target.value))
                                                }
                                                className="glass-input w-full"
                                            />
                                        </div>

                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-200 mb-1">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Optional description"
                                            value={tier.description}
                                            onChange={(e) =>
                                                updateTicketTier(index, "description", e.target.value)
                                            }
                                            className="glass-input w-full"
                                        />
                                    </div>

                                    {ticketTiers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTicketTier(index)}
                                            className="pt-3 px-5 cursor-pointer text-red-400 hover:text-red-500 text-sm font-medium transition-colors"
                                        >
                                            Remove Ticket Type
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addTicketTier}
                                className="btn2 w-72! ">
                                <span className="spn2 flex items-center justify-center gap-4 text-center">
                                    <Plus size={16} />
                                    Add Ticket Type
                                </span>
                            </button>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-amber-200 border-b border-white/10 pb-2">7. Discounts & Coupons</h3>
                            <div className="flex flex-col items-center justify-center gap-6">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-3 py-4 px-6 border border-white/10 rounded-4xl hover:bg-white/5 cursor-pointer transition-colors">
                                        <input type="checkbox" {...register('allowCoupon')} className="w-5 h-5 text-amber-200 rounded" />
                                        <div>
                                            <span className="font-bold text-amber-200">Allow Coupon Code</span>
                                            <p className="text-xs text-slate-400">Enable promotional codes for ticket discounts</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 py-4 px-6 border border-white/10 rounded-4xl hover:bg-white/5 cursor-pointer transition-colors">
                                        <input type="checkbox" {...register('allowMembershipDiscount')} className="w-5 h-5 text-amber-200 rounded" />
                                        <div>
                                            <span className="font-bold text-amber-200">Membership Discount</span>
                                            <p className="text-xs text-slate-400">Apply automated discount for premium members (Set by Admin)</p>
                                        </div>
                                    </label>
                                </div>
                                {watchAllowCoupon && (
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pl-8 animate-in fade-in bg-white/5 p-6 rounded-4xl border border-white/10">
                                        <CommonTextField
                                            name="couponCount"
                                            label="Number of Coupons"
                                            type="number"
                                            placeholder="e.g. 50"
                                        />
                                        <CommonTextField
                                            name="discountPercentage"
                                            label="Discount Percentage (%)"
                                            type="number"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="flex justify-end gap-4 sticky bottom-0 pt-2 py-4 z-10">
                            <button type="button" onClick={() => navigate('/org/events')} className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors">
                                Cancel
                            </button>
                            <button type="button" onClick={handleSubmit((data) => onSubmit(data, 'PLANNED'), (errors) => {
                                const firstError = Object.values(errors)[0];
                                if (firstError) toast.error((firstError as any).message || 'Please fill in required fields');
                            })} className="px-6 py-2.5 rounded-lg text-slate-300 font-bold border border-white/20 hover:bg-amber-200 hover:text-black shadow-sm transition-all cursor-pointer">
                                Save Draft
                            </button>
                            {isLaunchAllowed() && (
                                <button type="button" onClick={handleSubmit((data) => onSubmit(data, 'ACTIVE'), (errors) => {
                                    const firstError = Object.values(errors)[0];
                                    if (firstError) toast.error((firstError as any).message || 'Please fill in required fields');
                                })} className="px-8 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all transform hover:scale-105 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
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
