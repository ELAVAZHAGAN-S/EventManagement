import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../../services/api';
import type { User } from '../../types/auth';
import { HiPencil, HiCheck, HiXMark, HiCamera } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import ImageUploadModal from '../ui/ImageUploadModal';
import { getImageUrl } from '../../config';

// mocked for now if not in types yet
interface SocialLink {
    linkId?: number;
    platformName: string;
    url: string;
}

interface ExtendedUser extends User {
    phoneNumber?: string;
    bio?: string;
    companyName?: string;
    website?: string;
    areaOfInterest?: string;
    profilePicture?: string;
    socialLinks?: SocialLink[];
}

const ProfileSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState<ExtendedUser | null>(null);

    // Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState<'PROFILE' | 'BANNER'>('PROFILE');

    useEffect(() => {
        loadProfile();
    }, [navigate]);

    const loadProfile = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        try {
            // Fetch clean extended profile
            const profile = await userService.getProfile();
            setUser(profile);
            setFormData(profile);
        } catch (error) {
            console.error('Failed to parse user data or fetch profile', error);
            // Fallback to stored user if fetch fails (e.g. backend down)
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                setFormData(parsed);
            } catch (e) {
                authService.logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
    };

    const handleSave = async () => {
        if (!formData) return;

        const payload = {
            name: formData.fullName,
            phoneNumber: formData.phoneNumber,
            bio: formData.bio,
            website: formData.website,
            areaOfInterest: formData.areaOfInterest,
            profilePicture: formData.profilePicture,
            socialLinks: formData.socialLinks
        };

        try {
            const updated = await userService.updateProfile(payload);
            setUser(updated);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save profile.");
        }
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialLinkChange = (index: number, field: string, value: string) => {
        if (!formData) return;
        const newLinks = [...(formData.socialLinks || [])];
        if (!newLinks[index]) newLinks[index] = { platformName: '', url: '' };
        (newLinks[index] as any)[field] = value;
        setFormData({ ...formData, socialLinks: newLinks });
    };

    const addSocialLink = () => {
        if (!formData) return;
        setFormData({ ...formData, socialLinks: [...(formData.socialLinks || []), { platformName: 'LinkedIn', url: '' }] });
    };

    const removeSocialLink = (index: number) => {
        if (!formData) return;
        const newLinks = [...(formData.socialLinks || [])];
        newLinks.splice(index, 1);
        setFormData({ ...formData, socialLinks: newLinks });
    };

    const triggerUpload = (type: 'PROFILE' | 'BANNER') => {
        if (!isEditing) return;
        setUploadType(type);
        setShowUploadModal(true);
    };

    const onUploadSuccess = (url: string) => {
        if (!formData) return;
        setFormData(prev => prev ? ({ ...prev, profilePicture: url }) : null);
        setShowUploadModal(false);
    };

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
    }

    const isOrg = user.role === 'ORGANIZATION';

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">My Profile</h1>
                    <p className="text-slate-400 mt-1">Manage your personal information and preferences.</p>
                </div>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 transition"
                            >
                                <HiXMark className="w-5 h-5" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-glow flex items-center gap-2 px-4 py-2"
                            >
                                <HiCheck className="w-5 h-5" /> Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 text-slate-300 rounded-lg hover:bg-white/10 transition"
                        >
                            <HiPencil className="w-5 h-5" /> Edit Profile
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Main Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-violet-600 to-blue-600"></div>

                        {/* Profile Picture (Pointer / Circular) */}
                        <div className="relative mt-8 mb-4 group">
                            <div className="w-32 h-32 rounded-full border-4 border-violet-500/30 shadow-lg overflow-hidden bg-slate-800 flex items-center justify-center relative z-10">
                                {formData?.profilePicture ? (
                                    <img src={getImageUrl(formData.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-violet-400 font-bold">{formData?.fullName?.charAt(0)}</span>
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => triggerUpload('PROFILE')}
                                    className="absolute bottom-0 right-0 z-20 bg-violet-600 p-2 rounded-full shadow-lg text-white hover:bg-violet-500 transition-transform active:scale-95"
                                >
                                    <HiCamera className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-100">{isOrg ? formData?.fullName : formData?.fullName}</h2>
                        <p className="text-sm text-slate-400 mb-6">{user.email}</p>

                        {/* Status Label (instead of Role) */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                            Active Account
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-200">Social Presence</h3>
                            {isEditing && (
                                <button onClick={addSocialLink} className="text-sm text-violet-400 hover:text-violet-300">+ Add</button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {formData?.socialLinks?.map((link, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    {isEditing ? (
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                placeholder="Platform"
                                                value={link.platformName ?? ""}
                                                onChange={e => handleSocialLinkChange(idx, 'platformName', e.target.value)}
                                                className="glass-input w-1/3 text-xs p-2"
                                            />
                                            <input
                                                placeholder="URL"
                                                value={link.url ?? ""}
                                                onChange={e => handleSocialLinkChange(idx, 'url', e.target.value)}
                                                className="glass-input w-2/3 text-xs p-2"
                                            />
                                            <button onClick={() => removeSocialLink(idx)} className="text-red-400 hover:text-red-300">x</button>
                                        </div>
                                    ) : (
                                        <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-lg transition">
                                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                                                {link.platformName.substring(0, 2)}
                                            </div>
                                            <span className="text-sm text-slate-300 font-medium">{link.platformName}</span>
                                        </a>
                                    )}
                                </div>
                            ))}
                            {(!formData?.socialLinks || formData.socialLinks.length === 0) && !isEditing && (
                                <p className="text-xs text-slate-500 italic text-center">No social links added.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Form */}
                <div className="lg:col-span-2 space-y-8">

                    <div className="glass-card p-8">
                        <h3 className="text-lg font-bold text-slate-100 mb-6 border-b border-white/10 pb-4">Personal Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Common Fields */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    {isOrg ? "Representative Name" : "Full Name"}
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData?.fullName ?? ""}
                                        onChange={handleChange}
                                        className="glass-input w-full"
                                    />
                                ) : (
                                    <p className="text-slate-100 font-medium text-lg">{formData?.fullName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email Address</label>
                                <div className="relative">
                                    <p className="text-slate-100 font-medium text-lg border-b border-transparent py-2">
                                        {formData?.email}
                                    </p>
                                    {isEditing && <span className="absolute right-0 top-2 text-xs text-slate-500">(Cannot be changed)</span>}
                                </div>
                            </div>

                            {/* Attendee Specific */}
                            {!isOrg && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact Number</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={formData?.phoneNumber || ''}
                                                onChange={handleChange}
                                                className="glass-input w-full"
                                            />
                                        ) : (
                                            <p className="text-slate-100 font-medium">{formData?.phoneNumber || 'Not set'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Area of Interest</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="areaOfInterest"
                                                value={formData?.areaOfInterest || ''}
                                                onChange={handleChange}
                                                placeholder="e.g. Technology, Music"
                                                className="glass-input w-full"
                                            />
                                        ) : (
                                            <p className="text-slate-100 font-medium">{formData?.areaOfInterest || 'Not specified'}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Org Specific */}
                            {isOrg && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Company Name</label>
                                        <div className="relative">
                                            <p className="text-slate-100 font-medium text-lg border-b border-transparent py-2">
                                                {formData?.companyName || 'My Organization'}
                                            </p>
                                            {isEditing && <span className="absolute right-0 top-2 text-xs text-slate-500">(Cannot be changed)</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Website</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="website"
                                                value={formData?.website || ''}
                                                onChange={handleChange}
                                                placeholder="https://..."
                                                className="glass-input w-full"
                                            />
                                        ) : (
                                            <p className="text-violet-400 font-medium hover:text-violet-300">
                                                {formData?.website ? <a href={formData.website} target="_blank" rel="noreferrer">{formData.website}</a> : 'Not set'}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Full Width Bio */}
                            <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Bio</label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        rows={4}
                                        value={formData?.bio || ''}
                                        onChange={handleChange}
                                        className="glass-input w-full resize-none"
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                ) : (
                                    <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
                                        {formData?.bio || 'No bio provided.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUploadSuccess={onUploadSuccess}
                title={uploadType === 'PROFILE' ? 'Upload Profile Picture' : 'Upload Banner Image'}
                aspectRatio={uploadType === 'PROFILE' ? 1 : 16 / 5}
                circularCrop={uploadType === 'PROFILE'}
            />
        </div>
    );
};

export default ProfileSettings;
