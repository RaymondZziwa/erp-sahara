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
      reorder_level: 10,
      on_backorder: 0,
      expiry_date: null,
    },
  },
};

export default function InventoryDashboard() {
  const storeName = "Office Store (SPICE HUB)";
  const products = Object.keys(inventoryData);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {storeName} Inventory Dashboard
      </h1>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {products.map((product) => {
          const data = inventoryData[product][storeName];
          const isLowStock = data.available_quantity < data.reorder_level;
          return (
            <div
              key={product}
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium">{product}</h2>
                {isLowStock ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M12 2a10 10 0 11-10 10A10 10 0 0112 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="text-2xl font-bold">
                {data.available_quantity}
              </div>
              <p className="text-xs text-gray-500">
                Reorder Level: {data.reorder_level}
              </p>
            </div>
          );
        })}
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">Detailed Inventory</h2>
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="py-2 px-4">Product</th>
              <th className="py-2 px-4">Available</th>
              <th className="py-2 px-4">Received</th>
              <th className="py-2 px-4">Damaged</th>
              <th className="py-2 px-4">Reorder Level</th>
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
                  <td className="py-2 px-4">{data.received_quantity}</td>
                  <td className="py-2 px-4">{data.damaged_quantity}</td>
                  <td className="py-2 px-4">{data.reorder_level}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        isLowStock ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      {isLowStock ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
