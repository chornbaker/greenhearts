import React, { SelectHTMLAttributes } from 'react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  options: Array<{ value: string; label: string }>;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  id,
  containerClassName = '',
  className = '',
  options,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-800 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            color: '#171717',
            WebkitTextFillColor: '#171717',
            backgroundColor: '#ffffff',
            fontSize: '1rem',
            lineHeight: '1.5',
            paddingRight: '2.5rem',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            fontWeight: 500,
            opacity: 1,
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div 
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
          style={{ pointerEvents: 'none' }}
        >
          <svg 
            className="h-5 w-5 text-gray-500" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormSelect; 