//@ts-nocheck
import React from "react";

interface props {
  onClose: () => void,
  onSearch: (e) => void
}

const PosNavbar: React.FC<props> = ({ onClose, onSearch }) => {
  return (
    <nav className="flex items-center justify-between text-white bg-gray-200 p-4 shadow-md mt-12">
      {/* POS Name */}
      <div className="flex flex-row items-center">
        <h1 className="text-lg font-bold text-black">ERP POS</h1>

        {/* Search Input */}
        <input
        type="text"
        placeholder="Search item..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-[500px] px-3 py-2 rounded-md text-gray-700 outline-none ml-4"
        />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition"
      >
        Close
      </button>
    </nav>
  );
};

export default PosNavbar;
