//@ts-nocheck
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import Header from "../../../components/custom/print_header";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
//import { baseURL } from "../../../utils/api";

const StockTakingReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token)
  const [data, setData] = useState([])

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${baseURL}/inventories/reports/stocktakingreport`,
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
    <div className="bg-white p-3">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={() => reactToPrintFn()}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      <div ref={contentRef} className="p-4">
        <div className="flex flex-row justify-centeritems-center">
          <Header title={"Stock Taking Report"} />
        </div>
        <div className="overflow-x-auto">
          {data.length === 0 ? (
            <p className="text-gray-500">Loading....</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-left py-2 px-4 border-b">Item Name</th>
                  <th className="text-left py-2 px-4 border-b">Variant</th>
                  <th className="text-left py-2 px-4 border-b">Warehouse</th>
                  <th className="text-left py-2 px-4 border-b">
                    Current Stock
                  </th>
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
                    <td className="py-2 px-4 border-b">
                      {item.item_name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {item.variant || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {item.warehouse || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">{item.current_stock}</td>
                    <td className="py-2 px-4 border-b">
                      {item.stock_taken || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {item.discrepancy !== null ? item.discrepancy : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockTakingReport;
