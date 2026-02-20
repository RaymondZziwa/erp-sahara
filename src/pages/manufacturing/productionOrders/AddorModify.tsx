import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { toast, ToastContainer } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { ProductionOrder } from "../../../redux/slices/types/manufacturing/productionOrder";
import useWorkCenterOrders from "../../../hooks/manufacturing/workCenter/useWorkCentersOrders";

interface AddOrModifyProductionOrderProps {
  visible: boolean;
  onClose: () => void;
  item?: ProductionOrder;
  onSave: () => void;
}

const priorities = ["low", "medium", "high", "urgent"];

const AddOrModifyProductionOrder: React.FC<AddOrModifyProductionOrderProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<ProductionOrder>({
    work_order_id: "",
    quantity: 0,
    start_date: "",
    expected_completion_date: "",
    priority: "low",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const { data: workOrders, refresh, loading: workOrdersLoading } = useWorkCenterOrders();

  useEffect(() => {
    if (item) {
      setFormState(item);
    } else {
      setFormState({
        work_order_id: "",
        quantity: 0,
        start_date: "",
        expected_completion_date: "",
        priority: "low",
      });
    }
  }, [item]);

  const handleChange = (field: keyof ProductionOrder, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.work_order_id || !formState.quantity || !formState.start_date || !formState.expected_completion_date) {
      toast.warn("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? MANUFACTURING_ENDPOINTS.PRODUCTION_ORDERS.UPDATE(item?.id)
        : MANUFACTURING_ENDPOINTS.PRODUCTION_ORDERS.ADD;

      await createRequest(endpoint, token.access_token, formState, onSave, method);
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Production Order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:!bg-red-400 text-white"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label={item?.work_order_id ? "Update" : "Submit"}
        icon="pi pi-check"
        form="po-form"
        loading={isSubmitting}
        disabled={isSubmitting}
        size="small"
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item?.work_order_id ? "Edit Production Order" : "Add Production Order"}
        visible={visible}
        footer={footer}
        onHide={onClose}
        className="w-[500px]"
      >
        <p className="mb-6">
          Fields marked with <span className="text-red-500">*</span> are mandatory.
        </p>

        <form id="po-form" className="grid grid-cols-1 gap-4" onSubmit={handleSave}>
          {/* Work Order */}
          <div className="flex flex-col">
            <label>Work Order<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.work_order_id}
              options={workOrders.map((wo: any) => ({
                label: `${wo.order_no} - ${wo.item.name}`,
                value: wo.id,
              }))}
              onChange={(e) => handleChange("work_order_id", e.value)}
              loading={workOrdersLoading}
              placeholder="Select Work Order"
              className="w-full"
              required
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col">
            <label>Quantity<span className="text-red-500">*</span></label>
            <InputNumber
              value={formState.quantity}
              onValueChange={(e) => handleChange("quantity", e.value)}
              className="w-full"
              min={0}
              required
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col">
            <label>Start Date<span className="text-red-500">*</span></label>
            <Calendar
              value={formState.start_date ? new Date(formState.start_date) : null}
              onChange={(e) =>
                handleChange("start_date", e.value ? e.value.toISOString().split("T")[0] : "")
              }
              dateFormat="yy-mm-dd"
              className="w-full"
              required
            />
          </div>

          {/* Expected Completion Date */}
          <div className="flex flex-col">
            <label>Expected Completion Date<span className="text-red-500">*</span></label>
            <Calendar
              value={formState.expected_completion_date ? new Date(formState.expected_completion_date) : null}
              onChange={(e) =>
                handleChange("expected_completion_date", e.value ? e.value.toISOString().split("T")[0] : "")
              }
              dateFormat="yy-mm-dd"
              className="w-full"
              required
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col">
            <label>Priority<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.priority}
              options={priorities.map((p) => ({ label: p, value: p }))}
              onChange={(e) => handleChange("priority", e.value)}
              placeholder="Select Priority"
              className="w-full"
              required
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifyProductionOrder;
