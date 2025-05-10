//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useItems from "../../../hooks/inventory/useItems";
import useProjects from "../../../hooks/projects/useProjects";
import useBudgets from "../../../hooks/budgets/useBudgets";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { CashRequisition } from "../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useEmployees from "../../../hooks/hr/useEmployees";
import { v4 as uuidv4 } from "uuid";
import { formatCurrency } from "../../../utils/formatCurrency";
import useDepartments from "../../../hooks/hr/useDepartments";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import useLedgers from "../../../hooks/accounts/useLedgers";

interface AddCashRequisition {
  title: string;
  currency_id: string;
  requester_id: string;
  date_expected: string;
  budget_id?: string;
  department_id: string;
  items: ReqItem[];
}

interface ReqItem {
  unit_cost: number;
  budget_item_id?: string;
  quantity: number;
  specifications: null;
  chart_of_account_id: number;
  uuid: string; // For internal tracking only
  item_name?: string; // For display only
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
  const [formState, setFormState] = useState<Partial<AddCashRequisition>>({
    items: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: budgets } = useBudgets();
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  const { token } = useAuth();
  const { data: currencies } = useCurrencies();
  const { data: expenseAccounts } = useLedgers();
  const { data: projects } = useProjects();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();

  useEffect(() => {
    if (item) {
      // Initialize form with existing item data
      setFormState({
        title: item.title,
        currency_id: item.currency_id,
        requester_id: item.requester_id,
        date_expected: item.date_expected,
        budget_id: item.budget_id,
        department_id: item.department_id,
        items:
          item.items?.map((item) => ({
            ...item,
            uuid: uuidv4(),
          })) || [],
      });
    } else {
      // Reset form for new item
      setFormState({
        items: [],
      });
    }
  }, [item]);

  useEffect(() => {
    if (formState.budget_id) {
      const budget = budgets.find((b) => b.id === formState.budget_id);
      setSelectedBudget(budget || null);

      if (budget) {
        setAvailableItems(
          budget.items.map((item) => ({
            ...item,
            uuid: uuidv4(),
            chart_of_account_id: item.chart_of_account_id,
            unit_cost: item.amount_in_base_currency,
          }))
        );
      }
    } else {
      setAvailableItems(
        expenseAccounts.map((account) => ({
          uuid: uuidv4(),
          item_name: account.name,
          chart_of_account_id: account.id,
          unit_cost: 0,
        }))
      );
    }
  }, [formState.budget_id, budgets, expenseAccounts]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof AddCashRequisition, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof ReqItem,
    value: any
  ) => {
    const updatedItems = [...(formState.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormState((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleItemSelect = (index: number, uuid: string) => {
    const selectedItem = availableItems.find((item) => item.uuid === uuid);
    if (selectedItem) {
      const updatedItems = [...(formState.items || [])];
      updatedItems[index] = {
        unit_cost: selectedItem.unit_cost,
        budget_item_id: selectedItem.id,
        chart_of_account_id: selectedItem.chart_of_account_id,
        quantity: 1,
        specifications: null,
        uuid: selectedItem.uuid,
      };
      setFormState((prev) => ({ ...prev, items: updatedItems }));
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = [...(formState.items || [])];
    updatedItems.splice(index, 1);
    setFormState((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          unit_cost: 0,
          quantity: 1,
          specifications: null,
          chart_of_account_id: 0,
          uuid: uuidv4(),
        },
      ],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare the payload
      const payload = {
        title: formState.title,
        currency_id: formState.currency_id,
        requester_id: formState.requester_id,
        date_expected: formState.date_expected,
        budget_id: formState.budget_id,
        department_id: formState.department_id,
        items:
          formState.items?.map((item) => ({
            unit_cost: item.unit_cost,
            budget_item_id: item.budget_item_id,
            quantity: item.quantity,
            specifications: null,
            chart_of_account_id: item.chart_of_account_id,
          })) || [],
      };

      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.UPDATE(item.id.toString())
        : ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.ADD;

      const response = await createRequest(
        endpoint,
        token.access_token,
        payload,
        onSave,
        method
      );

      if(response.sucess) {
        setIsSubmitting(false)
      }else{
        setIsSubmitting;(false)
      }
      onClose();
    } catch (error) {
      console.error("Error saving requisition:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost =
    formState.items?.reduce(
      (sum, item) => sum + item.unit_cost * item.quantity,
      0
    ) || 0;

  const selectedCurrency = currencies?.find(
    (c) => c.id === formState.currency_id
  );

  return (
    <Dialog
      header={item?.id ? "Edit Cash Requisition" : "Add Cash Requisition"}
      visible={visible}
      onHide={onClose}
      className="w-full max-w-4xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <InputText
              name="title"
              value={formState.title || ""}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <Dropdown
              value={formState.currency_id}
              options={
                currencies?.map((c) => ({
                  value: c.id,
                  label: c.name,
                })) || []
              }
              onChange={(e) => handleSelectChange("currency_id", e.value)}
              placeholder="Select Currency"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date Expected
            </label>
            <Calendar
              value={
                formState.date_expected
                  ? new Date(formState.date_expected)
                  : null
              }
              onChange={(e) =>
                handleSelectChange(
                  "date_expected",
                  e.value?.toISOString().split("T")[0]
                )
              }
              className="w-full"
              required
              showIcon
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Budget</label>
            <Dropdown
              value={formState.budget_id}
              options={
                budgets?.map((b) => ({
                  value: b.id,
                  label: b.name,
                })) || []
              }
              onChange={(e) => handleSelectChange("budget_id", e.value)}
              placeholder="Select Budget"
              className="w-full"
              filter
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Requester</label>
            <Dropdown
              value={formState.requester_id}
              options={
                employees?.map((e) => ({
                  value: e.id,
                  label: `${e.first_name} ${e.last_name}`,
                })) || []
              }
              onChange={(e) => handleSelectChange("requester_id", e.value)}
              placeholder="Select Requester"
              className="w-full"
              required
              filter
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Dropdown
              value={formState.department_id}
              options={
                departments?.map((d) => ({
                  value: d.id,
                  label: d.name,
                })) || []
              }
              onChange={(e) => handleSelectChange("department_id", e.value)}
              placeholder="Select Department"
              className="w-full"
              required
              filter
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Items</h3>

          <DataTable
            value={formState.items || []}
            emptyMessage="No items added"
            className="w-full"
          >
            <Column
              header="Item"
              body={(item, { rowIndex }) => (
                <Dropdown
                  value={item.uuid}
                  options={availableItems.map((i) => ({
                    value: i.uuid,
                    label: i.item_name || i.name,
                  }))}
                  onChange={(e) => handleItemSelect(rowIndex, e.value)}
                  placeholder="Select Item"
                  className="w-full"
                />
              )}
            />
            <Column
              header="Unit Cost"
              body={(item, { rowIndex }) => (
                <InputNumber
                  value={item.unit_cost}
                  onValueChange={(e) =>
                    handleItemChange(rowIndex, "unit_cost", e.value || 0)
                  }
                  mode="currency"
                  currency={selectedCurrency?.code || "USD"}
                  className="w-full"
                />
              )}
            />
            <Column
              header="Quantity"
              body={(item, { rowIndex }) => (
                <InputNumber
                  value={item.quantity}
                  onValueChange={(e) =>
                    handleItemChange(rowIndex, "quantity", e.value || 0)
                  }
                  min={1}
                  className="w-full"
                />
              )}
            />
            <Column
              header="Total"
              body={(item) => (
                <div>
                  {formatCurrency(
                    item.unit_cost * item.quantity,
                    selectedCurrency?.code || "USD"
                  )}
                </div>
              )}
            />
            <Column
              header="Actions"
              body={(_, { rowIndex }) => (
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger p-button-text"
                  onClick={() => removeItem(rowIndex)}
                />
              )}
            />
          </DataTable>

          <Button
            icon="pi pi-plus"
            label="Add Item"
            onClick={addItem}
            className="mt-2"
          />

          <div className="mt-4 text-right font-bold">
            Total: {formatCurrency(totalCost, selectedCurrency?.code || "USD")}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={onClose}
            className="p-button-text"
            disabled={isSubmitting}
          />
          <Button
            label={item?.id ? "Update" : "Submit"}
            icon="pi pi-check"
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
