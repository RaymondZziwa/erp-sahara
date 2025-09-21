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
import useWorkCenters from "../../../hooks/manufacturing/workCenter/useWorkCenters";
import { toMySQLDateTime } from "../../../utils/dateUtils";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: any; // could type as WorkOrder if you extend it
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState({
    work_station_id: "",
    item_id: "",
    due_date: null as Nullable<Date>,
    order_type: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: items, loading: itemsLoading } = useItems();
  const { data: workStations, loading: wsLoading } = useWorkCenters();

  useEffect(() => {
    if (item) {
      setFormState({
        work_station_id: item.work_station_id || "",
        item_id: item.item_id || "",
        due_date: item.due_date ? new Date(item.due_date) : null,
        order_type: item.order_type || "",
        description: item.description || "",
      });
    } else {
      setFormState({
        work_station_id: "",
        item_id: "",
        due_date: null,
        order_type: "",
        description: "",
      });
    }
  }, [item]);

  const handleSelectChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (value: Nullable<Date>) => {
    setFormState((prev) => ({ ...prev, due_date: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.work_station_id ||
      !formState.item_id ||
      !formState.due_date ||
      !formState.order_type
    ) {
      setIsSubmitting(false);
      return;
    }

    const payload = {
      work_station_id: formState.work_station_id,
      item_id: formState.item_id,
      due_date: new Date(formState.due_date).toISOString().split("T")[0],
      order_type: formState.order_type,
      description: formState.description,
    };

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? MANUFACTURING_ENDPOINTS.WORK_ORDERS.UPDATE(item.id.toString())
        : MANUFACTURING_ENDPOINTS.WORK_ORDERS.ADD;

      await createRequest(endpoint, token.access_token, payload, onSave, method);
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
        form="work-order-form"
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
        Fields marked with <span className="text-red-500">*</span> are mandatory.
      </p>
      <form
        id="work-order-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        {/* Work Station */}
        <div>
          <label>Work Station<span className="text-red-500">*</span></label>
          <Dropdown
            value={formState.work_station_id}
            options={workStations.map((ws: any) => ({
              label: ws.name,
              value: ws.id,
            }))}
            onChange={(e) => handleSelectChange("work_station_id", e.value)}
            loading={wsLoading}
            placeholder="Select Work Station"
            className="w-full"
          />
        </div>

        {/* Item */}
        <div>
          <label>Item<span className="text-red-500">*</span></label>
          <Dropdown
            value={formState.item_id}
            options={items.map((i: any) => ({
              label: i.name,
              value: i.id,
            }))}
            onChange={(e) => handleSelectChange("item_id", e.value)}
            loading={itemsLoading}
            placeholder="Select Item"
            className="w-full"
          />
        </div>

        {/* Due Date */}
        <div>
          <label>Due Date<span className="text-red-500">*</span></label>
          <Calendar
            value={formState.due_date}
            onChange={(e) => handleDateChange(e.value)}
            showTime
            hourFormat="24"
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>

        {/* Order Type */}
        <div>
          <label>Order Type<span className="text-red-500">*</span></label>
          <Dropdown
            value={formState.order_type}
            options={[
              { label: "Production", value: "production" },
              { label: "Packaging", value: "packaging" },
              { label: "Both", value: "both" },
            ]}
            onChange={(e) => handleSelectChange("order_type", e.value)}
            placeholder="Select Order Type"
            className="w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label>Description</label>
          <InputText
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            placeholder="Enter description"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
