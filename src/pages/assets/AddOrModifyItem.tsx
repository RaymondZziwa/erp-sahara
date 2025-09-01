import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import useAssetCategories from "../../hooks/assets/useAssetCategories";
import useSuppliers from "../../hooks/inventory/useSuppliers";
import { baseURL } from "../../utils/api";
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
  const [currencyOptions, setCurrencyOptions] = useState<{
    name: string;
    value: string;
  }>([]);

  useEffect(() => {
    const mapped = currencies.map((currency) => ({
      name: currency.name,
      value: currency.id,
    }));
    setCurrencyOptions(mapped);
  }, [currencies]);

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
    currency_id: 0,
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
    // Vehicle fields
    make: "",
    model: "",
    year_of_manufacture: undefined,
    engine_number: "",
    chasis_number: "",
    body_type: "",
    // Optional fields
    codification_number: "",
    condition: "",
    remarks: "",
    warranty_expiry_date: "",
    branch_id: undefined,
    // Building/land fields
    building_cost: undefined,
    plot_number: "",
    usage: "",
    room_allocation: "",
    // Land fields
    surveyed_status: "",
    titled_deed_number: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierOptions, setSupplierOptions] = useState<
    { value: number | string; name: string }[]
  >([]);
  const [incomeAccounts, setIncomeAccounts] = useState<
    { value: number; name: string }[]
  >([]);
  const [expenseAccounts, setExpenseAccounts] = useState<
    { value: number; name: string }[]
  >([]);
  const [assetAccounts, setAssetAccounts] = useState<
    { value: number; name: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

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
      const response = await api.get("/accounts/get-income-accounts");
      const incomeData = response.data?.data || [];
      setIncomeAccounts(
        incomeData.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching income accounts:", error);
      setError("Failed to load income accounts");
    }
  };

  // Fetch expense accounts
  const getExpenseAccounts = async () => {
    try {
      const response = await api.get("/accounts/get-expense-accounts");
      const expenseData = response.data?.data || [];
      setExpenseAccounts(
        expenseData.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching expense accounts:", error);
      setError("Failed to load expense accounts");
    }
  };

  // Fetch asset accounts
  const getAssetAccounts = async () => {
    try {
      const response = await api.get("/accounts/get-asset-accounts");
      const assetData = response.data?.data || [];
      setAssetAccounts(
        assetData.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching asset accounts:", error);
      setError("Failed to load asset accounts");
    }
  };

  // Initialize data fetching
  useEffect(() => {
    if (token?.access_token) {
      Promise.all([
        getIncomeAccounts(),
        getExpenseAccounts(),
        getAssetAccounts(),
      ])
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
      setSupplierOptions(
        suppliers.map((supplier: any) => ({
          value: supplier.id,
          name: supplier.supplier_name,
        }))
      );
    }
  }, [suppliers]);

  // Initialize form state when editing an asset
  useEffect(() => {
    if (item) {
      setFormState({ ...item });
      // Find the selected category if editing
      if (item.asset_category_id && assetCats) {
        const category = assetCats.find(
          (cat: any) => cat.id === item.asset_category_id
        );
        setSelectedCategory(category);
      }
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
        currency_id: 0,
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
        // Vehicle fields
        make: "",
        model: "",
        year_of_manufacture: undefined,
        engine_number: "",
        chasis_number: "",
        body_type: "",
        // Optional fields
        codification_number: "",
        condition: "",
        remarks: "",
        warranty_expiry_date: "",
        branch_id: undefined,
        // Building/land fields
        building_cost: undefined,
        plot_number: "",
        usage: "",
        room_allocation: "",
        // Land fields
        surveyed_status: "",
        titled_deed_number: "",
      });
      setSelectedCategory(null);
    }
  }, [item, assetCats]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;
    setFormState((prev) => ({ ...prev, [name]: parsedValue }));
  };

  // Handle dropdown changes
  const handleDropdownChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // When category changes, update the selected category
    if (name === "asset_category_id" && assetCats) {
      const category = assetCats.find((cat: any) => cat.id === value);
      setSelectedCategory(category);
    }
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
      "description",
    ];

    // Add conditional required fields based on category
    if (selectedCategory?.order && [1, 2, 3, 6].includes(selectedCategory.order)) {
      requiredFields.push("salvage_value", "useful_life");
    }

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

      const response = await api.request({
        method,
        url: endpoint,
        data: formState,
      });

      // Reset form
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
        currency_id: 0,
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
        // Vehicle fields
        make: "",
        model: "",
        year_of_manufacture: undefined,
        engine_number: "",
        chasis_number: "",
        body_type: "",
        // Optional fields
        codification_number: "",
        condition: "",
        remarks: "",
        warranty_expiry_date: "",
        branch_id: undefined,
        // Building/land fields
        building_cost: undefined,
        plot_number: "",
        usage: "",
        room_allocation: "",
        // Land fields
        surveyed_status: "",
        titled_deed_number: "",
      });

      onSave();
      onClose();
      toast.success(`Asset ${item?.id ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error("Save error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat();
          setError(`Validation errors: ${errorMessages.join(", ")}`);
          toast.error(`Validation errors: ${errorMessages.join(", ")}`);
        } else {
          setError("Failed to save asset. Please try again.");
          toast.error("Failed to save asset. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map asset categories to dropdown options
  const assetCatOptions = assetCats
    ? assetCats.map((cat: any) => ({ value: cat.id, name: cat.name }))
    : [];
  
    const branchOptions = branches
    ? branches.map((cat: any) => ({ value: cat.id, name: cat.name }))
    : [];

  // Condition options
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

  // Always visible fields
  const alwaysVisibleFields = [
    {
      key: "asset_category_id",
      label: "Asset Category",
      type: "dropdown",
      options: assetCatOptions,
    },
    { key: "name", label: "Name", type: "text" },
    {
      key: "supplier",
      label: "Supplier",
      type: "dropdown",
      options: supplierOptions,
    },
    {
      key: "currency_id",
      label: "Currency",
      type: "dropdown",
      options: currencyOptions,
    },
    { key: "purchase_cost", label: "Purchase Cost", type: "number" },
    // { key: "current_value", label: "Current Value", type: "number" },
    { key: "identity_no", label: "Identity No.", type: "text" },
    { key: "purchase_date", label: "Purchase Date", type: "date" },
    { key: "date_put_to_use", label: "Date Put To Use", type: "date" },
    {
      key: "asset_account_id",
      label: "Asset Account",
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
      key: "income_account_id",
      label: "Income Account",
      type: "dropdown",
      options: incomeAccounts,
    },
    { key: "description", label: "Description", type: "text" },
    { key: "codification_number", label: "Codification Number", type: "text" },
    {
      key: "condition",
      label: "Condition",
      type: "dropdown",
      options: conditionOptions,
    },
    {
      key: "remarks",
      label: "Remarks",
      type: "dropdown",
      options: remarksOptions,
    },
    {
      key: "warranty_expiry_date",
      label: "Warranty Expiry Date",
      type: "date",
    },
    {
      key: "branch_id",
      label: "Branch",
      type: "dropdown",
      options: branchOptions,
    },
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
    { key: "salvage_value", label: "Salvage Value", type: "number" },
    { key: "useful_life", label: "Useful Life (years)", type: "number" },
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
    { key: "salvage_value", label: "Salvage Value", type: "number" },
    { key: "useful_life", label: "Useful Life (years)", type: "number" },
  ];

  // Vehicle specific fields
  const vehicleFields = [
    { key: "make", label: "Make", type: "text" },
    { key: "model", label: "Model", type: "text" },
    { key: "year_of_manufacture", label: "Year of Manufacture", type: "number" },
    { key: "engine_number", label: "Engine Number", type: "text" },
    { key: "chasis_number", label: "Chasis Number", type: "text" },
    {
      key: "body_type",
      label: "Body Type",
      type: "dropdown",
      options: bodyTypeOptions,
    },
  ];

  // Land specific fields
  const landFields = [
    { key: "surveyed_status", label: "Surveyed Status", type: "text" },
    { key: "titled_deed_number", label: "Titled Deed Number", type: "text" },
    { key: "plot_number", label: "Plot Number", type: "text" },
    {
      key: "usage",
      label: "Usage",
      type: "dropdown",
      options: usageOptions,
    },
  ];

  // Building specific fields
  const buildingFields = [
    { key: "building_cost", label: "Building Cost", type: "number" },
    { key: "plot_number", label: "Plot Number", type: "text" },
    {
      key: "usage",
      label: "Usage",
      type: "dropdown",
      options: usageOptions,
    },
    { key: "room_allocation", label: "Room Allocation", type: "text" },
  ];

  // Check if the selected category is a vehicle
  const isVehicleCategory = selectedCategory?.name?.toLowerCase().includes("vehicle");
  const isLandCategory = selectedCategory?.name?.toLowerCase().includes("land");
  const isBuildingCategory = selectedCategory?.name?.toLowerCase().includes("building") || 
                           selectedCategory?.name?.toLowerCase().includes("property");

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

  return (
    <Dialog
      header={item?.id ? "Edit Asset" : "Add Asset"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="asset-form" onSubmit={handleSave}>
      <div className="p-fluid grid grid-cols-2 gap-2">  {/* Reduced gap from 4 to 2 */}
  {/* Asset Type Dropdown
  <div className="p-field col-span-2">
    <label htmlFor="asset_type" className="text-sm"> 
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
        { value: "none", name: "N/A" },
      ]}
      optionLabel="name"
      optionValue="value"
      placeholder="Select Asset Type"
      className="w-full p-inputtext-sm" 
    />
  </div> */}

  {/* Always visible fields */}
  {alwaysVisibleFields.map((field) => (
    <div className="p-field" key={field.key}>
      <label htmlFor={field.key} className="text-sm"> 
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
          className="w-full p-inputtext-sm"
        />
      ) : (
        <InputText
          id={field.key}
          name={field.key}
          type={field.type}
          value={formState[field.key as keyof Asset]?.toString() || ""}
          onChange={handleInputChange}
          required={field.type !== "dropdown"}
          className="w-full p-inputtext-sm"
        />
      )}
    </div>
  ))}

          {formState.asset_type === "appreciating" &&
            appreciatingFields.map((field) => (
              <div className="p-field" key={field.key}>
                <label htmlFor={field.key} className="text-sm">{field.label}</label>
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
                    className="w-full p-inputtext-sm"
                  />
                ) : (
                  <InputText
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    value={formState[field.key as keyof Asset]?.toString() || ""}
                    onChange={handleInputChange}
                    className="w-full p-inputtext-sm"
                  />
                )}
              </div>
            ))}
          
          {formState.asset_type === "depreciating" &&
            depreciatingFields.map((field) => (
              <div className="p-field" key={field.key}>
                <label htmlFor={field.key} className="text-sm">{field.label}</label>
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
                    className="w-full p-inputtext-sm"
                  />
                ) : (
                  <InputText
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    value={formState[field.key as keyof Asset]?.toString() || ""}
                    onChange={handleInputChange}
                    className="w-full p-inputtext-sm"
                  />
                )}
              </div>
            ))}

          {/* Vehicle specific fields */}
          {isVehicleCategory &&
            vehicleFields.map((field) => (
              <div className="p-field" key={field.key}>
                <label htmlFor={field.key} className="text-sm">{field.label}</label>
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
                    className="w-full p-inputtext-sm"
                  />
                ) : (
                  <InputText
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    value={formState[field.key as keyof Asset]?.toString() || ""}
                    onChange={handleInputChange}
                    className="w-full p-inputtext-sm"
                  />
                )}
              </div>
            ))}

          {/* Land specific fields */}
          {isLandCategory &&
            landFields.map((field) => (
              <div className="p-field" key={field.key}>
                <label htmlFor={field.key} className="text-sm">{field.label}</label>
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
                    className="w-full p-inputtext-sm"
                  />
                ) : (
                  <InputText
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    value={formState[field.key as keyof Asset]?.toString() || ""}
                    onChange={handleInputChange}
                    className="w-full p-inputtext-sm"
                  />
                )}
              </div>
            ))}

          {/* Building specific fields */}
          {isBuildingCategory &&
            buildingFields.map((field) => (
              <div className="p-field" key={field.key}>
                <label htmlFor={field.key} className="text-sm">{field.label}</label>
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
                    className="w-full p-inputtext-sm"
                  />
                ) : (
                  <InputText
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    value={formState[field.key as keyof Asset]?.toString() || ""}
                    onChange={handleInputChange}
                    className="w-full p-inputtext-sm"
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