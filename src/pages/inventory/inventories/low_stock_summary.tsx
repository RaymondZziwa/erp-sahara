//@ts-nocheck
import axios from "axios";
import { useState, useEffect } from "react";
import { baseURL } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const LowStockSummary = () => {
    const [data, setData] = useState([])
    const token = useSelector((state: RootState) => state.userAuth.token)

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(
              `${baseURL}/erp/reports/dashboard/getlowstockitemsummary`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Bearer ${token.access_token}`,
                },
              }
            ); 
            setData(response.data.data); // Update the state with the API data
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
        fetchData();
    }, []);
    return (
      <div className="p-4 rounded-md bg-white shadow overflow-auto w-full">
        <h2 className="text-xl font-bold mb-4">Low Stock Summary</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Current Stock</th>
              <th className="border border-gray-300 p-2">Reorder Level</th>
              {/* <th className="border border-gray-300 p-2">Store</th> */}
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((item) => (
                <tr
                  key={item.id}
                  className={
                    item.stock_status === "Out of Stock"
                      ? "bg-red-100"
                      : item.current_stock <= item.stock_alert_level
                      ? "bg-yellow-100"
                      : ""
                  }
                >
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2">
                    {item.total_stock}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.stock_alert_level || "N/A"}
                  </td>
                  {/* <td className="border border-gray-300 p-2">
                    {item.warehouse_name || "N/A"}
                  </td> */}
                  <td
                    className={`border border-gray-300 p-2 ${
                      item.stock_status === "Out of Stock"
                        ? "text-red-600 font-bold"
                        : "text-gray-600"
                    }`}
                  >
                    {item.stock_status}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
}
export default LowStockSummary