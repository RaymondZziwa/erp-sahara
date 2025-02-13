import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import useAuth from "../../../../hooks/useAuth";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import { createRequest } from "../../../../utils/api";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";

import { CenterDownTimeLog } from "../../../../redux/slices/types/manufacturing/DownTimeLog";
import { InputTextarea } from "primereact/inputtextarea";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CenterDownTimeLog;
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
  const [formState, setFormState] = useState<Partial<CenterDownTimeLog>>({});
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
    // @ts-expect-error
    const formatDate = (date: Date): Date => date.toISOString().slice(0, 10);

    // Basic validation
    if (
      !formState.start_time ||
      !formState.end_time ||
      !formState.downtime_reason
    ) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data = { ...formState };
    const UpdateData = {
      start_time: formatDate(formState.start_time),
      downtime_reason: formState.downtime_reason,
      end_time: formatDate(formState.end_time),
    };
    console.log("dt", UpdateData);
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.CENTER_DOWNTIME_LOG.UPDATE(
          centerId,
          item.id.toString()
        )
      : MANUFACTURING_ENDPOINTS.CENTER_DOWNTIME_LOG.ADD(centerId);
    await createRequest(
      endpoint,
      token.access_token,
      item?.id
        ? UpdateData
        : {
            ...data,
            start_time: formatDate(formState.start_time),
            end_time: formatDate(formState.end_time),
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
    <Dialog
      header={item?.id ? "Edit Log" : "Add Log"}
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
          <label htmlFor="downtime_reason">Reason</label>
          <InputTextarea
            id="downtime_reason"
            name="downtime_reason"
            value={formState.downtime_reason || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        {/* Actual End Date */}
        <div className="p-field">
          <label htmlFor="start_time">Start Time</label>
          <Calendar
            id="start_time"
            name="start_time"
            value={formState.start_time || null}
            onChange={(e) => handleDateChange("start_time", e.value)}
            dateFormat="yy-mm-dd"
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="end_time">End Time</label>
          <Calendar
            id="end_time"
            name="end_time"
            value={formState.end_time || null}
            onChange={(e) => handleDateChange("end_time", e.value)}
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
