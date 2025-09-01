import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { toast } from "react-toastify";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useWarehouses from "../../../hooks/inventory/useWarehouses";

import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import useProductionPlans from "../../../hooks/manufacturing/workCenter/useProductionPlans";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import { useParams } from "react-router-dom";
import { formatDate } from "../../../utils/dateUtils";
import useItems from "../../../hooks/inventory/useItems";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: any;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
    const {id} = useParams()
  const { token } = useAuth();
  const { data: plans } = useProductionPlans(id);
  const { data: warehouses } = useWarehouses();
    const { data: uoms } = useUnitsOfMeasurement();
    const {data: items} = useItems()

  const [formState, setFormState] = useState({
    production_schedule_id: "",
    item_id: "",
    quantity: "",
    produced_at: null as Date | null,
    output_type: "",
    warehouse_id: "",
    uom: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
        produced_at: item.produced_at ? new Date(item.produced_at) : null,
      });
    } else {
      setFormState({
        production_schedule_id: "",
        item_id: "",
        quantity: "",
        produced_at: null,
        output_type: "",
        warehouse_id: "",
        uom: "",
      });
    }
  }, [item]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e: any) => {
    setFormState((prev) => ({
      ...prev,
      produced_at: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      production_schedule_id,
      item_id,
      quantity,
      produced_at,
      output_type,
      warehouse_id,
      uom,
    } = formState;

    if (
      !production_schedule_id ||
      !item_id ||
      !quantity ||
      !produced_at ||
      !output_type ||
      !warehouse_id ||
      !uom
    ) {
      toast.warn("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      production_schedule_id,
      item_id,
      quantity: parseInt(quantity),
      produced_at: produced_at.toISOString().split("T")[0],
      output_type,
      warehouse_id,
      uom,
    };

    try {
      const endpoint = item?.id
        ? MANUFACTURING_ENDPOINTS.PRODUCTION_OUTPUT.UPDATE(item.id)
        : MANUFACTURING_ENDPOINTS.PRODUCTION_OUTPUT.ADD;

      const method = item?.id ? "PUT" : "POST";

      await createRequest(endpoint, token.access_token, payload, onSave, method);

      onSave();
      onClose();
    } catch (error) {
      console.error("Save error", error);
      toast.error("An error occurred while saving.");
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
        className="p-button-text !bg-red-500 text-white hover:!bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        disabled={isSubmitting}
        type="submit"
        form="output-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Production Output" : "Add Production Output"}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="output-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <p className="text-sm text-gray-600">
          Fields marked with <span className="text-red-500">*</span> are
          mandatory.
        </p>

        <div>
          <label className="font-medium">
            Production Schedule <span className="text-red-500">*</span>
          </label>
          <Dropdown
            name="production_schedule_id"
            value={formState.production_schedule_id}
            options={plans.map((plan) => ({
              label: `${formatDate(plan.start_time)} - ${formatDate(plan.end_time)}`,
              value: plan.id,
            }))}
            onChange={handleInputChange}
            placeholder="Select plan"
            className="w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            Item <span className="text-red-500">*</span>
          </label>
          <Dropdown
            name="item_id"
            value={formState.item_id}
            options={items.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            onChange={handleInputChange}
            placeholder="Select Item"
            className="w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            Quantity <span className="text-red-500">*</span>
          </label>
          <InputText
            name="quantity"
            value={formState.quantity}
            onChange={handleInputChange}
            placeholder="Enter quantity"
            keyfilter="int"
          />
        </div>

        <div>
          <label className="font-medium">
            Produced At <span className="text-red-500">*</span>
          </label>
          <Calendar
            value={formState.produced_at}
            onChange={handleDateChange}
            showIcon
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            Output Type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            name="output_type"
            value={formState.output_type}
            options={[
              { label: "Final", value: "Final" },
              { label: "Intermediate", value: "Intermediate" },
            ]}
            onChange={handleInputChange}
            placeholder="Select type"
            className="w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            Warehouse <span className="text-red-500">*</span>
          </label>
          <Dropdown
            name="warehouse_id"
            value={formState.warehouse_id}
            options={warehouses.map((w) => ({
              label: w.name,
              value: w.id,
            }))}
            onChange={handleInputChange}
            placeholder="Select warehouse"
            className="w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            Unit of Measure <span className="text-red-500">*</span>
          </label>
          <Dropdown
            name="uom"
            value={formState.uom}
            options={uoms.map((u) => ({
              label: u.name,
              value: u.id,
            }))}
            onChange={handleInputChange}
            placeholder="Select UOM"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
