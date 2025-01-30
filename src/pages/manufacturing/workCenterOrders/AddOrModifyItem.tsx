import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { WorkOrder } from "../../../redux/slices/types/manufacturing/WorkOrder";
import { Dropdown } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import useProductionLines from "../../../hooks/manufacturing/workCenter/useProductionLines";
import useItems from "../../../hooks/inventory/useItems";

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

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({ quantity: "" }); // Reset formState when adding a new item
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

  const handleDateChange = (name: string, value: Nullable<Date>) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (
      !formState.actual_end_date ||
      !formState.actual_start_date ||
      !formState.planned_end_date ||
      !formState.planned_start_date
    ) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }
    // @ts-ignore
    const formatDate = (date: Date): Date => date?.toISOString().slice(0, 10);
    const data: Partial<WorkOrder> = {
      ...formState,
      actual_end_date: formatDate(formState.actual_end_date),
      actual_start_date: formatDate(formState.actual_start_date),
      planned_end_date: formatDate(formState.planned_end_date),
      planned_start_date: formatDate(formState.planned_start_date),
    };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.WORK_CENTER_ORDERS.UPDATE(item.id.toString())
      : MANUFACTURING_ENDPOINTS.WORK_CENTER_ORDERS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
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
        form="lead-form"
        size="small"
      />
    </div>
  );

  const handleSelectChange = (name: keyof WorkOrder, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const { data: items, loading: itemsLoading } = useItems();
  const { data: productionLines, loading: productionLinesLoading } =
    useProductionLines();
  return (
    <Dialog
      header={item?.id ? "Edit Work Order" : "Add Work Order"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="lead-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="item_id">Item</label>
          <Dropdown
            id="item_id"
            name="item_id"
            value={formState.item_id}
            options={items.map((center) => ({
              value: center.id,
              label: center.name,
            }))}
            required
            filter
            loading={itemsLoading}
            onChange={(e) => handleSelectChange("item_id", e.value)}
            placeholder="Select Item"
            className="w-full"
          />
          <div className="p-field">
            <label htmlFor="quantity">Quantity</label>
            <InputText
              id="quantity"
              name="quantity"
              value={formState.quantity?.toString() || ""}
              onChange={handleInputChange}
              required
              type="number"
              className="w-full"
            />
          </div>

          {/* Actual Start Date */}
          <div className="p-field">
            <label htmlFor="actual_start_date">Actual Start Date</label>
            <Calendar
              id="actual_start_date"
              name="actual_start_date"
              value={formState.actual_start_date || null}
              onChange={(e) => handleDateChange("actual_start_date", e.value)}
              dateFormat="yy-mm-dd"
              className="w-full"
              required
            />
          </div>

          {/* Actual End Date */}
          <div className="p-field">
            <label htmlFor="actual_end_date">Actual End Date</label>
            <Calendar
              id="actual_end_date"
              name="actual_end_date"
              value={formState.actual_end_date || null}
              onChange={(e) => handleDateChange("actual_end_date", e.value)}
              dateFormat="yy-mm-dd"
              className="w-full"
              required
            />
          </div>

          {/* Planned Start Date */}
          <div className="p-field">
            <label htmlFor="planned_start_date">Planned Start Date</label>
            <Calendar
              id="planned_start_date"
              name="planned_start_date"
              value={formState.planned_start_date || null}
              onChange={(e) => handleDateChange("planned_start_date", e.value)}
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>

          {/* Planned End Date */}
          <div className="p-field">
            <label htmlFor="planned_end_date">Planned End Date</label>
            <Calendar
              id="planned_end_date"
              name="planned_end_date"
              value={formState.planned_end_date || null}
              onChange={(e) => handleDateChange("planned_end_date", e.value)}
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>
        </div>
        <div className="p-field">
          <label htmlFor="production_line_id">Production Line</label>
          <Dropdown
            filter
            id="production_line_id"
            name="production_line_id"
            value={formState.production_line_id}
            options={productionLines.map((line) => ({
              value: line.id,
              label: line.name,
            }))}
            required
            loading={productionLinesLoading}
            onChange={(e) => handleSelectChange("production_line_id", e.value)}
            placeholder="Select a Production Line"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
