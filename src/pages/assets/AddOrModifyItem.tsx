import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import useAssetCategories from "../../hooks/assets/useAssetCategories";
import useSuppliers from "../../hooks/inventory/useSuppliers";
import useChartOfAccounts from "../../hooks/accounts/useChartOfAccounts";
import { baseURL, createRequest } from "../../utils/api";
import { ASSETSENDPOINTS } from "../../api/assetEndpoints";
import { Asset } from "../../redux/slices/types/mossApp/assets/asset";

interface AddOrModifyAssetProps {
  visible: boolean;
  onClose: () => void;
  item?: Asset;
  onSave: () => void;
}

const AddOrModifyAsset: React.FC<AddOrModifyAssetProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: accounts } = useChartOfAccounts();
  const { data: suppliers } = useSuppliers();
  const { data: assetCats } = useAssetCategories();

  const [formState, setFormState] = useState<Partial<Asset>>({
    name: "",
    supplier: "",
    asset_type: "",
    asset_account_id: 0,
    asset_category_id: 0,
    identity_no: "",
    purchase_date: "",
    date_put_to_use: "",
    purchase_cost: 0,
    current_value: 0,
    date_when: "",
    depreciation_account_id: 0,
    depreciation_loss_account_id: 0,
    depreciation_gain_account_id: 0,
    expense_account_id: 0,
    depreciation_method: "straight_line",
    depreciation_rate: 0,
    income_account_id: 0,
    appreciation_account_id: 0,
    appreciation_loss_account_id: 0,
    appreciation_gain_account_id: 0,
    appreciation_rate: undefined,
    salvage_value: 0,
    useful_life: 0,
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState<
    { value: number | string; name: string }[]
  >([]);
  const [assetLedgers, setAssetLedgers] = useState<
    { value: number; name: string }[]
  >([]);
  const [acctOptions, setAcctOptions] = useState<
    { value: number; name: string }[]
  >([]);

  // Map asset categories to dropdown options
  const assetCatOptions = assetCats
    ? assetCats.map((cat: any) => ({ value: cat.id, name: cat.name }))
    : [];

  // Fetch asset ledgers for asset account dropdown
  const getAssetLedgers = async () => {
    try {
      const res = await axios.get(
        "https://latcu-api.efinanci.co.tz/api/erp/accounts/get-asset-accounts",
        {
          headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" }, 
        }
      );
      // console.log("This is the response data: ", res.data);
      console.log("This is the response data: ", res.data);
      if (res.data && res.data.data) {
        const opts = res.data.data.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }));
        setAssetLedgers(opts);
      }
    } catch (error) {
      console.error("Error fetching asset ledgers:", error);
    }
  };


  const getAccountsData = async () => {
    try {
      const [incomeResponse, expenseResponse, assetResponse] =
        await Promise.all([
          axios.get(`${baseURL}/erp/accounts/get-income-accounts`, {
            headers: { Authorization: `Bearer ${token?.access_token}` },
          }),
          axios.get(`${baseURL}/erp/accounts/get-expense-accounts`, {
            headers: { Authorization: `Bearer ${token?.access_token}` },
          }),
          axios.get(`${baseURL}/erp/accounts/get-asset-accounts`, {
            headers: { Authorization: `Bearer ${token?.access_token}` },
          }),
        ]);

      console.log("Income Accounts:", incomeResponse.data);
      console.log("Expense Accounts:", expenseResponse.data);
      console.log("Asset Accounts:", assetResponse.data);

      const result = [
        ...(incomeResponse.data?.data || []), // Ensure it handles undefined gracefully
        ...(expenseResponse.data?.data || []),
        ...(assetResponse.data?.data || []),
      ].map((acc: any) => ({ value: acc.id, name: acc.name }));

      setAcctOptions(result);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  // console.log("Asset Ledgers testt:", getAccountsData());

  // Update supplier options when supplier data is available
  useEffect(() => {
    if (suppliers) {
      const options = suppliers.map((supplier: any) => ({
        value: supplier.id,
        name: supplier.supplier_name,
      }));
      setSupplierOptions(options);
    }
  }, [suppliers]);

  // Initialize form state when editing an existing asset
  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        supplier: item.supplier || "",
        asset_type: item.asset_type || "",
        asset_account_id: item.asset_account_id || 0,
        asset_category_id: item.asset_category_id || 0,
        identity_no: item.identity_no || "",
        purchase_date: item.purchase_date || "",
        date_put_to_use: item.date_put_to_use || "",
        purchase_cost: item.purchase_cost || 0,
        current_value: item.current_value || 0,
        date_when: item.date_when || "",
        depreciation_account_id: item.depreciation_account_id || 0,
        depreciation_loss_account_id: item.depreciation_loss_account_id || 0,
        depreciation_gain_account_id: item.depreciation_gain_account_id || 0,
        expense_account_id: item.expense_account_id || 0,
        depreciation_method: item.depreciation_method || "straight_line",
        depreciation_rate: item.depreciation_rate || 0,
        income_account_id: item.income_account_id || 0,
        appreciation_account_id: item.appreciation_account_id || 0,
        appreciation_loss_account_id: item.appreciation_loss_account_id || 0,
        appreciation_gain_account_id: item.appreciation_gain_account_id || 0,
        appreciation_rate: item.appreciation_rate ?? undefined,
        salvage_value: item.salvage_value || 0,
        useful_life: item.useful_life || 0,
        description: item.description || "",
      });
    } else {
      setFormState({
        name: "",
        supplier: "",
        asset_type: "",
        asset_account_id: 0,
        asset_category_id: 0,
        identity_no: "",
        purchase_date: "",
        date_put_to_use: "",
        purchase_cost: 0,
        current_value: 0,
        date_when: "",
        depreciation_account_id: 0,
        depreciation_loss_account_id: 0,
        depreciation_gain_account_id: 0,
        expense_account_id: 0,
        depreciation_method: "straight_line",
        depreciation_rate: 0,
        income_account_id: 0,
        appreciation_account_id: 0,
        appreciation_loss_account_id: 0,
        appreciation_gain_account_id: 0,
        appreciation_rate: undefined,
        salvage_value: 0,
        useful_life: 0,
        description: "",
      });
    }
  }, [item]);

  // Fetch asset ledgers and account data on mount
  useEffect(() => {
    getAssetLedgers();
    getAccountsData();
  }, []);

  // Generic change handler for text/number inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;
    setFormState((prev) => ({ ...prev, [name]: parsedValue }));
  };

  // Handler for dropdowns
  const handleDropdownChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Always visible fields (matching payload structure)
  const alwaysVisibleFields = [
    { key: "name", label: "Name", type: "text" },
    {
      key: "supplier",
      label: "Supplier",
      type: "dropdown",
      options: supplierOptions,
    },
    { key: "identity_no", label: "Serial Number", type: "text" },
    {
      key: "asset_category_id",
      label: "Asset Category",
      type: "dropdown",
      options: assetCatOptions,
    },
    { key: "purchase_date", label: "Purchase Date", type: "date" },
    { key: "purchase_cost", label: "Purchase Cost", type: "number" },
    { key: "current_value", label: "Current Value", type: "number" },
    { key: "date_put_to_use", label: "Date Put To Use", type: "date" },
    { key: "date_when", label: "Date When", type: "date" },
    { key: "salvage_value", label: "Salvage Value", type: "number" },
    { key: "useful_life", label: "Useful Life", type: "number" },
    {
      key: "asset_account_id",
      label: "Asset Account",
      type: "dropdown",
      options: assetLedgers,
    },
    { key: "description", label: "Description", type: "text" },
  ];

  // Fields specific to depreciating assets
  const depreciatingFields = [
    {
      key: "depreciation_method",
      label: "Depreciation Method",
      type: "dropdown",
      options: [
        { value: "straight_line", name: "Straight Line" },
        { value: "declining_balance", name: "Declining Balance" },
      ],
    },
    { key: "depreciation_rate", label: "Depreciation Rate", type: "number" },
    {
      key: "depreciation_account_id",
      label: "Depreciation Account",
      type: "dropdown",
      options: acctOptions,
    },
    {
      key: "expense_account_id",
      label: "Expense Account",
      type: "dropdown",
      options: acctOptions,
    },
    {
      key: "depreciation_loss_account_id",
      label: "Depreciation Loss Account",
      type: "dropdown",
      options: acctOptions,
    },
    {
      key: "depreciation_gain_account_id",
      label: "Depreciation Gain Account",
      type: "dropdown",
      options: acctOptions,
    },
  ];

  // Fields specific to appreciating assets
  const appreciatingFields = [
    { key: "appreciation_rate", label: "Appreciation Rate", type: "number" },
    {
      key: "appreciation_account_id",
      label: "Appreciation Account",
      type: "dropdown",
      options: acctOptions,
    },
    {
      key: "income_account_id",
      label: "Income Account",
      type: "dropdown",
      options: acctOptions,
    },
    {
      key: "appreciation_loss_account_id",
      label: "Appreciation Loss Account",
      type: "dropdown",
      options: acctOptions,
    },
    {
      key: "appreciation_gain_account_id",
      label: "Appreciation Gain Account",
      type: "dropdown",
      options: acctOptions,
    },
  ];

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? ASSETSENDPOINTS.ASSETS.UPDATE(item.id.toString())
      : ASSETSENDPOINTS.ASSETS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    setFormState({});
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
        form="asset-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Asset" : "Add Asset"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="asset-form" onSubmit={handleSave}>
        <div className="p-fluid grid grid-cols-2 gap-4">
          {/* Asset Type Dropdown */}
          <div className="p-field col-span-2">
            <label htmlFor="asset_type">
              Asset Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="asset_type"
              name="asset_type"
              value={formState.asset_type || ""}
              onChange={(e) => handleDropdownChange("asset_type", e.value)}
              options={[
                { value: "appreciating", name: "Appreciating" },
                { value: "depreciating", name: "Depreciating" },
              ]}
              optionLabel="name"
              optionValue="value"
              placeholder="Select Asset Type"
              className="w-full"
            />
          </div>

          {/* Always visible fields */}
          {alwaysVisibleFields.map((field) => (
            <div className="p-field" key={field.key}>
              <label htmlFor={field.key}>
                {field.label}{" "}
                {field.type !== "dropdown" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              {field.type === "dropdown" ? (
                <Dropdown
                  id={field.key}
                  name={field.key}
                  value={formState[field.key as keyof Asset] || ""}
                  onChange={(e) => handleDropdownChange(field.key, e.value)}
                  options={field.options}
                  optionLabel="name"
                  optionValue="value"
                  placeholder={`Select ${field.label}`}
                  className="w-full"
                />
              ) : (
                <InputText
                  id={field.key}
                  name={field.key}
                  type={field.type}
                  value={formState[field.key as keyof Asset]?.toString() || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              )}
            </div>
          ))}

          {/* Conditionally rendered fields based on asset type */}
          {formState.asset_type === "depreciating" &&
            depreciatingFields.map((field) => (
              <div className="p-field" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                {field.type === "dropdown" ? (
                  <Dropdown
                    id={field.key}
                    name={field.key}
                    value={formState[field.key as keyof Asset] || ""}
                    onChange={(e) => handleDropdownChange(field.key, e.value)}
                    options={field.options}
                    optionLabel="name"
                    optionValue="value"
                    placeholder={`Select ${field.label}`}
                    className="w-full"
                  />
                ) : (
                  <InputText
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    value={
                      formState[field.key as keyof Asset]?.toString() || ""
                    }
                    onChange={handleInputChange}
                    className="w-full"
                  />
                )}
              </div>
            ))}

          {formState.asset_type === "appreciating" &&
            appreciatingFields.map((field) => (
              <div className="p-field" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                {field.type === "dropdown" ? (
                  <Dropdown
                    id={field.key}
                    name={field.key}
                    value={formState[field.key as keyof Asset] || ""}
                    onChange={(e) => handleDropdownChange(field.key, e.value)}
                    options={field.options}
                    optionLabel="name"
                    optionValue="value"
                    placeholder={`Select ${field.label}`}
                    className="w-full"
                  />
                ) : (
                  <InputText
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    value={
                      formState[field.key as keyof Asset]?.toString() || ""
                    }
                    onChange={handleInputChange}
                    className="w-full"
                  />
                )}
              </div>
            ))}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyAsset;
