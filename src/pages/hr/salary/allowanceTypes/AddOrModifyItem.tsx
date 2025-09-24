import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { toast, ToastContainer } from "react-toastify";
import useAuth from "../../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../../api/hrEndpoints";
import { createRequest } from "../../../../utils/api";
import { AllowanceType } from "../../../../redux/slices/types/hr/salary/AllowanceType";
import useAssetsAccounts from "../../../../hooks/accounts/useAssetsAccounts";

interface AddOrModifyDeptProps {
  visible: boolean;
  onClose: () => void;
  item?: AllowanceType;
  onSave: () => void;
}

const FREQUENCIES = ["Monthly", "Yearly", "One-time"];
const CALC_TYPES = ["fixed", "percentage"];

const AddOrModify: React.FC<AddOrModifyDeptProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    auto_apply: false,
    frequency: "",
    calculation_type: "",
    is_taxable: false,
    default_value: 0,
    account_id: "" as string | number,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {expenseAccounts} = useAssetsAccounts()

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        description: item.description || "",
        auto_apply: !!item.auto_apply,
        frequency: (item as any).frequency || "",
        calculation_type: (item as any).calculation_type || "",
        is_taxable: (item as any).is_taxable ?? false,
        default_value: (item as any).default_value ?? 0,
        account_id: (item as any).account_id ?? "",
      });
    } else {
      setFormState({
        name: "",
        description: "",
        auto_apply: false,
        frequency: "",
        calculation_type: "",
        is_taxable: false,
        default_value: 0,
        account_id: "",
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name || !formState.frequency || !formState.calculation_type) {
      setIsSubmitting(false);
      toast.warn("Fill in all mandatory fields");
      return;
    }

    try {
      const payload = {
        name: formState.name,
        description: formState.description,
        auto_apply: formState.auto_apply ? 1 : 0,
        frequency: formState.frequency,
        calculation_type: formState.calculation_type,
        is_taxable: formState.is_taxable,
        default_value: Number(formState.default_value),
        account_id: Number(formState.account_id),
      };

      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? HUMAN_RESOURCE_ENDPOINTS.ALLOWANCE_TYPES.UPDATE(item.id.toString())
        : HUMAN_RESOURCE_ENDPOINTS.ALLOWANCE_TYPES.ADD;

      await createRequest(endpoint, token.access_token, payload, onSave, method);

      // Reset
      setFormState({
        name: "",
        description: "",
        auto_apply: false,
        frequency: "",
        calculation_type: "",
        is_taxable: false,
        default_value: 0,
        account_id: "",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving allowance type:", error);
      toast.error("An error occurred while saving allowance type.");
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
        form="allowance-form"
        size="small"
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item?.id ? "Edit Allowance Type" : "Add Allowance Type"}
        visible={visible}
        style={{ width: "450px" }}
        footer={footer}
        onHide={onClose}
      >
        <p className="mb-6">
          Fields marked with a red asterisk (<span className="text-red-500">*</span>) are mandatory.
        </p>
        <form
          id="allowance-form"
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
              value={formState.name}
              onChange={handleInputChange}
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
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>
              Frequency<span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formState.frequency}
              options={FREQUENCIES}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, frequency: e.value }))
              }
              placeholder="Select frequency"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>
              Calculation Type<span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formState.calculation_type}
              options={CALC_TYPES}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, calculation_type: e.value }))
              }
              placeholder="Select type"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>Default Value</label>
            <InputNumber
              value={formState.default_value}
              onValueChange={(e) =>
                setFormState((prev) => ({ ...prev, default_value: e.value || 0 }))
              }
              className="w-full"
            />
          </div>
          <div className="p-field">
            <label>Account ID (C.O.A)</label>
            <Dropdown
              value={formState.account_id}
              options={expenseAccounts.map((acc) => ({
                label: acc.name,
                value: acc.id
              }))}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, account_id: e.value }))
              }
              placeholder="Select Account"
              className="w-full"
            />
          </div>

          <div className="p-field flex items-center space-x-2">
            <Checkbox
              inputId="auto_apply"
              checked={formState.auto_apply}
              onChange={(e) => handleCheckboxChange("auto_apply", e.checked)}
            />
            <label htmlFor="auto_apply">Auto Apply</label>
          </div>

          <div className="p-field flex items-center space-x-2">
            <Checkbox
              inputId="is_taxable"
              checked={formState.is_taxable}
              onChange={(e) => handleCheckboxChange("is_taxable", e.checked)}
            />
            <label htmlFor="is_taxable">Is Taxable</label>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModify;
