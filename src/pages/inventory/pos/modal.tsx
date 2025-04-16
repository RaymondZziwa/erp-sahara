//@ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import PosItemCard from "./item_card";
import CartItem from "./cart_item";
import CategoryNav from "./nav/category_filter";
import { toast } from "react-toastify";
import { createRequest } from "../../../utils/api";
import { useReactToPrint } from "react-to-print";
import { PrintableContent } from "./receipt";
import PaymentComponent from "./payment_component";
import { useWindowSize } from "../../../hooks/useWindowSize";
import useItems from "../../../hooks/inventory/useItems";

interface Props {
  query: string;
}

const PosModal: React.FC<Props> = ({ query }) => {
  //const items = useSelector((state: RootState) => state.inventoryItems.data);
  const {data: items, refresh: getItems} = useItems()

  useEffect(()=> {
    if(!items) {
      getItems()
    }
  }, [])

  const businessName = 'Spice hub'
  // const businessName = useSelector(
  //   (state: RootState) => state.userAuth.organisation.organisation_name
  // );
  const [selectedCategory, setSelectedCategory] = useState<number | string>(0);
  const [customer, setCustomer] = useState<string | number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null);
  const [searchedItems, setSearchedItems] = useState<CartItemType[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
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

  // Filter items by category
  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== 0) {
      result = result.filter(
        (item) => item.item_category_id === selectedCategory
      );
    }
    return result;
  }, [items, selectedCategory]);

  // Apply search filter to category-filtered items
