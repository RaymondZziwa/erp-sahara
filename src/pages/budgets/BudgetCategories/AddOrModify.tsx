//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";

interface BudgetCategory {
  id?: number;
  name: string;
  description?: string;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: BudgetCategory;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<BudgetCategory>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name,
        description: item.description || "",
      });
    } else {
      setFormState({});
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name) {
      console.log("Name is required");
      setIsSubmitting(false);
      return;
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? BUDGETS_ENDPOINTS.BUDGET_CATEGORIES.UPDATE(item.id.toString())
      : BUDGETS_ENDPOINTS.BUDGET_CATEGORIES.ADD;

    const data = {
      name: formState.name,
      description: formState.description || "",
    };

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        disabled={isSubmitting}
        className="hover:!bg-red-400 !bg-red-500 text-white"
        size="small"
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="category-form"
        loading={isSubmitting}
        disabled={isSubmitting}
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Category" : "Add Category"}
      visible={visible}
      className="max-w-lg"
      footer={footer}
      onHide={onClose}
    >
      <form id="category-form" onSubmit={handleSave} className="grid gap-4">
        <div className="p-field">
          <label htmlFor="name">Category Name</label>
          <InputText
            id="name"
            name="name"
            value={formState.name || ""}
            onChange={handleInputChange}
            required
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
            rows={3}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
