//@ts-nocheck
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
//import { baseURL } from "../../../utils/api";

const StockTakingReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token)
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `https://merp.efinanci.co.tz/api/erp/inventories/reports/stocktakingreport`,
          {
            "start_date":"2024-08-01",
            "end_date":"2024-08-24"
          }, 
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
  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-teal-500">Stock Taking Report</h2>
      <div className="overflow-x-auto">
        {
          data.length === 0 ? (
            <p className="text-gray-500">Loading....</p>
          ): (
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left py-2 px-4 border-b">Item Name</th>
              <th className="text-left py-2 px-4 border-b">Variant</th>
              <th className="text-left py-2 px-4 border-b">Warehouse</th>
              <th className="text-left py-2 px-4 border-b">Current Stock</th>
              <th className="text-left py-2 px-4 border-b">Stock Taken</th>
              <th className="text-left py-2 px-4 border-b">Discrepancy</th>
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
                <td className="py-2 px-4 border-b">{item.variant || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.warehouse || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.current_stock}</td>
                <td className="py-2 px-4 border-b">{item.stock_taken || "N/A"}</td>
                <td className="py-2 px-4 border-b">
                  {item.discrepancy !== null ? item.discrepancy : "N/A"}
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

export default StockTakingReport;
