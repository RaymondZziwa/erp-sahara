import { useParams } from "react-router-dom";
import useBudgets from "../../../hooks/budgets/useBudgets";
import BudgetTable from "./budget_details_table";
import { useState, useEffect } from "react";
import BudgetAllocationModal from "../budget_allocation/AddorModify";
import { ToastContainer, toast } from "react-toastify";
import BudgetItemsModal from "../budget_items/AddorModify";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface IBudgetUsage {
  total_allocated: number
  total_remaining: number
  total_spent: number
  total_usage_percentage: number
}

const BudgetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [budgetUsage, setBudgetUsage] = useState<IBudgetUsage>();
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const { data: budgets, refresh } = useBudgets();
  const budget = budgets.find((budget) => budget.id.toString() === id);

  const getBudgetUsageSummary = async () => {
    try {
      const res = await axios.get(
        `${baseURL}/accounts/budgets/${id}/budgetusage`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBudgetUsage(res.data.data)
    } catch (error) {
      console.error("Error getting budget usage summary:", error);
      toast.error("An error occurred while getting budget usage summary");
    }
  };

  const deleteBudgetItem = async (budgetItemId: string) => {
    try {
      const res = await axios.delete(
        `${baseURL}/accounts/budgets/budgetitems/${budgetItemId}/delete`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        toast.success("Budget item deleted successfully.");
        refresh();
      }
    } catch (error) {
      console.error("Error deleting budget item:", error);
      toast.error("An error occurred while deleting budget item.");
    }
  };

  useEffect(() => {
    getBudgetUsageSummary();
  }, []);

  if (!budget) return <div>Loading...</div>;

  return (
    <div className="p-fluid grid grid-cols-1 gap-4">
      <ToastContainer />
      <div className="p-field">
        <h2 className="text-xl font-bold mb-4">Budget Details</h2>
        <div className="space-y-4">
          {/* First Row: Budget Name & Buttons */}
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{budget.name}</h3>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-800"
                onClick={() => setShowAllocationModal(true)}
              >
                Add Budget Allocation
              </button>
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-800"
                onClick={() => setShowItemsModal(true)}
              >
                Add Budget Items
              </button>
            </div>
          </div>

          {/* Second Row: Budget Tabs */}
          <div className="grid grid-cols-4 gap-4">
            {/* <div className="bg-white p-4 rounded-md shadow-sm text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Allocated
              </h5>
              <p className="text-lg font-bold">{budget.allocated_amount}</p>
            </div> */}

            {/* <div className="bg-white p-4 rounded-md shadow-sm text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Remaining
              </h5>
              <p className="text-lg font-bold">{budgetUsage?.total_remaining}</p>
            </div> */}
            <div className="bg-white p-4 rounded-md shadow-sm text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Spent
              </h5>
              <p className="text-lg font-bold">
                {budgetUsage?.total_spent || "N/A"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Usage Percentage
              </h5>
              <p className="text-lg font-bold">
                {budgetUsage?.total_usage_percentage || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <BudgetTable budget={budget} deleteBudgetItem={deleteBudgetItem} />
      </div>

      {/* Modals */}
      {showAllocationModal && (
        <BudgetAllocationModal
          visible={showAllocationModal}
          refresh={refresh}
          onHide={() => setShowAllocationModal(false)}
          id={id}
        />
      )}
      {showItemsModal && (
        <BudgetItemsModal
          budget={budget}
          refresh={refresh}
          visible={showItemsModal}
          onHide={() => setShowItemsModal(false)}
          id={id}
        />
      )}
    </div>
  );
};

export default BudgetDetails;
