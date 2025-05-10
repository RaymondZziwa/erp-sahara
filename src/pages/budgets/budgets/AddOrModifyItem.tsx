//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useFiscalYears from "../../../hooks/budgets/useFiscalYears";
import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import useBudgets from "../../../hooks/budgets/useBudgets";

interface AddBudget {
  name: string;
  allocated_amount: number;
  currency_id: number;
  fiscal_year_id: number;
  description: string;
  parent_id: null;
  project_id: null;
  activity_id: null;
  segment_id: null;
  budget_items: BudgetItem[];
}

interface BudgetItem {
  name: string;
  type: string;
  amount?: number;
  chart_of_account_id: number;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Budget;
  onSave: () => void;
}
interface AddBudgetForm extends Omit<Budget, "items"> {
  items: BudgetItem[];
}
const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<AddBudgetForm>>({
    items: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: currencies } = useCurrencies();
  const { data: fiscalYears } = useFiscalYears();
  // const { data: chartOfAccounts } = useChartOfAccounts();
  // const { data: incomeChartOfAccounts } = useLedgerChartOfAccounts({
  //   accountType: AccountType.INCOME,
  // });
  const { data: budgets } = useBudgets();
  
  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
        items:
          item.items.map((item) => ({
            amount: +item.amount,
            chart_of_account_id: item.chart_of_account_id,
            name: item.name,
            type: item.type,
          })) || [],
      });
    } else {
      setFormState({
        items: [],
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // const handleItemChange = (
  //   index: number,
  //   field: keyof BudgetItem,
  //   value: string | number
  // ) => {
  //   const updatedItems = [...(formState.items ?? [])];
  //   updatedItems[index] = { ...updatedItems[index], [field]: value };
  //   setFormState((prevState) => ({
  //     ...prevState,
  //     items: updatedItems,
  //   }));
  // };

  // const addBudgetItem = () => {
  //   setFormState((prevState) => ({
  //     ...prevState,
  //     items: [
  //       ...(prevState?.items ?? []),
  //       { name: "", type: "expense", chart_of_account_id: 0 },
  //     ],
  //   }));
  // };

  // const removeBudgetItem = (index: number) => {
  //   const updatedItems = [...(formState.items ?? [])];
  //   updatedItems.splice(index, 1);
  //   setFormState((prevState) => ({
  //     ...prevState,
  //     items: updatedItems,
  //   }));
  // };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // console.log(formState)

    // Basic validation
    if (
      !formState.name ||
      !formState.allocated_amount ||
      !formState.currency_id ||
      !formState.fiscal_year_id
    ) {
      console.log("Missing required fields");

      // setIsSubmitting(false);
      return; // Handle validation error here
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? BUDGETS_ENDPOINTS.BUDGETS.UPDATE(item.id.toString())
      : BUDGETS_ENDPOINTS.BUDGETS.ADD;
    const data: AddBudget = {
      name: formState.name,
      allocated_amount: Number(formState.allocated_amount),
      currency_id: formState.currency_id,
      fiscal_year_id: formState.fiscal_year_id,
      description: formState?.description?.toString(),
      parent_id: formState.parent_id ?? null,
      project_id: formState.project_id ?? null,
      activity_id: formState.activity_id ?? null,
      segment_id: formState.segment_id ?? null,
      budget_items:
        formState.items?.map((item) => ({
          amount: item.amount && +item.amount,
          chart_of_account_id: item.chart_of_account_id,
          name: item.name,
          type: item.type,
        })) ?? [],
    };
    console.log(data);
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        size="small"
        disabled={isSubmitting}
        className=" hover:!bg-red-400 !bg-red-500 text-white"
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="budget-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Budget" : "Add Budget"}
      visible={visible}
      // style={{ width: "800px" }}
      className="max-w-4xl "
      footer={footer}
      onHide={onClose}
    >
      <form
        id="budget-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="name">Name</label>
          <InputText
            id="name"
            name="name"
            value={formState.name || ""}
            onChange={handleInputChange}
            // required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="allocated_amount">Allocated Amount</label>
          <InputText
            id="allocated_amount"
            name="allocated_amount"
            type="currency"
            value={formState.allocated_amount || ""}
            onChange={handleInputChange}
            // required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="currency_id">Currency</label>
          <Dropdown
            id="currency_id"
            name="currency_id"
            value={formState.currency_id || ""}
            options={currencies.map((curr) => ({
              label: curr.code,
              value: curr.id,
            }))} // Example options
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                currency_id: e.value,
              }))
            }
            // required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="fiscal_year_id">Fiscal Year</label>
          <Dropdown
            placeholder="Year"
            id="fiscal_year_id"
            name="fiscal_year_id"
            value={formState.fiscal_year_id || ""}
            options={fiscalYears.map((year) => ({
              label:
                year.financial_year +
                " " +
                year.start_date +
                " " +
                year.end_date,
              value: year.id,
            }))} // Example options
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                fiscal_year_id: e.value,
              }))
            }
            // required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="parent_id">Parent Budget (Optional)</label>
          <Dropdown
            placeholder="Select a parent budget, if this budget is part of another budget"
            showClear
            id="parent_id"
            name="parent_id"
            value={formState.parent_id || ""}
            options={budgets.length > 0 ? budgets.map((budget) => ({
              label: budget.name,
              value: budget.id,
            })): []}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                parent_id: e.value,
              }))
            }
            className="w-full"
          />
        </div>

       
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
