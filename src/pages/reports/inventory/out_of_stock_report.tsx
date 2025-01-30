//@ts-nocheck
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";

const OutOfStockReport = () => {
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

  const outOfStockItems = data.filter((item) => item.quantity <= 0);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Out of Stock Report</h2>
      {outOfStockItems.length === 0 ? (
        <p className="text-gray-500">No data found</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">Warehouse Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">SKU</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Received At</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Days in Stock</th>
            </tr>
          </thead>
          <tbody>
            {outOfStockItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {item.warehouse_name ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.item_name ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.sku ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-red-500">
                  {item.quantity ?? 0}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.received_at ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.days_in_stock
                    ? Number(item.days_in_stock).toFixed(2)
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OutOfStockReport;