useEffect(() => {
  if (query.trim() !== "") {
    const result = items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchedItems(result);
  } else {
    // When search is empty, show items filtered by category only
    setSearchedItems(filteredItems);
  }
}, [query, items, filteredItems]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(searchedItems.length / itemsPerPage);
  const paginatedItems = searchedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cart functions
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
    //if (quantity < 1) return;
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

  // Calculate total
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

  // Checkout functions
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warn("Cart is empty. Please add items to checkout.");
      return;
    }
    setShowConfirmationModal(true);
  };

  const processCheckout = async (printReceipt: boolean) => {
    const formattedItems = cart.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
      discount: item.discount,
    }));

    const requestData = {
      ...formState,
      items: formattedItems,
    };

    const response = await createRequest(
      "/erp/inventories/pointsofsale",
      token,
      requestData,
      "POST"
    );

    if (response.success) {
      toast.success("Sale completed successfully!");
      if (printReceipt) {
        setTimeout(reactToPrintFn, 300);
      }
      setCart([]);
      setShowConfirmationModal(false);
    } else {
      toast.error("Error processing sale. Please try again.");
    }
  };

    return (
      <div
        className={`flex ${
          isMobile ? "flex-col" : "flex-row"
        } h-full bg-gray-50 ${
          isMobile ? "rounded-none" : "rounded-lg"
        } shadow-lg overflow-hidden`}
      >
        {/* Products Section */}
        <div
          className={`${
            isMobile ? "w-full" : "w-3/5"
          } flex flex-col border-r border-gray-200 bg-white`}
        >
          {/* Category Filter - Mobile optimized */}
          <div className={`p-${isMobile ? "2" : "4"} border-b`}>
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              isMobile={isMobile}
            />
          </div>

          {/* Products Grid - Responsive columns */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div
              className={`grid ${
                isMobile ? "grid-cols-2" : "grid-cols-3 md:grid-cols-4"
              } gap-2 sm:gap-4`}
            >
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <PosItemCard
                    key={item.item_id}
                    image={
                      item.item_images.length > 0
                        ? `https://saharaauth.efinanci.com/storage/${item.item_images[0]?.image_url}`
                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' fill='%236b7280' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ENo Photo%3C/text%3E%3C/svg%3E"
                    }
                    name={item.name}
                    item={item}
                    price={Math.floor(item.selling_price)}
                    addItem={() => addItemToCart(item)}
                    isMobile={isMobile}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No items found
                </div>
              )}
            </div>
          </div>

          {/* Pagination - Mobile optimized */}
          {totalPages > 1 && (
            <div
              className={`p-${
                isMobile ? "2" : "4"
              } border-t bg-white sticky bottom-0`}
            >
              <div className="flex justify-center items-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 rounded-l-md disabled:opacity-50 text-sm sm:text-base"
                >
                  Previous
                </button>
                <span className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 text-sm sm:text-base">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 rounded-r-md disabled:opacity-50 text-sm sm:text-base"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Section - Mobile optimized */}
        <div
          className={`${
            isMobile ? "w-full" : "w-2/5"
          } flex flex-col bg-gray-50 border-t ${
            isMobile ? "" : "border-l"
          } border-gray-200`}
        >
          <div className="flex-1 flex flex-col">
            {/* Cart Header */}
            <div
              className={`p-${
                isMobile ? "2" : "4"
              } border-b bg-white sticky top-0 z-10`}
            >
              <h2 className={`font-bold ${isMobile ? "text-md" : "text-lg"}`}>
                Order Summary
              </h2>
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3">
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
                <div className="text-center py-8 text-gray-500">
                  Your cart is empty
                </div>
              )}
            </div>

            {/* Fixed Footer - Mobile optimized */}
            <div
              className={`p-${
                isMobile ? "2" : "4"
              } border-t bg-white sticky bottom-0`}
            >
              <div
                className={`flex justify-between items-center mb-${
                  isMobile ? "2" : "4"
                }`}
              >
                <span className={`font-semibold ${isMobile ? "text-sm" : ""}`}>
                  Total:
                </span>
                <span
                  className={`font-bold ${isMobile ? "text-md" : "text-lg"}`}
                >
                  UGX {totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full ${
                  isMobile ? "py-2" : "py-3"
                } bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm sm:text-base`}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal - Mobile optimized */}
        {showConfirmationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div
              className={`bg-white rounded-lg ${
                isMobile ? "w-full" : "max-w-md"
              } max-h-[90vh] overflow-y-auto`}
            >
              <div className="p-4 sm:p-6">
                <h2
                  className={`${
                    isMobile ? "text-lg" : "text-xl"
                  } font-bold mb-${isMobile ? "2" : "4"}`}
                >
                  Confirm Order
                </h2>

                {/* Client and Payment Selection - Mobile optimized */}
                <PaymentComponent
                  setClientName={setCustomer}
                  setPaymentMethod={setPaymentMethod}
                  isMobile={isMobile}
                />

                {/* Order Summary */}
                <div className={`mb-${isMobile ? "4" : "6"}`}>
                  <h3
                    className={`font-semibold mb-${isMobile ? "1" : "2"} ${
                      isMobile ? "text-sm" : ""
                    }`}
                  >
                    Order Items ({cart.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className={`flex justify-between py-${
                          isMobile ? "1" : "2"
                        } border-b`}
                      >
                        <span
                          className={`truncate ${
                            isMobile ? "max-w-[120px]" : "max-w-xs"
                          } text-sm sm:text-base`}
                        >
                          {item.name} × {item.quantity}
                        </span>
                        <span className={`font-medium text-sm sm:text-base`}>
                          UGX{" "}
                          {(
                            item.quantity *
                              parseFloat(item.actual_selling_price) -
                            item.discount
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`flex justify-between mt-${
                      isMobile ? "2" : "4"
                    } pt-${isMobile ? "1" : "2"} border-t font-bold`}
                  >
                    <span className={isMobile ? "text-sm" : ""}>Total:</span>
                    <span className={isMobile ? "text-md" : "text-lg"}>
                      UGX {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Stacked on mobile */}
                <div
                  className={`flex ${
                    isMobile ? "flex-col" : "space-x-3"
                  } space-y-2 ${isMobile ? "" : "space-y-0"}`}
                >
                  <button
                    onClick={() => setShowConfirmationModal(false)}
                    className={`${
                      isMobile ? "w-full" : "flex-1"
                    } py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm sm:text-base`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => processCheckout(false)}
                    className={`${
                      isMobile ? "w-full" : "flex-1"
                    } py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base`}
                  >
                    Complete Order
                  </button>
                  <button
                    onClick={() => processCheckout(true)}
                    className={`${
                      isMobile ? "w-full" : "flex-1"
                    } py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base`}
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
