//@ts-nocheck
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import Header from "../../../components/custom/print_header";
import { useReactToPrint } from "react-to-print";
import { Icon } from "@iconify/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReorderReport = () => {
  const token = useSelector((state: RootState) => state.userAuth.token);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${baseURL}/inventories/reports/reorderreport`,
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const checkReorderStatus = (currentStock, reorderLevel) => {
    if (currentStock <= reorderLevel * 0.2)
      return { status: "Critical", class: "bg-red-100 text-red-700" };
    if (currentStock <= reorderLevel * 0.5)
      return { status: "Urgent", class: "bg-orange-100 text-orange-700" };
    if (currentStock < reorderLevel)
      return { status: "Warning", class: "bg-yellow-100 text-yellow-700" };
    return { status: "Adequate", class: "bg-green-100 text-green-700" };
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;

    const status = checkReorderStatus(
      item.current_stock,
      item.reorder_level
    ).status;
    return (
      matchesSearch &&
      ((filterStatus === "needs_reorder" && status !== "Adequate") ||
        filterStatus === status.toLowerCase())
    );
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Header title={""} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Inventory Reorder Report
          </h2>
          <p className="text-sm text-gray-600">
            Items approaching or below reorder levels
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon icon="uil:search" className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              className="pl-10 pr-4 py-2 border rounded-md text-sm w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All Items</option>
            <option value="needs_reorder">Needs Reorder</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="warning">Warning</option>
            <option value="adequate">Adequate</option>
          </select>

          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white flex gap-2 items-center justify-center"
            onClick={reactToPrintFn}
          >
            <Icon icon="solar:printer-bold" fontSize={20} />
            Print Report
          </button>
        </div>
      </div>

      <div ref={contentRef} className="p-4 print:p-0">
        <div className="hidden print:block">
          <Header title={"Inventory Reorder Report"} />
          <div className="text-sm text-gray-600 mb-4">
            {new Date().toLocaleDateString()} | Filter:{" "}
            {filterStatus === "all"
              ? "All Items"
              : filterStatus.replace(/_/g, " ")}
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
                icon="mdi:package-variant-closed-check"
                className="text-green-400 text-5xl mx-auto"
              />
              <p className="mt-3 text-gray-500">No matching items found</p>
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
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reorder Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reorder Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => {
                    const status = checkReorderStatus(
                      item.current_stock,
                      item.reorder_level
                    );
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.item_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.sku || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.current_stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.reorder_level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                          {item.recommended_reorder_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.class}`}
                          >
                            {status.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredData.length} of {data.length} items
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReorderReport;