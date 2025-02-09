//@ts-nocheck
import React, { useState } from "react";

interface props  {
    item: any,
    updateQuantity: () => void,
    updateDiscount: () => void,
    removeItemFromCart: (id: number) => void
}

const CartItem: React.FC<props> = ({ item, updateQuantity, updateDiscount, removeItemFromCart }) => {
  const [isOpen, setIsOpen] = useState(false); // To toggle quantity and discount inputs

  return (
    <div className="border-b py-4 flex justify-between">
      {/* Main div showing the item name, price and remove button */}
      <div className="flex flex-col  justify-between w-full">
        <div className="flex items-center justify-between space-x-4">
          <span className="font-medium">{item.name}</span>
          <span className="text-lg font-semibold">UGX {parseFloat(item.selling_price).toFixed(2)}</span>
        </div>
        {/* Toggleable section for Quantity and Discount */}
      <div className={`w-full mt-2 ${isOpen ? "block" : "hidden"}`}>
        <div className="flex space-x-4 items-center">
          <div className="flex flex-col items-center space-x-2">
            <span className="text-sm">Quantity:</span>
            <input
              type="number"
              className="border rounded w-20 p-1 text-center"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, e.target.value)}
              min="1"
            />
          </div>
          <div className="flex flex-col items-center space-x-2">
            <span className="text-sm">Discount (per item):</span>
            <input
              type="number"
              className="border rounded w-20 p-1 text-center"
              value={item.discount}
              onChange={(e) => updateDiscount(item.id, e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
        {/* Subtotal display
        <div className="mt-2 text-lg font-semibold">
          Subtotal: UGX{" "}
          {(
            item.quantity * parseFloat(item.selling_price) -
            item.quantity * item.discount
          ).toFixed(2)}
        </div> */}
      </div>

      {/* Button to toggle the visibility of quantity and discount inputs */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className=" text-gray-500 text-sm ml-4"
      >
        {isOpen ? "▲" : "▼"}
      </button>
       {/* Remove button */}
       <button
          onClick={() => removeItemFromCart(item.id)}
          className="bg-red-500 text-white text-xs w-5 h-5 rounded-full ml-2"
        >
          X
        </button>
    </div>
  );
};

export default CartItem;