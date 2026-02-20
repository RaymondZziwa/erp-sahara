//@ts-nocheck
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";
import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";
import useFiscalYears from "../../../hooks/budgets/useFiscalYears";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useAssetsAccounts from "../../../hooks/accounts/useAssetsAccounts";

interface AddOrModifyBudgetProps {
  visible: boolean;
  onClose: () => void;
  budget?: any;
  onSave: () => void;
}

const AddOrModifyBudget: React.FC<AddOrModifyBudgetProps> = ({
  visible,
  onClose,
  budget,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: currencies } = useCurrencies();
  const { data: fiscalYears } = useFiscalYears();
  const { expenseAccounts } = useAssetsAccounts();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    fiscal_year_id: "",
    currency_id: "",
    description: "",
    parent_id: "",
    budget_category: "",
    allocations: [],
  });

  useEffect(() => {
    if (budget) {
      setFormData(budget);
    } else {
      setFormData({
        name: "",
        fiscal_year_id: "",
        currency_id: "",
        description: "",
        parent_id: "",
        budget_category: "",
        allocations: [],
      });
    }
  }, [budget]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // === Allocation logic ===
  const addAllocation = () => {
    setFormData((prev) => ({
      ...prev,
      allocations: [
        ...prev.allocations,
        { account_category_id: "", allocated_amount: "", description: "", items: [] },
      ],
    }));
  };

  const removeAllocation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allocations: prev.allocations.filter((_, i) => i !== index),
    }));
  };

  const handleAllocationChange = (index: number, field: string, value: any) => {
    const updated = [...formData.allocations];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, allocations: updated }));
  };

  // === Items logic ===
  const addItem = (allocIndex: number) => {
    const updated = [...formData.allocations];
    updated[allocIndex].items.push({
      amount: "",
      type: "",
      coa: "",
      description: "",
    });
    setFormData((prev) => ({ ...prev, allocations: updated }));
  };

  const removeItem = (allocIndex: number, itemIndex: number) => {
    const updated = [...formData.allocations];
    updated[allocIndex].items.splice(itemIndex, 1);
    setFormData((prev) => ({ ...prev, allocations: updated }));
  };

  const handleItemChange = (allocIndex: number, itemIndex: number, field: string, value: any) => {
    const updated = [...formData.allocations];
    updated[allocIndex].items[itemIndex][field] = value;
    setFormData((prev) => ({ ...prev, allocations: updated }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const endpoint = budget
      ? BUDGETS_ENDPOINTS.BUDGETS.UPDATE(budget.id)
      : BUDGETS_ENDPOINTS.BUDGETS.ADD;

    const method = budget ? "PUT" : "POST";
    await createRequest(endpoint, token.access_token, formData, onSave, method);
    setIsSubmitting(false);
    onClose();
  };

  // === Step content ===
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 text-gray-700 max-w-3xl mx-auto">
            <div>
              <label className="block text-sm font-medium mb-1">Budget Name</label>
              <InputText name="name" value={formData.name} onChange={handleChange} className="w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Fiscal Year</label>
                <Dropdown
                  name="fiscal_year_id"
                  value={formData.fiscal_year_id}
                  options={fiscalYears?.map((fy) => ({ label: fy.financial_year, value: fy.id }))}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Select Fiscal Year"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <Dropdown
                  name="currency_id"
                  value={formData.currency_id}
                  options={currencies?.map((c) => ({ label: c.code, value: c.id }))}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Select Currency"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Budget Category</label>
              <Dropdown
                name="budget_category"
                value={formData.budget_category}
                options={[
                  { label: "Operational", value: "Operational" },
                  { label: "Capital", value: "Capital" },
                ]}
                onChange={handleChange}
                className="w-full"
                placeholder="Select Category"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <InputTextarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 text-gray-700 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">Allocations</h2>
              <Button label="Add Allocation" icon="pi pi-plus" onClick={addAllocation} />
            </div>
            {formData.allocations.map((alloc, index) => (
              <div key={index} className="border p-3 rounded-lg bg-gray-50 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Dropdown
                    value={alloc.account_category_id}
                    options={expenseAccounts?.map((a) => ({ label: a.name, value: a.id }))}
                    onChange={(e) => handleAllocationChange(index, "account_category_id", e.value)}
                    placeholder="Account Category"
                    className="w-full"
                  />
                  <InputText
                    placeholder="Allocated Amount"
                    value={alloc.allocated_amount}
                    onChange={(e) => handleAllocationChange(index, "allocated_amount", e.target.value)}
                  />
                </div>

                <InputText
                  placeholder="Description"
                  value={alloc.description}
                  onChange={(e) => handleAllocationChange(index, "description", e.target.value)}
                  className="w-full"
                />

                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Items</span>
                    <Button icon="pi pi-plus" text label="Add Item" onClick={() => addItem(index)} />
                  </div>

                  {alloc.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-white p-2 rounded-md border">
                      <InputText
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, i, "amount", e.target.value)}
                      />
                      <Dropdown
                        value={item.type}
                        options={[
                          { label: "Revenue", value: "Revenue" },
                          { label: "Expense", value: "Expense" },
                        ]}
                        onChange={(e) => handleItemChange(index, i, "type", e.value)}
                        placeholder="Type"
                        className="w-full"
                      />
                      <InputText
                        placeholder="COA"
                        value={item.coa}
                        onChange={(e) => handleItemChange(index, i, "coa", e.target.value)}
                      />
                      <InputText
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, i, "description", e.target.value)}
                      />
                      <Button icon="pi pi-trash" text severity="danger" onClick={() => removeItem(index, i)} />
                    </div>
                  ))}
                </div>

                <Button
                  icon="pi pi-trash"
                  text
                  label="Remove Allocation"
                  severity="danger"
                  onClick={() => removeAllocation(index)}
                />
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="text-gray-700 space-y-2 max-w-3xl mx-auto">
            <h2 className="font-semibold mb-2 text-lg">Review Budget</h2>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-80">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        );

      default:
        return null;
    }
  };

  const footer = (
    <div className="flex justify-between mt-4">
      {step > 1 && (
        <Button label="Back" icon="pi pi-arrow-left" onClick={() => setStep(step - 1)} className="p-button-text" />
      )}
      {step < 3 ? (
        <Button label="Next" icon="pi pi-arrow-right" onClick={() => setStep(step + 1)} className="bg-teal-600 text-white" />
      ) : (
        <Button
          label={isSubmitting ? "Saving..." : budget ? "Update Budget" : "Create Budget"}
          icon="pi pi-check"
          onClick={handleSubmit}
          loading={isSubmitting}
          className="bg-teal-600 text-white"
        />
      )}
    </div>
  );

  return (
    <Dialog
      header={budget ? "Edit Budget" : "Add Budget"}
      visible={visible}
      style={{ width: "50vw", maxWidth: "800px" }}
      modal
      footer={footer}
      onHide={onClose}
      className="p-4"
    >
      {renderStep()}
    </Dialog>
  );
};

export default AddOrModifyBudget;
