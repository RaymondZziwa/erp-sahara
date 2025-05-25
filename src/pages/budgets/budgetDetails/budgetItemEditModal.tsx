import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useChartOfAccounts from "../../../hooks/accounts/useChartOfAccounts";
import useLedgerChartOfAccounts from "../../../hooks/accounts/useLedgerChartOfAccounts";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import useAssetsAccounts from "../../../hooks/accounts/useAssetsAccounts";

interface Props {
  visible: boolean;
  onHide: () => void;
  item: any;
  budgetId: string;
  budget: Budget;
  refresh: () => void;
}

const BudgetItemEditModal: React.FC<Props> = ({
  visible,
  onHide,
  budget,
  item,
  budgetId,
  refresh,
}) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  const { data: chartOfAccounts } = useChartOfAccounts();
  const { data: incomeChartOfAccounts } = useLedgerChartOfAccounts({
    accountType: AccountType.INCOME,
  });
  const {expenseAccounts, incomeAccounts} = useAssetsAccounts()

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    amount: null,
    currency_id: budget.currency_id,
    chart_of_account_id: "",
    budget_allocation_id: null,
    description: "",
  });

  useEffect(() => {
    console.log(item);
    if (item) {
      setFormData({
        name: item.name || "",
        type: item.type || "",
        amount: item.amount || null,
        currency_id: budget.currency_id,
        chart_of_account_id: item.chart_of_account_id || "",
        budget_allocation_id: item.budget_allocation_id || null,
        description: item.description || "",
      });
    }
  }, [item]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      type: formData.type.toLowerCase(),
    };
    try {
      const response = await axios.put(
        `${baseURL}/accounts/budgets/${budgetId}/budgetitems/${item.id}/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Budget item updated successfully!");
        refresh();
        onHide();
      } else {
        toast.error("Failed to update budget item.");
      }
    } catch (error) {
      console.error("Error updating budget item:", error);
      toast.error("An error occurred while updating.");
    }
  };

  return (
    <Dialog header="Edit Budget Item" visible={visible} onHide={onHide}>
      <div className="p-fluid space-y-4">
        <div className="p-field">
          <label className="font-semibold">
            Name <span className="text-red-500">*</span>
          </label>
          <InputText
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
        <div className="p-field">
          <label className="font-semibold">
            Type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.type}
            options={[
              { label: "Expense", value: "Expense" },
              { label: "Revenue", value: "Revenue" },
            ]}
            onChange={(e) => handleChange("type", e.value)}
            placeholder="Select Type"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold">
            Chart of Account <span className="text-red-500">*</span>
          </label>
          <Dropdown
            filter
            value={formData.chart_of_account_id}
            options={
              formData.type === "Revenue"
                ? incomeAccounts
                : expenseAccounts || []
            }
            onChange={(e) => handleChange("chart_of_account_id", e.value)}
            placeholder="Select Account"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold">
            Amount <span className="text-red-500">*</span>
          </label>
          <InputNumber
            placeholder="Amount"
            value={formData.amount}
            onValueChange={(e) => handleChange("amount", e.value)}
            required
          />
        </div>
        <div className="p-field">
          <label>Description</label>
          <InputText
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>
        <Button
          label="Save Changes"
          icon="pi pi-check"
          onClick={handleSubmit}
          className="p-button-success"
        />
      </div>
    </Dialog>
  );
};

export default BudgetItemEditModal;
