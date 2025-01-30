//@ts-nocheck
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
//import { baseURL } from "../../../utils/api";

const StockAgingReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token)
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `https://merp.efinanci.co.tz/api/erp/inventories/reports/stockagingreport`,
          {}, 
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token.access_token}`,
            },
          }          
        );
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); 

  const formatDaysInStock = (days) => {
    return days ? `${(days * 1e10).toFixed(2)} days` : "N/A";
  };

  const getStockAgeCategory = (days) => {
    if (!days) return "Unknown";
    const daysInStock = days * 1e10; // Adjusted for readability
    if (daysInStock < 10) return "Critical";
    if (daysInStock < 30) return "Warning";
    return "Stable";
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-teal-700">Stock Aging Report</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left py-2 px-4 border-b">Warehouse Name</th>
              <th className="text-left py-2 px-4 border-b">Item Name</th>
              <th className="text-left py-2 px-4 border-b">SKU</th>
              <th className="text-left py-2 px-4 border-b">Quantity</th>
              <th className="text-left py-2 px-4 border-b">Days in Stock</th>
              <th className="text-left py-2 px-4 border-b">Stock Age Category</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100`}
              >
                <td className="py-2 px-4 border-b">{item.warehouse_name || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.item_name || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.sku || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.quantity}</td>
                <td className="py-2 px-4 border-b">{formatDaysInStock(item.days_in_stock)}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 text-sm rounded ${
                      getStockAgeCategory(item.days_in_stock) === "Critical"
                        ? "bg-red-100 text-red-700"
                        : getStockAgeCategory(item.days_in_stock) === "Warning"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {getStockAgeCategory(item.days_in_stock)}
                  </span>
                </td>
              </tr>
            )):
            data.length === 0 ? 
            <tr colSpan={6} className="text-center">No data found</tr>
            :
            <tr colSpan={6} className="text-center">Loading...</tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockAgingReport;
