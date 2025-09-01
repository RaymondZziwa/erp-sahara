import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import useBudgets from "../../../../hooks/budgets/useBudgets";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
import useDepartments from "../../../../hooks/hr/useDepartments";
import useAssetsAccounts from "../../../../hooks/accounts/useAssetsAccounts";
import { Budget } from "../../../../redux/slices/types/budgets/Budget";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

interface RequisitionFormState {
  title: string;
  date_expected: Date | null;
  budget_id: string;
  department_id: string;
  items: {
    unit_cost: number;
    budget_item_id: string;
    quantity: number;
    specifications: string | null;
    chart_of_account_id: string | null;
    currency_id: string;
  }[];
}

interface Props {
  visible: boolean;
  onHide: () => void;
  onSubmit: () => void;
  item?: any;
}

const AddOrModifyRequisition: React.FC<Props> = ({ visible, onHide, onSubmit, item }) => {
  const { data: budgets } = useBudgets();
  const { data: departments } = useDepartments();
  const { data: currencies } = useCurrencies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { expenseAccounts: chartOfAccounts } = useAssetsAccounts();
  const token = useSelector((state: RootState) => state.userAuth.token)

  const [formState, setFormState] = useState<RequisitionFormState>({
    title: "",
    date_expected: null,
    budget_id: "",
    department_id: "",
    items: [
      {
        unit_cost: 0,
        budget_item_id: "",
        quantity: 1,
        specifications: "",
        chart_of_account_id: null,
        currency_id: currencies && currencies.length > 0 ? currencies[0].id : "",
      },
    ],
  });

  useEffect(() => {
    if (item) {
      setFormState({
        title: item.title || "",
        date_expected: item.date_expected ? new Date(item.date_expected) : null,
        budget_id: item.budget_id || "",
        department_id: item.department_id || "",
        items: item.cash_requisition_items?.length
          ? item.cash_requisition_items.map((i: any) => ({
              unit_cost: i.unit_cost || 0,
              budget_item_id: i.budget_item_id || "",
              quantity: i.quantity || 1,
              specifications: i.specifications || "",
              chart_of_account_id: i.chart_of_account_id || null,
              currency_id: i.currency_id || (currencies?.[0]?.id ?? ""),
            }))
          : [
              {
                unit_cost: 0,
                budget_item_id: "",
                quantity: 1,
                specifications: "",
                chart_of_account_id: null,
                currency_id: currencies?.[0]?.id ?? "",
              },
            ],
      });
    } else {
      // reset to default blank form
      setFormState({
        title: "",
        date_expected: null,
        budget_id: "",
        department_id: "",
        items: [
          {
            unit_cost: 0,
            budget_item_id: "",
            quantity: 1,
            specifications: "",
            chart_of_account_id: null,
            currency_id: currencies?.[0]?.id ?? "",
          },
        ],
      });
    }
  }, [item]);
  

  const selectedBudget: Budget | null =
    budgets.find((budget) => budget.id === formState.budget_id) || null;

  const addItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          unit_cost: 0,
          budget_item_id: "",
          quantity: 1,
          specifications: "",
          chart_of_account_id: null,
          currency_id: currencies && currencies.length > 0 ? currencies[0].id : "",
        },
      ],
    }));
  };


  const updateItem = (index: number, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      title: formState.title,
      date_expected: formState.date_expected ? formState.date_expected.toISOString().split("T")[0] : null,
      budget_id: formState.budget_id,
      department_id: formState.department_id,
      items: formState.items.map(({ ...rest }) => ({
        ...rest,
        specifications: rest.specifications || null,
      })),
    };
    setIsSubmitting(true);

    try {
      await apiRequest(`${item ? ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.UPDATE(item?.id) : ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.ADD}`, item ? "PUT" : "POST", token.access_token, payload);
      toast.success(item ? "Expense Requisition modified successfully" : "Expense Requisition saved successfully")
    } catch (error) {
      toast.error(error?.response?.data.message)
    } finally {
      setFormState({
        title: "",
        date_expected: null,
        budget_id: "",
        department_id: "",
        items: [
          {
            unit_cost: 0,
            budget_item_id: "",
            quantity: 1,
            specifications: "",
            chart_of_account_id: null,
            currency_id: currencies && currencies.length > 0 ? currencies[0].id : "",
          },
        ],
      })
    }
    setIsSubmitting(false);
    onSubmit();
    onHide();
  };

  return (
    <Dialog
      header={item ? "Modify Expense Requisition" : "Create Expense Requisition"}
      visible={visible}
      onHide={onHide}
      style={{ width: "30vw" }}
    >
      <div className="grid gap-4">
        {/* Title - Full width */}
        <div className="col-12">
          <label>Title</label>
          <InputText
            value={formState.title}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Date Expected and Budget - 2 per row */}
        <div className="col-12 md:col-6">
          <label>Date Expected</label>
          <Calendar
            value={formState.date_expected}
            onChange={(e) => setFormState({ ...formState, date_expected: e.value as Date })}
            showIcon
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-6">
          <label>Budget</label>
          <Dropdown
            value={formState.budget_id}
            options={budgets.map((budget) => ({
              label: budget.name,
              value: budget.id,
            }))}
            onChange={(e) => setFormState({ ...formState, budget_id: e.value })}
            placeholder="Select Budget"
            className="w-full"
          />
        </div>

        {/* Department and Currency - 2 per row */}
        <div className="col-12 md:col-6">
          <label>Department</label>
          <Dropdown
            value={formState.department_id}
            options={departments.map((dept) => ({
              label: dept.name,
              value: dept.id,
            }))}
            onChange={(e) => setFormState({ ...formState, department_id: e.value })}
            placeholder="Select Department"
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-6">
          <label>Default Currency</label>
          <Dropdown
            value={formState.items[0]?.currency_id || ""}
            options={currencies.map((currency) => ({
              label: currency.name,
              value: currency.id,
            }))}
            onChange={(e) => {
              // Update all items with the selected currency
              const updatedItems = formState.items.map(item => ({
                ...item,
                currency_id: e.value
              }));
              setFormState({ ...formState, items: updatedItems });
            }}
            placeholder="Select Currency"
            className="w-full"
          />
        </div>

        {/* Items Section */}
        <div className="col-12">
          <div className="flex flex-row justify-between align-items-center mb-3">
            <h4 className="text-xl">Items</h4>
            <Button
              label="Add Item"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={addItem}
            />
          </div>
          
          {formState.items.map((item, index) => (
            <div key={index} className="grid gap-2 border-1 border-200 border-round-md p-3 mb-3 surface-50">
              <div className="col-12 flex justify-content-between align-items-center mb-2">
                <h5>Item {index + 1}</h5>
                {formState.items.length > 1 && (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger p-button-rounded p-button-text"
                    onClick={() => removeItem(index)}
                  />
                )}
              </div>
              
              {/* Budget Item and Quantity - 2 per row */}
              <div className="col-12 md:col-6">
                <label>Budget Item</label>
                <Dropdown
                  value={item.budget_item_id}
                  options={(selectedBudget?.items || []).map(budgetItem => ({
                    label: budgetItem.name,
                    value: budgetItem.id,
                  }))}
                  onChange={(e) => updateItem(index, "budget_item_id", e.value)}
                  placeholder="Select Item"
                  className="w-full"
                />
              </div>
              
              <div className="col-12 md:col-6">
                <label>Quantity</label>
                <InputNumber
                  value={item.quantity}
                  onValueChange={(e) => updateItem(index, "quantity", e.value || 1)}
                  className="w-full"
                  min={1}
                />
              </div>
              
              {/* Unit Cost and Currency - 2 per row */}
              <div className="col-12 md:col-6">
                <label>Unit Cost</label>
                <InputNumber
                  value={item.unit_cost}
                  onValueChange={(e) => updateItem(index, "unit_cost", e.value || 0)}
                  className="w-full"
                  currency={currencies.find(c => c.id === item.currency_id)?.code}
                  min={0}
                />
              </div>
              
              <div className="col-12 md:col-6">
                <label>Currency</label>
                <Dropdown
                  value={item.currency_id}
                  options={currencies.map((currency) => ({
                    label: currency.name,
                    value: currency.id,
                  }))}
                  onChange={(e) => updateItem(index, "currency_id", e.value)}
                  placeholder="Select Currency"
                  className="w-full"
                />
              </div>
              
              {/* Chart of Account - Full width */}
              <div className="col-12">
                <label>Chart of Account</label>
                <Dropdown
                  value={item.chart_of_account_id}
                  options={chartOfAccounts.map(account => ({
                    label: account.name,
                    value: account.id,
                  }))}
                  onChange={(e) => updateItem(index, "chart_of_account_id", e.value)}
                  placeholder="Select Account"
                  className="w-full"
                />
              </div>
              
              {/* Specifications - Full width */}
              <div className="col-12">
                <label>Specifications</label>
                <InputText
                  value={item.specifications || ""}
                  onChange={(e) => updateItem(index, "specifications", e.target.value)}
                  placeholder="Enter specifications"
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-4">
        {/* <Button label="Cancel" className="p-button-text" onClick={onHide} /> */}
        <Button label={isSubmitting ? "Saving..." : "Save"} icon="pi pi-check" onClick={handleSubmit} disabled={isSubmitting}
            loading={isSubmitting}/>
      </div>
    </Dialog>
  );
};

export default AddOrModifyRequisition;