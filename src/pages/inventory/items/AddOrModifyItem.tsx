import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

import useItemCategories from "../../../hooks/inventory/useCategories";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { RadioButton } from "primereact/radiobutton";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { InventoryItem } from "../../../redux/slices/types/inventory/Items";
import useLedgerChartOfAccounts from "../../../hooks/accounts/useLedgerChartOfAccounts";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<InventoryItem>;
  onSave: () => void;
}

const itemTypes = [
  { label: "Physical", value: "physical" },
  { label: "Service", value: "service" },
  { label: "Raw Material", value: "raw_material" },
  { label: "Semi-Finished", value: "semi_finished" },
  { label: "Finished Good", value: "finished_good" },
  { label: "Asset", value: "asset" },
  { label: "Consumable", value: "consumable" },
  { label: "Digital Good", value: "digital_good" },
  { label: "Subscriptions", value: "subscriptions" },
];
const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem = {
    name: "",
    description: "",
    item_category_id: undefined,
    unit_of_measure_id: undefined,
    currency_id: undefined,
    account_chart_id: undefined,
    item_type: "Product",
    cost_price: undefined,
    selling_price: undefined,
    vat: undefined,
    reference: "",
    barcode: "",
    stock_alert_level: undefined,
    sku_unit: undefined,
    has_expiry: undefined,
    shell_life: undefined,
  };
  const [formState, setFormState] =
    useState<Partial<InventoryItem>>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: units } = useUnitsOfMeasurement();
  const { data: currencies } = useCurrencies();
  const { token } = useAuth();
  const { data: chartOfAccounts, loading: chartOfAccountsLoading } =
    useLedgerChartOfAccounts({ accountType: AccountType.EXPENSES });

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({ ...initialItem, has_expiry: 0 });
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
    // Basic validation
    if (!formState.name) {
      return; // You can handle validation error here
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.ITEMS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.ITEMS.ADD;
    const data = item?.id ? { ...item, ...formState } : formState;
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };
  const { data: categories } = useItemCategories();
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
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Item" : "Add Item"}
      visible={visible}
      className="max-w-screen-2xl"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 "
      >
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
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description ?? ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="item_category_id">Category</label>
          <div className="card flex justify-content-center">
            <Dropdown
              value={formState.item_category_id}
              onChange={(e: DropdownChangeEvent) => {
                setFormState({ ...formState, item_category_id: e.value });
              }}
              options={categories}
              optionLabel="name"
              optionValue="id"
              placeholder="Select a Category"
              filter
              className="w-full md:w-14rem"
            />
          </div>
        </div>
        <div className="p-field">
          <label htmlFor="item_category_id">Unit of Measure</label>
          <div className="card flex justify-content-center">
            <Dropdown
              value={formState.unit_of_measure_id}
              onChange={(e: DropdownChangeEvent) => {
                setFormState({ ...formState, unit_of_measure_id: e.value });
              }}
              options={units}
              optionLabel="name"
              optionValue="id"
              placeholder="Select a unit"
              filter
              className="w-full md:w-14rem"
            />
          </div>
        </div>

        <div className="p-field">
          <label htmlFor="item_category_id">Chart of Account</label>
          <div className="card flex justify-content-center">
            <Dropdown
              loading={chartOfAccountsLoading}
              required
              value={formState.chart_account}
              onChange={(e: DropdownChangeEvent) => {
                setFormState({ ...formState, chart_account: e.value });
              }}
              options={chartOfAccounts.map((acc) => ({
                label: acc.name,
                value: acc.id,
              }))}
              placeholder="Select Chart Of Account"
              filter
              className="w-full md:w-14rem"
            />
          </div>
        </div>
        {/* <div className="p-field">
          <label htmlFor="item_type">Item Type</label>

          {["Service", "Product"].map((type) => {
            return (
              <div
                id="item_type"
                key={type}
                className="flex align-items-center"
              >
                <RadioButton
                  required
                  inputId={type}
                  id="item_type"
                  name="type"
                  value={type}
                  onChange={(e) =>
                    setFormState({ ...formState, item_type: e.value })
                  }
                  checked={formState.item_type === type}
                />
                <label htmlFor={type} className="ml-2">
                  {type}
                </label>
              </div>
            );
          })}
        </div> */}
        <div className="p-field">
          <label htmlFor="item_category_id">Item Type</label>
          <div className="card flex justify-content-center">
            <Dropdown
              required
              value={formState.item_type}
              onChange={(e: DropdownChangeEvent) => {
                setFormState({ ...formState, item_type: e.value });
              }}
              options={itemTypes.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
              placeholder="Select Item Type"
              filter
              className="w-full md:w-14rem"
            />
          </div>
        </div>
        <div className="p-field">
          <label htmlFor="cost_price">Cost Price</label>
          <InputText
            id="cost_price"
            name="cost_price"
            type="number"
            step="0.01"
            value={formState.cost_price}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="selling_price">Selling Price</label>
          <InputText
            id="selling_price"
            name="selling_price"
            type="number"
            step="0.01"
            value={formState.selling_price}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="item_category_id">Currency</label>
          <div className="card flex justify-content-center">
            <Dropdown
              required
              value={formState.currency_id}
              onChange={(e: DropdownChangeEvent) => {
                setFormState({ ...formState, currency_id: e.value });
              }}
              options={currencies}
              optionLabel="name"
              optionValue="id"
              placeholder="Select a currency"
              filter
              className="w-full md:w-14rem"
            />
          </div>
        </div>
        <div className="p-field">
          <label htmlFor="vat">VAT</label>
          <InputText
            id="vat"
            name="vat"
            type="number"
            value={formState.vat}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="reference">Reference</label>
          <InputText
            id="reference"
            name="reference"
            value={formState.reference}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="barcode">Barcode</label>
          <InputText
            id="barcode"
            name="barcode"
            value={formState.barcode}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="stock_alert_level">Stock Alert Level</label>
          <InputText
            id="stock_alert_level"
            name="stock_alert_level"
            type="number"
            value={formState.stock_alert_level}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="sku_unit">SKU Unit</label>
          <InputText
            id="sku_unit"
            name="sku_unit"
            type="number"
            value={formState.sku_unit}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="has_expiry">Has Expiry</label>
          {[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ].map((category) => {
            return (
              <div key={category.value} className="flex align-items-center">
                <RadioButton
                  inputId={category.value.toString()}
                  name="expiry"
                  value={category.value}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      has_expiry: e.value,
                    })
                  }
                  checked={formState.has_expiry === category.value}
                />
                <label htmlFor={category.value.toString()} className="ml-2">
                  {category.label}
                </label>
              </div>
            );
          })}
        </div>

        <div className="p-field">
          <label htmlFor="shell_life">Shell Life</label>
          <InputText
            id="shell_life"
            name="shell_life"
            type="number"
            value={formState.shell_life}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
