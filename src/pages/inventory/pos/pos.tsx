//@ts-nocheck
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import useItems from "../../../hooks/inventory/useItems";

const POS = () => {
  const [catalog] = useState([
    { id: 1, name: "Item A", price: 50 },
    { id: 2, name: "Item B", price: 30 },
    { id: 3, name: "Item C", price: 20 },
    { id: 4, name: "Item D", price: 100 },
  ]);
  const { data, refresh } = useItems();
  const items = useSelector((state: RootState) => state.inventoryItems.data);

  useEffect(()=>{
    console.log('items', data)
  }, [])

  const [cart, setCart] = useState([]);

  // Add item to cart
  const addItemToCart = (item) => {
    const exists = cart.find((cartItem) => cartItem.id === item.id);
    if (exists) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1, discount: 0 }]);
    }
  };

  // Remove item from cart
  const removeItemFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Update quantity
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return; // Prevent zero or negative quantities
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: parseInt(quantity, 10) } : item
      )
    );
  };

  // Update discount
  const updateDiscount = (id, discount) => {
    if (discount < 0) return; // Prevent negative discounts
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, discount: parseFloat(discount) } : item
      )
    );
  };

  // Calculate totals
  const calculateTotal = () => {
    return cart.reduce(
      (total, item) =>
        total + item.quantity * parseFloat(item.selling_price) - item.discount * item.quantity,
      0
    );
  };

  // Handle Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items to checkout.");
      return;
    }

    const payload = JSON.stringify(cart, null, 2); // Stringify cart items
    console.log("Checkout Payload:", payload);

    alert("Checkout successful! Check the console for the payload.");
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Point of Sale</h2>

      {/* Item Search */}
      <div className="flex items-center space-x-4 w-full">
        <select
          className="border p-2 rounded w-full"
          onChange={(e) => {
            const selectedItem = data.find(
              (item) => item.id === parseInt(e.target.value, 10)
            );
            if (selectedItem) addItemToCart(selectedItem);
          }}
        >
          <option value="">Select Item</option>
          {data.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - UGX {item.selling_price}
            </option>
          ))}
        </select>
      </div>

      {/* Cart Table */}
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Item</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Discount (per item)</th>
            <th className="border px-4 py-2">Subtotal</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2"> UGX {parseFloat(item.selling_price).toFixed(2)}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  className="border rounded w-16 p-1 text-center"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, e.target.value)
                  }
                  min="1"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  className="border rounded w-16 p-1 text-center"
                  value={item.discount}
                  onChange={(e) =>
                    updateDiscount(item.id, e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
              </td>
              <td className="border px-4 py-2">
                UGX
                {(
                  item.quantity * parseFloat(item.selling_price) -
                  item.quantity * item.discount
                ).toFixed(2)}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => removeItemFromCart(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total and Checkout */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Total: UGX {calculateTotal().toFixed(2)}</div>
        <button
          onClick={handleCheckout}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default POS;
