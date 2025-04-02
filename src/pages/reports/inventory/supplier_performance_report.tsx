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

const SupplierPerformanceReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${baseURL}/erp/inventories/reports/supplierperformancereport`,
          {
            ...(startDate && {
              start_date: startDate.toISOString().split("T")[0],
            }),
            ...(endDate && { end_date: endDate.toISOString().split("T")[0] }),
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
  }, [startDate, endDate]);

  const filteredData = data.filter((supplier) =>
    supplier.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerformanceRating = (accuracy, deliveryTime) => {
    if (!accuracy || !deliveryTime)
      return { rating: "N/A", class: "bg-gray-100 text-gray-700" };

    const accuracyScore = parseFloat(accuracy);
    const deliveryScore =
      parseFloat(deliveryTime) <= 3
        ? 1
        : parseFloat(deliveryTime) <= 7
        ? 0.8
        : 0.5;
    const totalScore = accuracyScore * 0.7 + deliveryScore * 0.3;

    if (totalScore >= 0.9)
      return { rating: "Excellent", class: "bg-green-100 text-green-700" };
    if (totalScore >= 0.7)
      return { rating: "Good", class: "bg-blue-100 text-blue-700" };
    if (totalScore >= 0.5)
      return { rating: "Average", class: "bg-yellow-100 text-yellow-700" };
    return { rating: "Poor", class: "bg-red-100 text-red-700" };
  };

  const formatDeliveryTime = (time) => {
    if (!time) return "N/A";
    return `${time} days`;
  };

  const formatAccuracy = (accuracy) => {
    if (!accuracy) return "N/A";
    return `${(accuracy * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Header title={""} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Supplier Performance Analysis
          </h2>
          <p className="text-sm text-gray-600">
            Supplier reliability and delivery metrics
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

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon icon="uil:search" className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers..."
              className="pl-10 pr-4 py-2 border rounded-md text-sm w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white flex gap-2 items-center justify-center"
            onClick={() => reactToPrintFn()}
          >
            <Icon icon="solar:printer-bold" fontSize={20} />
            Print
          </button>
        </div>
      </div>

      <div ref={contentRef} className="p-4 print:p-0">
        <div className="hidden print:block">
          <Header title={"Supplier Performance Report"} />
          <div className="text-sm text-gray-600 mb-4">
            {startDate && endDate
              ? `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : "All available data"}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Icon
                icon="mdi:account-tie-remove"
                className="text-gray-400 text-5xl mx-auto"
              />
              <p className="mt-3 text-gray-500">No supplier data found</p>
              <p className="text-sm text-gray-400">
                Adjust your filters or search term
              </p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Delivery Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fulfillment Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((supplier, index) => {
                    const performance = getPerformanceRating(
                      supplier.fulfillment_accuracy,
                      supplier.average_delivery_time
                    );
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {supplier.supplier_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {supplier.total_orders || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDeliveryTime(supplier.average_delivery_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAccuracy(supplier.fulfillment_accuracy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${performance.class}`}
                          >
                            {performance.rating}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredData.length} of {data.length} suppliers
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierPerformanceReport;
