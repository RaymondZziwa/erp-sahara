//@ts-nocheck
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
//import { baseURL } from "../../../utils/api";

const SupplierPerformanceReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token)
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${baseURL}/erp/inventories/reports/supplierperformancereport`,
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
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Supplier Performance Report</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">Loading....</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">Supplier Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Total Orders</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Average Delivery Time</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Fulfillment Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {item.supplier_name ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.total_orders ?? 0}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.average_delivery_time ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.fulfillment_accuracy ?? "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SupplierPerformanceReport;
