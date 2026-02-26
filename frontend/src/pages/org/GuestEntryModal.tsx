import React, { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { fileService } from '../../services/api';
import toast from 'react-hot-toast';

interface Guest {
    id?: number;
    name: string;
    linkedinProfile: string;
    photo: string;
    role: string;
    about: string;
}

interface GuestEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (guest: Guest) => void;
    initialData?: Guest;
}

const GuestEntryModal: React.FC<GuestEntryModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [linkedinProfile, setLinkedinProfile] = useState(initialData?.linkedinProfile || '');
    const [photo, setPhoto] = useState(initialData?.photo || '');
    const [role, setRole] = useState(initialData?.role || '');
    const [about, setAbout] = useState(initialData?.about || '');
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            linkedinProfile,
            photo,
            role,
            about
        });
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setLinkedinProfile('');
        setPhoto('');
        setRole('');
        setAbout('');
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // fileService.upload returns the full URL string
            const url = await fileService.upload(file);
            setPhoto(url);
            toast.success('Photo uploaded!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card rounded-xl w-full max-w-md animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh] text-white">
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h3 className="text-xl font-bold text-white text-glow">Add Guest / Speaker</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Photo Upload Section */}
                        <div className="flex justify-center">
                            {photo ? (
                                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg shadow-purple-500/20">
                                    <img src={photo} alt="Guest" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setPhoto('')}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-white/50 hover:border-purple-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer relative bg-white/5">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <div className="animate-pulse text-xs">Uploading...</div>
                                    ) : (
                                        <>
                                            <Upload size={24} className="mb-1" />
                                            <span className="text-xs font-medium">Upload Photo</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full glass-input"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Role / Designation</label>
                            <input
                                type="text"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full glass-input"
                                placeholder="e.g. Chief Product Officer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn Profile</label>
                            <input
                                type="url"
                                value={linkedinProfile}
                                onChange={e => setLinkedinProfile(e.target.value)}
                                className="w-full glass-input"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Short Bio</label>
                            <textarea
                                value={about}
                                onChange={e => setAbout(e.target.value)}
                                rows={3}
                                className="w-full glass-input resize-none"
                                placeholder="Brief introduction..."
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-transparent pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-6 py-2 btn-glow text-white rounded-lg font-bold disabled:opacity-50"
                            >
                                Add Guest
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuestEntryModal;
