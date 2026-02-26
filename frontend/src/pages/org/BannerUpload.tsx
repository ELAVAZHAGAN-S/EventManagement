import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const BannerUpload = () => {
    const { register, setValue, watch } = useFormContext();
    const bannerImageId = watch('bannerImageId');
    const [uploading, setUploading] = useState(false);

    // Helper to get full URL from ID
    const getImageUrl = (id: string) => {
        if (!id) return '';
        if (id.startsWith('http')) return id;
        return `${API_BASE_URL}/files/${id}`;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Direct call if service wrapper not ready
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Extract ID from URL response or raw ID
            // The controller returns full URL: "${API_BASE_URL}/files/{id}"
            const fullUrl = res.data;
            const id = fullUrl.split('/').pop();

            setValue('bannerImageId', id);
            toast.success('Banner uploaded!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload banner');
        } finally {
            setUploading(false);
        }
    };

    const removeBanner = () => {
        setValue('bannerImageId', '');
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Event Banner</label>

            {bannerImageId ? (
                <div className="relative w-full h-48 bg-white/5 rounded-xl overflow-hidden border border-white/10 group">
                    <img
                        src={getImageUrl(bannerImageId)}
                        alt="Event Banner"
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={removeBanner}
                        className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-red-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    {uploading ? (
                        <div className="animate-pulse text-purple-400">Uploading...</div>
                    ) : (
                        <>
                            <Upload size={24} className="mb-2 text-purple-400" />
                            <span className="text-sm text-slate-400">Click to upload banner image</span>
                        </>
                    )}
                </div>
            )}
            <input type="hidden" {...register('bannerImageId')} />
        </div>
    );
};

export default BannerUpload;
