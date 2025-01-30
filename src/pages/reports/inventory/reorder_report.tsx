//@ts-nocheck
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
//import { baseURL } from "../../../utils/api";

const ReorderReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token)
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `https://merp.efinanci.co.tz/api/erp/inventories/reports/reorderreport`,
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
  
  const checkReorderStatus = (currentStock, reorderLevel) => {
    if (currentStock < reorderLevel) return "Needs Reorder";
    return "Sufficient Stock";
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-teal-500">Reorder Report</h2>
      <div className="overflow-x-auto">
        {
          data.length === 0 ? (
            <p className="text-gray-500">Loading....</p>
          ): (
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left py-2 px-4 border-b">Item Name</th>
              <th className="text-left py-2 px-4 border-b">SKU</th>
              <th className="text-left py-2 px-4 border-b">Current Stock</th>
              <th className="text-left py-2 px-4 border-b">Reorder Level</th>
              <th className="text-left py-2 px-4 border-b">
                Recommended Reorder Quantity
              </th>
              <th className="text-left py-2 px-4 border-b">Reorder Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100`}
              >
                <td className="py-2 px-4 border-b">{item.item_name || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.sku || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.current_stock}</td>
                <td className="py-2 px-4 border-b">{item.reorder_level}</td>
                <td className="py-2 px-4 border-b">
                  {item.recommended_reorder_quantity}
                </td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 text-sm rounded ${
                      checkReorderStatus(
                        item.current_stock,
                        item.reorder_level
                      ) === "Needs Reorder"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {checkReorderStatus(item.current_stock, item.reorder_level)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          )
        }
      </div>
    </div>
  );
};

export default ReorderReport;
