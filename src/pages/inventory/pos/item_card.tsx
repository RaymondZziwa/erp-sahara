import { imageURL } from "../../../utils/api";
import { Plus } from 'lucide-react';

export const PosItemCard: React.FC<{
  image: string;
  name: string;
  price: number;
  addItem: () => void;
  item: any;
  isMobile?: boolean;
}> = ({ image, name, price, addItem, item, isMobile = false }) => {
  return (
    <div
  className={`h-48 w-48 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 group ${
    isMobile ? "w-full" : "w-full"
  }`}
  onClick={addItem}
>
  <div className="relative overflow-hidden h-2/3 w-full">
    <img
      src={
        item.item_images?.[0]?.image_url
          ? `${imageURL}/${item.item_images[0].image_url}`
          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
      }
      alt={name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
      <Plus className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  </div>

  <div className="p-2">
    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{name}</h3>
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-teal-600">UGX {price}</span>
      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
        {item?.unit_of_measure?.abbreviation || "unit"}
      </span>
    </div>
  </div>
</div>

  );
};