import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import useAuth from "../../../../hooks/useAuth";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import { createRequest } from "../../../../utils/api";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";

import { InputText } from "primereact/inputtext";
import { CapapcityLog } from "../../../../redux/slices/types/manufacturing/CapacityLog";
import { toast, ToastContainer } from "react-toastify";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CapapcityLog;
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
  const [formState, setFormState] = useState<Partial<CapapcityLog>>({});
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // @ts-expect-error --ignore
    const formatDate = (date: Date): Date => date.toISOString().slice(0, 10);

    // Basic validation
    if (
      !formState.available_capacity ||
      !formState.utilized_capacity ||
      !formState.log_date
    ) {
      setIsSubmitting(false);
      toast.warn('Please fill in all the mandatory fields')
      return; // Handle validation error here
    }
    const updateData = {
      log_date: formState.log_date,
      utilized_capacity: Number(formState.utilized_capacity),
      available_capacity: Number(formState.available_capacity),
      description: formState.description,
    };

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.CENTER_CAPACITY_LOG.UPDATE(
          centerId.toString(),
          item.id.toString()
        )
      : MANUFACTURING_ENDPOINTS.CENTER_CAPACITY_LOG.ADD(centerId);
    console.log("up", updateData);
    console.log("data", data);
    await createRequest(
      endpoint,
      token.access_token,
      item?.id
        ? { ...updateData, log_date: formatDate(formState.log_date) }
        : {
            ...data,
            log_date: formatDate(formState.log_date),
          },
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
    <>
      <ToastContainer />
    <Dialog
      header={item?.id ? "Edit Log" : "Add Log"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
       <p className="mb-6">
          Fields marked with a red asterik (<span className="text-red-500">*</span>) are mandatory.
       </p>
      <form
        id="lead-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="utilized_capacity">Utlized Capacity<span className="text-red-500">*</span></label>
          <InputText
            id="utilized_capacity"
            name="utilized_capacity"
            value={formState.utilized_capacity || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="available_capacity">Available Capacity<span className="text-red-500">*</span></label>
          <InputText
            id="available_capacity"
            name="available_capacity"
            value={formState.available_capacity || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        {/* Actual End Date */}
        <div className="p-field">
          <label htmlFor="log_date">Log Date<span className="text-red-500">*</span></label>
          <Calendar
            id="log_date"
            name="log_date"
            value={formState.log_date || null}
            onChange={(e) => handleDateChange("log_date", e.value)}
            dateFormat="yy-mm-dd"
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputText
            id="description"
            name="description"
            value={formState.description || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  </>
  );
};

export default AddOrModifyItem;
