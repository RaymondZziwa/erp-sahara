import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../../api/hrEndpoints";
import useDeductionTypes from "../../../../hooks/hr/salary/useDeductionTypes";
import { Deduction } from "../../../../redux/slices/types/hr/salary/Deduction";
import useAssetsAccounts from "../../../../hooks/accounts/useAssetsAccounts";
import { InputTextarea } from "primereact/inputtextarea";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Deduction;
  onSave: () => void;
}

const classificationOptions = [
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
  { label: "Payable", value: "payable" },
  { label: "Asset", value: "asset" },
];

const calculationOptions = [
  { label: "Amount", value: "amount" },
  { label: "Percent", value: "percent" },
];

const deductionIsOptions = [
  { label: "Mandatory", value: "mandatory" },
  { label: "Optional", value: "optional" },
  { label: "Adjustable", value: "adjustable" },
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<any>({
    deduction_type_id: "",
    is_tax: false,
    accounting_classification: "expense",
    account_id: null,
    calculation_method: "amount",
    deduction_is: "mandatory",
    amount: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    frequency: "One-Time",
    employee_id: 0,
  });

    const {
      expenseAccounts,
      cashAccounts,
      payableAccounts,
      incomeAccounts,
      data: accounts,
      refresh,
    } = useAssetsAccounts();
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const { token } = useAuth();
  const { data: deductionTypes } = useDeductionTypes();

  useEffect(() => {
    if (item) {
      setFormState({ ...formState, ...item });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string, value: any) => {
    setFormState((prev: any) => ({ ...prev, [name]: value }));
  };



  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.amount ||
      !formState.deduction_type_id ||
      dateError
    ) {
      setIsSubmitting(false);
      return;
    }

    const payload = {
      deduction_type_id: formState.deduction_type_id,
      is_tax: formState.is_tax,
      accounting_classification: formState.accounting_classification,
      account_id: formState.account_id,
      calculation_method: formState.calculation_method,
      deduction_is: formState.deduction_is,
      amount: Number(formState.amount),
      name: formState.name,
      description: formState.description,
    };

    console.log("Payload to API:", payload);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.DEDUCTIONS.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.DEDUCTIONS.ADD;

    await createRequest(endpoint, token.access_token, payload, onSave, method);
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
        //disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        //type="submit"
        //form="deduction-form"
        size="small"
        onClick={handleSave}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Deduction" : "Add Deduction"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="deduction-form"
        //onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >

        {/* Deduction Type */}
        <div>
          <label>Deduction Type</label>
          <Dropdown
            value={formState.deduction_type_id || null}
            options={deductionTypes?.map((t) => ({
              label: t.name,
              value: t.id,
            }))}
            onChange={(e) =>
              handleDropdownChange("deduction_type_id", e.value)
            }
            placeholder="Select Deduction Type"
            className="w-full"
          />
        </div>
        {/* Is Tax */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formState.is_tax}
            onChange={(e) =>
              handleDropdownChange("is_tax", e.checked ?? false)
            }
          />
          <label>Is Tax?</label>
        </div>
          {/* Classification */}
          <div>
            <label>Accounting Classification</label>
            <Dropdown
              value={formState.accounting_classification}
              options={classificationOptions}
              onChange={(e) =>
                handleDropdownChange("accounting_classification", e.value)
              }
              className="w-full"
            />
          </div>

        {/* Account ID */}
          <div>
            <label>Account</label>
            <Dropdown
              value={formState.account_id || null}
              options={
                formState.accounting_classification === "income"
                  ? incomeAccounts.map((a) => ({ label: a.name, value: a.id }))
                  : formState.accounting_classification === "expense"
                  ? expenseAccounts.map((a) => ({ label: a.name, value: a.id }))
                  : formState.accounting_classification === "payable"
                  ? payableAccounts.map((a) => ({ label: a.name, value: a.id }))
                  : cashAccounts.map((a) => ({ label: a.name, value: a.id }))
              }
              onChange={(e) => handleDropdownChange("account_id", e.value)}
              placeholder="Select an Account"
              className="w-full"
            />
          </div>
        {/* Calculation Method */}
        <div>
          <label>Calculation Method</label>
          <Dropdown
            value={formState.calculation_method}
            options={calculationOptions}
            onChange={(e) =>
              handleDropdownChange("calculation_method", e.value)
            }
            className="w-full"
          />
        </div>

        {/* Deduction Is */}
        <div>
          <label>Deduction Is</label>
          <Dropdown
            value={formState.deduction_is}
            options={deductionIsOptions}
            onChange={(e) => handleDropdownChange("deduction_is", e.value)}
            className="w-full"
          />
        </div>

        {/* Amount */}
        <div>
          <label>Amount</label>
          <InputText
            name="amount"
            type="number"
            value={formState.amount || ""}
            onChange={handleInputChange}
          />
        </div>


        {/* Name */}
        <div>
          <label>Name</label>
          <InputText
            name="name"
            value={formState.name || ""}
            onChange={handleInputChange}
          />
        </div>

        {/* Description */}
        <div>
          <label>Description</label>
          <InputTextarea
            name="description"
            value={formState.description || ""}
            onChange={handleInputChange}
          />
        </div>
        
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
