//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";

import { HUMAN_RESOURCE_ENDPOINTS } from "../../../../api/hrEndpoints";
import { DeductionType } from "../../../../redux/slices/types/hr/salary/DeductionTypes";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: DeductionType;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<DeductionType>>({
    deduction_name: "",
    description: "",
    is_tax: false,
    deduction_accounting_type: "expense",
    account_id: 0,
    calculation_method: "amount",
    deduction_is: "mandatory",
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
        deduction_name: "",
        description: "",
        is_tax: false,
        deduction_accounting_type: "expense",
        account_id: 0,
        calculation_method: "amount",
        deduction_is: "mandatory",
        amount: 0,
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: keyof DeductionType, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState((prev) => ({ ...prev, [name]: checked }));
  };

  const handleNumberChange = (
    name: keyof DeductionType,
    value: number | null
  ) => {
    setFormState((prev) => ({ ...prev, [name]: value ?? 0 }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.deduction_name || !formState.description) return;

    const data = {
      name: formState.deduction_name,
      description: formState.description,
      is_tax: formState.is_tax,
      deduction_accounting_type: formState.deduction_accounting_type,
      account_id: formState.account_id,
      calculation_method: formState.calculation_method,
      deduction_is: formState.deduction_is,
      amount: formState.amount,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.DEDUCTION_TYPES.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.DEDUCTION_TYPES.ADD;

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
        form="deduction-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Deduction Type" : "Add Deduction Type"}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="deduction-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div>
          <label htmlFor="deduction_name">Name</label>
          <InputText
            id="deduction_name"
            name="deduction_name"
            value={formState.deduction_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            inputId="is_tax"
            name="is_tax"
            checked={formState.is_tax}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="is_tax">Is Tax</label>
        </div>

        <div>
          <label>Accounting Type</label>
          <Dropdown
            value={formState.deduction_accounting_type}
            options={["income", "expense", "payable", "asset"]}
            onChange={(e) =>
              handleDropdownChange("deduction_accounting_type", e.value)
            }
            placeholder="Select Type"
          />
        </div>

        <div>
          <label>Account ID</label>
          <InputNumber
            value={formState.account_id}
            onValueChange={(e) => handleNumberChange("account_id", e.value)}
            useGrouping={false}
          />
        </div>

        <div>
          <label>Calculation Method</label>
          <Dropdown
            value={formState.calculation_method}
            options={["amount", "percent"]}
            onChange={(e) =>
              handleDropdownChange("calculation_method", e.value)
            }
            placeholder="Select Method"
          />
        </div>

        <div>
          <label>Deduction Is</label>
          <Dropdown
            value={formState.deduction_is}
            options={["mandatory", "optional", "adjustable"]}
            onChange={(e) => handleDropdownChange("deduction_is", e.value)}
            placeholder="Select Deduction Type"
          />
        </div>

        <div>
          <label>Amount</label>
          <InputNumber
            value={formState.amount}
            onValueChange={(e) => handleNumberChange("amount", e.value)}
            useGrouping={false}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
