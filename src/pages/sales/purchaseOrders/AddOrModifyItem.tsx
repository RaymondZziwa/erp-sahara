import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { CustomerOrder } from "../../../redux/slices/types/sales/CustomerOrder";
import useCustomers from "../../../hooks/inventory/useCustomers";
import useItems from "../../../hooks/inventory/useItems";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useQuotations from "../../../hooks/sales/useQuotations";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

type Nullable<T> = T | null | undefined;

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CustomerOrder;
  onSave: () => void;
}

interface AddItem {
  customer_id: string;
  currency_id: string;
  quotation_id?: string; // Optional
  order_date: Date;
  expected_delivery_date: Date;
  shipping_address?: string; // Optional
  shipping_method?: string; // Optional
  tracking_number?: string; // Optional
  items: Item[];
}

interface Item {
  item_id: number;
  quantity: number;
  unit_price: string;
  currency_id: number;
  notes?: string; // Optional
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { data: currencies } = useCurrencies();
  const { data: items } = useItems(); // Fetch items for dropdown
  const { data: customers } = useCustomers();
  const { data: quotations } = useQuotations();
  const { token } = useAuth();

  const [formState, setFormState] = useState<AddItem>({
    customer_id: "",
    currency_id: "",
    quotation_id: "",
    order_date: new Date(),
    expected_delivery_date: new Date(),
    shipping_address: "",
    shipping_method: "",
    tracking_number: "",
    items: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedQuotaton = quotations.find(
    (quotation) => quotation.id.toString() == formState.quotation_id
  );
  useEffect(() => {
    if (item) {
      console.log("here");

      setFormState({
        customer_id: item.customer_id.toString(),
        currency_id: item.currency_id.toString(),
        quotation_id: item.quotation_id?.toString() || "",
        order_date: new Date(item.order_date),
        expected_delivery_date: new Date(item.expected_delivery_date),
        shipping_address: item.shipping_address || "",
        shipping_method: item.shipping_method || "",
        tracking_number: item.tracking_number || "",
        items: item.customer_order_items.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id,
          notes: item.notes || "",
        })),
      });
    }
    if (formState.quotation_id) {
      setFormState({
        ...formState,
        items: formState.quotation_id
          ? selectedQuotaton?.quotation_items.map((item) => ({
              item_id: item.item_id,
              quantity: +item.quantity,
              unit_price: item.unit_price,
              currency_id: item.currency_id,
              notes: item.notes || "",
            })) || []
          : [],
      });
    }
    console.log(formState.quotation_id);

    console.log(selectedQuotaton?.quotation_items);
    console.log(formState.items);
  }, [item, formState.quotation_id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (name: keyof AddItem, date: Nullable<Date>) => {
    if (date) {
      setFormState((prevState) => ({
        ...prevState,
        [name]: date,
      }));
    }
  };

  const handleItemChange = (
    index: number,
    e:
      | DropdownChangeEvent
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    const updatedItems = [...formState.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value,
    };
    setFormState((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setFormState((prevState) => ({
      ...prevState,
      items: [
        ...prevState.items,
        {
          item_id: prevState.items.length + 1, // or some logic to get a new ID
          quantity: 1,
          unit_price: "",
          currency_id: 1,
          notes: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormState((prevState) => ({
      ...prevState,
      items: prevState.items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.currency_id || !formState.customer_id) {
      setIsSubmitting(false);
      console.log("mssing");

      return; // Handle validation error here
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const data = {
      ...formState,
      order_date: formatDate(formState.order_date),
      expected_delivery_date: formatDate(formState.expected_delivery_date),
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.CUSTOMER_ORDERS.UPDATE(item.id.toString())
      : SALES_ENDPOINTS.CUSTOMER_ORDERS.ADD;
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div id="add-item" className="flex justify-end space-x-2">
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
        form="add-item"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item ? "Edit Order" : "Add Order"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="add-item"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="customer_id">Customer ID</label>
          <Dropdown
            id="customer_id"
            name="customer_id"
            optionValue="id"
            value={formState.customer_id}
            options={customers || []}
            onChange={(e: DropdownChangeEvent) =>
              setFormState((prevState) => ({
                ...prevState,
                customer_id: e.value as string,
              }))
            }
            optionLabel="email" // or another property from customer object
            placeholder="Select a Customer"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="currency_id">Currency ID</label>
          <Dropdown
            optionValue="id"
            id="currency_id"
            name="currency_id"
            value={formState.currency_id}
            options={currencies || []}
            onChange={(e: DropdownChangeEvent) =>
              setFormState((prevState) => ({
                ...prevState,
                currency_id: e.value as string,
              }))
            }
            optionLabel="name" // or another property from currency object
            placeholder="Select a Currency"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="quotation_id">
            Quotation{" "}
            <span className="italic text-sm text-red-500">
              Select if applicable
            </span>
          </label>
          <Dropdown
            filter
            id="quotation_id"
            name="quotation_id"
            value={formState.quotation_id}
            options={quotations || []}
            optionValue="id"
            onChange={(e: DropdownChangeEvent) =>
              setFormState((prevState) => ({
                ...prevState,
                quotation_id: e.value as string,
              }))
            }
            optionLabel="title" // or another property from currency object
            placeholder="Select a Quotation"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="order_date">Order Date</label>
          <Calendar
            id="order_date"
            name="order_date"
            value={formState.order_date}
            onChange={(e) => handleDateChange("order_date", e.value)}
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="expected_delivery_date">Expected Delivery Date</label>
          <Calendar
            id="expected_delivery_date"
            name="expected_delivery_date"
            value={formState.expected_delivery_date}
            onChange={(e) =>
              handleDateChange("expected_delivery_date", e.value)
            }
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="shipping_address">Shipping Address</label>
          <InputTextarea
            id="shipping_address"
            name="shipping_address"
            value={formState.shipping_address || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="p-field">
          <label htmlFor="shipping_method">Shipping Method</label>
          <InputText
            id="shipping_method"
            name="shipping_method"
            value={formState.shipping_method || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="p-field">
          <label htmlFor="tracking_number">Tracking Number</label>
          <InputText
            id="tracking_number"
            name="tracking_number"
            value={formState.tracking_number || ""}
            onChange={handleInputChange}
          />
        </div>

        {/* Items Table */}
        <div className="p-field col-span-2">
          <label>Items</label>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Currency ID</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formState.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <Dropdown
                      value={item.item_id}
                      options={items || []}
                      onChange={(e: DropdownChangeEvent) =>
                        handleItemChange(index, e)
                      }
                      optionValue="id"
                      optionLabel="name" // or another property from item object
                      placeholder="Select Item"
                    />
                  </td>
                  <td>
                    <InputText
                      name="quantity"
                      value={item.quantity.toString()}
                      onChange={(e) => handleItemChange(index, e)}
                      type="number"
                    />
                  </td>
                  <td>
                    <InputText
                      name="unit_price"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, e)}
                    />
                  </td>
                  <td>
                    <Dropdown
                      optionValue="id"
                      value={item.currency_id}
                      options={currencies || []}
                      onChange={(e: DropdownChangeEvent) =>
                        handleItemChange(index, e)
                      }
                      optionLabel="name" // or another property from currency object
                      placeholder="Select Currency"
                    />
                  </td>
                  <td>
                    <InputTextarea
                      name="notes"
                      value={item.notes || ""}
                      onChange={(e) => handleItemChange(index, e)}
                    />
                  </td>
                  <td>
                    <Button
                      icon="pi pi-trash"
                      className="p-button-danger"
                      onClick={() => removeItem(index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            type="button"
            label="Add Item"
            icon="pi pi-plus"
            onClick={addItem}
            className="p-button-success mt-2 flex w-fit"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
