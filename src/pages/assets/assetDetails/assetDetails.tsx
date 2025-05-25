import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import useAssets from "../../../hooks/assets/useAssets";
import AddOrModifyPaymentModal from ".././AddOrModifyPaymentModal";
import AddOrModifyExpenseModal from ".././AddOrModifyExpenseModal";
import AddOrModifyIncomeModal from ".././AddOrModifyIncomeModal";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { ASSETSENDPOINTS } from "../../../api/assetEndpoints";
import { baseURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import AddOrModifyValuationModal from "../AddOrModifyValuationModal";

const AssetDetails: React.FC = () => {
  const {token} = useAuth()
  const { id } = useParams<{ id: string }>();
  const { data: assets } = useAssets();
  const [assetType, setAssetType] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("payments");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [valuationDialogOpen, setValuationDialogOpen] = useState(false)

  const [history, setHistory] = useState<any[]>([])

  const navigationTabs = [
    { id: "payments", label: "Payments" },
    { id: "expenses", label: "Expenses" },
    { id: "income", label: "Income" },
    {
      id: assetType === "appreciating" ? "appreciation" : "depreciation",
      label: assetType === "appreciating" ? "Appreciation" : "Depreciation",
    },
    { id: "attachments", label: "Attachments" },
    { id: "valuation", label: "Valuation" },
  ];

  const fetchAssetInfo = async () => {
    try {
      const res = await axios.get(
        `${baseURL}${ASSETSENDPOINTS.ASSETS.GET_BY_ID(id)}`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`, // ✅ fixed typo
          },
        }
      );
      setSelectedAsset(res.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch asset data");
    }
  };

    useEffect(() => {
      fetchAssetInfo();
    }, [id]);


  const fetchAppreciationOrDepreciationHistory = async (
    asset_id: string,
    asset_type: string
  ): Promise<any> => {
    try {
      const endpoint =
        asset_type === "depreciating"
          ? `${baseURL}/assets/assetdepreciation/process/${asset_id}`
          : `${baseURL}/assets/assetappreciation/history/${asset_id}`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });
      setHistory(response.data.data)
    } catch (error: any) {
      console.error("Error fetching history:", error);
      // toast.error(error?.response?.data?.message || "Failed to fetch asset history");
      return null;
    }
  };


  useEffect(() => {
    fetchAppreciationOrDepreciationHistory(id, assetType)
  }, [id]); 

  useEffect(()=> {
    if(selectedAsset) {
      setAssetType(selectedAsset.asset_type);
    }
  }, [selectedAsset])

  const fetchValuations = async () => {}

  if (!assets) return <div>Loading...</div>;

  const totalCards = [
    { title: "Total Purchase", value: selectedAsset?.purchase_cost || 0 },
    { title: "Total Payments", value: selectedAsset?.total_paid || 0 },
    {
  title: "Total Balance",
  value: selectedAsset?.purchase_cost - parseFloat(selectedAsset?.total_paid ?? "0")
},

    {
      title: "Depreciation/Appreciation",
      value:
        (selectedAsset?.current_value || 0) -
        (selectedAsset?.purchase_cost || 0),
    },
    { title: "Total Expense", value: selectedAsset?.total_expense || 0 },
    { title: "Total Income", value: selectedAsset?.total_income || 0 },
  ];

  if (!selectedAsset) {
    return (
      <div className="p-fluid grid grid-cols-1 gap-4">
        Loading...
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
            {activeTab === "attachments" && (
              <Button
                label="Add Attachment"
                icon="pi pi-plus"
                className="p-button-info w-48"
                onClick={() => setShowIncomeModal(true)}
              />
            )}
            {activeTab === "valuation" && (
              <Button
                label="Add Valuation"
                icon="pi pi-plus"
                className="p-button-info w-44"
                onClick={() => setValuationDialogOpen(true)}
              />
            )}
          </div>

          {/* Data Tables */}
          {activeTab === "payments" && (
            <DataTable
              value={selectedAsset.asset_payments || []}
              paginator
              rows={10}
            >
              <Column field="transaction_date" header="Date" />
              <Column field="amount" header="Amount" />
              <Column field="payment_method.name" header="Payment Method" />
            </DataTable>
          )}

          {activeTab === "expenses" && (
            <DataTable
              value={selectedAsset.asset_expenses || []}
              paginator
              rows={10}
            >
              <Column field="transaction_date" header="Date" />
              <Column field="amount" header="Amount" />
              <Column field="narrative" header="Description" />
            </DataTable>
          )}

          {activeTab === "income" && (
            <DataTable
              value={selectedAsset.asset_incomes || []}
              paginator
              rows={10}
            >
              <Column field="transaction_date" header="Date" />
              <Column field="amount" header="Amount" />
              <Column field="payment method" header="Payment Method" />
            </DataTable>
          )}

          {(activeTab === "depreciation" || activeTab === "appreciation") && (
            <DataTable
              value={
                activeTab === "depreciation"
                  ? selectedAsset.asset_depreciations || []
                  : selectedAsset.asset_appreciations || []
              }
              paginator
              rows={10}
            >
              <Column field="date" header="Date" />
              <Column field="type" header="Type" />
              <Column field="amount" header="Amount" />
            </DataTable>
          )}

          {activeTab === "valuation" && (
            <DataTable
              value={selectedAsset.valuations || []}
              paginator
              rows={10}
            >
              <Column field="date" header="Date" />
              <Column field="type" header="Type" />
              <Column field="amount" header="Amount" />
            </DataTable>
          )}
          {activeTab === "attachments" && (
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
          fetchAssetInfo();
        }}
      />

      <AddOrModifyExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        assetId={selectedAsset.id}
        onSave={() => {
          fetchAssetInfo();
        }}
      />

      <AddOrModifyIncomeModal
        visible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        assetId={selectedAsset.id}
        onSave={() => {
          fetchAssetInfo();
        }}
      />

      <AddOrModifyValuationModal
        visible={valuationDialogOpen}
        onClose={() => setValuationDialogOpen(false)}
        assetId={id}
        onSave={fetchValuations}
        editMode={false}
        valuationId=""
        //initialData={selectedValuation}
      />
    </div>
  );
};

export default AssetDetails;