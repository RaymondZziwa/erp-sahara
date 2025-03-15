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
import { baseURL } from "../../utils/api"; // Import baseURL
import { ASSETSENDPOINTS } from "../../api/assetEndpoints"; // Import endpoints
import { Asset } from "../../redux/slices/types/mossApp/assets/asset";

// Centralized API configuration
const api = axios.create({
  baseURL: baseURL, // Use imported baseURL
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
    supplier: "", // Nullable
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
    appreciation_rate: undefined, // Nullable
    salvage_value: 0,
    useful_life: 0,
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierOptions, setSupplierOptions] = useState<{ value: number | string; name: string }[]>([]);
  const [assetLedgers, setAssetLedgers] = useState<{ value: number; name: string }[]>([]);
  const [acctOptions, setAcctOptions] = useState<{ value: number; name: string }[]>([]);

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

  // Fetch asset ledgers and account data
  const fetchData = async (endpoint: string) => {
    try {
      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setError(`Failed to load ${endpoint.split('/').pop()}`);
      return [];
    }
  };

  const getAssetLedgers = async () => {
    try {
      const response = await api.get("/erp/accounts/get-asset-accounts");
      console.log("API Response:", response);
  
      // Check if the response contains the expected data
      if (response.data?.success && Array.isArray(response.data.data)) {
        const opts = response.data.data.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }));
        setAssetLedgers(opts);
      } else {
        console.error("Unexpected response structure:", response.data);
        setError("Failed to load asset ledgers: Unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching asset ledgers:", error);
      setError("Failed to load asset ledgers");
    }
  };
  
  const getAccountsData = async () => {
    try {
      const [incomeResponse, expenseResponse, assetResponse] = await Promise.all([
        api.get("/erp/accounts/get-income-accounts"),
        api.get("/erp/accounts/get-expense-accounts"),
        api.get("/erp/accounts/get-asset-accounts"),
      ]);


      // Extract data from responses
      const incomeData = incomeResponse.data?.data || [];
      const expenseData = expenseResponse.data?.data || [];
      const assetData = assetResponse.data?.data || [];

      console.log("Income Response:", incomeResponse);
      console.log("Expense Response:", expenseResponse);
      console.log("Asset Response:", assetResponse);
  
      // Combine data and map to options
      const result = [...incomeData, ...expenseData, ...assetData].map((acc: any) => ({
        value: acc.id,
        name: acc.name,
      }));
  
      setAcctOptions(result);
    } catch (error) {
      console.error("Error fetching account data:", error);
      setError("Failed to load account data");
    } finally {
      setLoading(false);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    if (token?.access_token) {
      Promise.all([getAssetLedgers(), getAccountsData()]).catch((error) => {
        console.error("Initialization error:", error);
        setError("Failed to initialize component");
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

  // Save or update asset
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ASSETSENDPOINTS.ASSETS.UPDATE(item.id.toString()) // Use correct update endpoint
        : ASSETSENDPOINTS.ASSETS.ADD; // Use correct create endpoint

      // Log request details for debugging
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

      // Log successful response
      console.log("Save successful:", response.data);

      onSave();
      onClose();
    } catch (error) {
      // Log detailed error information
      console.error("Save error:", {
        message: (error as any).message,
        status: (error as any).response?.status,
        data: (error as any).response?.data,
        config: (error as any).config,
      });
      setError("Failed to save asset. Please try again.");
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
    { key: "asset_account_id", label: "Asset Account", type: "dropdown", options: assetLedgers },
    { key: "description", label: "Description", type: "text" },
  ];

  // Fields for depreciating assets
  const depreciatingFields = [
    { key: "depreciation_method", label: "Depreciation Method", type: "dropdown", options: [
      { value: "straight_line", name: "Straight Line" },
      { value: "declining_balance", name: "Declining Balance" },
    ]},
    { key: "depreciation_rate", label: "Depreciation Rate", type: "number" },
    { key: "depreciation_account_id", label: "Depreciation Account", type: "dropdown", options: acctOptions },
    { key: "expense_account_id", label: "Expense Account", type: "dropdown", options: acctOptions },
    { key: "depreciation_loss_account_id", label: "Depreciation Loss Account", type: "dropdown", options: acctOptions },
    { key: "depreciation_gain_account_id", label: "Depreciation Gain Account", type: "dropdown", options: acctOptions },
  ];

  // Fields for appreciating assets
  const appreciatingFields = [
    { key: "appreciation_rate", label: "Appreciation Rate", type: "number" },
    { key: "appreciation_account_id", label: "Appreciation Account", type: "dropdown", options: acctOptions },
    { key: "income_account_id", label: "Income Account", type: "dropdown", options: acctOptions },
    { key: "appreciation_loss_account_id", label: "Appreciation Loss Account", type: "dropdown", options: acctOptions },
    { key: "appreciation_gain_account_id", label: "Appreciation Gain Account", type: "dropdown", options: acctOptions },
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