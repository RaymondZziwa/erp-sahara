import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { toast, ToastContainer } from "react-toastify";
import useAuth from "../../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../../api/hrEndpoints";
import { createRequest } from "../../../../utils/api";
import { DeductionType } from "../../../../redux/slices/types/hr/salary/DeductionTypes";
import useAssetsAccounts from "../../../../hooks/accounts/useAssetsAccounts";

interface AddOrModifyDeptProps {
  visible: boolean;
  onClose: () => void;
  item?: DeductionType;
  onSave: () => void;
}

const FREQUENCIES = ["Monthly", "Yearly", "One-time"];
const CALC_METHODS = ["fixed", "percent"];
const DEDUCTION_IS = ["mandatory", "optional"];

const AddOrModify: React.FC<AddOrModifyDeptProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
    const {expenseAccounts} = useAssetsAccounts()
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    is_tax: false,
    frequency: "",
    account_id: "",
    calculation_method: "",
    deduction_is: "",
    auto_apply: false,
    default_value: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        description: item.description || "",
        is_tax: (item as any).is_tax ?? false,
        frequency: (item as any).frequency || "",
        account_id: (item as any).account_id?.toString() || "",
        calculation_method: (item as any).calculation_method || "",
        deduction_is: (item as any).deduction_is || "",
        auto_apply: (item as any).auto_apply ?? false,
        default_value: (item as any).default_value ?? 0,
      });
    } else {
      setFormState({
        name: "",
        description: "",
        is_tax: false,
        frequency: "",
        account_id: "",
        calculation_method: "",
        deduction_is: "",
        auto_apply: false,
        default_value: 0,
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormState((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (
      !formState.name ||
      !formState.frequency ||
      !formState.calculation_method ||
      !formState.deduction_is ||
      !formState.account_id
    ) {
      setIsSubmitting(false);
      toast.warn("Fill in all the mandatory fields");
      return;
    }

    try {
      const payload = {
        name: formState.name,
        is_tax: formState.is_tax,
        frequency: formState.frequency,
        account_id: Number(formState.account_id),
        calculation_method: formState.calculation_method,
        deduction_is: formState.deduction_is,
        auto_apply: formState.auto_apply,
        default_value: Number(formState.default_value),
        description: formState.description,
      };

      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? HUMAN_RESOURCE_ENDPOINTS.DEDUCTION_TYPES.UPDATE(item.id.toString())
        : HUMAN_RESOURCE_ENDPOINTS.DEDUCTION_TYPES.ADD;

      await createRequest(endpoint, token.access_token, payload, onSave, method);

      // Reset form
      setFormState({
        name: "",
        description: "",
        is_tax: false,
        frequency: "",
        account_id: "",
        calculation_method: "",
        deduction_is: "",
        auto_apply: false,
        default_value: 0,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving deduction type:", error);
      toast.error("An error occurred while saving deduction type.");
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
        form="deduction-form"
        size="small"
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item?.id ? "Edit Deduction Type" : "Add Deduction Type"}
        visible={visible}
        style={{ width: "450px" }}
        footer={footer}
        onHide={onClose}
      >
        <p className="mb-6">
          Fields marked with a red asterisk (<span className="text-red-500">*</span>) are mandatory.
        </p>

        <form
          id="deduction-form"
          onSubmit={handleSave}
          className="p-fluid grid grid-cols-1 gap-4"
        >
          <div className="p-field">
            <label>
              Name<span className="text-red-500">*</span>
            </label>
            <InputText
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>Description</label>
            <InputTextarea
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
              onChange={(e) => setFormState((p) => ({ ...p, frequency: e.value }))}
              placeholder="Select frequency"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>
              Calculation Method<span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formState.calculation_method}
              options={CALC_METHODS}
              onChange={(e) =>
                setFormState((p) => ({ ...p, calculation_method: e.value }))
              }
              placeholder="Select method"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>
              Deduction Is<span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formState.deduction_is}
              options={DEDUCTION_IS}
              onChange={(e) => setFormState((p) => ({ ...p, deduction_is: e.value }))}
              placeholder="Select type"
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

          <div className="p-field">
            <label>Default Value</label>
            <InputNumber
              value={formState.default_value}
              onValueChange={(e) =>
                setFormState((p) => ({ ...p, default_value: e.value || 0 }))
              }
              mode="decimal"
              minFractionDigits={2}
              className="w-full"
            />
          </div>

          <div className="p-field flex items-center space-x-2">
            <Checkbox
              inputId="is_tax"
              checked={formState.is_tax}
              onChange={(e) => handleCheckboxChange("is_tax", e.checked)}
            />
            <label htmlFor="is_tax">Is Tax</label>
          </div>

          <div className="p-field flex items-center space-x-2">
            <Checkbox
              inputId="auto_apply"
              checked={formState.auto_apply}
              onChange={(e) => handleCheckboxChange("auto_apply", e.checked)}
            />
            <label htmlFor="auto_apply">Auto Apply</label>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModify;
