
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useBudgets from "../../../hooks/budgets/useBudgets";
import useBudgetCategories from "../../../hooks/budgets/useBudgetCategories";
import useProjects from "../../../hooks/projects/useProjects";
import useAssetsAccounts from "../../../hooks/accounts/useAssetsAccounts";
import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import { Fieldset } from "primereact/fieldset";
import useCurrencies from "../../../hooks/procurement/useCurrencies";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Budget;
  onSave: () => void;
}

interface BudgetAllocation {
  name: string;
  project_id: string;
  activity_id: string;
  allocated_amount: number | null;
  description: string;
}

interface BudgetItem {
  name: string;
  type: string;
  amount: number | "";
  currency_id: string;
  chart_of_account_id: string;
  budget_allocation_id: string | null;
  description: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    parent_id: null,
    budget_category_id: "",
  });

  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [activities, setActivities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { data: currencies } = useCurrencies();


  const { token } = useAuth();
  const { data: budgets } = useBudgets();
  const { data: categories = [] } = useBudgetCategories();
  const { expenseAccounts, incomeAccounts } = useAssetsAccounts();

  const isEditing = !!item;
  const isStep1Valid = () => formState.budget_category_id && formState.name;
  const isStep2Valid = () => items.length > 0 && items.every(item => item.name && item.amount && item.type && item.chart_of_account_id);

  const goNext = () => isStep1Valid() && setCurrentStep(1);
  const goBack = () => setCurrentStep(0);

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        description: item.description || "",
        parent_id: item.parent_id || null,
        budget_category_id: item.budget_category_id || "",
      });
      setCurrentStep(0); // Always show step 0 when editing
    } else {
      setFormState({
        name: "",
        description: "",
        parent_id: null,
        budget_category_id: "",
      });
      setAllocations([]);
      setItems([]);
      setCurrentStep(0); // Reset to step 0 when creating new
    }
  }, [item]);

  const fetchActivitiesByProject = async (projectId: string) => {
    try {
      const res = await createRequest(
        `/projects/${projectId}/activities`,
        token.access_token
      );
      setActivities(res.activities || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        type: "",
        amount: "",
        currency_id: item?.currency_id || 0,
        chart_of_account_id: "",
        budget_allocation_id: null,
        description: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? BUDGETS_ENDPOINTS.BUDGETS.UPDATE(item.id.toString())
      : BUDGETS_ENDPOINTS.BUDGETS.ADD;

    const payload = {
      ...formState,
      parent_id: formState.parent_id ?? null,
      allocations,
      budget_items: items,
    };

    await createRequest(endpoint, token.access_token, payload, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const renderFooter = () => {
    if (isEditing) {
      return (
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={onClose}
            className="p-button-text"
          />
          <Button
            label="Update Budget"
            icon="pi pi-check"
            type="submit"
            form="budget-form"
            loading={isSubmitting}
          />
        </div>
      );
    }

    return (
      <div className="flex justify-between">
        <div>
          {currentStep > 0 && (
            <Button
              label="Back"
              icon="pi pi-arrow-left"
              onClick={goBack}
              className="p-button-text"
            />
          )}
        </div>
        <div>
          {currentStep === 0 ? (
            <Button
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={goNext}
              disabled={!isStep1Valid()}
            />
          ) : (
            <Button
              label="Create Budget"
              icon="pi pi-check"
              type="submit"
              form="budget-form"
              disabled={!isStep2Valid()}
              loading={isSubmitting}
            />
          )}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="grid gap-4 mt-4">
      <div className="col-12 md:col-6">
        <label htmlFor="budget_category_id" className="block text-600 text-sm font-medium mb-2">
          Budget Category *
        </label>
        <Dropdown
          id="budget_category_id"
          name="budget_category_id"
          value={formState.budget_category_id}
          options={categories.map(cat => ({
            label: cat.name,
            value: cat.id,
          }))}
          onChange={(e) =>
            setFormState(prev => ({
              ...prev,
              budget_category_id: e.value,
            }))
          }
          className="w-full"
          placeholder="Select Category"
          required
        />
      </div>

      <div className="col-12 md:col-6">
        <label htmlFor="name" className="block text-600 text-sm font-medium mb-2">
          Budget Name *
        </label>
        <InputText
          id="name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          className="w-full"
          required
        />
      </div>

      <div className="col-12">
        <label htmlFor="description" className="block text-600 text-sm font-medium mb-2">
          Description
        </label>
        <InputTextarea
          id="description"
          name="description"
          value={formState.description}
          onChange={handleChange}
          rows={3}
          className="w-full"
        />
      </div>

      <div className="col-12">
        <label htmlFor="parent_id" className="block text-600 text-sm font-medium mb-2">
          Parent Budget
        </label>
        <Dropdown
          id="parent_id"
          name="parent_id"
          value={formState.parent_id}
          options={budgets?.map(b => ({
            label: b.name,
            value: b.id,
          })) || []}
          onChange={(e) =>
            setFormState(prev => ({
              ...prev,
              parent_id: e.value,
            }))
          }
          className="w-full"
          showClear
          placeholder="Select parent budget"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="mt-4">
      <Fieldset legend="Budget Items" className="mb-4">
        {items.length === 0 && (
          <div className="text-center py-4 text-600">
            No budget items added yet
          </div>
        )}

        {items.map((item, index) => (
          <div key={index} className="mb-4 p-3 border-round border-1 surface-border">
            <div className="grid gap-3">
              <div className="col-12 md:col-4">
                <label className="block text-600 text-sm font-medium mb-2">Name *</label>
                <InputText
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="col-12 md:col-2">
                <label className="block text-600 text-sm font-medium mb-2">Type *</label>
                <Dropdown
                  placeholder="Select Type"
                  value={item.type}
                  options={[
                    { label: 'Expense', value: 'expense' },
                    { label: 'Revenue', value: 'revenue' },
                  ]}
                  onChange={(e) => handleItemChange(index, 'type', e.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="col-12 md:col-3">
                <label className="block text-600 text-sm font-medium mb-2">Amount *</label>
                <InputNumber
                  value={item.amount}
                  onValueChange={(e) => handleItemChange(index, 'amount', e.value || '')}
                  className="w-full"
                  required
                />
              </div>

              <div className="col-12 md:col-3">
                <label className="block text-600 text-sm font-medium mb-2">Currency</label>
                <Dropdown
                    value={item.currency_id}
                    onChange={(e) =>
                      handleItemChange(index, "currency_id", e.value)
                    }
                    options={currencies || []}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Currency"
                    className="w-5rem"
                  />
              </div>

              <div className="col-12 md:col-6">
                <label className="block text-600 text-sm font-medium mb-2">Account *</label>
                <Dropdown
                  filter
                  value={item.chart_of_account_id}
                  options={
                    (item.type === 'revenue' ? incomeAccounts : expenseAccounts || []).map(acc => ({
                      label: acc.name,
                      value: acc.id,
                    }))
                  }
                  onChange={(e) => handleItemChange(index, 'chart_of_account_id', e.value)}
                  placeholder="Select Account"
                  className="w-full"
                  required
                />
              </div>

              <div className="col-12">
                <label className="block text-600 text-sm font-medium mb-2">Description</label>
                <InputTextarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-3 flex items-end">
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger p-button-outlined"
                  onClick={() => removeItem(index)}
                  tooltip="Remove item"
                  tooltipOptions={{ position: 'top' }}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          label="Add Item"
          icon="pi pi-plus"
          onClick={addItem}
          className="w-full md:w-auto"
        />
      </Fieldset>
    </div>
  );

  return (
    <Dialog
      header={isEditing ? 'Edit Budget' : 'Create New Budget'}
      visible={visible}
      className="w-full max-w-3xl"
      footer={renderFooter()}
      onHide={onClose}
    >
      <form id="budget-form" onSubmit={handleSubmit}>
        {currentStep === 0 && renderStep1()}
        {currentStep === 1 && !isEditing && renderStep2()}
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;