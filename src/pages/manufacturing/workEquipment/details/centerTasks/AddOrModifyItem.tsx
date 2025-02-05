import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import useAuth from "../../../../../hooks/useAuth";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import { createRequest } from "../../../../../utils/api";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { CenterTask } from "../../../../../redux/slices/types/manufacturing/CenterTask";
import useWorkCenterOrders from "../../../../../hooks/manufacturing/workCenter/useWorkCentersOrders";
import { InputText } from "primereact/inputtext";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CenterTask;
  onSave: () => void;
  centerId: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  centerId,
}) => {
  const [formState, setFormState] = useState<Partial<CenterTask>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({}); // Reset formState when adding a new item
    }
  }, [item]);

  const handleSelectChange = (name: keyof CenterTask, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // @ts-expect-error
    const formatDate = (date: Date): Date => date.toISOString().slice(0, 10);

    // Basic validation
    if (
      !formState.task_name ||
      !formState.work_order_id ||
      !formState.planned_end_time ||
      !formState.planned_start_time
    ) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data = {
      work_order_id: Number(formState.work_order_id),
      task_name: formState.task_name,
      assigned_to: 10,
      status: formState.status,
    };
    console.log(data, "data");

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.CENTER_TASKS.UPDATE(item.id.toString())
      : MANUFACTURING_ENDPOINTS.CENTER_TASKS.ADD(centerId);

    await createRequest(
      endpoint,
      token.access_token,
      {
        ...data,
        planned_start_time: formatDate(formState.planned_start_time),
        planned_end_time: formatDate(formState.planned_end_time),
        status: item?.id ? formState.status : undefined,
      },
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };
  const { data: workOrders, loading: workOrdersLoading } =
    useWorkCenterOrders();

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

  const handleDateChange = (name: string, value: Nullable<Date>) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  return (
    <Dialog
      header={item?.id ? "Edit Task" : "Add Task"}
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
          <label htmlFor="task_name">Name</label>
          <InputText
            id="task_name"
            name="task_name"
            value={formState.task_name || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="work_center_id">Work order</label>
          <Dropdown
            loading={workOrdersLoading}
            id="work_order_id"
            name="work_order_id"
            value={formState.work_order_id}
            options={workOrders.map((order) => ({
              value: order.id,
              label: order.order_number,
            }))}
            required
            onChange={(e) => handleSelectChange("work_order_id", e.value)}
            placeholder="Select order"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="work_center_id">Status</label>
          <Dropdown
            id="status"
            name="status"
            value={formState.status}
            options={["in-progress", "completed", "pending", "in-progress"].map(
              (status) => ({
                value: status,
                label: status,
              })
            )}
            required
            onChange={(e) => handleSelectChange("status", e.value)}
            placeholder="Select status"
            className="w-full"
          />
        </div>

        {/* Actual End Date */}
        <div className="p-field">
          <label htmlFor="planned_start_time">Maintenance Date</label>
          <Calendar
            id="planned_start_time"
            name="planned_start_time"
            value={formState.planned_start_time || null}
            onChange={(e) => handleDateChange("planned_start_time", e.value)}
            dateFormat="yy-mm-dd"
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="planned_end_time">Mantenance End Date</label>
          <Calendar
            id="planned_end_time"
            name="planned_end_time"
            value={formState.planned_end_time || null}
            onChange={(e) => handleDateChange("planned_end_time", e.value)}
            dateFormat="yy-mm-dd"
            className="w-full"
            required
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
