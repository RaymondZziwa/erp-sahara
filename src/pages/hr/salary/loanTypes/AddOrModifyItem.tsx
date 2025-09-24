import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { toast, ToastContainer } from "react-toastify";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../../api/hrEndpoints";

interface LoanTypePayload {
  id?: string;
  name: string;
  description?: string;
  auto_apply?: boolean | null;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: LoanTypePayload;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<LoanTypePayload>>({
    name: "",
    description: "",
    auto_apply: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({
        name: "",
        description: "",
        auto_apply: null,
      });
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      auto_apply: checked ? true : null, // if unchecked, send null
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name) {
      setIsSubmitting(false);
      toast.warn("Fill in all the mandatory fields");
      return;
    }

    try {
      const data: LoanTypePayload = {
        name: formState.name,
        description: formState.description,
        auto_apply: formState.auto_apply,
      };

      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? HUMAN_RESOURCE_ENDPOINTS.LOAN_TYPES.UPDATE(item.id.toString())
        : HUMAN_RESOURCE_ENDPOINTS.LOAN_TYPES.ADD;

      await createRequest(endpoint, token.access_token, data, onSave, method);

      // Reset form state
      setFormState({
        name: "",
        description: "",
        auto_apply: null,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving loan type:", error);
      toast.error("An error occurred while saving loan type.");
    } finally {
      setIsSubmitting(false);
    }
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
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="loan-type-form"
        size="small"
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item?.id ? "Edit Loan Type" : "Add Loan Type"}
        visible={visible}
        style={{ width: "400px" }}
        footer={footer}
        onHide={onClose}
      >
        <p className="mb-6">
          Fields marked with a red asterisk (
          <span className="text-red-500">*</span>) are mandatory.
        </p>
        <form
          id="loan-type-form"
          onSubmit={handleSave}
          className="p-fluid grid grid-cols-1 gap-4"
        >
          <div className="p-field">
            <label htmlFor="name">
              Name<span className="text-red-500">*</span>
            </label>
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
            />
          </div>
          <div className="p-field flex items-center space-x-2">
            <Checkbox
              inputId="auto_apply"
              checked={formState.auto_apply === true}
              onChange={(e) => handleCheckboxChange(e.checked!)}
            />
            <label htmlFor="auto_apply">Auto Apply</label>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifyItem;
