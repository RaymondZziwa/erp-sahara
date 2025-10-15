 import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck, FaSearch } from 'react-icons/fa';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface ModernDropdownProps {
  options: DropdownOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  isRequired?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  label?: string;
  error?: string;
  className?: string;
}

const ModernDropdown: React.FC<ModernDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  isRequired = false,
  disabled = false,
  searchable = false,
  multiSelect = false,
  label,
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      onChange([optionValue]);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    
    if (multiSelect) {
      const selectedLabels = value.map(val => 
        options.find(opt => opt.value === val)?.label
      ).filter(Boolean);
      
      return selectedLabels.length > 2 
        ? `${selectedLabels.length} selected`
        : selectedLabels.join(', ');
    }
    
    return options.find(opt => opt.value === value[0])?.label || placeholder;
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const removeSingleValue = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== valueToRemove));
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Dropdown Container */}
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Trigger */}
        <button
          type="button"
          className={`
            w-full px-4 py-3 text-left bg-white border rounded-xl transition-all duration-200
            flex items-center justify-between min-h-[48px]
            ${disabled 
              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <div className="flex items-center flex-wrap gap-1 flex-1 min-w-0">
            {multiSelect && value.length > 0 ? (
              value.map(val => {
                const option = options.find(opt => opt.value === val);
                return option ? (
                  <span
                    key={val}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => removeSingleValue(val, e)}
                      className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })
            ) : (
              <span className={`truncate ${value.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                {getDisplayText()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
            {value.length > 0 && !multiSelect && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                ×
              </button>
            )}
            <FaChevronDown 
              className={`text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
              size={14}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-gray-500 text-sm">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`
                      w-full px-4 py-3 text-left transition-colors duration-150 flex items-center justify-between
                      ${option.disabled 
                        ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                        : 'hover:bg-blue-50 hover:text-blue-700'
                      }
                      ${value.includes(option.value) ? 'bg-blue-50 text-blue-700' : ''}
                    `}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    
                    {value.includes(option.value) && (
                      <FaCheck className="text-blue-600 flex-shrink-0 ml-2" size={14} />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Selected Count for Multi-select */}
            {multiSelect && value.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-sm text-gray-600">
                {value.length} selected
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ModernDropdown;