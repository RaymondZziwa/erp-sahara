import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { createRequest } from "../../../utils/api";
import { Account } from "../../../redux/slices/types/accounts";
import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";

interface AddOrModifyAccountProps {
  visible: boolean;
  onClose: () => void;
  item?: Account;
  onSave: () => void;
}

interface AddAccount {
  account_name: string;
  manual_entry?: number;
  account_code: string;
  description?: string;
  account_sub_category_id?: number;
}



const AddOrModifyAccount: React.FC<AddOrModifyAccountProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<AddAccount>>({
    account_name: "",
    account_code: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        account_name: item.name,
        account_code: item.code,
        description: "",
        manual_entry: item.normal_balance_side,
      });
    } else {
      setFormState({
        account_name: "",
        account_code: "",
        description: "",
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.account_name || !formState.account_code) {
      setIsSubmitting(false);
      return;
    }

    try {
      const data: AddAccount = {
        account_name: formState.account_name,
        code: formState.account_code,
        description: formState.description || "",
        manual_entry: formState.manual_entry,
        account_sub_category_id: formState.account_sub_category_id,
      };

      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ACCOUNTS_ENDPOINTS.CATEGORIES.UPDATE(item.id.toString())
        : ACCOUNTS_ENDPOINTS.CATEGORIES.ADD;

      await createRequest(endpoint, token.access_token, data, onSave, method);
      //toast.success("Category updated successfully")
      setIsSubmitting(false);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving item", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex flex-row gap-2 justify-end">
      <Button
        severity="danger"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text mr-2 !bg-red-500"
        type="button"
      />
      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        severity="info"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Account" : "Add Account"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="account_name">Account Name</label>
            <InputText
              id="account_name"
              name="account_name"
              value={formState.account_name || ""}
              onChange={handleInputChange}
              required
              disabled={!!item?.id} // 🔒 Make read-only when editing
            />
          </div>
          <div className="p-field">
            <label htmlFor="account_code">Account Code</label>
            <InputText
              id="account_code"
              name="account_code"
              value={formState.account_code || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              name="description"
              value={formState.description || ""}
              onChange={handleInputChange}
              disabled={!!item?.id} // 🔒 Make read-only when editing
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyAccount;
