import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useItems from "../../../hooks/inventory/useItems";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { WorkOrder } from "../../../redux/slices/types/manufacturing/WorkOrder";
import useCustomers from "../../../hooks/inventory/useCustomers";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: WorkOrder;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<WorkOrder>>({
    quantity: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const { data: items, loading: itemsLoading } = useItems();
  const { data: customers, loading: customersLoading } = useCustomers();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({ quantity: "" });
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

  const handleSelectChange = (name: keyof WorkOrder, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (name: string, value: Nullable<Date>) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formatDate = (date: Date) => date.toISOString().slice(0, 10);

    if (
      !formState.item_id ||
      !formState.customer_id ||
      !formState.quantity ||
      !formState.start_date ||
      !formState.expected_completion_date ||
      !formState.priority ||
      !formState.status
    ) {
      setIsSubmitting(false);
      return;
    }

    const data = {
      item_id: formState.item_id,
      customer_id: formState.customer_id,
      quantity: parseFloat(formState.quantity.toString()),
      start_date: formatDate(formState.start_date as Date),
      expected_completion_date: formatDate(formState.expected_completion_date as Date),
      priority: formState.priority,
      status: formState.status,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.WORK_CENTER_ORDERS.UPDATE(item.id.toString())
      : MANUFACTURING_ENDPOINTS.WORK_CENTER_ORDERS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
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
        form="lead-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Work Order" : "Add Work Order"}
      visible={visible}
      style={{ width: "450px" }}
      footer={footer}
      onHide={onClose}
    >
      <p className="mb-6">
        Fields marked with a red asterisk (<span className="text-red-500">*</span>) are mandatory.
      </p>
      <form
        id="lead-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="item_id">Item<span className="text-red-500">*</span></label>
          <Dropdown
            id="item_id"
            value={formState.item_id}
            options={items.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            onChange={(e) => handleSelectChange("item_id", e.value)}
            loading={itemsLoading}
            placeholder="Select Item"
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="customer_id">Customer<span className="text-red-500">*</span></label>
          <Dropdown
            id="customer_id"
            value={formState.customer_id}
            options={customers.map((c) => ({
              label: `${c.first_name} ${c.last_name}`,
              value: c.id,
            }))}
            onChange={(e) => handleSelectChange("customer_id", e.value)}
            loading={customersLoading}
            placeholder="Select Customer"
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="quantity">Quantity<span className="text-red-500">*</span></label>
          <InputText
            id="quantity"
            name="quantity"
            type="number"
            value={formState.quantity?.toString() || ""}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="start_date">Start Date<span className="text-red-500">*</span></label>
          <Calendar
            id="start_date"
            value={formState.start_date || null}
            onChange={(e) => handleDateChange("start_date", e.value)}
            dateFormat="yy-mm-dd"
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="expected_completion_date">Expected Completion Date<span className="text-red-500">*</span></label>
          <Calendar
            id="expected_completion_date"
            value={formState.expected_completion_date || null}
            onChange={(e) => handleDateChange("expected_completion_date", e.value)}
            dateFormat="yy-mm-dd"
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="priority">Priority<span className="text-red-500">*</span></label>
          <Dropdown
            id="priority"
            value={formState.priority}
            options={["low", "medium", "high", "urgent"].map((p) => ({
              label: p,
              value: p,
            }))}
            onChange={(e) => handleSelectChange("priority", e.value)}
            placeholder="Select Priority"
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="status">Status<span className="text-red-500">*</span></label>
          <Dropdown
            id="status"
            value={formState.status}
            options={["planned", "released", "in-progress", "completed", "cancelled"].map((s) => ({
              label: s,
              value: s,
            }))}
            onChange={(e) => handleSelectChange("status", e.value)}
            placeholder="Select Status"
            className="w-full"
            required
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
