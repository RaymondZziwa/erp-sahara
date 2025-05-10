//@ts-nocheck
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import Header from "../../../components/custom/print_header";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OutOfStockReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filterWarehouse, setFilterWarehouse] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${baseURL}/inventories/reports/outofstockreport`,
          {
            ...(startDate && {
              start_date: startDate.toISOString().split("T")[0],
            }),
            ...(endDate && { end_date: endDate.toISOString().split("T")[0] }),
            ...(filterWarehouse && { warehouse: filterWarehouse }),
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, filterWarehouse]);

  const outOfStockItems = data.filter((item) => item.quantity <= 0);
  const warehouses = [
    ...new Set(data.map((item) => item.warehouse_name).filter(Boolean)),
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDaysInStock = (days) => {
    if (days === null || days === undefined) return "N/A";
    return `${Math.round(days * 100) / 100} days`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Header title={"Out of Stock Report"} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800"></h2>
          <p className="text-sm text-gray-600">
            Items with zero or negative inventory levels
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="border rounded px-3 py-1 text-sm w-32"
              placeholderText="Start date"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="border rounded px-3 py-1 text-sm w-32"
              placeholderText="End date"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Warehouse:
            </label>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="border rounded px-3 py-1 text-sm w-40"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse} value={warehouse}>
                  {warehouse}
                </option>
              ))}
            </select>
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white flex gap-2 items-center justify-center"
            onClick={reactToPrintFn}
          >
            <Icon icon="solar:printer-bold" fontSize={20} />
            Print
          </button>
        </div>
      </div>

      <div ref={contentRef} className="p-4 print:p-0">
        <div className="hidden print:block">
          <Header title={"Out of Stock Report"} />
          <div className="text-sm text-gray-600 mb-4">
            {startDate && endDate
              ? `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : "All available data"}
            {filterWarehouse && ` | Warehouse: ${filterWarehouse}`}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : outOfStockItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Icon
                icon="mdi:package-variant-check"
                className="text-green-400 text-5xl mx-auto"
              />
              <p className="mt-3 text-gray-500">No out of stock items found</p>
              <p className="text-sm text-gray-400">
                All items are currently in stock
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Since
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outOfStockItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.warehouse_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.item_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                      {item.quantity ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.received_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDaysInStock(item.days_in_stock)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {outOfStockItems.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {outOfStockItems.length} out of stock items
          </div>
        )}
      </div>
    </div>
  );
};

export default OutOfStockReport;
