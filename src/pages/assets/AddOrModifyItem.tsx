import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import useAssetCategories from "../../hooks/assets/useAssetCategories";
import useSuppliers from "../../hooks/inventory/useSuppliers";
import { baseURL } from "../../utils/api";
import { ASSETSENDPOINTS } from "../../api/assetEndpoints";
import { Asset } from "../../redux/slices/types/mossApp/assets/asset";

// Centralized API configuration
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  const { data: suppliers } = useSuppliers();
  const { data: assetCats } = useAssetCategories();

  const [formState, setFormState] = useState<Partial<Asset>>({
    name: "",
    supplier: "",
    asset_type: "",
    asset_account_id: undefined,
    asset_category_id: undefined,
    identity_no: "",
    purchase_date: "",
    date_put_to_use: "",
    purchase_cost: undefined,
    current_value: undefined,
    date_when: "",
    depreciation_account_id: undefined,
    depreciation_loss_account_id: undefined,
    depreciation_gain_account_id: undefined,
    expense_account_id: undefined,
    depreciation_method: "straight_line",
    depreciation_rate: undefined,
    income_account_id: undefined,
    appreciation_account_id: undefined,
    appreciation_loss_account_id: undefined,
    appreciation_gain_account_id: undefined,
    appreciation_rate: undefined,
    salvage_value: undefined,
    useful_life: undefined,
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierOptions, setSupplierOptions] = useState<{ value: number | string; name: string }[]>([]);
  const [incomeAccounts, setIncomeAccounts] = useState<{ value: number; name: string }[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<{ value: number; name: string }[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<{ value: number; name: string }[]>([]);

  // Axios interceptors for token injection
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token?.access_token) {
          config.headers.Authorization = `Bearer ${token.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Fetch income accounts
  const getIncomeAccounts = async () => {
    try {
      const response = await api.get("/erp/accounts/get-income-accounts");
      console.log("Income Accounts Response:", response.data);

      const incomeData = response.data?.data || [];
      setIncomeAccounts(incomeData.map((acc: any) => ({
        value: acc.id,
        name: acc.name,
      })));
    } catch (error) {
      console.error("Error fetching income accounts:", error);
      setError("Failed to load income accounts");
    }
  };

  // Fetch expense accounts
  const getExpenseAccounts = async () => {
    try {
      const response = await api.get("/erp/accounts/get-expense-accounts");
      console.log("Expense Accounts Response:", response.data);

      const expenseData = response.data?.data || [];
      setExpenseAccounts(expenseData.map((acc: any) => ({
        value: acc.id,
        name: acc.name,
      })));
    } catch (error) {
      console.error("Error fetching expense accounts:", error);
      setError("Failed to load expense accounts");
    }
  };

  // Fetch asset accounts
  const getAssetAccounts = async () => {
    try {
      const response = await api.get("/erp/accounts/get-asset-accounts");
      console.log("Asset Accounts Response:", response.data);

      const assetData = response.data?.data || [];
      setAssetAccounts(assetData.map((acc: any) => ({
        value: acc.id,
        name: acc.name,
      })));
    } catch (error) {
      console.error("Error fetching asset accounts:", error);
      setError("Failed to load asset accounts");
    }
  };

  // Initialize data fetching
  useEffect(() => {
    if (token?.access_token) {
      Promise.all([getIncomeAccounts(), getExpenseAccounts(), getAssetAccounts()])
        .then(() => setLoading(false))
        .catch((error) => {
          console.error("Initialization error:", error);
          setError("Failed to initialize component");
          setLoading(false);
        });
    }
  }, [token]);

  // Update supplier options
  useEffect(() => {
    if (suppliers) {
      setSupplierOptions(suppliers.map((supplier: any) => ({
        value: supplier.id,
        name: supplier.supplier_name,
      })));
    }
  }, [suppliers]);

  // Initialize form state when editing an asset
  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({
        name: "",
        supplier: "",
        asset_type: "",
        asset_account_id: undefined,
        asset_category_id: undefined,
        identity_no: "",
        purchase_date: "",
        date_put_to_use: "",
        purchase_cost: undefined,
        current_value: undefined,
        date_when: "",
        depreciation_account_id: undefined,
        depreciation_loss_account_id: undefined,
        depreciation_gain_account_id: undefined,
        expense_account_id: undefined,
        depreciation_method: "straight_line",
        depreciation_rate: undefined,
        income_account_id: undefined,
        appreciation_account_id: undefined,
        appreciation_loss_account_id: undefined,
        appreciation_gain_account_id: undefined,
        appreciation_rate: undefined,
        salvage_value: undefined,
        useful_life: undefined,
        description: "",
      });
    }
  }, [item]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;
    setFormState((prev) => ({ ...prev, [name]: parsedValue }));
  };

  // Handle dropdown changes
  const handleDropdownChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Handle asset type change
  const handleAssetTypeChange = (value: string) => {
    setFormState((prev) => {
      const newState = { ...prev, asset_type: value };

      // Reset fields based on asset type
      if (value === "appreciating") {
        newState.depreciation_account_id = undefined;
        newState.depreciation_loss_account_id = undefined;
        newState.depreciation_gain_account_id = undefined;
        newState.expense_account_id = undefined;
        newState.depreciation_rate = undefined;
        newState.depreciation_method = undefined;
      } else if (value === "depreciating") {
        newState.appreciation_account_id = undefined;
        newState.appreciation_loss_account_id = undefined;
        newState.appreciation_gain_account_id = undefined;
        newState.income_account_id = undefined;
        newState.appreciation_rate = undefined;
      }

      return newState;
    });
  };

  // Save or update asset
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const requiredFields = [
      "name",
      "asset_account_id",
      "asset_category_id",
      "purchase_date",
      "purchase_cost",
      "current_value",
      "date_put_to_use",
      "date_when",
      "salvage_value",
      "useful_life",
      "description",
    ];

    for (const field of requiredFields) {
      if (!formState[field as keyof Asset]) {
        setError(`Field ${field} is required.`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ASSETSENDPOINTS.ASSETS.UPDATE(item.id.toString())
        : ASSETSENDPOINTS.ASSETS.ADD;

      console.log("Sending request:", {
        method,
        url: endpoint,
        data: formState,
      });

      const response = await api.request({
        method,
        url: endpoint,
        data: formState,
      });

      console.log("Save successful:", response.data);

      onSave();
      onClose();
    } catch (error) {
      console.error("Save error:", {
        message: (error as any).message,
        status: (error as any).response?.status,
        data: (error as any).response?.data,
        config: (error as any).config,
      });

      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(`Validation errors: ${errorMessages.join(", ")}`);
      } else {
        setError("Failed to save asset. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map asset categories to dropdown options
  const assetCatOptions = assetCats
    ? assetCats.map((cat: any) => ({ value: cat.id, name: cat.name }))
    : [];

  // Always visible fields
  const alwaysVisibleFields = [
    { key: "name", label: "Name", type: "text" },
    { key: "supplier", label: "Supplier", type: "dropdown", options: supplierOptions },
    { key: "identity_no", label: "Serial Number", type: "text" },
    { key: "asset_category_id", label: "Asset Category", type: "dropdown", options: assetCatOptions },
    { key: "purchase_date", label: "Purchase Date", type: "date" },
    { key: "purchase_cost", label: "Purchase Cost", type: "number" },
    { key: "current_value", label: "Current Value", type: "number" },
    { key: "date_put_to_use", label: "Date Put To Use", type: "date" },
    { key: "date_when", label: "Date When", type: "date" },
    { key: "salvage_value", label: "Salvage Value", type: "number" },
    { key: "useful_life", label: "Useful Life", type: "number" },
    { key: "asset_account_id", label: "Asset Account", type: "dropdown", options: assetAccounts },
    { key: "description", label: "Description", type: "text" },
  ];

  // Fields for depreciating assets
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
      options: assetAccounts,
    },
    {
      key: "expense_account_id",
      label: "Expense Account",
      type: "dropdown",
      options: expenseAccounts,
    },
    {
      key: "depreciation_loss_account_id",
      label: "Depreciation Loss Account",
      type: "dropdown",
      options: expenseAccounts,
    },
    {
      key: "depreciation_gain_account_id",
      label: "Depreciation Gain Account",
      type: "dropdown",
      options: incomeAccounts,
    },
  ];

  // Fields for appreciating assets
  const appreciatingFields = [
    { key: "appreciation_rate", label: "Appreciation Rate", type: "number" },
    {
      key: "appreciation_account_id",
      label: "Appreciation Account",
      type: "dropdown",
      options: assetAccounts,
    },
    {
      key: "income_account_id",
      label: "Income Account",
      type: "dropdown",
      options: incomeAccounts,
    },
    {
      key: "appreciation_loss_account_id",
      label: "Appreciation Loss Account",
      type: "dropdown",
      options: expenseAccounts,
    },
    {
      key: "appreciation_gain_account_id",
      label: "Appreciation Gain Account",
      type: "dropdown",
      options: incomeAccounts,
    },
  ];

  // Dialog footer
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <ProgressSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
        <Button
          label="Retry"
          className="p-button-text ml-2"
          onClick={() => window.location.reload()}
        />
      </div>
    );
  }

  // Main form
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
              onChange={(e) => handleAssetTypeChange(e.value)}
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
                {field.label}
                {field.type !== "dropdown" && <span className="text-red-500">*</span>}
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
                    value={formState[field.key as keyof Asset]?.toString() || ""}
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
                    value={formState[field.key as keyof Asset]?.toString() || ""}
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