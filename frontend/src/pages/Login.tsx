import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEye, HiEyeSlash, HiSparkles, HiExclamationCircle } from "react-icons/hi2";
import { authService } from '../services/api';

interface FieldErrors {
  email?: string;
  password?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(formData);
      toast.success("Login Successful!");

      setTimeout(() => {
        if (response.role === 'ORGANIZATION') {
          navigate('/org/dashboard');
        } else if (response.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/events');
        }
      }, 1500);
    } catch (error: any) {
      console.error("Login failed", error);

      // Handle backend validation errors
      if (error.response?.data?.details) {
        const backendErrors = error.response.data.details;
        setErrors({ ...errors, ...backendErrors });
        setTouched({ email: true, password: true });
      }

      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
    return `glass-input w-full ${hasError ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="glass-card max-w-md w-full p-8 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <HiSparkles className="w-8 h-8 text-violet-400 float-animation" />
          </div>
          <h2 className="text-3xl font-extrabold text-gradient mb-2">EventMate</h2>
          <p className="text-slate-400">Welcome back! Let's get you in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClasses('email')}
              placeholder="you@example.com"
            />
            <FieldError error={touched.email ? errors.email : undefined} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getInputClasses('password')} pr-12`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 hover:text-violet-400 transition-colors"
              >
                {showPassword ? (
                  <HiEyeSlash className="w-5 h-5" />
                ) : (
                  <HiEye className="w-5 h-5" />
                )}
              </button>
            </div>
            <FieldError error={touched.password ? errors.password : undefined} />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-glow w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;