
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import PosItemCard from "./item_card";
import CartItem from "./cart_item";
import CategoryNav from "./nav/category_filter";
import { toast } from "react-toastify";
import { createRequest, imageURL } from "../../../utils/api";
import { useReactToPrint } from "react-to-print";
import { PrintableContent } from "./receipt";
import PaymentComponent from "./payment_component";
import { useWindowSize } from "../../../hooks/useWindowSize";
import useItems from "../../../hooks/inventory/useItems";


interface Props {
  query: string;
}

const PosModal: React.FC<Props> = ({ query }) => {
  const { data: items, refresh: getItems } = useItems()
  const businessName = useSelector(
    (state: RootState) => state.userAuth.user?.organisation?.organisation_name
  );
  

  const [selectedCategory, setSelectedCategory] = useState<number | string>(0);
  const [customer, setCustomer] = useState<string | number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>("");
  const [searchedItems, setSearchedItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const user = useSelector((state: RootState) => state.userAuth.user);
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const { width } = useWindowSize();
  const isMobile = width < 768;

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const [formState, setFormState] = useState({
    cashier_id: user.id,
    cashier_name: user.first_name,
    customer_id: typeof customer === "number" ? customer : 0,
    customer_name: typeof customer === "string" ? customer : "",
    warehouse_id: localStorage.getItem('store'),
    items: [],
    payment_method_id: paymentMethod,
    amount_paid: total,
    sale_date: new Date().toLocaleDateString(),
    currency_id: 1,
  });

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== 0) {
      result = result.filter(
        (item) => item.item_category_id === selectedCategory
      );
    }
    return result;
  }, [items, selectedCategory]);

  useEffect(() => {
    if (query.trim() !== "") {
      const result = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchedItems(result);
    } else {
      setSearchedItems(filteredItems);
    }
  }, [query, items, filteredItems]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(searchedItems.length / itemsPerPage);
  const paginatedItems = searchedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const addItemToCart = (item: CartItemType) => {
    setCart((prev) => {
      const exists = prev.find((cartItem) => cartItem.id === item.id);
      if (exists) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 0 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 0,
          discount: 0,
          actual_selling_price: Math.floor(+item.selling_price),
        },
      ];
    });
  };

  const removeItemFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const updateSellingPrice = (id: number, selling_price: number) => {
    if (selling_price < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, actual_selling_price: selling_price } : item
      )
    );
  };

  const updateDiscount = (id: number, discount: number) => {
    if (discount < 0) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, discount } : item))
    );
  };

  const totalAmount = useMemo(() => {
    const result = cart.reduce((sum, item) => {
      return (
        sum +
        item.quantity * parseFloat(item.actual_selling_price) -
        item.discount * item.quantity
      );
    }, 0);
    setTotal(result);
    return result;
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warn("Cart is empty. Please add items to checkout.");
      return;
    }
    setShowConfirmationModal(true);
  };

  const processCheckout = async (printReceipt: boolean) => {

    if (!localStorage.getItem('store') || !localStorage.getItem('currency')) {
      toast.warn('Please select the warehouse you are selling from and currency');
      return;
    }
    const formattedItems = cart.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
      discount: item.discount,
    }));

    const requestData = {
      ...formState,
      items: formattedItems,
      payment_method_id: paymentMethod,
      warehouse_id: localStorage.getItem('store'),
      amount: total,
      currency_id: localStorage.getItem('currency')
    };

    await createRequest(
      "/inventories/pointsofsale",
      token,
      requestData,
      ()=> {},
      "POST",
    );

    setShowConfirmationModal(false)
      if (printReceipt) {
        setTimeout(reactToPrintFn, 300);
      }
      setCart([]);
    setShowConfirmationModal(false);
    reactToPrintFn()
  };

  return (
    <div className={`z-70 flex ${isMobile ? "flex-col" : "flex-row"} h-full bg-gray-50 ${isMobile ? "rounded-none" : "rounded-xl"} overflow-hidden`}>
      {/* Products Section */}
      <div className={`${isMobile ? "w-full" : "w-3/5"} flex flex-col border-r border-gray-200 bg-white`}>
        {/* Category Filter */}
        <div className="p-4 border-b border-gray-100">
          <CategoryNav
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isMobile={isMobile}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {paginatedItems.length > 0 ? (
            <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4"} gap-4`}>
              {paginatedItems.map((item) => (
                <PosItemCard
                  key={item.item_id}
                  image={
                    item.item_images.length > 0
                      ? `${imageURL}/${item.item_images[0]?.image_url}`
                      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
                  }
                  name={item.name}
                  item={item}
                  price={Math.floor(item.selling_price)}
                  addItem={() => addItemToCart(item)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">No items found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className={`${isMobile ? "w-full" : "w-2/5"} flex flex-col bg-gray-50 border-l border-gray-200 z-60`}>
        <div className="flex-1 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10 space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
            <div className="space-y-2">
              
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length > 0 ? (
              cart.map((item) => (
                <CartItem
                  key={item.item_id}
                  item={item}
                  updateQuantity={updateQuantity}
                  updateSellingPrice={updateSellingPrice}
                  updateDiscount={updateDiscount}
                  removeItemFromCart={removeItemFromCart}
                  isMobile={isMobile}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-1">Add items to get started</p>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="font-bold text-xl text-blue-600">
                UGX {totalAmount.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                cart.length > 0 
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Order</h2>

              <PaymentComponent
                setClientName={setCustomer}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isMobile={isMobile}
              />

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-medium">UGX {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">UGX {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className={`flex ${isMobile ? "flex-col space-y-3" : "space-x-3"} mt-8`}>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => processCheckout(false)}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Complete Order
                </button>
                <button
                  onClick={() => reactToPrintFn()} 
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Content */}
      <div ref={contentRef} className="print-content">
        <PrintableContent
          paymentMethod={paymentMethod}
          servedBy={user.full_name}
          total={total}
          cart={cart}
          businessName={businessName}
          isMobile={isMobile}
        />
        <style>
          {`
          @media print {
            .print-content { display: block !important; }
          }
          .print-content { display: none; }
        `}
        </style>
      </div>
    </div>
  );
};

export default PosModal;