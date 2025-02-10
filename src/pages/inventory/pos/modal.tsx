//@ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import useItems from "../../../hooks/inventory/useItems";
import PosItemCard from "./item_card";
import CartItem from "./cart_item";
import CategoryNav from "./nav/category_filter";
import PaymentComponent from "./payment_component";
import { toast } from "react-toastify";
import { createRequest } from "../../../utils/api";

const clients = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Mark Johnson" },
];

interface Props {
  query: string;
}

interface CartItemType {
  id: number;
  name: string;
  selling_price: string;
  quantity: number;
  discount: number;
}

const PosModal: React.FC<Props> = ({ query }) => {
  const { data } = useItems();
  const items = useSelector((state: RootState) => state.inventoryItems.data);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [customer, setCustomer] = useState<string | number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null);
  const [searchedItems, setSearchedItems] = useState<CartItemType[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [total, setTotal] = useState(0);
  const user = useSelector((state: RootState) => state.userAuth.user);
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);

  const [formState, setFormState] = useState({
    cashier_id: user.id,
    cashier_name: user.full_name,
    customer_id: typeof customer === "number" ? customer : 0,
    customer_name: typeof customer === "string" ? customer : "",
    warehouse_id: 1,
    chart_of_account_id: 1,
    items: [],
    payment_method_id: paymentMethod,
    amount_paid: total,
    sale_date: new Date().toLocaleDateString(),
    currency_id: 1,
  });

  useEffect(() => {
    setFormState((prev) => ({ ...prev, items: cart }));
  }, [cart]);

  // Sync customer & payment method
  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      customer_id: typeof customer === "number" ? customer : 0,
      customer_name: typeof customer === "string" ? customer : "",
      payment_method_id: paymentMethod,
    }));
  }, [customer, paymentMethod]);

  // Sync total amount
  useEffect(() => {
    setFormState((prev) => ({ ...prev, amount_paid: total }));
  }, [total]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    let filteredItems = items;
  
    // Apply category filter only if selectedCategory is NOT 0
    if (selectedCategory !== 0) {
      filteredItems = filteredItems.filter(
        (item) => item.item_category_id === selectedCategory
      );
    }
  
    // Apply search filter
    if (query.trim() !== "") {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  
    // Ensure pagination stays within bounds
    const totalFilteredItems = filteredItems.length;
    const adjustedLastIndex = Math.min(indexOfLastItem, totalFilteredItems);
    const adjustedFirstIndex = Math.min(indexOfFirstItem, adjustedLastIndex);
  
    setSearchedItems(filteredItems.slice(adjustedFirstIndex, adjustedLastIndex));
  }, [query, items, selectedCategory, indexOfFirstItem, indexOfLastItem]);
  

  // Add item to cart
  const addItemToCart = (item: CartItemType) => {
    setCart((prevCart) => {
      const exists = prevCart.find((cartItem) => cartItem.id === item.id);
      if (exists) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1, discount: 0 }];
    });
  };

  // Remove item from cart
  const removeItemFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Update quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Update discount
  const updateDiscount = (id: number, discount: number) => {
    if (discount < 0) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, discount } : item
      )
    );
  };

  // Calculate totals
  const calculateTotal = () => {
    const result = cart.reduce(
      (total, item) =>
        total + item.quantity * parseFloat(item.selling_price) - item.discount * item.quantity,
      0
    );
    setTotal(result);
    return result;
  };

  const totalAmount = useMemo(() => calculateTotal(), [cart]);

  // Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warn("Cart is empty. Please add items to checkout.");
      return;
    }

    // Ensure items are structured properly
  const formattedItems = cart.map((item) => ({
    item_id: item.id, 
    quantity: item.quantity,
    discount: item.discount,
  }));

  if (formattedItems.some((item) => !item.item_id)) {
    toast.error("Error: One or more items are missing an item_id.");
    return;
  }

  const requestData = {
    ...formState,
    items: formattedItems, // Ensure correct structure
  };

  const endpoint = "/erp/inventories/pointsofsale";
  const response = await createRequest(endpoint, token, requestData, 'POST');

  if (response.success) {
    toast.success("Sale saved successfully!");
    setCart([]); // Clear cart after submission
  } else {
    toast.error("Error processing sale. Check your inputs.");
  }
  };

  return (
    <div className="mt-4">
      <div className="p-6 flex flex-row justify-between overflow-auto">
        <div className="w-3/5 h-[650px]">
          <CategoryNav selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 p-4">
            {searchedItems.length > 0 ? searchedItems.map((item) => (
              <PosItemCard
                key={item.item_id}
                image={item.image ?? 'https://picsum.photos/150'}
                name={item.name}
                price={item.selling_price}
                addItem={() => addItemToCart(item)}
              />
            )):

              <p className="text-center">Not items found</p>
            }
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-1">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300">
              Previous
            </button>
            <span className="mx-4">Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300">
              Next
            </button>
          </div>
        </div>

        <div className="w-2/5">
          {/* Cart Items */}
          <div className="flex flex-col p-2">
            {cart.map((item) => (
              <CartItem key={item.item_id} item={item} updateQuantity={updateQuantity} updateDiscount={updateDiscount} removeItemFromCart={removeItemFromCart} />
            ))}
          </div>

          {/* Payment Component */}
          <PaymentComponent clients={clients} setClientName={setCustomer} setPaymentMethod={setPaymentMethod} />

          {/* Total and Checkout */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-lg font-bold">Total: UGX {totalAmount.toFixed(2)}</div>
            <button onClick={handleCheckout} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosModal;
