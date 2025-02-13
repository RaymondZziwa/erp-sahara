import { useEffect, useState } from "react";
import LowStockSummary from "./low_stock_summary";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface ProductData {
  totalReceived: number;
  totalTransferredIn: number;
  totalTransferredOut: number;
  totalSold: number;
  totalWrittenOff: number;
  availableStock: number;
  received_quantity: number;
  damaged_quantity: number;
  available_quantity: number;
  reorder_level: number;
  revenue?: number,
  on_backorder: number;
  expiry_date: string | null;
}

interface InventoryData {
  [product: string]: {
    [store: string]: ProductData;
  };
}

const inventoryData: InventoryData = {
  "Aligator Pepper": {
    "Office Store (SPICE HUB)": {
      totalReceived: 0,
      totalTransferredIn: 0,
      totalTransferredOut: 0,
      totalSold: 0,
      totalWrittenOff: 0,
      availableStock: 0,
      received_quantity: 5,
      damaged_quantity: 0,
      available_quantity: 5,
      reorder_level: 10,
      revenue: 56000,
      on_backorder: 0,
      expiry_date: null,
    },
  },
  Basil: {
    "Office Store (SPICE HUB)": {
      totalReceived: 0,
      totalTransferredIn: 0,
      totalTransferredOut: 0,
      totalSold: 0,
      totalWrittenOff: 0,
      availableStock: 0,
      received_quantity: 20,
      damaged_quantity: 0,
      available_quantity: 20,
      revenue: 56000,
      reorder_level: 10,
      on_backorder: 0,
      expiry_date: null,
    },
  },
  "Coconut Powder": {
    "Office Store (SPICE HUB)": {
      totalReceived: 0,
      totalTransferredIn: 0,
      totalTransferredOut: 0,
      totalSold: 0,
      totalWrittenOff: 0,
      availableStock: 0,
      received_quantity: 1000,
      damaged_quantity: 0,
      available_quantity: 1000,
      reorder_level: 10,
      revenue: 56000,
      on_backorder: 0,
      expiry_date: null,
    },
  },
  "Dry Ginger": {
    "Office Store (SPICE HUB)": {
      totalReceived: 0,
      totalTransferredIn: 0,
      totalTransferredOut: 0,
      totalSold: 0,
      totalWrittenOff: 0,
      availableStock: 0,
      received_quantity: 50,
      damaged_quantity: 0,
      available_quantity: 50,
      revenue: 56000,
      reorder_level: 10,
      on_backorder: 0,
      expiry_date: null,
    },
  },
};

export default function InventoryDashboard() {
  const storeName = "Office Store (SPICE HUB)";
  const products = Object.keys(inventoryData);
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  const [liveFeed, setLiveFeed] = useState<any[]>([])
  const [warehouseSales, setWarehouseSales] = useState<any[]>([])

  useEffect(()=> {
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
                <h2 className="text-lg font-bold">Sales Transactions</h2>
               
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-md  flex flex-col">
                  <span>Today</span>
                  <span>UGX 0</span>
                </div>
                <div className="text-md  flex flex-col">
                  <span>Yesterday</span>
                  <span>UGX 0</span>
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
                  <span>UGX 0</span>
                </div>
                <div className="text-md  flex flex-col">
                  <span>Yesterday</span>
                  <span>UGX 0</span>
                </div>
              </div>
            </div>
            <div
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Total Products Produced</h2>
               
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-md  flex flex-col">
                  <span>Today</span>
                  <span>UGX 0</span>
                </div>
                <div className="text-md  flex flex-col">
                  <span>Yesterday</span>
                  <span>UGX 0</span>
                </div>
              </div>
            </div>
            <div
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Average Sales Per Sale</h2>
               
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-md  flex flex-col">
                  <span>Today</span>
                  <span>UGX 0</span>
                </div>
                <div className="text-md  flex flex-col">
                  <span>Yesterday</span>
                  <span>UGX 0</span>
                </div>
              </div>
            </div>
      </div>

      {/* Inventory Table */}
      <div className="flex flex-row gap-2 justify-end overflow-auto h-[360px]">
      <LowStockSummary />
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">General Stock Summary</h2>
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="py-2 px-4">Product</th>
              <th className="py-2 px-4">Available</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const data = inventoryData[product][storeName];
              const isLowStock = data.available_quantity < data.reorder_level;
              return (
                <tr key={product} className="border-b">
                  <td className="py-2 px-4 font-medium">{product}</td>
                  <td className="py-2 px-4">{data.available_quantity}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        isLowStock ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      {isLowStock ? "Low" : "Ok"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
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
