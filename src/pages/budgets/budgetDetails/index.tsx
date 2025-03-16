import { useParams } from "react-router-dom";
import useBudgets from "../../../hooks/budgets/useBudgets";
import BudgetTable from "./budget_details_table";
import { useState } from "react";
import BudgetAllocationModal from "../budget_allocation/AddorModify";
import { ToastContainer } from "react-toastify";
import BudgetItemsModal from "../budget_items/AddorModify";

const BudgetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const { data: budgets } = useBudgets();
  const budget = budgets.find((budget) => budget.id.toString() === id);

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
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => setShowAllocationModal(true)}
              >
                Add Budget Allocation
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                onClick={() => setShowItemsModal(true)}
              >
                Add Budget Items
              </button>
            </div>
          </div>

          {/* Second Row: Budget Tabs */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-md shadow-md text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Allocated
              </h5>
              <p className="text-lg font-bold">{budget.allocated_amount}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-md text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Payments
              </h5>
              <p className="text-lg font-bold">{budget.spent_amount}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-md text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Unavailable
              </h5>
              <p className="text-lg font-bold">
                {budget.totalUnavailable || "N/A"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-md text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Remaining
              </h5>
              <p className="text-lg font-bold">{budget.remaining_amount}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-md text-center">
              <h5 className="text-sm font-semibold text-gray-600">
                Total Reserved
              </h5>
              <p className="text-lg font-bold">
                {budget.totalReserved || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <BudgetTable budget={budget} />
      </div>

      {/* Modals */}
      {showAllocationModal && (
        <BudgetAllocationModal
          visible={showAllocationModal}
          onHide={() => setShowAllocationModal(false)}
          onSubmit={(data: any) => {}}
          id={id}
        />
      )}
      {showItemsModal && (
        <BudgetItemsModal
          visible={showItemsModal}
          onHide={() => setShowItemsModal(false)}
          onSubmit={(data: any) => {}}
          id={id}
        />
      )}
    </div>
  );
};

export default BudgetDetails;
