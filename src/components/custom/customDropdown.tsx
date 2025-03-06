import { FiChevronDown } from "react-icons/fi";

interface Option {
  value: string | number;
  label: string;
}

interface CustomDropdownProps {
  label: string;
  placeholder: string;
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Ensure the value is the correct type
    const newValue = e.target.value;
    if (typeof value === "number") {
      onChange(Number(newValue)); // Convert to number if required
    } else {
      onChange(newValue); // Otherwise pass the string
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-gray-900 appearance-none pr-12 text-sm h-11
             focus:outline-none focus:ring-0 focus:border-gray-400 hover:border-gray-500 transition-all"
          value={value || ""}
          onChange={handleChange} // Use the handleChange method
        >
          <option value="" disabled className="text-gray-400 text-xs">
            {placeholder}
          </option>
          {options.length > 0 ? (
            options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="text-gray-900"
              >
                {option.label}
              </option>
            ))
          ) : (
            <option key={""} value={""} className="text-gray-400">
              No options available
            </option>
          )}
        </select>

        {/* Custom dropdown arrow */}
        <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};

export default CustomDropdown;
