//@ts-nocheck
import React from "react";

interface props {
  onClose: () => void,
  onSearch: (e) => void
}

const PosNavbar: React.FC<props> = ({ onClose, onSearch }) => {
  return (
    <nav className="flex flex-col md:flex-row items-center justify-between text-white bg-gray-200 p-4 shadow-md mt-12 space-y-4 md:space-y-0">
      {/* POS Name and Search Input */}
      <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
        <h1 className="text-lg font-bold text-black">POS</h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search item..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full md:w-[500px] px-3 py-2 rounded-md text-gray-700 outline-none mt-2 md:mt-0 md:ml-4"
        />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition w-full md:w-auto"
      >
        Close
      </button>
    </nav>
  );
};

export default PosNavbar;
