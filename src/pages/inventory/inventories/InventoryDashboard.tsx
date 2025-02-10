import { useEffect, useState } from "react";
import LowStockSummary from "./low_stock_summary";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

export default function InventoryDashboard() {
  const storeName = "Office Store (SPICE HUB)";
  // const products = Object.keys(inventoryData);
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  const [liveFeed, setLiveFeed] = useState<any[]>([])
  const [warehouseSales, setWarehouseSales] = useState<any[]>([])
  const [salesSummary, setSalesSummary] = useState<any>()
  //const [innventorySummary, setInventorySummary] = useState<any[]>([])

  useEffect(()=> {
    const getInventorySummary = async () => {
      const response = await axios.get(`${baseURL}/erp/reports/dashboard/sales_summary`,{
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log(response)
      setSalesSummary(response.data.data)
    }

    const getWarehouseSales = async () => {
      const response = await axios.get(`${baseURL}/erp/reports/dashboard/warehousesales`,{
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log(response)
      setWarehouseSales(response.data.data)
    }

    const getLiveFeed = async () => {
      const response = await axios.get(`${baseURL}/erp/reports/dashboard/livefeeds`,{
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log(response)
      setLiveFeed(response.data.data)
    }

    getWarehouseSales()
    getLiveFeed()
    getInventorySummary()
  },[])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {storeName} Inventory Dashboard
      </h1>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Total Sales Amount</h2>
               
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-md  flex flex-col">
                  <span>Today</span>
                  <span>{salesSummary?.total_amount_collected?.today ?? 0}</span>
                </div>
                <div className="text-md  flex flex-col">
                  <span>Yesterday</span>
                  <span>{salesSummary?.total_amount_collected?.yesterday ?? 0}</span>
                </div>
              </div>
            </div>
            <div
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Sales Amount</h2>
               
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-md  flex flex-col">
                  <span>Today</span>
                  <span>{salesSummary?.total_transactions?.today ?? 0}</span>
                </div>
                <div className="text-md  flex flex-col">
                  <span>Yesterday</span>
                  <span>{salesSummary?.total_transactions?.yesterday ?? 0}</span>
                </div>
              </div>
            </div>
            <div
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Total Products Sold</h2>
               
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-md  flex flex-col">
                  <span>Today</span>
                  <span>{salesSummary?.total_products_sold?.today ?? 0}</span>
                </div>
                <div className="text-md  flex flex-col">
                  <span>Yesterday</span>
                  <span>{salesSummary?.total_products_sold?.yesterday ?? 0}</span>
                </div>
              </div>
            </div>
            <div
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Total Unique Sales</h2>
               
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-md  flex flex-col">
                  <span>Today</span>
                  <span>{salesSummary?.total_unique_sales?.today ?? 0}</span>
                </div>
                <div className="text-md  flex flex-col">
                  <span>Yesterday</span>
                  <span>{salesSummary?.total_unique_sales?.yesterday ?? 0}</span>
                </div>
              </div>
            </div>
      </div>

      {/* Inventory Table */}
      <div className="flex flex-row gap-2 justify-center overflow-auto h-[360px]">
      <LowStockSummary />

      <div className="bg-white shadow rounded-lg p-4 w-1/2">
        <h2 className="text-lg font-bold mb-4">Warehouse Sales</h2>
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {warehouseSales.map((sale) => {
              return (
                <tr key={sale} className="border-b">
                  <td className="py-2 px-4 font-medium">{sale.warehouse_name}</td>
                  <td className="py-2 px-4">{sale.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
      <div className="bg-white shadow rounded-lg w-full p-4 mt-4">
        <h2 className="text-lg font-bold mb-4">Live feed</h2>
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
            {liveFeed.length > 0 ? liveFeed.map((feed: any) => {
              return (
                <tr key={feed.movement_id} className="border-b">
                  <td className="py-2 px-4 font-medium">{feed.item_name}</td>
                  <td className="py-2 px-4">{feed.quantity}</td>
                  <td className="py-2 px-4">{feed.stock_status}</td>
                  <td className="py-2 px-4">{feed.warehouse_name}</td>
                  <td className="py-2 px-4">{feed.type}</td>
                  <td className="py-2 px-4">{feed.created_at}</td>
                </tr>
              );
            }):
              <tr>
                <td colSpan={6} className="py-2 px-4 text-center">No live feed</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
