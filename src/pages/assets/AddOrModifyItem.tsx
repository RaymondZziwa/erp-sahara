//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import useAuth from "../../hooks/useAuth";
import { baseURL, createRequest } from "../../utils/api";
import { Dropdown } from "primereact/dropdown";
import { Asset } from "../../redux/slices/types/mossApp/assets/asset";
import useAssetCategories from "../../hooks/assets/useAssetCategories";
import useSuppliers from "../../hooks/inventory/useSuppliers";
import { Supplier } from "../../redux/slices/types/inventory/Suppliers";
import useChartOfAccounts from "../../hooks/accounts/useChartOfAccounts";
import axios from "axios";
import { ASSETSENDPOINTS } from "../../api/assetEndpoints";

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
  appreciation_rate: undefined, // Nullable
  salvage_value: 0,
  useful_life: 0,
  description: "",
});


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([])
  const [acctOptions, setAcctOptions] = useState([]);
  const [acps, setAcps] = useState<{name: string, accounts: []}[]>([])

  const [assetLedgers, setAssetLedgers] = useState([])
  const { token } = useAuth();

  const getAssetLedgers = async () => {
    try {
      const res = await axios.get(
        `${baseURL}/erp/accounts/get-asset-accounts`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      if(res.data) {
        const opts = res.data?.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }));
        console.log(res.data);
        setAssetLedgers(opts);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=> {
    getAssetLedgers();
  },[])

  const {data: accounts} = useChartOfAccounts()
  const {data: suppliers} = useSuppliers()
  const {data: assetCats} = useAssetCategories()

  useEffect(()=> {
    const options = suppliers.map((supplier) => ({
      value: supplier.id,
      name: supplier.supplier_name,
    }));

    const opts = accounts.map((acc) => ({
      value: acc.id,
      name: acc.name,
    }));

    setSupplierOptions(options);
    setAcctOptions(opts);
  }, [accounts, suppliers])

  const getAccountsData = async () => {
    try {
      const [incomeResponse, expenseResponse, assetResponse] =
        await Promise.all([
          axios.get(`${baseURL}/erp/accounts/get-income-accounts`, {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          }),
          axios.get(`${baseURL}/erp/accounts/get-expense-accounts`, {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          }),
          axios.get(`${baseURL}/erp/accounts/get-asset-accounts`, {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          }),
        ]);

      // Combine the results into an array of objects
      const result = [
        {
          name: "Income Accounts",
          accounts: incomeResponse.data, // assuming the response data contains the accounts
        },
        {
          name: "Expense Accounts",
          accounts: expenseResponse.data,
        },
        {
          name: "Asset Accounts",
          accounts: assetResponse.data,
        },
      ];

      setAcps(result)
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  useEffect(()=> {
      getAccountsData();
  }, [])

useEffect(() => {
  if (item) {
    setFormState({
      name: item.name || "",
      supplier: item.supplier || "",
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
      appreciation_rate: item.appreciation_rate ?? undefined, // Nullable
      salvage_value: item.salvage_value || 0,
      useful_life: item.useful_life || 0,
      description: item.description || "",
    });
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
  }
}, [item]);



  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formState)
    setIsSubmitting(true);
    // Basic validation
   
    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? ASSETSENDPOINTS.ASSETS.UPDATE(item.id.toString())
      : ASSETSENDPOINTS.ASSETS.ADD;
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    setFormState({});
    onSave();
    onClose(); // Close the modal after saving
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
        form="truck-form"
        size="small"
        onClick={handleSave}
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
          <div className="p-field">
            <label htmlFor="asset_type">
              Asset Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              name="asset_type"
              value={formState.asset_type || ""}
              onChange={(e) =>
                setFormState({ ...formState, asset_type: e.value })
              }
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

          {/* Always Visible Fields */}
          {[
            "name",
            "serial_number",
            "purchase_date",
            "purchase_cost",
            "date_put_to_use",
            "salvage_value",
            "useful_life",
            "asset_account_id",
          ].map((key) => (
            <div className="p-field" key={key}>
              <label htmlFor={key}>
                {key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}{" "}
                <span className="text-red-500">*</span>
              </label>
              {key === "asset_account_id" ? (
                <Dropdown
                  name={key}
                  value={formState[key] || ""}
                  onChange={(e) =>
                    setFormState({ ...formState, [key]: e.value })
                  }
                  options={assetLedgers.length > 0 ? assetLedgers : []}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Asset Account"
                  className="w-full"
                />
              ) : (
                <InputText
                  id={key}
                  name={key}
                  type={key.includes("date") ? "date" : "text"}
                  value={formState[key] || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              )}
            </div>
          ))}

          {/* Conditionally Rendered Fields (ONLY after asset type is selected) */}
          {formState.asset_type &&
            Object.keys(formState).map((key) => {
              if (
                [
                  "name",
                  "serial_number",
                  "purchase_date",
                  "purchase_cost",
                  "date_put_to_use",
                  "salvage_value",
                  "useful_life",
                  "asset_account_id",
                  "asset_type",
                ].includes(key)
              )
                return null; // Skip always visible fields

              const isDropdown = [
                "depreciation_method",
                "appreciation_account_id",
                "appreciation_loss_account_id",
                "appreciation_gain_account_id",
                "depreciation_account_id",
                "expense_account_id",
                "depreciation_loss_account_id",
                "depreciation_gain_account_id",
              ].includes(key);

              // Handle Dropdown Options
              const options = key.includes("depreciation_method")
                ? [
                    { value: "straight_line", name: "Straight line" },
                    { value: "declining_balance", name: "Declining balance" },
                  ]
                : acctOptions;

              // Conditionally Render Fields Based on Asset Type
              if (
                formState.asset_type === "appreciating" &&
                ![
                  "appreciation_rate",
                  "appreciation_account_id",
                  "income_account_id",
                  "appreciation_loss_account_id",
                  "appreciation_gain_account_id",
                ].includes(key)
              ) {
                return null;
              }

              if (
                formState.asset_type === "depreciating" &&
                ![
                  "depreciation_method",
                  "depreciation_rate",
                  "depreciation_account_id",
                  "expense_account_id",
                  "depreciation_loss_account_id",
                  "depreciation_gain_account_id",
                ].includes(key)
              ) {
                return null;
              }

              return (
                <div className="p-field" key={key}>
                  <label htmlFor={key}>
                    {key
                      .replace(/_/g, " ")
                      .replace(/^\w/, (c) => c.toUpperCase())}{" "}
                  </label>
                  {isDropdown ? (
                    <Dropdown
                      name={key}
                      value={formState[key] || ""}
                      onChange={(e) =>
                        setFormState({ ...formState, [key]: e.value })
                      }
                      options={options}
                      optionLabel="name"
                      optionValue="id"
                      placeholder={`Select ${key.replace(/_/g, " ")}`}
                      className="w-full"
                    />
                  ) : (
                    <InputText
                      id={key}
                      name={key}
                      type={key.includes("date") ? "date" : "text"}
                      value={formState[key] || ""}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  )}
                </div>
              );
            })}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyAsset;
