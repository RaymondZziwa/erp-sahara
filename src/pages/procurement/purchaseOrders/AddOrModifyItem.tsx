import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import useItems from "../../../hooks/inventory/useItems";

import { PurchaseOrder } from "../../../redux/slices/types/procurement/PurchaseOrders";
import useSuppliers from "../../../hooks/inventory/useSuppliers";
import useBids from "../../../hooks/procurement/useBids";

interface PurchaseOrderAdd {
  id?: number;
  bid_id: number | null; // nullable
  supplier_id: number;
  issue_date: string;
  develivery_date: string;
  total_amount: number;
  currency_id: number;
  items: Item[];
}

interface Item {
  item_id: number;
  quantity: number;
  unit_price: number;
  currency_id: number;
  delivery_time: number;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<PurchaseOrder>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialState: PurchaseOrderAdd = {
    bid_id: null,
    supplier_id: 0,
    issue_date: "",
    develivery_date: "",
    total_amount: 0,
    currency_id: 0,
    items: [],
  };

  const initialItem: Item = {
    item_id: 0,
    quantity: 0,
    unit_price: 0,
    currency_id: 0,
    delivery_time: 0,
  };

  const [formState, setFormState] = useState<PurchaseOrderAdd>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currencies } = useCurrencies();
  const { data: suppliers } = useSuppliers();
  const { token } = useAuth();
  const { data: items } = useItems();
  const { data: bids } = useBids();

  const totalAmount = formState.items.reduce(
    (acc, curr) => acc + curr.quantity * curr.unit_price,
    0
  );
  useEffect(() => {
    if (item) {
      setFormState({
        bid_id: item.bid_id ?? null,
        supplier_id: item.supplier_id ?? 0,
        issue_date: item.issue_date ?? "",
        develivery_date: item.develivery_date ?? "",
        total_amount: (item.total_amount && +item.total_amount) || 0,
        currency_id: item.currency_id ?? 0,
        items:
          item?.purchase_order_items?.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
            unit_price: +item.unit_price,
            currency_id: item.currency_id,
            delivery_time: 0,
          })) ?? [],
      });
    } else {
      setFormState(initialState);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemIndex?: number
  ) => {
    const { name, value } = e.target;
    if (itemIndex !== undefined) {
      setFormState((prevState) => ({
        ...prevState,
        items: prevState.items.map((item, index) =>
          index === itemIndex ? { ...item, [name]: value } : item
        ),
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleDropdownChange = (
    e: DropdownChangeEvent,
    itemIndex?: number,
    field?: string
  ) => {
    const { value } = e;
    if (itemIndex !== undefined && field) {
      setFormState((prevState) => ({
        ...prevState,
        items: prevState.items.map((item, index) =>
          index === itemIndex ? { ...item, [field]: value } : item
        ),
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [field!]: value,
      }));
    }
  };

  const handleAddItem = () => {
    setFormState((prevState) => ({
      ...prevState,
      items: [...prevState.items, { ...initialItem }],
    }));
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setFormState((prevState) => ({
      ...prevState,
      items: prevState.items.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? API_ENDPOINTS.PURCHASE_ORDERS.UPDATE(item.id.toString())
      : API_ENDPOINTS.PURCHASE_ORDERS.ADD;

    await createRequest(
      endpoint,
      token.access_token,
      { ...formState, total_amount: totalAmount },
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        disabled={isSubmitting}
        type="button"
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
        size="small"
      />
      <Button
        loading={isSubmitting}
        label={formState?.id ? "Update" : "Add"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Purchase Order" : "Add Purchase Order"}
      visible={visible}
      style={{ width: "1025px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-field">
            <label htmlFor="supplier_id">Supplier ID</label>
            <Dropdown
              id={`supplier_id`}
              value={formState.supplier_id}
              onChange={(e) => {
                setFormState({ ...formState, supplier_id: +e.target.value });
              }}
              options={suppliers}
              optionLabel="supplier_name"
              optionValue="id"
              placeholder="Select a supplier"
              filter
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="issue_date">Issue Date</label>
            <InputText
              id="issue_date"
              name="issue_date"
              value={formState.issue_date}
              onChange={handleInputChange}
              required
              className="w-full"
              type="date"
            />
          </div>
          <div className="p-field">
            <label htmlFor="develivery_date">Delivery Date</label>
            <InputText
              id="develivery_date"
              name="develivery_date"
              value={formState.develivery_date}
              onChange={handleInputChange}
              required
              className="w-full"
              type="date"
            />
          </div>

          <div className="p-field">
            <label htmlFor="currency_id">Currency</label>
            <Dropdown
              id="currency_id"
              value={formState.currency_id}
              onChange={(e) =>
                handleDropdownChange(e, undefined, "currency_id")
              }
              options={currencies}
              optionLabel="name"
              optionValue="id"
              placeholder="Select a currency"
              filter
              className="w-full"
            />
          </div>
        </div>
        <div className="p-field mt-2">
          <label htmlFor="supplier_id">
            Bid(
            <span className="italic text-sm text-red-500">
              Select a bid if applicable
            </span>
            )
          </label>
          <Dropdown
            showClear
            id={`bid_id`}
            value={formState.bid_id}
            onChange={(e) => {
              setFormState({
                ...formState,
                items:
                  bids
                    .find((bid) => bid.id == e.target.value)
                    ?.bid_items.map((item) => ({
                      currency_id: item.currency_id,
                      delivery_time: item.delivery_time,
                      item_id: item.request_for_quotation_item.item.id,
                      quantity: +item.quantity,
                      unit_price: +item.unit_price,
                    })) ?? [],
                bid_id: e.value == "" || e.value == undefined ? null : e.value,
              });
            }}
            options={bids}
            optionLabel="bid_no"
            optionValue="id"
            placeholder="Select a bid"
            filter
            className="w-full"
          />
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold">Items</h3>
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2">Item</th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Unit Price</th>
                <th className="border px-4 py-2">Currency</th>

                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formState.items.map((item, index) => (
                <tr key={index}>
                  {/* <td className="border px-4 py-2">
                    
                   
                  </td> */}
                  <td className="border px-4 py-2">
                    {item.item_id ? (
                      <InputText
                        id={`name_${index}`}
                        name="name"
                        type="text"
                        disabled={item.item_id > 0}
                        value={
                          items.find((it) => it.id == item.item_id)?.name ?? ""
                        }
                        className="w-full"
                      />
                    ) : (
                      <Dropdown
                        id={`item_id_${index}`}
                        value={item.item_id}
                        onChange={(e) =>
                          handleDropdownChange(e, index, "item_id")
                        }
                        options={items}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select an item"
                        filter
                        className="w-full"
                      />
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <InputText
                      id={`quantity_${index}`}
                      name="quantity"
                      type="number"
                      value={item.quantity.toString()}
                      onChange={(e) => handleInputChange(e, index)}
                      className="w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <InputText
                      id={`unit_price_${index}`}
                      name="unit_price"
                      type="number"
                      value={item.unit_price.toString()}
                      onChange={(e) => handleInputChange(e, index)}
                      className="w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <Dropdown
                      id={`currency_id_${index}`}
                      value={item.currency_id}
                      onChange={(e) =>
                        handleDropdownChange(e, index, "currency_id")
                      }
                      options={currencies}
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select a currency"
                      filter
                      className="w-full"
                    />
                  </td>

                  <td className="border px-4 py-2">
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="p-button-rounded p-button-danger p-button-text !bg-red-500"
                      onClick={() => handleRemoveItem(index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            disabled={formState.bid_id !== null}
            type="button"
            label="Add Item"
            icon="pi pi-plus"
            className={`p-button-text p-button-sm my-4 ${
              formState.bid_id !== null && "hidden"
            }`}
            onClick={handleAddItem}
          />
        </div>
        <div className="p-field flex flex-col">
          <label htmlFor="total_amount" className="font-bold text-lg">
            Total Amount
          </label>
          <InputText
            id="total_amount"
            name="total_amount"
            value={totalAmount.toString()}
            onChange={handleInputChange}
            required
            className="w-1/2"
            readOnly
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
