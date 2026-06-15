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
            <div className="glass-card max-w-md w-full py-12 px-8 relative">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <HiSparkles className="w-15 h-15 px-3 py-3 border-2 border-amber-200 rounded-full text-amber-200 float-animation" />
                    </div>
                    <h2 className="text-sm font-extrabold text-amber-200 mb-2">EventMate 2.0</h2>
                    <h1 className="text-white font-medium">Forgot Password</h1>
                    <p className="text-sm text-white mt-2">Enter your email to receive an OTP</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-10">
                        <label className="block text-sm font-medium text-amber-200 mb-2">
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
                                <HiExclamationCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <button className="btn2" type='submit' disabled={isLoading}>
                        <span className="spn2">
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
                        )}</span>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-white">
                    Remember your password?{' '}
                    <Link to="/login" className="text-amber-200! font-semibold hover:text-amber-100! hover:border-b hover:border-amber-200 transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
