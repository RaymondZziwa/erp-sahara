import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../../api/hrEndpoints";
import { AllowanceType } from "../../../../redux/slices/types/hr/salary/AllowanceType";
import { InputText } from "primereact/inputtext";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: AllowanceType;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<AllowanceType>>({
    name: "",
    description: "",
    calculation_method: "amount",
    allowance_is: "mandatory",
    amount: 0,
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
        calculation_method: "amount",
        allowance_is: "mandatory",
        amount: 0,
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name || !formState.description) {
      // Optionally add error notification here
      setIsSubmitting(false);
      return;
    }

    const { name, description, calculation_method, allowance_is, amount } =
      formState;
    const data = {
      name,
      description,
      calculation_method,
      allowance_is,
      amount,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.ALLOWANCE_TYPES.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.ALLOWANCE_TYPES.ADD;

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
        form="allowance-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Allowance Type" : "Add Allowance Type"}
      visible={visible}
      style={{ width: "450px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="allowance-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="name">Name</label>
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
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="calculation_method">Calculation Method</label>
          <select
            id="calculation_method"
            name="calculation_method"
            value={formState.calculation_method}
            onChange={handleInputChange}
            className="p-inputtext w-full"
          >
            <option value="amount">Amount</option>
            <option value="percent">Percent</option>
          </select>
        </div>

        <div className="p-field">
          <label htmlFor="allowance_is">Allowance Type</label>
          <select
            id="allowance_is"
            name="allowance_is"
            value={formState.allowance_is}
            onChange={handleInputChange}
            className="p-inputtext w-full"
          >
            <option value="mandatory">Mandatory</option>
            <option value="optional">Optional</option>
            <option value="adjustable">Adjustable</option>
          </select>
        </div>

        <div className="p-field">
          <label htmlFor="amount">Amount</label>
          <InputNumber
            id="amount"
            name="amount"
            type="number"
            value={formState.amount}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
