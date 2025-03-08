import React, { ReactNode } from 'react';

interface DateSelectorProps {
  label?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  required?: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  label,
  value,
  onChange,
  containerClassName = '',
  required = false,
}) => {
  // Format today's date as YYYY-MM-DD for max attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label htmlFor={`date-${label}`} className="block text-sm font-medium text-gray-800 mb-1">
          {label}
        </label>
      )}
      <input
        id={`date-${label}`}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={today}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
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
      />
    </div>
  );
};

export default DateSelector; 