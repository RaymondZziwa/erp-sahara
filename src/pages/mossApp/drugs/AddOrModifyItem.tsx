import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { createMossAppRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import useConditions from "../../../hooks/mossApp/useConditions";
import { Drug } from "../../../redux/slices/types/mossApp/Drug";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Drug>;
  onSave: () => void;
}

interface AddDrug {
  name: string;
  condition_id: string | undefined;
  id?: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialState: AddDrug = {
    name: "",
    condition_id: "",
  };

  const [formState, setFormState] = useState<AddDrug>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: conditions } = useConditions();
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        condition_id: "",
        id: item.id?.toString(),
      });
    } else {
      setFormState(initialState);
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (
    e: DropdownChangeEvent,
    field: keyof AddDrug
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: e.value as string,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = formState.id ? "PUT" : "POST";
    const endpoint = formState.id
      ? MOSS_APP_ENDPOINTS.DRUGS.UPDATE(formState.id)
      : MOSS_APP_ENDPOINTS.DRUGS.ADD;

    await createMossAppRequest(
      endpoint,
      token.access_token,
      {
        name: formState.name,
        condition_id: formState.condition_id,
      },
      onSave,
      method
    );

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
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label={formState.id ? "Update" : "Add"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={formState.id ? "Edit Drug" : "Add Drug"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-field">
            <label htmlFor="name">Drug Name</label>
            <InputText
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="condition_id">Condition</label>
            <Dropdown
              id="condition_id"
              name="condition_id"
              value={formState.condition_id}
              onChange={(e) => handleDropdownChange(e, "condition_id")}
              options={conditions}
              optionLabel="name"
              optionValue="id"
              placeholder="Select a condition"
              filter
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
