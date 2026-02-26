import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEye, HiEyeSlash, HiShieldCheck, HiExclamationCircle } from "react-icons/hi2";
import { authService } from '../services/api';

interface FieldErrors {
    newPassword?: string;
    confirmPassword?: string;
}

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, otp } = location.state || {};

    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!email || !otp) {
            toast.error("Invalid access. Please start from Forgot Password.");
            navigate('/forgot-password');
        }
    }, [email, otp, navigate]);

    if (!email || !otp) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name as keyof FieldErrors]) {
            setErrors({ ...errors, [name]: undefined });
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        validateField(name, value);
    };

    const validateField = (name: string, value: string) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'newPassword':
                if (!value) {
                    newErrors.newPassword = 'Password is required';
                } else if (value.length < 8) {
                    newErrors.newPassword = 'Password must be at least 8 characters';
                } else {
                    delete newErrors.newPassword;
                }
                // Revalidate confirm if touched
                if (touched.confirmPassword && formData.confirmPassword) {
                    if (value !== formData.confirmPassword) {
                        newErrors.confirmPassword = 'Passwords do not match';
                    } else {
                        delete newErrors.confirmPassword;
                    }
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    newErrors.confirmPassword = 'Please confirm your password';
                } else if (value !== formData.newPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
        }

        setErrors(newErrors);
    };

    const validateForm = (): boolean => {
        const newErrors: FieldErrors = {};

        if (!formData.newPassword) {
            newErrors.newPassword = 'Password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        setTouched({ newPassword: true, confirmPassword: true });
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors above");
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({
                email,
                otp,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });
            toast.success("Password Reset Successful! Please login.");
            navigate('/login');
        } catch (error: any) {
            console.error("Reset password failed", error);
            toast.error(error.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const FieldError = ({ error }: { error?: string }) => {
        if (!error) return null;
        return (
            <div className="flex items-center gap-1 mt-1.5 text-red-400 text-sm">
                <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
            </div>
        );
    };

    const getInputClasses = (fieldName: keyof FieldErrors) => {
        const hasError = touched[fieldName] && errors[fieldName];
        return `glass-input w-full pr-12 ${hasError ? 'border-red-500/50 focus:border-red-500' : ''}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="glass-card max-w-md w-full p-8 relative">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <HiShieldCheck className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gradient mb-2">Almost Done!</h2>
                    <p className="text-slate-400">Create a new strong password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            New Password
                            <span className="text-red-400 ml-1">*</span>
                            <span className="text-slate-500 text-xs ml-2">(min. 8 characters)</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClasses('newPassword')}
                                placeholder="Min 8 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 hover:text-violet-400 transition-colors"
                            >
                                {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                            </button>
                        </div>
                        <FieldError error={touched.newPassword ? errors.newPassword : undefined} />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm Password
                            <span className="text-red-400 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClasses('confirmPassword')}
                                placeholder="Re-enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 hover:text-violet-400 transition-colors"
                            >
                                {showConfirmPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                            </button>
                        </div>
                        <FieldError error={touched.confirmPassword ? errors.confirmPassword : undefined} />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-glow w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Resetting...
                            </span>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
