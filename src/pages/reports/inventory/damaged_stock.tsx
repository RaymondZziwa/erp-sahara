import axios from "axios";
import { useEffect, useState } from "react";
//import { baseURL } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const DamagedStockReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token)
  const [data, setData] = useState([
    {
        "supplier_name": null,
        "total_orders": 0,
        "average_delivery_time": null,
        "fulfillment_accuracy": null
    },
    {
        "supplier_name": null,
        "total_orders": 0,
        "average_delivery_time": null,
        "fulfillment_accuracy": null
    },
    {
        "supplier_name": null,
        "total_orders": 0,
        "average_delivery_time": null,
        "fulfillment_accuracy": null
    }
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `https://merp.efinanci.co.tz/api/inventories/reports/supplierperformancereport`,
          {}, 
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `${token}`, 
            },
          }
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); 
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Damaged Stock Report</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
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

export default DamagedStockReport;
