import React, { InputHTMLAttributes, ReactNode } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  containerClassName?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  id,
  containerClassName = '',
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-800 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          color: '#4b5563',
          WebkitTextFillColor: '#4b5563',
          backgroundColor: '#ffffff',
          fontSize: '1rem',
          lineHeight: '1.5',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          fontWeight: 400,
          opacity: 1,
        }}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormInput; 