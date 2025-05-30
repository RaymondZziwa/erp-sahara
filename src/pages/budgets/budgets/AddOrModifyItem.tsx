// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useBudgets from "../../../hooks/budgets/useBudgets";
import useBudgetCategories from "../../../hooks/budgets/useBudgetCategories";
import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";
import { Budget } from "../../../redux/slices/types/budgets/Budget";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Budget;
  onSave: () => void;
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

  const { token } = useAuth();
  const { data: budgets } = useBudgets();
  const { data: categories = [] } = useBudgetCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        description: item.description || "",
        parent_id: item.parent_id || null,
        budget_category_id: item.budget_category_id || "",
      });
    } else {
      setFormState({
        name: "",
        description: "",
        parent_id: null,
        budget_category_id: "",
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name || !formState.budget_category_id) {
      console.log("Missing required fields");
      setIsSubmitting(false);
      return;
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? BUDGETS_ENDPOINTS.BUDGETS.UPDATE(item.id.toString())
      : BUDGETS_ENDPOINTS.BUDGETS.ADD;

    const payload = {
      name: formState.name,
      description: formState.description,
      parent_id: formState.parent_id ?? null,
      budget_category_id: formState.budget_category_id,
    };

    await createRequest(endpoint, token.access_token, payload, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="!bg-red-500 hover:!bg-red-400 text-white"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        form="budget-form"
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        disabled={isSubmitting}
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Budget" : "Add Budget"}
      visible={visible}
      className="max-w-4xl w-full"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="budget-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label htmlFor="budget_category_id" className="block mb-1">
            Budget Category
          </label>
          <Dropdown
            id="budget_category_id"
            name="budget_category_id"
            value={formState.budget_category_id}
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                budget_category_id: e.value,
              }))
            }
            className="w-full"
            placeholder="Select Category"
          />
        </div>

        <div>
          <label htmlFor="name" className="block mb-1">
            Budget Name
          </label>
          <InputText
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="parent_id" className="block mb-1">
            Parent Budget (Optional)
          </label>
          <Dropdown
            id="parent_id"
            name="parent_id"
            value={formState.parent_id}
            options={budgets.map((b) => ({
              label: b.name,
              value: b.id,
            }))}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                parent_id: e.value,
              }))
            }
            className="w-full"
            showClear
            placeholder="Select parent budget"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block mb-1">
            Description
          </label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleChange}
            rows={4}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
