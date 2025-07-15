
import React, { useEffect, useState } from "react";
import Select from "react-select";
import useWarehouses from "../../../../hooks/inventory/useWarehouses";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
interface props {
  onClose: () => void,
  onSearch: (e) => void
}

const PosNavbar: React.FC<props> = ({ onClose, onSearch }) => {
      const { data } = useWarehouses()
      const { data: currencies } = useCurrencies()
    const [currencyOptions, setCurrencyOptions] = useState([])
    const [stores, setStores] = useState([])
    const [selectedStore, setSelectedStore] = useState(null)
    const [selectedCurrency, setSelectedCurrency] = useState(null)
    useEffect(()=> {
      const storeOptions = data?.map(store => ({
        value: store.id,
        label: store.name,
      }));
      setStores(storeOptions)
    }, [data])
  
    useEffect(()=> {
      const options = currencies?.map(store => ({
        value: store.id,
        label: store.name,
      }));
      setCurrencyOptions(options)
    }, [currencies])
    
  const handleStoreChange = (option: any) => {
      localStorage.setItem('store', option.value)
      setSelectedStore(option.value);
    }
  
  const handleCurrencyChange = (option: any) => {
    localStorage.setItem('currency', option.value)
      setSelectedCurrency(option.value);
    }
  
  return (
    <nav className="flex flex-col md:flex-row items-center justify-between text-white bg-gray-200 p-4 shadow-md mt-1 space-y-4 md:space-y-0 z-100">
      {/* POS Name and Search Input */}
      <div className="flex flex-col md:flex-row items-center w-full md:w-auto gap-3">
        <h1 className="text-lg font-bold text-black">POS</h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search item..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full md:w-[500px] px-3 py-2 rounded-md text-gray-700 outline-none mt-2 md:mt-0 md:ml-4"
        />
        <Select
                        options={stores}
                        value={stores?.find((option) => option.value === selectedStore?.value)}
                        onChange={handleStoreChange}
                        placeholder="Select warehouse..."
                        classNamePrefix="react-select"
                      />
                      <Select
                        options={currencyOptions}
                        value={currencyOptions?.find((option) => option.value === selectedCurrency?.value)}
                        onChange={handleCurrencyChange}
                        placeholder="Select currency..."
                        classNamePrefix="react-select"
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
