import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orgService } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const CreateEditVenue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        capacity: 0,
        numberOfFloors: 1
    });

    useEffect(() => {
        if (isEditMode) {
            loadVenue();
        }
    }, [id]);

    const loadVenue = async () => {
        setLoading(true);
        try {
            const data = await orgService.getVenueDetails(id!);
            setFormData({
                name: data.name,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                capacity: data.capacity,
                numberOfFloors: data.numberOfFloors
            });
        } catch (error) {
            console.error('Failed to load venue', error);
            toast.error('Could not load venue details');
            navigate('/org/venues');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value } = target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                capacity: parseInt(formData.capacity.toString()),
                numberOfFloors: parseInt(formData.numberOfFloors.toString())
            };

            if (isEditMode) {
                await orgService.updateVenue(id!, payload);
                toast.success('Venue updated successfully');
            } else {
                await orgService.createVenue(payload);
                toast.success('Venue created successfully');
            }
            navigate('/org/venues');
        } catch (error: any) {
            console.error('Failed to save venue', error);
            toast.error(error.response?.data?.message || 'Failed to save venue');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/org/venues')}
                className="flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Venues
            </button>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <h1 className="text-xl font-bold text-slate-100">
                        {isEditMode ? 'Edit Venue' : 'Add New Venue'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Venue Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="glass-input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                className="glass-input w-full"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="glass-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    required
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="glass-input w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    required
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="glass-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    required
                                    min="1"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="glass-input w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Number of Floors</label>
                                <input
                                    type="number"
                                    name="numberOfFloors"
                                    required
                                    min="1"
                                    value={formData.numberOfFloors}
                                    onChange={handleChange}
                                    className="glass-input w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/org/venues')}
                            className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEditMode ? 'Update Venue' : 'Create Venue')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEditVenue;
