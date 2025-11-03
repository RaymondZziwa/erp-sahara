import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import useAuth from "../../../../hooks/useAuth";
import { createRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { BankAccount } from "../../../../redux/slices/types/accounts/bankReconciliation/bank";
import useBanks from "../../../../hooks/accounts/bankReconciliation/useBanks";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";

interface AddOrModifyBankAccountProps {
  visible: boolean;
  onClose: () => void;
  bankAccount?: BankAccount;
  onSave: () => void;
  banks?: { id: string; name: string }[];
  branches?: { id: string; name: string }[];
  currencies?: { id: string; name: string; code: string }[];
}

const AddOrModifyBankAccount: React.FC<AddOrModifyBankAccountProps> = ({
  visible,
  onClose,
  bankAccount,
  onSave,
}) => {
  const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: banks } = useBanks();
    const {data: currencies} = useCurrencies()

  const [formState, setFormState] = useState({
    bank_id: "",
    bank_branch_id: "",
    currency_id: "",
    name: "",
    account_no: "",
    branch_code: "",
    swift_code: "",
    description: "",
  });

  // Prefill form for edit
  useEffect(() => {
    if (bankAccount) {
      setFormState({
        bank_id: bankAccount.bank_id || "",
        bank_branch_id: bankAccount.bank_branch_id || "",
        currency_id: bankAccount.currency_id || "",
        name: bankAccount.name || "",
        account_no: bankAccount.account_no || "",
        branch_code: bankAccount.branch_code || "",
        swift_code: bankAccount.swift_code || "",
        description: bankAccount.description || "",
      });
    } else {
      setFormState({
        bank_id: "",
        bank_branch_id: "",
        currency_id: "",
        name: "",
        account_no: "",
        branch_code: "",
        swift_code: "",
        description: "",
      });
    }
  }, [bankAccount]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      bank_id: formState.bank_id,
      bank_branch_id: formState.bank_branch_id || null,
      currency_id: formState.currency_id,
      name: formState.name,
      account_no: formState.account_no,
      branch_code: formState.branch_code || null,
      swift_code: formState.swift_code || null,
      description: formState.description || null,
    };

    const method = bankAccount?.id ? "PUT" : "POST";
    const endpoint = bankAccount?.id
      ? ACCOUNTS_ENDPOINTS.BANKACCOUNTS.UPDATE(bankAccount.id.toString())
      : ACCOUNTS_ENDPOINTS.BANKACCOUNTS.ADD;

    await createRequest(endpoint, token.access_token, payload, onSave, method);

    setIsSubmitting(false);
    onSave();
      onClose();
      setFormState({
        bank_id: "",
        bank_branch_id: "",
        currency_id: "",
        name: "",
        account_no: "",
        branch_code: "",
        swift_code: "",
        description: "",
      });
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
        label={bankAccount?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="bank-account-form"
      />
    </div>
  );

  return (
    <Dialog
      header={bankAccount?.id ? "Edit Bank Account" : "Add Bank Account"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="bank-account-form" onSubmit={handleSave}>
        <div className="p-fluid space-y-3">
          {/* Bank */}
          <div>
            <label className="text-sm font-semibold">Bank<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.bank_id}
              options={banks}
              optionLabel="name"
              optionValue="id"
              onChange={(e) => handleSelectChange("bank_id", e.value)}
              placeholder="Select Bank"
              className="w-full"
              required
            />
          </div>

          {/* Branch */}
          <div>
            <label className="text-sm font-semibold">Branch</label>
            <Dropdown
              value={formState.bank_branch_id}
              options={banks.filter((b) => b.id === formState.bank_id)[0]?.branches || []}
              optionLabel="name"
              optionValue="id"
              onChange={(e) => handleSelectChange("bank_branch_id", e.value)}
              placeholder="Select Branch (optional)"
              className="w-full"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="text-sm font-semibold">Currency<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.currency_id}
              options={currencies}
              optionLabel="name"
              optionValue="id"
              onChange={(e) => handleSelectChange("currency_id", e.value)}
              placeholder="Select Currency"
              className="w-full"
              required
            />
          </div>

          {/* Account Info */}
          <div>
            <label className="text-sm font-semibold">Account Name<span className="text-red-500">*</span></label>
            <InputText
              name="name"
              value={formState.name}
              onChange={handleChange}
              required
              className="w-full"
              placeholder="Company Main Account"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Account Number<span className="text-red-500">*</span></label>
            <InputText
              name="account_no"
              value={formState.account_no}
              onChange={handleChange}
              required
              className="w-full"
              placeholder="123456789013Q1"
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-semibold">Branch Code</label>
              <InputText
                name="branch_code"
                value={formState.branch_code}
                onChange={handleChange}
                className="w-full"
                placeholder="001"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">SWIFT Code</label>
              <InputText
                name="swift_code"
                value={formState.swift_code}
                onChange={handleChange}
                className="w-full"
                placeholder="ABCDEFXX"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Description</label>
            <InputTextarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows={3}
              className="w-full"
              placeholder="This is the primary bank account for receiving payments."
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyBankAccount;
