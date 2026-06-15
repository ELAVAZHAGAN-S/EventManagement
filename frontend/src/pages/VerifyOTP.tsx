import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiSparkles, HiExclamationCircle } from 'react-icons/hi2';
import { authService } from '../services/api';

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(300);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            toast.error("No email found. Please try again.");
            navigate('/forgot-password');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.error("OTP expired. Please try again.");
                    navigate('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError(undefined); // Clear error on input

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) {
            setError('OTP must contain only digits');
            return;
        }

        const newOtp = [...otp];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        setError(undefined);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        if (!/^\d{6}$/.test(otpString)) {
            setError('OTP must contain only digits');
            toast.error("OTP must contain only digits");
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOtp(email, otpString);
            toast.success("OTP Verified Successfully!");
            navigate('/reset-password', { state: { email, otp: otpString } });
        } catch (error: any) {
            console.error("OTP verification failed", error);
            setError('Invalid OTP. Please check and try again.');
            toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full py-12 px-8 relative">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <HiSparkles className="w-15 h-15 px-3 py-3 border-2 border-amber-200 rounded-full text-amber-200 float-animation" />
                    </div>
                    <h2 className="text-sm font-extrabold text-amber-200 mb-2">EventMate 2.0</h2>
                    <h1 className="text-white font-medium">Verify OTP</h1>
                    <p className="text-sm text-white mt-2">
                        Enter the 6-digit code sent to your mail (<span className="text-amber-200">{email}</span>)
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className={`w-12 h-14 text-center text-2xl font-bold bg-white/5 border rounded-xl text-white focus:ring-2 outline-none transition-all ${error
                                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                                            : 'border-white focus:border-amber-200 focus:ring-amber-100/30'
                                        }`}
                                />
                            ))}
                        </div>
                        {error && (
                            <div className="flex items-center justify-center gap-1 mt-3 text-red-400 text-sm">
                                <HiExclamationCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <span className="text-sm text-slate-400">Time Remaining: </span>
                        <span className={`text-sm font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-amber-200'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !isComplete}
                        className="btn2">
                        <span className="spn2">
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Verifying...
                            </span>
                        ) : (
                            'Verify OTP'
                        )}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
