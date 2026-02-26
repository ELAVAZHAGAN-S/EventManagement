import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEnvelope, HiSparkles, HiExclamationCircle } from 'react-icons/hi2';
import { authService } from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [touched, setTouched] = useState(false);

    const validateEmail = (value: string): string | undefined => {
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return undefined;
    };

    const handleBlur = () => {
        setTouched(true);
        setError(validateEmail(email));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(undefined);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateEmail(email);
        if (validationError) {
            setError(validationError);
            setTouched(true);
            toast.error("Please fix the errors above");
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            toast.success("OTP sent successfully!");
            navigate('/verify-otp', { state: { email } });
        } catch (error: any) {
            console.error("Forgot password failed", error);
            toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const showError = touched && error;

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
                        <HiSparkles className="w-8 h-8 text-violet-400 float-animation" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gradient mb-2">EventMate</h2>
                    <h1 className="text-slate-300 font-medium">Forgot Password</h1>
                    <p className="text-sm text-slate-500 mt-2">Enter your email to receive an OTP</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address
                            <span className="text-red-400 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <HiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`glass-input w-full pl-11 ${showError ? 'border-red-500/50 focus:border-red-500' : ''
                                    }`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {showError && (
                            <div className="flex items-center gap-1 mt-1.5 text-red-400 text-sm">
                                <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-glow w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Sending...
                            </span>
                        ) : (
                            'Send OTP'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Remember your password?{' '}
                    <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
