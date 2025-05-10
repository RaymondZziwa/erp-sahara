import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { v4 as uuidv4 } from "uuid";
import { InputNumber } from "primereact/inputnumber";
import useAuth from "../../../../hooks/useAuth";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
import useItems from "../../../../hooks/inventory/useItems";
import useProjects from "../../../../hooks/projects/useProjects";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import useBudgets from "../../../../hooks/budgets/useBudgets";
import useDepartments from "../../../../hooks/hr/useDepartments";
import useEmployees from "../../../../hooks/hr/useEmployees";
import { baseURL, createRequest } from "../../../../utils/api";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { Card } from "primereact/card";
import useLedgers from "../../../../hooks/accounts/useLedgers";
import { toast, ToastContainer } from "react-toastify";
import { Budget } from "../../../../redux/slices/types/budgets/Budget";
import axios from "axios";

interface AddCashRequisition {
  title: string;
  date_expected: string;
  budget_id?: string;
  requester_id: string;
  department_id: string;
  items: ReqItem[];
}

interface ReqItem {
  uuid: string;
  budget_item_id?: string;
  quantity: number;
  unit_cost: number;
  specifications: string | null;
  chart_of_account_id: number;
  currency_id: string;
}

const AddCashRequisition: React.FC = () => {
  const [formState, setFormState] = useState<Partial<AddCashRequisition>>({
    items: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const { token } = useAuth();
  const { data: expenseAccounts } = useLedgers();
  const { data: currencies } = useCurrencies();
  const { data: inventoryItems } = useItems();
  const { data: projects } = useProjects();
  const { data: budgets } = useBudgets();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: keyof AddCashRequisition, value: any) => {
    if (name === "budget_id") {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
      const selected = budgets.find((budget) => budget.id === value);
      setSelectedBudget(selected);
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof ReqItem,
    value: any
  ) => {
    const updatedItems = [...(formState.items ?? [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    setFormState((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const handleItemSelectChange = (index: number, value: string) => {
    if (selectedBudget) {
      const selectedItem = selectedBudget.items.find(
        (item) => item.id === value
      );
      if (selectedItem) {
        const updatedItems = [...(formState.items ?? [])];
        updatedItems[index] = {
          ...updatedItems[index],
          budget_item_id: selectedItem.id,
          unit_cost: selectedItem.amount_in_base_currency,
          chart_of_account_id: selectedItem.chart_of_account_id,
          currency_id: selectedItem.currency_id,
        };

        setFormState((prevState) => ({
          ...prevState,
          items: updatedItems,
        }));
      }
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = [...(formState.items ?? [])];
    updatedItems.splice(index, 1);
    setFormState((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setFormState((prevState) => ({
      ...prevState,
      items: [
        ...(prevState.items ?? []),
        {
          uuid: uuidv4(),
          budget_item_id: "",
          quantity: 1,
          unit_cost: 0,
          specifications: null,
          chart_of_account_id: 0,
          currency_id: currencies.length > 0 ? currencies[0].id : "",
        },
      ],
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.title ||
      !formState.requester_id ||
      !formState.department_id
    ) {
      toast.error("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    if (!formState.items || formState.items.length === 0) {
      toast.error("Please add at least one item");
      setIsSubmitting(false);
      return;
    }

    const data = {
      ...formState,
      date_expected: new Date(formState.date_expected ?? new Date())
        .toISOString()
        .slice(0, 10),
      items: formState.items.map((item) => ({
        ...item,
        specifications: item.specifications || null,
      })),
    };

    try {
      const endpoint = `${baseURL}${ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.ADD}`;
      const res = await axios.post(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
        validateStatus: () => true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setFormState({
          title: "",
          requester_id: "",
          department_id: "",
          date_expected: "",
          items: [],
        });
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create cash requisition");
    } finally {
      setIsSubmitting(false);
    }
  };

  const budgetItems = selectedBudget?.items || [];

  const totalCost = formState.items?.reduce(
    (acc, curr) => acc + curr.unit_cost * curr.quantity,
    0
  );

  const selectedCurrency = currencies.find(
    (curr) => curr.id == formState.items?.[0]?.currency_id
  );

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={"Submit"}
        icon="pi pi-check"
        type="submit"
        form="requisition-form"
        size="small"
      />
    </div>
  );

  return (
    <Card footer={footer} className="max-w-md md:max-w-2xl xl:max-w-screen-xl">
      <ToastContainer />
      <h4 className="font-bold text-lg">Add Cash Requisition</h4>
      <form
        id="requisition-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div className="p-field">
          <label htmlFor="title">Title*</label>
          <InputText
            id="title"
            name="title"
            value={formState.title || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="date_expected">Date Expected*</label>
          <Calendar
            id="date_expected"
            name="date_expected"
            value={
              formState.date_expected
                ? new Date(formState.date_expected)
                : new Date()
            }
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                date_expected: e.value?.toString(),
              }))
            }
            required
            showIcon
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="budget_id">Budget</label>
          <Dropdown
            filter
            id="budget_id"
            name="budget_id"
            value={formState.budget_id}
            options={budgets.map((budget) => ({
              value: budget.id,
              label: budget.name,
            }))}
            onChange={(e) => handleSelectChange("budget_id", e.value)}
            placeholder="Select a Budget"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="requester_id">Requester*</label>
          <Dropdown
            filter
            id="requester_id"
            name="requester_id"
            value={formState.requester_id}
            options={employees.map((employee) => ({
              value: employee.id,
              label: `${employee.first_name} ${employee.last_name}`,
            }))}
            onChange={(e) => handleSelectChange("requester_id", e.value)}
            placeholder="Select a Requester"
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="department_id">Department*</label>
          <Dropdown
            filter
            id="department_id"
            name="department_id"
            value={formState.department_id}
            options={departments.map((department) => ({
              value: department.id,
              label: department.name,
            }))}
            onChange={(e) => handleSelectChange("department_id", e.value)}
            placeholder="Select a Department"
            className="w-full"
            required
          />
        </div>

        {/* Items Section */}
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <h4 className="text-xl font-semibold">Items</h4>
          <DataTable
            value={formState.items}
            emptyMessage="No items added yet."
            className="w-full"
            footer={
              <div className="p-field">
                <Button
                  size="small"
                  type="button"
                  label="Add Item"
                  icon="pi pi-plus"
                  onClick={addItem}
                  className="p-button-outlined w-max"
                />
              </div>
            }
          >
            {selectedBudget && (
              <Column
                header="Budget Item"
                body={(item: ReqItem, { rowIndex }) => (
                  <Dropdown
                    value={item.budget_item_id}
                    options={budgetItems.map((it) => ({
                      value: it.id,
                      label: it.name,
                    }))}
                    onChange={(e) => handleItemSelectChange(rowIndex, e.value)}
                    placeholder="Select Budget Item"
                    className="w-full"
                  />
                )}
              />
            )}

            <Column
              header="Quantity"
              body={(item: ReqItem, { rowIndex }) => (
                <InputNumber
                  value={item.quantity}
                  onValueChange={(e) =>
                    handleItemChange(rowIndex, "quantity", e.value || 1)
                  }
                  min={1}
                  className="w-full"
                />
              )}
            />

            <Column
              header="Unit Cost"
              body={(item: ReqItem, { rowIndex }) => (
                <InputNumber
                  value={item.unit_cost}
                  onValueChange={(e) =>
                    handleItemChange(rowIndex, "unit_cost", e.value || 0)
                  }
                  mode="currency"
                  currency={selectedCurrency?.code || "TZS"}
                  locale="en-US"
                  className="w-full"
                />
              )}
            />

            <Column
              header="Currency"
              body={(item: ReqItem, { rowIndex }) => (
                <Dropdown
                  value={item.currency_id}
                  options={currencies.map((curr) => ({
                    value: curr.id,
                    label: curr.code,
                  }))}
                  onChange={(e) =>
                    handleItemChange(rowIndex, "currency_id", e.value)
                  }
                  placeholder="Select Currency"
                  className="w-full"
                />
              )}
            />

            <Column
              header="Specifications"
              body={(item: ReqItem, { rowIndex }) => (
                <InputText
                  value={item.specifications || ""}
                  onChange={(e) =>
                    handleItemChange(
                      rowIndex,
                      "specifications",
                      e.target.value || null
                    )
                  }
                  className="w-full"
                />
              )}
            />

            <Column
              header="Total"
              body={(item: ReqItem) => (
                <div>
                  {formatCurrency(
                    item.quantity * item.unit_cost,
                    currencies.find((c) => c.id === item.currency_id)?.code ||
                      "TZS"
                  )}
                </div>
              )}
            />

            <Column
              header="Actions"
              body={(_, { rowIndex }) => (
                <Button
                  type="button"
                  icon="pi pi-trash"
                  className="p-button-danger p-button-outlined !bg-red-500"
                  onClick={() => removeItem(rowIndex)}
                />
              )}
            />
          </DataTable>

          <div className="text-xl font-semibold my-2 flex justify-between">
            <span>Total Cost: </span>
            <span className="mr-80">
              {formatCurrency(totalCost || 0, selectedCurrency?.code || "TZS")}
            </span>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default AddCashRequisition;
