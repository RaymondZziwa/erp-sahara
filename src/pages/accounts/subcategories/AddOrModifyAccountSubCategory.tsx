import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import useAuth from "../../../hooks/useAuth";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { createRequest } from "../../../utils/api";
import { AccountSubCategory } from "../../../redux/slices/types/accounts/subCategories";
import useAccounts from "../../../hooks/accounts/useAccounts";

interface AddOrModifySubCategoryAccountProps {
  visible: boolean;
  onClose: () => void;
  item?: AccountSubCategory;
  onSave: () => void;
}

interface SubCategoryAccount {
  account_category_id: number;
  parent_id: number;
  name: string;
  description: string;
  code?: string | null;
  baseAccountId: number;
}

const AddOrModifyAccountSubCategory: React.FC<
  AddOrModifySubCategoryAccountProps
> = ({ visible, onClose, item, onSave }) => {
  const [formState, setFormState] = useState<Partial<SubCategoryAccount>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: accountCategories } = useAccounts();

  useEffect(() => {
    if (item) {
      setFormState({
        account_category_id: item.account_category_id,
        parent_id: item?.parent_id ?? 0,
        name: item.name,
        description: item.description,
        code: item.code?.toString() || "",
        baseAccountId: item.account_category_id, // Assuming this was intended as the base account ID
      });
    } else {
      setFormState({});
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.name ||
      !formState.account_category_id ||
      !formState.parent_id
    ) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    try {
      const data = {
        account_category_id: formState.baseAccountId,
        parent_id: formState.account_category_id,
        name: formState.name,
        description: formState.description,
        code: formState.code || null,
      };
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ACCOUNTS_ENDPOINTS.SUB_CATEGORIES.UPDATE(item.id.toString())
        : ACCOUNTS_ENDPOINTS.SUB_CATEGORIES.ADD;
      await createRequest(endpoint, token.access_token, data, onSave, method);
      setIsSubmitting(false);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving item", error);
      // Handle error here
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        severity="danger"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="sub-category-form"
        severity="info"
      />
    </div>
  );

  const selectedParentAccount = accountCategories?.find(
    (cat) => cat.id === formState.baseAccountId
  );
  const selectedAccountCategory =
    selectedParentAccount?.account_sub_categories.find(
      (cat) => cat.id === formState.parent_id
    );

  return (
    <Dialog
      header={item?.id ? "Edit Subcategory Account" : "Add Subcategory Account"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="sub-category-form" onSubmit={handleSave} className="p-fluid">
        {((item?.id && item.is_system_created === 0) || !item?.id) && (
          <>
            <div className="p-field">
              <label htmlFor="baseAccountId">Base Account</label>
              <Dropdown
                placeholder="Select Account"
                id="baseAccountId"
                name="baseAccountId"
                optionLabel="name"
                optionValue="id"
                value={formState.baseAccountId}
                options={accountCategories}
                onChange={(e) =>
                  setFormState({ ...formState, baseAccountId: e.value })
                }
                className="w-full"
              />
            </div>
            <div className="p-field">
              <label htmlFor="parent_id">Parent Account</label>
              <Dropdown
                placeholder="Select Account"
                id="parent_id"
                name="parent_id"
                optionLabel="name"
                optionValue="id"
                value={formState.parent_id}
                options={selectedParentAccount?.account_sub_categories || []}
                onChange={(e) =>
                  setFormState({ ...formState, parent_id: e.value })
                }
                className="w-full"
              />
            </div>
            <div className="p-field">
              <label htmlFor="account_category_id">Account Category</label>
              <Dropdown
                placeholder="Select Account"
                id="account_category_id"
                name="account_category_id"
                optionLabel="name"
                optionValue="id"
                filter
                value={formState.account_category_id}
                options={selectedAccountCategory?.children || []}
                onChange={(e) =>
                  setFormState({ ...formState, account_category_id: e.value })
                }
                className="w-full"
              />
            </div>
          </>
        )}
        <div className="p-field">
          <label htmlFor="name">Name</label>
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
            rows={3}
            className="w-full"
            required
          />
        </div>
        {/* <div className="p-field">
          <label htmlFor="code">Code</label>
          <InputText
            id="code"
            name="code"
            value={formState.code || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div> */}
      </form>
    </Dialog>
  );
};

export default AddOrModifyAccountSubCategory;
