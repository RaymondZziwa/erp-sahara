//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useItems from "../../../hooks/inventory/useItems";
import useProjects from "../../../hooks/projects/useProjects";
import useBudgets from "../../../hooks/budgets/useBudgets";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { CashRequisition } from "../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useEmployees from "../../../hooks/hr/useEmployees";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { InputNumber } from "primereact/inputnumber";
import { formatCurrency } from "../../../utils/formatCurrency";
import useDepartments from "../../../hooks/hr/useDepartments";
import { Budget } from "../../../redux/slices/types/budgets/Budget";

interface AddCashRequisition {
  title: string;
  total_amount: number;
  currency_id: number;
  requester_id: number;
  date_expected: string;
  purpose: string;
  project_id?: number;
  department_id: number;
  branch_id: number;
  segment_id: number;
  items: ReqItem[];
  budget_id?: string;
}

interface ReqItem {
  item_type: string;
  uuid: string;
  item_id: number;
  item_name: string;
  chart_of_accounts_id: any;
  quantity: number;
  unit_cost: number;
  price: number;
  budget_item_id?: number; //When a budget is selected on a requisition an added item must be compared to its budgeted value
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CashRequisition;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<AddCashRequisition>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: budgets, refresh } = useBudgets();
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [allItems, setAllItems] = useState<ReqItem[]>([]);

  const { token } = useAuth();
  const { data: currencies } = useCurrencies();
  const {data: expenseAccounts} = useLedgers()
  const { data: inventoryItems } = useItems();
  const { data: projects } = useProjects();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();

 useEffect(() => {
   if (formState.budget_id) {
     const selectedBudget = budgets.find(
       (budget) => budget.id === formState.budget_id
     );
     console.log("selected budget2233:", selectedBudget);
     if (selectedBudget) {
      console.log("selected budget22:", selectedBudget);
       const budgetItems = selectedBudget.items.map((item) => ({
         item_id: item.id,
         item_name: item.name,
         quantity: 0,
         price: +item.amount_in_base_currency,
         unit_cost: +item.amount_in_base_currency,
         budget_item_id: item.budget_id,
         uuid: uuidv4(),
         item_type: "Product", // Default to "Product" or adjust as needed
       }));
       setAllItems(budgetItems);
     }
   } else {
     setAllItems(
       inventoryItems.map((item) => ({
         item_id: item.id,
         item_name: item.name,
         quantity: 0,
         price: +item.cost_price,
         unit_cost: +item.cost_price,
         uuid: uuidv4(),
         item_type: item.item_type,
       }))
     );
   }
 }, [formState.budget_id, budgets, inventoryItems]);

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
      console.log('selected budget:', selected)
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
    const selectedItem = allItems.find((item) => item.uuid == value);

    if (selectedItem) {
      const updatedItems = [...(formState.items ?? [])];
      updatedItems[index] = {
        ...updatedItems[index],
        item_id: selectedItem.item_id,
        item_name: selectedItem.item_name,
        price: +selectedItem.price,
        unit_cost: +selectedItem.price,
        budget_item_id: selectedItem?.budget_item_id,
      };

      setFormState((prevState) => ({
        ...prevState,
        items: updatedItems,
      }));
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
          item_id: 0,
          item_name: "",
          price: 0,
          unit_cost: 0,
          budget_item_id: 0,
          chart_of_accounts_id: 0,
          quantity: 0,
          uuid: uuidv4(),
          item_type: "",
        },
      ],
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.title || !formState.currency_id) {
      setIsSubmitting(false);
      return;
    }

    const method = item?.id ? "PUT" : "POST";

    // Construct the payload with `unit_cost` included
    const data = {
      ...formState,
      date_expected: new Date(formState.date_expected ?? new Date())
        .toISOString()
        .slice(0, 10),
      items: formState.items?.map((item) => ({
        ...item,
        unit_cost: item.unit_cost ?? 0, // Explicitly include `unit_cost`
      })),
    };

    console.log("Payload:", data); // Log the payload for verification

    const endpoint = item?.id
      ? ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.UPDATE(item.id.toString())
      : ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const budgetItems = formState.budget_id
    ? budgets.find((budget) => budget.id.toString() == formState.budget_id)
        ?.items
    : [];

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="project-form"
        size="small"
        onClick={(e) => handleSave(e)}
      />
    </div>
  );

  const totalCost = formState.items?.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0
  );
  const selectedCurrency = currencies.find(
    (curr) => curr.id == formState.currency_id
  );

  return (
    <Dialog
      header={item?.id ? "Edit Cash Requisition" : "Add Cash Requisition"}
      visible={visible}
      footer={footer}
      onHide={onClose}
      className="max-w-md md:max-w-2xl xl:max-w-screen-xl"
    >
      <form
        id="project-form"
        //onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {/* Form Fields */}
        <div className="p-field">
          <label htmlFor="name">Title</label>
          <InputText
            id="name"
            name="title"
            value={formState.title || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="currency_id">Currency</label>
          <Dropdown
            id="currency_id"
            name="currency_id"
            value={formState.currency_id}
            options={currencies.map((curr) => ({
              value: curr.id,
              label: curr.name,
            }))}
            onChange={(e) => handleSelectChange("currency_id", e.value)}
            placeholder="Select a Currency"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="date_expected">Date Expected</label>
          <Calendar
            id="date_expected"
            name="date_expected"
            value={new Date(formState.date_expected ?? new Date()) || null}
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
          <label htmlFor="purpose">Purpose</label>
          <InputText
            id="purpose"
            name="purpose"
            value={formState.purpose || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="project_id">Project</label>
          <Dropdown
            showClear
            id="project_id"
            name="project_id"
            value={formState.project_id}
            options={projects.map((project) => ({
              value: project.id,
              label: project.name,
            }))}
            onChange={(e) => handleSelectChange("project_id", e.value)}
            placeholder="Select a Project"
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
          <label htmlFor="requester_id">Requester</label>
          <Dropdown
            filter
            id="requester_id"
            name="requester_id"
            value={formState.requester_id}
            options={employees.map((employee) => ({
              value: employee.id,
              label: employee.first_name + " " + employee.last_name,
            }))}
            onChange={(e) => handleSelectChange("requester_id", e.value)}
            placeholder="Select a Requester"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="department_id">Department</label>
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
          />
        </div>

        This is the second form

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
            <Column
              header="Item"
              field="item_name"
              body={(item: ReqItem, options) =>
                item.item_id ? (
                  item.item_name
                ) : (
                  <Dropdown
                    value={item.uuid}
                    options={
                      selectedBudget
                        ? selectedBudget?.items.map((it) => ({
                            value: it.uuid,
                            label: it.item_name,
                          }))
                        : expenseAccounts.map((acc)=> ({
                          value: acc.id,
                          label: acc.name
                        }))
                    }
                    onChange={(e) =>
                      handleItemSelectChange(options.rowIndex, e.value)
                    }
                    placeholder="Select an Item"
                  />
                )
              }
            />
            <Column
              header="Quantity"
              field="quantity"
              body={(item, options) => (
                <InputNumber
                  className="w-max"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      options.rowIndex,
                      "quantity",
                      e.value ? +e.value : ""
                    )
                  }
                />
              )}
            />
            <Column
              header="Price"
              field="price"
              body={(item, options) => (
                <InputNumber
                  className="w-max"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(
                      options.rowIndex,
                      "price",
                      e.value ? +e.value : ""
                    )
                  }
                />
              )}
            />
            <Column
              header="Cost"
              field="price"
              body={(item: ReqItem) => <div>{item.quantity * item.price}</div>}
            />
            <Column
              header="Actions"
              body={(_, options) => (
                <Button
                  type="button"
                  icon="pi pi-trash"
                  className="p-button-danger p-button-outlined !bg-red-500"
                  onClick={() => removeItem(options.rowIndex)}
                />
              )}
            />
          </DataTable>
          <div className="text-xl font-semibold my-2 flex justify-between">
            <span>Total Cost: </span>
            <span className="mr-80">
              {formatCurrency(totalCost ?? 0, selectedCurrency?.code ?? "TZS")}
            </span>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
