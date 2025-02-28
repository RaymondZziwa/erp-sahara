import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { InputTextarea } from "primereact/inputtextarea";
// import useAccountSubCategories from "../../../hooks/accounts/useAccountsSubCategories";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { Dropdown } from "primereact/dropdown";
import useAccounts from "../../../hooks/accounts/useAccounts";
import { ChartofAccount } from "../../../redux/slices/types/accounts/ChartOfAccounts";
import { TreeSelect } from "primereact/treeselect";
import { TreeNode } from "primereact/treenode";
import { InputNumber } from "primereact/inputnumber";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import {
  IAccountChild,
  IAccountsubcategory,
  IAccountType,
} from "../../../redux/slices/types/accounts/AccountType";
import { RadioButton } from "primereact/radiobutton";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ChartofAccount;
  onSave: () => void;
}
interface ChartofAccountAdd {
  name: string;
  manual_entry: number;
  description?: string;
  account_sub_category_id: number;
  opening_balance?: number | null;
  currency_id: number | null;
  cash_flow_type: string | null;
  transaction_date: string;
  is_contra: 1 | 0;
}
const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<ChartofAccountAdd>>({
    name: "",
    description: "",
    is_contra: 0,
  });
  const [accountType, setAccountType] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { data: accountSubCategories } = useAccountSubCategories();
  const { data: accountTypes } = useAccounts();
  const { data: currencies } = useCurrencies();
  const { token } = useAuth();

  // Recursive function to build TreeNode structure from Accountsubcategory[]
  const buildTreeNodesFromSubCategories = (
    subCategories: IAccountsubcategory[]
  ): TreeNode[] => {
    return subCategories.map((subCategory) => ({
      key: subCategory.id.toString(),
      label: subCategory.name,
      data: subCategory.description, // Description as additional data
      icon: "pi pi-fw pi-folder", // Icon for sub-categories
      children: subCategory.children.length
        ? buildTreeNodesFromChildren(subCategory.children)
        : [], // Recursively handle children
    }));
  };

  // Recursive function to build TreeNode structure from Child[]
  const buildTreeNodesFromChildren = (
    children: IAccountChild[]
  ): TreeNode[] => {
    return children.map((child) => ({
      key: child.id.toString(),
      label: child.name,
      data: child.description, // Description as additional data
      icon: "pi pi-fw pi-file", // Icon for leaf nodes (children)
      children: child.children.length
        ? buildTreeNodesFromChildren(child.children) // Recursively handle nested children
        : [], // Leaf node if no further children
    }));
  };

  // Function to find a specific account type by id and build its subcategories TreeNode[]
  const findAccountTypeAndBuildSubCategoryTreeNodes = (
    accountTypes: IAccountType[],
    accountTypeId: number
  ): TreeNode[] => {
    // Find the account type with the given id
    const accountType = accountTypes.find((acc) => acc.id === accountTypeId);

    if (accountType) {
      // Directly return the subcategories' TreeNode[]
      return buildTreeNodesFromSubCategories(
        accountType.account_sub_categories
      );
    } else {
      // If no matching account type found, return an empty array
      return [];
    }
  };

  const accountNodes: TreeNode[] = findAccountTypeAndBuildSubCategoryTreeNodes(
    accountTypes,
    accountType ?? 1
  );

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name,
        description: item.description,
        account_sub_category_id: item.account_sub_category_id,
        // currency_id: ,
        //"cash_flow_type":"Operating",Nullable if specified should be either Operating,Investing,Financing',
        // transaction_date: item.cre,
      });
    } else {
      setFormState({ is_contra: 0 });
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
    try {
      e.preventDefault();
      setIsSubmitting(true);
      // Basic validation
      if (
        !formState.name ||
        !formState.account_sub_category_id ||
        (formState?.opening_balance &&
          +formState?.opening_balance > 0 &&
          !formState.currency_id)
      ) {
        setIsSubmitting(false);
        return; // Handle validation error here
      }

      const data: ChartofAccountAdd = {
        transaction_date: new Date().toISOString().slice(0, 10),
        name: formState.name,
        manual_entry: 1, //0 to allow manual entry, 1 not to allow
        description: formState.description,
        account_sub_category_id: formState.account_sub_category_id,
        cash_flow_type: formState.cash_flow_type ?? null,
        opening_balance: formState.opening_balance,
        currency_id: formState.currency_id ?? null,
        is_contra: formState.is_contra ?? 0,
      };
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ACCOUNTS_ENDPOINTS.CHART_OF_ACCOUNTS.UPDATE(item.id.toString())
        : ACCOUNTS_ENDPOINTS.CHART_OF_ACCOUNTS.ADD;
      await createRequest(endpoint, token.access_token, data, onSave, method);
      setIsSubmitting(false);
      onSave();
      setFormState({});
      onClose(); // Close the modal after saving
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2 border-t py-2">
      <Button
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-400"
        size="small"
        severity="danger"
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="truck-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Account" : "Add Account"}
      visible={visible}
      footer={footer}
      className="max-w-3xl md:min-w-[768px]"
      onHide={onClose}
    >
      <form
        id="truck-form"
        onSubmit={handleSave}
        className="p-fluid grid md:grid-cols-2 gap-4"
      >
        {!item?.id && (
          <div className="p-field">
            <label htmlFor="accountType">Category</label>
            <Dropdown
              id="accountType"
              name="accountType"
              value={accountType}
              options={accountTypes.map((account) => ({
                label: account.name,
                value: account.id,
              }))}
              onChange={(e) => setAccountType(e.value)}
              className="w-full"
            />
          </div>
        )}

        <div className="p-field">
          <label htmlFor="account_sub_category_id">Sub Category</label>
          <TreeSelect
            filter
            value={
              item?.id
                ? item?.account_sub_category.id.toString() // Ensure value is a string
                : formState.account_sub_category_id?.toString() // Ensure value is a string
            }
            onChange={(e) => {
              setFormState({
                ...formState,
                account_sub_category_id: +(e.value ?? 0), // Convert back to number
              });
            }}
            options={accountNodes}
            className="md:w-20rem w-full"
            placeholder="Select Item"
          />

          {/* <div className="bg-gray-300 my-2 rounded p-2 h-14 text-sm">
            {accountTypes
              .find((accountCat) => accountCat.id == accountType)
              ?.account_sub_categories.find(
                (cat) => cat.id == formState.account_sub_category_id
              )?.description ?? "No selected account sub category"}
          </div> */}
        </div>
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
          <label htmlFor="cash_flow_type">Cash Flow Type (Optional)</label>
          <Dropdown
            showClear
            id="cash_flow_type"
            name="cash_flow_type"
            value={formState.cash_flow_type}
            options={["Financing", "Operating", "Investing"].map((account) => ({
              label: account,
              value: account,
            }))}
            onChange={(e) =>
              setFormState({ ...formState, cash_flow_type: e.value })
            }
            className="w-full"
            placeholder="Select Cash Flow"
          />
        </div>
        {!item?.id && (
          <div className="p-field">
            <label htmlFor="name">Opening Balance</label>
            <InputNumber
              disabled={accountType == 4 || accountType == 5}
              id="opening_balance"
              name="opening_balance"
              placeholder={
                accountType == 4 || accountType == 5 ? "Not required" : ""
              }
              value={formState?.opening_balance}
              onChange={(e) =>
                setFormState({ ...formState, opening_balance: e.value ?? null })
              }
              required={!(accountType == 4 || accountType == 5)}
              className="w-full"
            />
          </div>
        )}
        {!item?.id && (
          <div className="p-field">
            <label htmlFor="currency_id">Currency</label>
            <Dropdown
              disabled={
                !(formState.opening_balance && formState?.opening_balance > 0)
              }
              id="currency_id"
              name="currency_id"
              value={formState.currency_id}
              options={currencies.map((curr) => ({
                label: curr.code,
                value: curr.id,
              }))}
              onChange={(e) =>
                setFormState({ ...formState, currency_id: e.value })
              }
              className="w-full"
              placeholder="Select Currency"
            />
          </div>
        )}
        <div className="p-field col-span-full">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        {!item?.id && (
          <div className="p-field">
            <label htmlFor="name">Is Contra</label>
            <div className="flex gap-2">
              {[
                { name: "Yes", value: 1 },
                { name: "No", value: 0 },
              ].map((option) => (
                <div key={option.value}>
                  <RadioButton
                    inputId="is_contra"
                    name={option.name}
                    value={option.value}
                    onChange={(e) => {
                      setFormState({ ...formState, is_contra: e.value });
                    }}
                    checked={
                      formState.is_contra?.toString() == option.value.toString()
                    }
                  />
                  <label htmlFor="is_contra" className="ml-2">
                    {option.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
