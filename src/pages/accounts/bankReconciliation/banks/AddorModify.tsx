import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import useAuth from "../../../../hooks/useAuth";
import { Bank } from "../../../../redux/slices/types/accounts/bankReconciliation/bank";
import { createRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";

interface AddOrModifyBankProps {
  visible: boolean;
  onClose: () => void;
  bank?: Bank;
  onSave: () => void;
}

const AddOrModifyBank: React.FC<AddOrModifyBankProps> = ({
  visible,
  onClose,
  bank,
  onSave,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<{
    name: string;
    email: string;
    description: string;
    branches: { name: string; contact_person: string; contact_phone: string }[];
  }>({
    name: "",
    email: "",
    description: "",
    branches: [
      { name: "", contact_person: "", contact_phone: "" },
    ],
  });

  // Prefill form when editing
  useEffect(() => {
    if (bank) {
      setFormState({
        name: bank.name || "",
        email: bank.email || "",
        description: bank.description || "",
        branches: bank.branches?.length
          ? bank.branches
          : [{ name: "", contact_person: "", contact_phone: "" }],
      });
    } else {
      setFormState({
        name: "",
        email: "",
        description: "",
        branches: [{ name: "", contact_person: "", contact_phone: "" }],
      });
    }
  }, [bank]);

  // Handle text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Handle branch field updates
  const handleBranchChange = (
    index: number,
    field: keyof (typeof formState.branches)[0],
    value: string
  ) => {
    const updated = [...formState.branches];
    updated[index][field] = value;
    setFormState((prev) => ({ ...prev, branches: updated }));
  };

  // Add new branch entry
  const handleAddBranch = () => {
    setFormState((prev) => ({
      ...prev,
      branches: [...prev.branches, { name: "", contact_person: "", contact_phone: "" }],
    }));
  };

  // Remove branch entry
  const handleRemoveBranch = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
  };

  // Save form
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formState.name,
      email: formState.email,
      description: formState.description,
      branches: formState.branches.filter((b) => b.name.trim() !== ""),
    };

    const method = bank?.id ? "PUT" : "POST";
    const endpoint = bank?.id
      ? ACCOUNTS_ENDPOINTS.BANKS.UPDATE(bank.id.toString())
      : ACCOUNTS_ENDPOINTS.BANKS.ADD;

    await createRequest(endpoint, token.access_token, payload, onSave, method);

    setIsSubmitting(false);
    onSave();
    onClose();
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
        label={bank?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="bank-form"
      />
    </div>
  );

  return (
    <Dialog
      header={bank?.id ? "Edit Bank" : "Add Bank"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <p className="mb-4 text-sm">
        Fields marked with <span className="text-red-500">*</span> are required.
      </p>
      <form id="bank-form" onSubmit={handleSave}>
        <div className="p-fluid space-y-3">
          <div>
            <label htmlFor="name" className="text-sm">
              Bank Name<span className="text-red-500">*</span>
            </label>
            <InputText
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm">
              Email<span className="text-red-500">*</span>
            </label>
            <InputText
              id="email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="text-sm">
              Description
            </label>
            <InputTextarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Branches</label>
            {formState.branches.map((branch, index) => (
              <div
                key={index}
                className="border p-3 rounded-md mt-2 space-y-2 bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <InputText
                    placeholder="Branch Name"
                    value={branch.name}
                    onChange={(e) =>
                      handleBranchChange(index, "name", e.target.value)
                    }
                    className="w-full"
                  />
                  <InputText
                    placeholder="Contact Person"
                    value={branch.contact_person}
                    onChange={(e) =>
                      handleBranchChange(index, "contact_person", e.target.value)
                    }
                    className="w-full"
                  />
                  <InputText
                    placeholder="Contact Phone"
                    value={branch.contact_phone}
                    onChange={(e) =>
                      handleBranchChange(index, "contact_phone", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                {formState.branches.length > 1 && (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-text !text-red-500 !bg-gray-50"
                    type="button"
                    onClick={() => handleRemoveBranch(index)}
                  />
                )}
              </div>
            ))}

            <Button
              icon="pi pi-plus"
              label="Add Branch"
              type="button"
              onClick={handleAddBranch}
              className="mt-2"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyBank;
