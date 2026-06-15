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
        <HiExclamationCircle className="w-4 h-4 shrink-0" />
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
      <div className="glass-card max-w-md w-full py-12 px-8 relative">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <HiSparkles className="w-15 h-15 px-3 py-3 border-2 border-amber-200 rounded-full text-amber-200 float-animation" />
          </div>
          <h2 className="text-sm font-extrabold text-amber-200 mb-2">EventMate 2.0</h2>
          <p className="text-white text-sm">Welcome back! Let's get you in to your events.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mb-10">
            <label className="block text-sm font-medium text-amber-200 mb-2">
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
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-2">
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
                className="absolute inset-y-0 right-3 flex items-center justify-center text-white hover:text-amber-100 cursor-pointer transition-colors"
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
            <Link to="/forgot-password" className="text-sm text-amber-200! hover:text-amber-100! hover:border-b hover:border-amber-200 transition-colors">
              Forgot Password?
            </Link>
          </div>


          <button className="btn2" type='submit' disabled={loading}>
            <span className="spn2">{loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}</span>
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-white">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-200! font-semibold hover:text-amber-100! hover:border-b hover:border-amber-200 transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;