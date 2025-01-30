//@ts-nocheck
import { useEffect, useState } from "react";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import LowStockSummary from "./low_stock_summary";

const Dashboard = () => {
  const token = useSelector((state: RootState) => state.userAuth.token)
  const [data, setData] = useState([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/erp/reports/dashboard/inventory-summary`, {
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Bearer ${token.access_token}`,
                },    
        }); 
        setData(response.data.data); // Update the state with the API data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Group data by warehouses
  const groupByWarehouse = (data) => {
    if (!Array.isArray(data)) return {}; // Ensure data is an array
    return data.reduce((acc, item) => {
      const warehouse = item.warehouse_name;
      if (!acc[warehouse]) {
        acc[warehouse] = [];
      }
      acc[warehouse].push(item);
      return acc;
    }, {});
  };

  const warehouses = groupByWarehouse(data);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Stock Dashboard</h1>
      {Object.keys(warehouses).map((warehouse, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-teal-500">
            {warehouse}
          </h2>
          <div className="overflow-x-auto">
            <table className="bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Item Name</th>
                  <th className="py-3 px-6 text-center">Total Received</th>
                  <th className="py-3 px-6 text-center">Transferred In</th>
                  <th className="py-3 px-6 text-center">Transferred Out</th>
                  <th className="py-3 px-6 text-center">Total Sold</th>
                  <th className="py-3 px-6 text-center">Written Off</th>
                  <th className="py-3 px-6 text-center">Available Stock</th>
                  <th className="py-3 px-6 text-center">Reorder Level</th>
                  <th className="py-3 px-6 text-center">Backorder</th>
                  <th className="py-3 px-6 text-center">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {warehouses[warehouse].map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-6 text-left">{item.item_name}</td>
                    <td className="py-3 px-6 text-center">
                      {item.total_received}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.received_quantity}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.total_transferred_out}
                    </td>
                    <td className="py-3 px-6 text-center">{item.total_sold}</td>
                    <td className="py-3 px-6 text-center">
                      {item.total_written_off}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.available_quantity}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.reorder_level}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.on_backorder}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.expiry_date ? item.expiry_date : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <LowStockSummary />
    </div>
  );
};

export default Dashboard;
