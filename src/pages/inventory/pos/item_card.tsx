//@ts-nocheck
import React from "react";

interface Props {
  image: string;
  name: string;
  price: string;
  addItem: () => void;
  item: any;
  isMobile?: boolean;
}

const PosItemCard: React.FC<Props> = ({ image, name, price, addItem, item, isMobile = false }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer border border-gray-100 ${
        isMobile ? "w-full" : "w-full"
      }`}
      onClick={addItem}
    >
      <div className="relative aspect-square">
        <img
          src={image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{name}</h3>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm font-bold text-blue-600">
            UGX {price}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {item?.unit_of_measure?.abbreviation || 'unit'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PosItemCard;