import { useEffect, useState } from "react";
import LowStockSummary from "./low_stock_summary";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

export default function InventoryDashboard() {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [warehouseSales, setWarehouseSales] = useState<any[]>([]);
  const [salesSummary, setSalesSummary] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, warehouseRes, liveFeedRes] = await Promise.all([
          axios.get(`${baseURL}/reports/dashboard/sales_summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseURL}/reports/dashboard/warehousesales`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseURL}/reports/dashboard/livefeeds`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSalesSummary(salesRes.data.data);
        setWarehouseSales(warehouseRes.data.data);
        setLiveFeed(liveFeedRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">
        Inventory Dashboard
      </h1>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Total Sales Amount", key: "total_amount_collected" },
          { title: "Sales Amount", key: "total_transactions" },
          { title: "Total Products Sold", key: "total_products_sold" },
          { title: "Total Unique Sales", key: "total_unique_sales" },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white shadow rounded-lg p-4 flex flex-col"
          >
            <h2 className="text-lg font-bold">{item.title}</h2>
            <div className="flex flex-row justify-between mt-2">
              <div className="text-md flex flex-col">
                <span>Today</span>
                <span>{salesSummary?.[item.key]?.today ?? 0}</span>
              </div>
              <div className="text-md flex flex-col">
                <span>Yesterday</span>
                <span>{salesSummary?.[item.key]?.yesterday ?? 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Table Section */}
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <LowStockSummary />

        <div className="bg-white shadow rounded-lg p-4 w-full md:w-1/2 overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Warehouse Sales</h2>
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {warehouseSales.map((sale) => (
                <tr key={sale.warehouse_name} className="border-b">
                  <td className="py-2 px-4 font-medium">
                    {sale.warehouse_name}
                  </td>
                  <td className="py-2 px-4">{sale.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Feed Table */}
      <div className="bg-white shadow rounded-lg w-full p-4 mt-4 overflow-x-auto">
        <h2 className="text-lg font-bold mb-4">Live Feed</h2>
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="py-2 px-4">Product</th>
              <th className="py-2 px-4">Quantity</th>
              <th className="py-2 px-4">Stock Status</th>
              <th className="py-2 px-4">Warehouse</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {liveFeed.length > 0 ? (
              liveFeed.map((feed) => (
                <tr key={feed.movement_id} className="border-b">
                  <td className="py-2 px-4 font-medium">{feed.item_name}</td>
                  <td className="py-2 px-4">{feed.quantity}</td>
                  <td className="py-2 px-4">{feed.stock_status}</td>
                  <td className="py-2 px-4">{feed.warehouse_name}</td>
                  <td className="py-2 px-4">{feed.type}</td>
                  <td className="py-2 px-4">{feed.created_at}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-2 px-4 text-center">
                  No live feed available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
