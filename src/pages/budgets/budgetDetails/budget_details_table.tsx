import { Icon } from "@iconify/react";
import { useState } from "react";
import { baseURL } from "../../../utils/api";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import useBudgets from "../../../hooks/budgets/useBudgets";

export default function BudgetTable({ budget }) {
  const [activeTab, setActiveTab] = useState("allocations");
  const {refresh} = useBudgets()
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

const deleteHandler = async (id:any) => {
  try {
    const response = await axios.delete(
      `${baseURL}/erp/accounts/budgets/${budget.id}/budgetallocations/${id}/delete`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      toast.success("Budget allocation deleted successfully!");
      refresh()
    } else {
      toast.error("Failed to delete budget allocation.");
    }
  } catch (error) {
    console.error("Error deleting allocation:", error);
    toast.error("An error occurred while deleting.");
  }
};

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Toggle Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "allocations"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("allocations")}
        >
          Budget Allocations
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "items"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("items")}
        >
          Budget Items
        </button>
      </div>

      {/* Table Display */}
      <div>
        {activeTab === "allocations" ? (
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2">Name</th>
                <th className="border border-gray-200 px-4 py-2">
                  Allocated Amount
                </th>
                <th className="border border-gray-200 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {budget &&
                budget.allocations.map((allocation: any) => (
                  <tr key={allocation.id} className="text-center">
                    <td className="border border-gray-200 px-4 py-2">
                      {allocation.name}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {allocation.allocated_amount}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex flex-row gap-2">
                        <Icon
                          icon="solar:pen-bold"
                          className="text-blue-500 cursor-pointer"
                          fontSize={20}
                        />
                        <Icon
                          icon="solar:trash-bin-trash-bold"
                          className="text-red-500 cursor-pointer"
                          fontSize={20}
                          onClick={() => {
                            deleteHandler(allocation.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2">Item Name</th>
                <th className="border border-gray-200 px-4 py-2">Amount</th>
                <th className="border border-gray-200 px-4 py-2">Type</th>
                <th className="border border-gray-200 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {budget?.items.map((item) => (
                <tr key={item.id} className="text-center">
                  <td className="border border-gray-200 px-4 py-2">
                    {item.name}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {item.amount}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {item.type}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex flex-row gap-2">
                      <Icon
                        icon="solar:pen-bold"
                        className="text-blue-500 cursor-pointer"
                        fontSize={20}
                      />
                      <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="text-red-500 cursor-pointer"
                        fontSize={20}
                        onClick={() => {
                          deleteHandler(allocation.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
