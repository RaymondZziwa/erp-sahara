//@ts-nocheck
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import useChartOfAccounts from "../../../hooks/accounts/useChartOfAccounts";
import useLedgerChartOfAccounts from "../../../hooks/accounts/useLedgerChartOfAccounts";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import useAssetsAccounts from "../../../hooks/accounts/useAssetsAccounts";

interface BudgetItem {
  name: string;
  type: string;
  amount: number | "";
  currency_id: number;
  chart_of_account_id: string;
  budget_allocation_id: number | null;
  description: string;
}

interface Props {
  budget: Budget;
  refresh: any;
  id: any;
  visible: boolean;
  onHide: () => void;
}

const BudgetItemsModal: React.FC<Props> = ({
  budget,
  id,
  visible,
  refresh,
  onHide,
}) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  const { data: chartOfAccounts } = useChartOfAccounts();

  const [formState, setFormState] = useState<BudgetItem[]>([
    {
      name: "",
      type: "",
      amount: "",
      currency_id: budget.currency_id,
      chart_of_account_id: "",
      budget_allocation_id: "", // Nullable
      description: "",
    },
  ]);
  const { data: incomeChartOfAccounts } = useLedgerChartOfAccounts({
    accountType: AccountType.INCOME,
  });
  const { expenseAccounts, incomeAccounts } = useAssetsAccounts();

  const handleItemChange = (
    index: number,
    field: keyof BudgetItem,
    value: any
  ) => {
    const updatedItems = [...formState];
    updatedItems[index][field] = value;
    setFormState(updatedItems);
  };

  const addBudgetItem = () => {
    setFormState([
      ...formState,
      {
        name: "",
        type: "",
        amount: "",
        currency_id: budget.currency_id,
        chart_of_account_id: "",
        budget_allocation_id: "", // Nullable
        description: "",
      },
    ]);
  };

  const removeBudgetItem = (index: number) => {
    setFormState(formState.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/accounts/budgets/${id}/budgetitems/create`,
        {
          budget_items: formState,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        refresh();
      } else {
        toast.error(response.data.message);
      }

      onHide();
    } catch (error) {
      console.log("Error submitting budget items:", error);
      toast.error("An error occurred while submitting the budget items."); // Show error toast
    }
  };

  return (
    <Dialog header="Add Budget Items" visible={visible} onHide={onHide}>
      <div className="p-fluid space-y-4 w-full">
        {formState.map((item, index) => (
          <div key={index} className="p-field flex justify-between py-2 gap-2">
            <div className="grid grid-cols-4 gap-4 items-center">
              <InputText
                placeholder="Name"
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
              />
              <Dropdown
                placeholder="Type"
                value={item.type}
                options={[
                  { label: "Expense", value: "expense" },
                  { label: "Revenue", value: "revenue" },
                ]}
                onChange={(e) => handleItemChange(index, "type", e.value)}
              />
              <Dropdown
                filter
                value={item.chart_of_account_id} // Changed from formState to item
                options={(item.type === "revenue" // Changed from formState to item
                  ? incomeAccounts
                  : expenseAccounts || []
                ).map((acc) => ({ label: acc.name, value: acc.id }))}
                onChange={(e) =>
                  handleItemChange(index, "chart_of_account_id", e.value)
                }
                placeholder="Select Account"
              />

              <InputNumber
                placeholder="Amount"
                value={item.amount}
                onValueChange={(e) =>
                  handleItemChange(index, "amount", e.value || "")
                }
              />
              {/* <InputText
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, "description", e.target.value)
                }
              /> */}
            </div>
            <Button
              type="button"
              icon="pi pi-trash"
              className="p-button-danger p-button-outlined !bg-red-500"
              onClick={() => removeBudgetItem(index)}
              size="small"
            />
          </div>
        ))}
        <Button
          size="small"
          type="button"
          label="Add Item"
          icon="pi pi-plus"
          className="w-max"
          onClick={addBudgetItem}
        />
        <Button
          label="Save"
          icon="pi pi-check"
          onClick={handleSubmit}
          className="p-button-success mt-4 w-28 float-end"
        />
      </div>
    </Dialog>
  );
};

export default BudgetItemsModal;
