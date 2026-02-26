import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEye, HiEyeSlash, HiSparkles, HiUserGroup, HiUser, HiExclamationCircle } from "react-icons/hi2";
import { authService } from '../services/api';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'USER' | 'ORGANIZATION'>('USER');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { fullName, email, password, confirmPassword, phoneNumber } = formData;
  const publicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];

  const handleTabSwitch = (newRole: 'USER' | 'ORGANIZATION') => {
    setRole(newRole);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: ''
    });
    setErrors({});
    setTouched({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
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
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value.length > 100) {
          newErrors.fullName = 'Full name cannot exceed 100 characters';
        } else {
          delete newErrors.fullName;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email format';
        } else if (role === 'ORGANIZATION') {
          const domain = value.split('@')[1];
          if (publicDomains.includes(domain)) {
            newErrors.email = 'Please use a work email for Organizations';
          } else {
            delete newErrors.email;
          }
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors.password;
        }
        // Also validate confirm password if it's been touched
        if (touched.confirmPassword && formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (touched.confirmPassword && value === formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'phoneNumber':
        if (value && !/^[0-9]{10,15}$/.test(value)) {
          newErrors.phoneNumber = 'Phone number must be 10-15 digits';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.length > 100) {
      newErrors.fullName = 'Full name cannot exceed 100 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    } else if (role === 'ORGANIZATION') {
      const domain = email.split('@')[1];
      if (publicDomains.includes(domain)) {
        newErrors.email = 'Please use a work email for Organizations';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (phoneNumber && !/^[0-9]{10,15}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10-15 digits';
    }

    setErrors(newErrors);
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true, phoneNumber: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    const payload = {
      fullName,
      email,
      password,
      phoneNumber: phoneNumber || undefined,
      role
    };

    try {
      setLoading(true);
      await authService.register(payload);
      toast.success("Account Created Successfully! 🚀");
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      console.error("Registration failed", error);

      // Handle backend validation errors
      if (error.response?.data?.details) {
        const backendErrors = error.response.data.details;
        const fieldErrors: FieldErrors = {};

        Object.keys(backendErrors).forEach((field) => {
          fieldErrors[field as keyof FieldErrors] = backendErrors[field];
        });

        setErrors({ ...errors, ...fieldErrors });
        setTouched({ fullName: true, email: true, password: true, confirmPassword: true, phoneNumber: true });
        toast.error(error.response.data.message || "Validation failed");
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
        toast.error(errorMessage);
      }
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
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="glass-card max-w-md w-full p-8 relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <HiSparkles className="w-8 h-8 text-violet-400 float-animation" />
          </div>
          <h2 className="text-3xl font-extrabold text-gradient">EventMate</h2>
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'USER'
              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25'
              : 'text-slate-400 hover:text-slate-300'
              }`}
            onClick={() => handleTabSwitch('USER')}
          >
            <HiUser className="w-4 h-4" />
            Attendee
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'ORGANIZATION'
              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25'
              : 'text-slate-400 hover:text-slate-300'
              }`}
            onClick={() => handleTabSwitch('ORGANIZATION')}
          >
            <HiUserGroup className="w-4 h-4" />
            Organizer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {role === 'ORGANIZATION' ? 'Company Name' : 'Full Name'}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClasses('fullName')}
              placeholder={role === 'ORGANIZATION' ? 'Acme Inc.' : 'John Doe'}
            />
            <FieldError error={touched.fullName ? errors.fullName : undefined} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClasses('email')}
              placeholder="you@example.com"
            />
            <FieldError error={touched.email ? errors.email : undefined} />
          </div>

          {/* Phone Number - Optional */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
              <span className="text-slate-500 text-xs ml-2">(optional)</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClasses('phoneNumber')}
              placeholder="1234567890"
            />
            <FieldError error={touched.phoneNumber ? errors.phoneNumber : undefined} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
              <span className="text-red-400 ml-1">*</span>
              <span className="text-slate-500 text-xs ml-2">(min. 8 characters)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
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
                {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
            <FieldError error={touched.password ? errors.password : undefined} />
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
                value={confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getInputClasses('confirmPassword')} pr-12`}
                placeholder="••••••••"
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
            className="btn-glow w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </span>
            ) : (
              role === 'ORGANIZATION' ? 'Register Company' : 'Sign Up Free'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;