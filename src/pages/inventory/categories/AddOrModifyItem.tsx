import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Category } from "../../../redux/slices/types/procurement/categories";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Category;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<{
    name: string;
    description: string;
    is_final_product: boolean;
  }>({
    name: "",
    description: "",
    is_final_product: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        description: item.description || "",
        is_final_product: (item as any).is_final_product ?? false,
      });
    } else {
      setFormState({ name: "", description: "", is_final_product: false });
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

  const handleCheckboxChange = (e: any) => {
    setFormState((prev) => ({
      ...prev,
      is_final_product: e.checked,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name) {
      setIsSubmitting(false);
      return;
    }

    const data = {
      name: formState.name,
      is_final_product: formState.is_final_product,
      description: formState.description,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.ITEM_CATEGORIES.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.ITEM_CATEGORIES.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);

    setIsSubmitting(false);
    onSave();
    onClose();
    setFormState({ name: "", description: "", is_final_product: false });
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Item" : "Add Category"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <p className="mb-6">
        Fields marked with a red asterik (<span className="text-red-500">*</span>) are mandatory.
      </p>
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name" className="text-sm">
              Name<span className="text-red-500">*</span>
            </label>
            <InputText
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              className="w-full p-inputtext-sm"
              required
            />
          </div>

          {/* <div className="p-field flex items-center space-x-2 mt-3">
            <Checkbox
              inputId="is_final_product"
              checked={formState.is_final_product}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="is_final_product" className="text-sm cursor-pointer">
              Is Final Product?
            </label>
          </div> */}

          <div className="p-field mt-3">
            <label htmlFor="description" className="text-sm">
              Description
            </label>
            <InputTextarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              className="w-full p-inputtext-sm"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
