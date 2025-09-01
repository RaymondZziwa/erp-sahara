import React from "react";

interface TableFooterProps {
  setEntries: React.Dispatch<React.SetStateAction<number>>;
  entries: number;
}

const TableFooter: React.FC<TableFooterProps> = ({ setEntries, entries }) => {
  return (
    <div className="flex flex-col w-full py-4 border-t border-gray-300">
    {/* Centered text */}
    <div className="p-4 text-sm text-gray-500 text-center border-t border-gray-200">
          **Amount is being displayed in your base currency
    </div>
    {/* Number of entries input aligned to the right */}
    <div className="flex justify-end mt-2 items-center">
      <label htmlFor="numEntries" className="mr-2 font-medium text-sm">
        Number of entries:
      </label>
      <input
        id="numEntries"
        type="number"
        min={1}
        value={entries}
        onChange={(e) => setEntries(Number(e.target.value))}
        className="border rounded px-2 py-1 w-12 text-sm outline-none"
      />
    </div>
  </div>
  );
};

export default TableFooter;
