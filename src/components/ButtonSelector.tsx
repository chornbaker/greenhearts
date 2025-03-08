import React, { ReactNode } from 'react';

interface Option {
  value: string;
  label: string;
}

interface ButtonSelectorProps {
  label?: ReactNode;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  containerClassName?: string;
}

const ButtonSelector: React.FC<ButtonSelectorProps> = ({
  label,
  options,
  value,
  onChange,
  containerClassName = '',
}) => {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-800">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2 w-full">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
              value === option.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ButtonSelector; 