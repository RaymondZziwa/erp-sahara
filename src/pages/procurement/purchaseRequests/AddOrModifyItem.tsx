import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import useItems from "../../../hooks/inventory/useItems";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface PurchaseRequestItem {
  item_id: number;
  quantity: string;
  unit_price_estimate: string;
  currency_id: number;
  notes: string;
}

interface PurchaseRequest {
  id: number;
  name: string;
  request_comment: string;
  items: PurchaseRequestItem[];
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  purchaseRequest?: Partial<PurchaseRequest>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  purchaseRequest,
  onSave,
}) => {
  const initialItem: PurchaseRequestItem = {
    item_id: 0,
    quantity: "",
    unit_price_estimate: "",
    currency_id: 0,
    notes: "",
  };

  const initialState: PurchaseRequest = {
    id: 0,
    name: "",
    request_comment: "",
    items: [initialItem],
  };

  const [formState, setFormState] = useState<PurchaseRequest>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const levels = useSelector((state: RootState) => state.levels.data)
  const { data: currencies } = useCurrencies();
  const { token } = useAuth();
  const { data: items } = useItems();
  useEffect(() => {
    if (purchaseRequest) {
      setFormState({
        id: purchaseRequest.id ?? 0,
        items: purchaseRequest.items ?? [],
        name: purchaseRequest.name ?? "",
        request_comment: purchaseRequest.request_comment ?? "",
      });
    } else {
      setFormState(initialState);
    }
  }, [purchaseRequest]);

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
    itemIndex: number,
    field: string
  ) => {
    const { value } = e;
    setFormState((prevState) => ({
      ...prevState,
      items: prevState.items.map((item, index) =>
        index === itemIndex ? { ...item, [field]: value } : item
      ),
    }));
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
    const method = formState.id ? "PUT" : "POST";
    const endpoint = formState.id
      ? API_ENDPOINTS.PURCHASE_REQUESTS.UPDATE(formState.id.toString())
      : API_ENDPOINTS.PURCHASE_REQUESTS.ADD;
    await createRequest(
      endpoint,
      token.access_token,
      formState,
      onSave,
      method
    );

    onSave();
    setIsSubmitting(false);
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
        label={formState.id ? "Update" : "Add"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={formState.id ? "Edit Purchase Request" : "Add Purchase Request"}
      visible={visible}
      style={{ width: "1025px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
                <label className="block text-gray-700 mb-1">Add approval level</label>
                <select
                    name='user_id'
                    // value={formData.user_id}
                    // onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    >
                    <option value=" ">Select level</option>
                    {
                        levels.map((level) => (
                            <option value={level.id}>{level.name}</option>
                        ))
                    }
                </select>
            </div>
          <div className="p-field sm:col-span-2">
            <label htmlFor="request_comment">Request Comment</label>
            <InputTextarea
              id="request_comment"
              name="request_comment"
              value={formState.request_comment}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <h3>Items</h3>
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2">Item </th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Unit Price Estimate</th>
                <th className="border px-4 py-2">Currency</th>
                <th className="border px-4 py-2">Notes</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formState.items.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    <Dropdown
                      id={`item_id${index}`}
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
                  </td>
                  <td className="border px-4 py-2">
                    <InputText
                      id={`quantity_${index}`}
                      name="quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(e, index)}
                      className="w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <InputText
                      id={`unit_price_estimate_${index}`}
                      name="unit_price_estimate"
                      type="number"
                      value={item.unit_price_estimate}
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
                    <InputTextarea
                      id={`notes_${index}`}
                      name="notes"
                      value={item.notes}
                      onChange={(e) => handleInputChange(e, index)}
                      rows={1}
                      className="w-full"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Icon
                      icon="solar:trash-bin-trash-bold"
                      className="text-red-500 cursor-pointer"
                      fontSize={20}
                      onClick={() => handleRemoveItem(index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <Button
              type="button"
              label="Add Item"
              icon="pi pi-plus"
              onClick={handleAddItem}
              className="p-button-secondary w-full sm:w-auto"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
