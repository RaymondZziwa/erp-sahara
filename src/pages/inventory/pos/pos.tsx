import { ShoppingCart, Search, Warehouse, Coins, User, LogOut, Filter, Package, CreditCard } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { toast, ToastContainer } from "react-toastify";
import useItems from "../../../hooks/inventory/useItems";
import useWarehouses from "../../../hooks/inventory/useWarehouses";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { RootState } from "../../../redux/store";
import { apiRequest } from "../../../utils/api";
import CartItem from "./cart_item";
import { PosItemCard } from "./item_card";
import CategoryNav from "./nav/category_filter";
import { PaymentComponent } from "./payment_component";
import { PrintableContent } from "./receipt";
import SuspendedSalesModal from "./suspendedSalesModal";

interface CartItemType {
  id: number;
  item_id: number;
  name: string;
  selling_price: string;
  actual_selling_price: number;
  quantity: number;
  discount: number;
  unit_of_measure?: {
    abbreviation: string;
  };
  item_images: Array<{
    image_url: string;
  }>;
}


const PosPage = () => {
  const navigate = useNavigate();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [warehouseError, setWarehouseError] = useState("");
  const [currencyError, setCurrencyError] = useState("");
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);
  const suspendedSales = JSON.parse(localStorage.getItem("suspendedSales")) || [];

  useEffect(() => {
    const checkSelections = () => {
      const hasWarehouse = localStorage.getItem("selectedWarehouse");
      const hasCurrency = localStorage.getItem("selectedCurrency");
      
      if (!hasWarehouse || !hasCurrency) {
        setShowSelectionModal(true);
      }
    };

    checkSelections();
  }, []);

  const handleSelectSale = (sale) => {
    console.log("Selected suspended sale:", sale);
    setCart(sale.items);
    setIsSuspendedModalOpen(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currency');
    localStorage.removeItem('warehouse');
    navigate('/');
  };

  const {data: items} = useItems()
  const [selectedCategory, setSelectedCategory] = useState<number | string>(0);
  const [customer, setCustomer] = useState<string | number | null>(null);
  const [searchedItems, setSearchedItems] = useState<CartItemType[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [query, setQuery] = useState("");
  const user = JSON.parse(localStorage.getItem('user') ?? '')
  const businessName = user?.user?.organisation?.organisation_name;
  const { data: warehouses } = useWarehouses()
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  const {data: currencies} = useCurrencies()
  const [warehouse, setWarehouse] = useState(() => localStorage.getItem("selectedWarehouse") || "");
  const [currency, setCurrency] = useState(() => localStorage.getItem("selectedCurrency") || "");
  const [paymentMethod, setPaymentMethod] = useState<string | null>("");

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setWarehouse(value);
    localStorage.setItem("selectedWarehouse", value);
    if (value) setWarehouseError("");

  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCurrency(value);
    localStorage.setItem("selectedCurrency", value);
    if (value) setCurrencyError("");
  };

  const validateSelections = () => {
    let isValid = true;
    
    if (!warehouse) {
      setWarehouseError("Please select a warehouse");
      isValid = false;
    }
    
    if (!currency) {
      setCurrencyError("Please select a currency");
      isValid = false;
    }
    
    return isValid;
  };

  const confirmSelections = () => {
    if (validateSelections()) {
      setShowSelectionModal(false);
    }
  };


  const isMobile = window.innerWidth < 768;

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const suspendSale = () => {
    const payload = {
      cashier_id: user.user.id,
      cashier_name: `${user.user.first_name} ${user.user.last_name}`,
      customer_id: 0,
      customer_name: customer || "",
      warehouse_id: localStorage.getItem("selectedWarehouse"),
      items: cart.map(item => ({
        item_id: item.id.toString(),
        name: item.name,
        actual_selling_price: Math.floor(+item.selling_price),
        quantity: item.quantity,
        discount: item.discount
      })),
      payment_method_id: paymentMethod || "db1c6e65-ca5d-4637-9edb-1e56f189145c",
      amount_paid: 0,
      sale_date: new Date().toLocaleDateString("en-US"),
      currency_id: localStorage.getItem("selectedCurrency"),
      amount: totalAmount
    };
  
    // --- Save to localStorage ---
    const existingSuspended = JSON.parse(localStorage.getItem("suspendedSales")) || [];
    existingSuspended.push(payload);
    localStorage.setItem("suspendedSales", JSON.stringify(existingSuspended));
  
    toast.success("Sale suspended successfully!");
    setShowConfirmationModal(false);
    setCart([])
  };
  

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== 0) {
      result = result.filter(
        (item) => item.
        item_category_id
         === selectedCategory
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
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
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
        item.quantity * parseFloat(item.actual_selling_price.toString()) -
        item.discount * item.quantity
      );
    }, 0);
    setTotal(result);
    return result;
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items to checkout.");
      return;
    }
    setShowConfirmationModal(true);
  };

  const processCheckout = async (printReceipt: boolean) => {

    const payload = {
      cashier_id: user.user.id, // Assuming this is the correct path to user ID
      cashier_name: `${user.user.first_name} ${user.user.last_name}`,
      customer_id: 0, // Default value as shown in example
      customer_name: customer || "", // Use entered customer name or empty string
      warehouse_id: localStorage.getItem("selectedWarehouse"), // You may want to make this dynamic
      items: cart.map(item => ({
        item_id: item.id.toString(),
        quantity: item.quantity,
        discount: item.discount
      })),
      payment_method_id: paymentMethod || "db1c6e65-ca5d-4637-9edb-1e56f189145c", // Default or selected
      amount_paid: 0, // You may want to calculate this if taking partial payments
      sale_date: new Date().toLocaleDateString('en-US'), // Format as "6/24/2025"
      currency_id: localStorage.getItem("selectedCurrency"), // You may want to make this dynamic
      amount: totalAmount // The calculated total
    };
  
    try {
      // Your existing API call logic would go here
      // await createRequest("/inventories/pointsofsale", token, requestData, () => {}, "POST");
      await apiRequest(
        "/inventories/pointsofsale",
        "POST",
        token,
        payload,
      );
      // Show success message
      toast.success("Order completed successfully!");
      
      // Handle printing after a short delay to ensure DOM is updated
      if (printReceipt) {
        setTimeout(() => {
          if (contentRef.current) {
            reactToPrintFn()
                  // Clear the cart and close modal first
            setCart([]);
            setShowConfirmationModal(false);
      
          }
        }, 500);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">

{showSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Required Settings
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Please select a warehouse and currency to continue using the POS system.
            </p>

            <div className="space-y-6">
              {/* Warehouse Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse
                </label>
                <select
                  value={warehouse}
                  onChange={handleWarehouseChange}
                  className={`w-full p-3 border rounded-md  ${
                    warehouseError ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {warehouseError && (
                  <p className="mt-1 text-sm text-red-600">{warehouseError}</p>
                )}
              </div>

              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={handleCurrencyChange}
                  className={`w-full p-3 border rounded-md  ${
                    currencyError ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select currency</option>
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {currencyError && (
                  <p className="mt-1 text-sm text-red-600">{currencyError}</p>
                )}
              </div>

              <button
                onClick={confirmSelections}
                className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-800 text-white rounded-xl font-medium transition-all transform hover:scale-105 mt-4"
              >
                Confirm Selections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <ToastContainer />
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">POS</h1>
              {/* <p className="text-sm text-gray-500">{businessName}</p> */}
            </div>
          </div>

          {/* Search + Dropdowns */}
          <div className="flex-1 max-w-2xl mx-8 flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Warehouse Dropdown */}
            <div className="flex items-center space-x-2">
              <Warehouse className="w-5 h-5 text-gray-500" />
              <select
                value={warehouse}
                onChange={handleWarehouseChange}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="" disabled>Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Currency Dropdown */}
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-gray-500" />
              <select
                value={currency}
                onChange={handleCurrencyChange}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="" disabled>Select currency</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Section: Date, User, Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user.user.first_name} {user.user.last_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} h-[calc(100vh-80px)]`}>
        {/* Products Section */}
        <div className={`${isMobile ? "w-full" : "w-3/5"} flex flex-col bg-white border-r border-gray-200`}>
          {/* Category Filter */}
          <div className="p-6 border-b border-gray-100">
          <div className="mb-6">
            {/* Suspended Sales (Clickable) */}
            <button
              onClick={() => setIsSuspendedModalOpen(true)}
              className="text-md font-medium text-teal-600 hover:underline mb-1 block"
            >
              Suspended Sales (<span className="text-red-500">{suspendedSales.length}</span>)
            </button>

            {/* Products + Filter Row */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Products</h2>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Filter className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              isMobile={isMobile}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {paginatedItems.length > 0 ? (
              <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4"} gap-6`}>
                {paginatedItems.map((item) => (
                  <PosItemCard
                    key={item.item_id}
                    image=""
                    name={item.name}
                    item={item}
                    price={Math.floor(+item.selling_price)}
                    addItem={() => addItemToCart(item)}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Package className="w-16 h-16 mb-4" />
                <p className="text-lg">No items found</p>
                <p className="text-sm">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className={`${isMobile ? "w-full" : "w-2/5"} flex flex-col bg-gradient-to-b from-gray-50 to-white`}>
          <div className="flex-1 flex flex-col">
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
                <div className="bg-teal-100 text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
                  {cart.length} items
                </div>
              </div>
              <p className="text-sm text-gray-600">Review your order before checkout</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-1">Add items to get started</p>
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Total Amount:</span>
                  <span className="font-bold text-2xl text-teal-600">
                    UGX {totalAmount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    cart.length > 0 
                      ? "bg-teal-500 hover:bg-teal-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {cart.length > 0 ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Proceed to Checkout</span>
                    </div>
                  ) : (
                    "Add items to checkout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Confirm Order</h2>

              <PaymentComponent
                setClientName={setCustomer}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isMobile={isMobile}
              />

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>UGX {((item.quantity * item.actual_selling_price) - (item.discount * item.quantity)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-gray-100">
                  <span>Total:</span>
                  <span className="text-teal-600">UGX {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className={`flex ${isMobile ? "flex-col space-y-3" : "space-x-3"} mt-8`}>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium mb-3 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => suspendSale()}
                  className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-800 mb-3 transition-colors"
                >
                  Suspend
                </button>
                <button
                  onClick={() => processCheckout(false)}
                  className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-800 mb-3 transition-colors"
                >
                  Complete Order
                </button>
                <button
                  onClick={() => processCheckout(true)}
                  className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-800 mb-3 transition-colors"
                >
                  Complete & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Content */}
        <div ref={contentRef} className="print-content"> {/* Add this wrapper */}
          <PrintableContent
            paymentMethod={paymentMethod}
            servedBy={user.full_name}
            total={totalAmount}
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
      <SuspendedSalesModal isOpen={isSuspendedModalOpen} onClose={() => setIsSuspendedModalOpen(false)} suspendedSales={suspendedSales} onSelectSale={handleSelectSale}/>
    </div>
  );
};

export default PosPage