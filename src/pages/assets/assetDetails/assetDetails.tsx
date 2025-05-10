import React, { useState } from "react";
//import { useParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import useAssets from "../../../hooks/assets/useAssets";
import AddOrModifyPaymentModal from ".././AddOrModifyPaymentModal";
import AddOrModifyExpenseModal from ".././AddOrModifyExpenseModal";
import AddOrModifyIncomeModal from ".././AddOrModifyIncomeModal";
import { ToastContainer } from "react-toastify";

const AssetDetails: React.FC = () => {
 // const { id } = useParams<{ id: string }>();
  const { data: assets, refresh } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("payments");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const navigationTabs = [
    { id: "payments", label: "Payments" },
    { id: "expenses", label: "Expenses" },
    { id: "income", label: "Income" },
    { id: "depreciation", label: "Depreciation/Appreciation" },
  ];

  if (!assets) return <div>Loading...</div>;

  const handleAssetChange = (e: { value: any }) => {
    setSelectedAsset(e.value);
  };

  const assetOptions = assets.map((asset) => ({
    label: asset.name,
    value: asset,
  }));

  const totalCards = [
    { title: "Total Purchase", value: selectedAsset?.purchase_cost || 0 },
    { title: "Total Payments", value: selectedAsset?.total_payments || 0 },
    { title: "Total Balance", value: selectedAsset?.current_value || 0 },
    { 
      title: "Depreciation/Appreciation", 
      value: (selectedAsset?.current_value || 0) - (selectedAsset?.purchase_cost || 0) 
    },
    { title: "Total Expense", value: selectedAsset?.total_expense || 0 },
    { title: "Total Income", value: selectedAsset?.total_income || 0 },
  ];

  if (!selectedAsset) {
    return (
      <div className="p-fluid grid grid-cols-1 gap-4">
        <div className="p-field">
          <h2 className="text-xl font-bold mb-4">Select Asset</h2>
          <Dropdown
            value={selectedAsset}
            options={assetOptions}
            onChange={handleAssetChange}
            placeholder="Select an Asset"
            className="w-full md:w-96"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-fluid grid grid-cols-1 gap-4">
      <ToastContainer />

      {/* Total Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {totalCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
            <p className="text-2xl font-semibold mt-2">
              {typeof card.value === "number"
                ? card.value.toLocaleString()
                : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation and Content Card */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 font-medium ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-primary hover:border-b-2 hover:border-primary/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            {activeTab === "payments" && (
              <Button
                label="Add Payment"
                icon="pi pi-plus"
                className="p-button-success w-44"
                onClick={() => setShowPaymentModal(true)}
              />
            )}
            {activeTab === "expenses" && (
              <Button
                label="Add Expense"
                icon="pi pi-plus"
                className="p-button-warning w-44 float-end"
                onClick={() => setShowExpenseModal(true)}
              />
            )}
            {activeTab === "income" && (
              <Button
                label="Add Income"
                icon="pi pi-plus"
                className="p-button-info w-44"
                onClick={() => setShowIncomeModal(true)}
              />
            )}
          </div>

          {/* Data Tables */}
          {activeTab === "payments" && (
            <DataTable value={selectedAsset.payments || []} paginator rows={10}>
              <Column field="date" header="Date" />
              <Column field="amount" header="Amount" />
              <Column field="method" header="Payment Method" />
            </DataTable>
          )}

          {activeTab === "expenses" && (
            <DataTable value={selectedAsset.expenses || []} paginator rows={10}>
              <Column field="date" header="Date" />
              <Column field="description" header="Description" />
              <Column field="amount" header="Amount" />
            </DataTable>
          )}

          {activeTab === "income" && (
            <DataTable value={selectedAsset.income || []} paginator rows={10}>
              <Column field="date" header="Date" />
              <Column field="source" header="Source" />
              <Column field="amount" header="Amount" />
            </DataTable>
          )}

          {activeTab === "depreciation" && (
            <DataTable
              value={selectedAsset.depreciation || []}
              paginator
              rows={10}
            >
              <Column field="date" header="Date" />
              <Column field="type" header="Type" />
              <Column field="amount" header="Amount" />
            </DataTable>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddOrModifyPaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        assetId={selectedAsset.id}
        onSave={() => {
          refresh();
        }}
      />

      <AddOrModifyExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        assetId={selectedAsset.id}
        onSave={() => {
          refresh();
        }}
      />

      <AddOrModifyIncomeModal
        visible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        assetId={selectedAsset.id}
        onSave={() => {
          refresh()
        }}
      />
    </div>
  );
};

export default AssetDetails;