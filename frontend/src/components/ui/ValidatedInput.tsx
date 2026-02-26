import React from 'react';
import { HiExclamationCircle } from 'react-icons/hi2';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    hint?: string;
    icon?: React.ReactNode;
}

/**
 * Reusable input component with validation styling and error display
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
    label,
    error,
    touched,
    required,
    hint,
    icon,
    className = '',
    ...props
}) => {
    const showError = touched && error;

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
                {hint && <span className="text-slate-500 text-xs ml-2">({hint})</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    {...props}
                    className={`glass-input w-full ${icon ? 'pl-10' : ''} ${showError
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                            : ''
                        } ${className}`}
                />
            </div>
            {showError && (
                <div className="flex items-center gap-1 mt-1.5 text-red-400 text-sm">
                    <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    hint?: string;
}

/**
 * Reusable textarea component with validation styling
 */
export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
    label,
    error,
    touched,
    required,
    hint,
    className = '',
    ...props
}) => {
    const showError = touched && error;

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
                {hint && <span className="text-slate-500 text-xs ml-2">({hint})</span>}
            </label>
            <textarea
                {...props}
                className={`glass-input w-full ${showError
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : ''
                    } ${className}`}
            />
            {showError && (
                <div className="flex items-center gap-1 mt-1.5 text-red-400 text-sm">
                    <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

interface ValidatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    hint?: string;
    options: { value: string; label: string }[];
}

/**
 * Reusable select component with validation styling
 */
export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
    label,
    error,
    touched,
    required,
    hint,
    options,
    className = '',
    ...props
}) => {
    const showError = touched && error;

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
                {hint && <span className="text-slate-500 text-xs ml-2">({hint})</span>}
            </label>
            <select
                {...props}
                className={`glass-input w-full ${showError
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : ''
                    } ${className}`}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {showError && (
                <div className="flex items-center gap-1 mt-1.5 text-red-400 text-sm">
                    <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Common validation rules
 */
export const ValidationRules = {
    required: (value: string, fieldName: string = 'This field') =>
        !value?.trim() ? `${fieldName} is required` : undefined,

    email: (value: string) => {
        if (!value?.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return undefined;
    },

    minLength: (value: string, min: number, fieldName: string = 'Field') =>
        value && value.length < min ? `${fieldName} must be at least ${min} characters` : undefined,

    maxLength: (value: string, max: number, fieldName: string = 'Field') =>
        value && value.length > max ? `${fieldName} cannot exceed ${max} characters` : undefined,

    phone: (value: string) => {
        if (!value) return undefined; // Optional
        if (!/^[0-9]{10,15}$/.test(value)) return 'Phone must be 10-15 digits';
        return undefined;
    },

    url: (value: string) => {
        if (!value) return undefined; // Optional
        try {
            new URL(value);
            return undefined;
        } catch {
            return 'Invalid URL format';
        }
    },

    date: (value: string, fieldName: string = 'Date') =>
        !value ? `${fieldName} is required` : undefined,

    positiveNumber: (value: string | number, fieldName: string = 'Value') => {
        const num = Number(value);
        if (isNaN(num) || num <= 0) return `${fieldName} must be a positive number`;
        return undefined;
    },

    match: (value: string, compareValue: string, message: string = 'Values do not match') =>
        value !== compareValue ? message : undefined
};

/**
 * Hook for form validation
 */
export const useFormValidation = <T extends Record<string, any>>(initialValues: T) => {
    const [values, setValues] = React.useState<T>(initialValues);
    const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof T]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const setFieldError = (field: keyof T, error: string | undefined) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const setFieldTouched = (field: keyof T, value: boolean = true) => {
        setTouched(prev => ({ ...prev, [field]: value }));
    };

    const touchAll = () => {
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key as keyof T] = true;
            return acc;
        }, {} as Record<keyof T, boolean>);
        setTouched(allTouched);
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    const hasErrors = Object.values(errors).some(e => !!e);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldError,
        setFieldTouched,
        setValues,
        setErrors,
        touchAll,
        reset,
        hasErrors
    };
};

export default ValidatedInput;
