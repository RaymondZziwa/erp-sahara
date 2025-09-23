import React, { useState, useEffect, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import useAssetCategories from "../../hooks/assets/useAssetCategories";
import useSuppliers from "../../hooks/inventory/useSuppliers";
import { apiRequest, baseURL } from "../../utils/api";
import { ASSETSENDPOINTS } from "../../api/assetEndpoints";
import { Asset } from "../../redux/slices/types/mossApp/assets/asset";
import useCurrencies from "../../hooks/procurement/useCurrencies";
import { toast } from "react-toastify";
import useBranches from "../../hooks/Branches/useBranches";

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

// Field configuration interface
interface FieldConfig {
  key: keyof Asset;
  label: string;
  type: "text" | "number" | "date" | "dropdown";
  options?: { value: any; name: string }[];
  required?: boolean;
  condition?: (formState: Partial<Asset>, selectedCategory: any) => boolean;
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
  const { data: currencies } = useCurrencies();
  const { data: branches } = useBranches();
  
  const [currencyOptions, setCurrencyOptions] = useState<{ name: string; value: string }[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ value: number | string; name: string }[]>([]);
  const [incomeAccounts, setIncomeAccounts] = useState<{ value: number; name: string }[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<{ value: number; name: string }[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<{ value: number; name: string }[]>([]);
  const [branchOptions, setBranchOptions] = useState<{ value: number; name: string }[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState<Partial<Asset>>({
    name: "",
    supplier: "",
    asset_type: "depreciating",
    asset_account_id: undefined,
    asset_category_id: undefined,
    identity_no: "",
    purchase_date: "",
    date_put_to_use: "",
    purchase_cost: undefined,
    current_value: undefined,
    currency_id: undefined,
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
    make: "",
    model: "",
    year_of_manufacture: undefined,
    engine_number: "",
    chasis_number: "",
    body_type: "",
    codification_number: "",
    condition: "",
    remarks: "",
    warranty_expiry_date: "",
    branch_id: undefined,
    building_cost: undefined,
    plot_number: "",
    usage: "",
    room_allocation: "",
    surveyed_status: "",
    titled_deed_number: "",
  });

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

  // Fetch accounts data
  const fetchAccountsData = useCallback(async () => {
    if (!token?.access_token) return;

    try {
      const [incomeResponse, expenseResponse, assetResponse] = await Promise.all([
        api.get("/accounts/get-income-accounts"),
        api.get("/accounts/get-expense-accounts"),
        api.get("/accounts/get-asset-accounts"),
      ]);

      setIncomeAccounts((incomeResponse.data?.data || []).map((acc: any) => ({
        value: acc.id,
        name: acc.name,
      })));

      setExpenseAccounts((expenseResponse.data?.data || []).map((acc: any) => ({
        value: acc.id,
        name: acc.name,
      })));

      setAssetAccounts((assetResponse.data?.data || []).map((acc: any) => ({
        value: acc.id,
        name: acc.name,
      })));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setError("Failed to load accounts data");
      setLoading(false);
    }
  }, [token]);

  // Initialize data
  useEffect(() => {
    if (visible && token?.access_token) {
      fetchAccountsData();
    }
  }, [visible, token, fetchAccountsData]);

  // Update options when data changes
  useEffect(() => {
    if (currencies) {
      setCurrencyOptions(currencies.map(currency => ({
        name: currency.name,
        value: currency.id,
      })));
    }
  }, [currencies]);

  useEffect(() => {
    if (suppliers) {
      setSupplierOptions(suppliers.map(supplier => ({
        value: supplier.id,
        name: supplier.supplier_name,
      })));
    }
  }, [suppliers]);

  useEffect(() => {
    if (branches) {
      setBranchOptions(branches.map(branch => ({
        value: branch.id,
        name: branch.name,
      })));
    }
  }, [branches]);

  // Initialize form when item changes or dialog opens/closes
  useEffect(() => {
    if (visible) {
      if (item) {
        setFormState({ ...item });
        if (item.asset_category_id && assetCats) {
          const category = assetCats.find(cat => cat.id === item.asset_category_id);
          setSelectedCategory(category);
        }
      } else {
        // Reset form for new asset
        setFormState(prev => ({
          ...prev,
          name: "",
          supplier: "",
          asset_type: "depreciating",
          asset_account_id: undefined,
          asset_category_id: undefined,
          identity_no: "",
          purchase_date: "",
          date_put_to_use: "",
          purchase_cost: undefined,
          current_value: undefined,
          currency_id: undefined,
          description: "",
          // Reset specific fields
          make: "",
          model: "",
          year_of_manufacture: undefined,
          engine_number: "",
          chasis_number: "",
          body_type: "",
          codification_number: "",
          condition: "",
          remarks: "",
          warranty_expiry_date: "",
          branch_id: undefined,
          building_cost: undefined,
          plot_number: "",
          usage: "",
          room_allocation: "",
          surveyed_status: "",
          titled_deed_number: "",
        }));
        setSelectedCategory(null);
      }
    }
  }, [item, assetCats, visible]);

  // Handle category change
  const handleCategoryChange = (categoryId: number) => {
    if (assetCats) {
      const category = assetCats.find(cat => cat.id === categoryId);
      setSelectedCategory(category);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? (value === "" ? undefined : Number(value)) : value;
    setFormState(prev => ({ ...prev, [name]: parsedValue }));
  };

  // Handle number input changes
  const handleNumberChange = (name: string, value: number | null) => {
    setFormState(prev => ({ ...prev, [name]: value === null ? undefined : value }));
  };

  // Handle date changes
  const handleDateChange = (name: string, value: Date | null) => {
    const dateString = value ? value.toISOString().split('T')[0] : "";
    setFormState(prev => ({ ...prev, [name]: dateString }));
  };

  // Handle dropdown changes
  const handleDropdownChange = (name: string, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    
    if (name === "asset_category_id") {
      handleCategoryChange(value);
    }
    
    if (name === "asset_type") {
      // Reset related fields when asset type changes
      setFormState(prev => {
        const newState = { ...prev, asset_type: value };
        
        if (value === "appreciating") {
          newState.depreciation_account_id = undefined;
          newState.depreciation_loss_account_id = undefined;
          newState.depreciation_gain_account_id = undefined;
          newState.depreciation_rate = undefined;
          newState.depreciation_method = undefined;
        } else if (value === "depreciating") {
          newState.appreciation_account_id = undefined;
          newState.appreciation_loss_account_id = undefined;
          newState.appreciation_gain_account_id = undefined;
          newState.appreciation_rate = undefined;
        }
        
        return newState;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const requiredFields: (keyof Asset)[] = [
      "name",
      "asset_account_id",
      "asset_category_id",
      "purchase_date",
      "purchase_cost",
      "date_put_to_use",
      "description",
    ];

    // Add conditional required fields
    if (selectedCategory?.order && [1, 2, 3, 6].includes(selectedCategory.order)) {
      requiredFields.push("salvage_value", "useful_life");
    }

    for (const field of requiredFields) {
      if (!formState[field] || formState[field] === "") {
        setError(`Field "${field}" is required.`);
        toast.error(`Field "${field}" is required.`);
        return false;
      }
    }

    if (formState.asset_type === "depreciating" && !formState.depreciation_method) {
      setError("Depreciation method is required for depreciating assets.");
      toast.error("Depreciation method is required for depreciating assets.");
      return false;
    }

    return true;
  };

  // Save or update asset
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ASSETSENDPOINTS.ASSETS.UPDATE(item.id.toString())
        : ASSETSENDPOINTS.ASSETS.ADD;
      
      await apiRequest(endpoint, method, token!.access_token, formState);

      toast.success(`Asset ${item?.id ? "updated" : "added"} successfully!`);
      onSave();
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat();
          const errorMessage = `Validation errors: ${errorMessages.join(", ")}`;
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          const errorMessage = error.response?.data?.message || "Failed to save asset. Please try again.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        setError("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field configurations
  const assetCatOptions = assetCats?.map(cat => ({ value: cat.id, name: cat.name })) || [];

  const conditionOptions = [
    { value: "Good", name: "Good" },
    { value: "Fair", name: "Fair" },
    { value: "Poor", name: "Poor" },
    { value: "N/A", name: "N/A" },
  ];

  const remarksOptions = [
    { value: "Good", name: "Good" },
    { value: "Service", name: "Service" },
    { value: "Un-Serviceable", name: "Un-Serviceable" },
    { value: "N/A", name: "N/A" },
  ];

  const usageOptions = [
    { value: "Warehouse", name: "Warehouse" },
    { value: "Office", name: "Office" },
    { value: "Residential", name: "Residential" },
    { value: "Rent", name: "Rent" },
    { value: "Industry", name: "Industry" },
    { value: "N/A", name: "N/A" },
  ];

  const bodyTypeOptions = [
    { value: "Van", name: "Van" },
    { value: "Sedan", name: "Sedan" },
    { value: "SUV", name: "SUV" },
    { value: "Truck", name: "Truck" },
    { value: "Bus", name: "Bus" },
    { value: "Other", name: "Other" },
  ];

  const depreciationMethodOptions = [
    { value: "straight_line", name: "Straight Line" },
    { value: "declining_balance", name: "Declining Balance" },
  ];

  const assetTypeOptions = [
    { value: "depreciating", name: "Depreciating" },
    { value: "appreciating", name: "Appreciating" },
  ];

  // Field configurations
  const baseFields: FieldConfig[] = [
    { key: "asset_category_id", label: "Asset Category", type: "dropdown", options: assetCatOptions, required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "supplier", label: "Supplier", type: "dropdown", options: supplierOptions },
    { key: "currency_id", label: "Currency", type: "dropdown", options: currencyOptions, required: true },
    { key: "purchase_cost", label: "Purchase Cost", type: "number", required: true },
    { key: "identity_no", label: "Identity No.", type: "text" },
    { key: "purchase_date", label: "Purchase Date", type: "date", required: true },
    { key: "date_put_to_use", label: "Date Put To Use", type: "date", required: true },
    { key: "asset_account_id", label: "Asset Account", type: "dropdown", options: assetAccounts, required: true },
    { key: "expense_account_id", label: "Expense Account", type: "dropdown", options: expenseAccounts },
    { key: "income_account_id", label: "Income Account", type: "dropdown", options: incomeAccounts },
    { key: "description", label: "Description", type: "text", required: true },
    { key: "codification_number", label: "Codification Number", type: "text" },
    { key: "condition", label: "Condition", type: "dropdown", options: conditionOptions },
    { key: "remarks", label: "Remarks", type: "dropdown", options: remarksOptions },
    { key: "warranty_expiry_date", label: "Warranty Expiry Date", type: "date" },
    { key: "branch_id", label: "Branch", type: "dropdown", options: branchOptions },
    { key: "asset_type", label: "Asset Type", type: "dropdown", options: assetTypeOptions },
  ];

  const depreciatingFields: FieldConfig[] = [
    { key: "depreciation_method", label: "Depreciation Method", type: "dropdown", options: depreciationMethodOptions, required: true },
    { key: "depreciation_rate", label: "Depreciation Rate", type: "number" },
    { key: "depreciation_account_id", label: "Depreciation Account", type: "dropdown", options: assetAccounts },
    { key: "depreciation_loss_account_id", label: "Depreciation Loss Account", type: "dropdown", options: expenseAccounts },
    { key: "depreciation_gain_account_id", label: "Depreciation Gain Account", type: "dropdown", options: incomeAccounts },
    { key: "salvage_value", label: "Salvage Value", type: "number" },
    { key: "useful_life", label: "Useful Life (years)", type: "number" },
  ];

  const appreciatingFields: FieldConfig[] = [
    { key: "appreciation_rate", label: "Appreciation Rate", type: "number" },
    { key: "appreciation_account_id", label: "Appreciation Account", type: "dropdown", options: assetAccounts },
    { key: "appreciation_loss_account_id", label: "Appreciation Loss Account", type: "dropdown", options: expenseAccounts },
    { key: "appreciation_gain_account_id", label: "Appreciation Gain Account", type: "dropdown", options: incomeAccounts },
    { key: "salvage_value", label: "Salvage Value", type: "number" },
    { key: "useful_life", label: "Useful Life (years)", type: "number" },
  ];

  const vehicleFields: FieldConfig[] = [
    { key: "make", label: "Make", type: "text" },
    { key: "model", label: "Model", type: "text" },
    { key: "year_of_manufacture", label: "Year of Manufacture", type: "number" },
    { key: "engine_number", label: "Engine Number", type: "text" },
    { key: "chasis_number", label: "Chasis Number", type: "text" },
    { key: "body_type", label: "Body Type", type: "dropdown", options: bodyTypeOptions },
  ];

  const landFields: FieldConfig[] = [
    { key: "surveyed_status", label: "Surveyed Status", type: "text" },
    { key: "titled_deed_number", label: "Titled Deed Number", type: "text" },
    { key: "plot_number", label: "Plot Number", type: "text" },
    { key: "usage", label: "Usage", type: "dropdown", options: usageOptions },
  ];

  const buildingFields: FieldConfig[] = [
    { key: "building_cost", label: "Building Cost", type: "number" },
    { key: "plot_number", label: "Plot Number", type: "text" },
    { key: "usage", label: "Usage", type: "dropdown", options: usageOptions },
    { key: "room_allocation", label: "Room Allocation", type: "text" },
  ];

  // Determine which fields to show based on category and asset type
  const isVehicleCategory = selectedCategory?.name?.toLowerCase().includes("vehicle");
  const isLandCategory = selectedCategory?.name?.toLowerCase().includes("land");
  const isBuildingCategory = selectedCategory?.name?.toLowerCase().includes("building") || 
                           selectedCategory?.name?.toLowerCase().includes("property");

  const allFields = [
    ...baseFields,
    ...(formState.asset_type === "depreciating" ? depreciatingFields : []),
    ...(formState.asset_type === "appreciating" ? appreciatingFields : []),
    ...(isVehicleCategory ? vehicleFields : []),
    ...(isLandCategory ? landFields : []),
    ...(isBuildingCategory ? buildingFields : []),
  ];

  // Render field based on type
  const renderField = (field: FieldConfig) => {
    const value = formState[field.key];
    
    switch (field.type) {
      case "dropdown":
        return (
          <Dropdown
            id={field.key}
            name={field.key}
            value={value || ""}
            onChange={(e) => handleDropdownChange(field.key, e.value)}
            options={field.options}
            optionLabel="name"
            optionValue="value"
            placeholder={`Select ${field.label}`}
            className="w-full p-inputtext-sm"
            disabled={isSubmitting}
          />
        );
      
      case "number":
        return (
          <InputNumber
            id={field.key}
            name={field.key}
            value={value as number || null}
            onValueChange={(e) => handleNumberChange(field.key, e.value)}
            className="w-full p-inputtext-sm"
            disabled={isSubmitting}
          />
        );
      
      case "date":
        return (
          <Calendar
            id={field.key}
            name={field.key}
            value={value ? new Date(value as string) : null}
            onChange={(e) => handleDateChange(field.key, e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            className="w-full p-inputtext-sm"
            disabled={isSubmitting}
          />
        );
      
      default:
        return (
          <InputText
            id={field.key}
            name={field.key}
            type={field.type}
            value={value?.toString() || ""}
            onChange={handleInputChange}
            className="w-full p-inputtext-sm"
            disabled={isSubmitting}
          />
        );
    }
  };

  // Dialog footer
  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text p-button-danger"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="asset-form"
        loading={isSubmitting}
      />
    </div>
  );

  // if (loading) {
  //   return (
  //     <Dialog visible={visible} onHide={onClose}>
  //       <div className="flex justify-center items-center p-4">
  //         <i className="pi pi-spin pi-spinner mr-2"></i>
  //         Loading...
  //       </div>
  //     </Dialog>
  //   );
  // }

  return (
    <Dialog
      header={item?.id ? "Edit Asset" : "Add Asset"}
      visible={visible}
      style={{ width: "800px", maxWidth: "90vw" }}
      footer={footer}
      onHide={onClose}
      className="asset-dialog"
    >
      {error && (
        <div className="p-error-message mb-4 p-2 border-round border-1 border-red-500 bg-red-100">
          {error}
        </div>
      )}
      
      <form id="asset-form" onSubmit={handleSave}>
        <div className="p-fluid grid grid-cols-2 gap-2">
          {allFields.map((field) => (
            <div className="p-field mb-3" key={field.key}>
              <label htmlFor={field.key} className="text-sm font-medium block mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyAsset;