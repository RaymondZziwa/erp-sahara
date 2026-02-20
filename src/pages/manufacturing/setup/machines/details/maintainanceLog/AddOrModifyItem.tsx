import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { ToastContainer, toast } from "react-toastify";
import { MaintainanceLog } from "../../../../../../redux/slices/types/manufacturing/maintainanceLog";
import useEmployees from "../../../../../../hooks/hr/useEmployees";
import useAuth from "../../../../../../hooks/useAuth";
import { MANUFACTURING_ENDPOINTS } from "../../../../../../api/manufacturingEndpoints";
import { createRequest } from "../../../../../../utils/api";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: MaintainanceLog;
  onSave: () => void;
  equpmentId: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  equpmentId,
}) => {
  const [formState, setFormState] = useState<Partial<MaintainanceLog>>({
    scheduled_date: null,
    completed_date: null,
    maintenance_type: "preventive",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: employees, loading: employeesLoading } = useEmployees();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
        scheduled_date: item.scheduled_date ? new Date(item.scheduled_date) : null,
        completed_date: item.completed_date ? new Date(item.completed_date) : null, });
    } else {
      setFormState({
        scheduled_date: null,
        completed_date: null,
        maintenance_type: "preventive",
        technician_id: "",
        description: "",
        actions_taken: "",
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof MaintainanceLog, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: keyof MaintainanceLog, value: Nullable<Date>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (date: Date | null | undefined) =>
    date ? date.toISOString().split("T")[0] : null;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { technician_id, scheduled_date, completed_date, maintenance_type } = formState;

    if (!technician_id || !scheduled_date || !completed_date || !maintenance_type) {
      toast.warn("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    const data = {
      maintenance_type: formState.maintenance_type,
      scheduled_date: formatDate(formState.scheduled_date),
      completed_date: formatDate(formState.completed_date),
      technician_id: formState.technician_id,
      description: formState.description,
      actions_taken: formState.actions_taken,
    };

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? MANUFACTURING_ENDPOINTS.EQUIPMENT_MAINTANANCE_LOG.UPDATE(equpmentId, item.id.toString())
        : MANUFACTURING_ENDPOINTS.EQUIPMENT_MAINTANANCE_LOG.ADD(equpmentId);

      await createRequest(endpoint, token.access_token, data, onSave, method);
      setFormState({
        scheduled_date: null,
        completed_date: null,
        maintenance_type: "preventive",
        technician_id: "",
        description: "",
        actions_taken: "",
      });

      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error saving maintenance log");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text !bg-red-500 hover:bg-red-400"
        onClick={onClose}
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="maintenance-form"
        size="small"
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item?.id ? "Edit Maintenance Log" : "Add Maintenance Log"}
        visible={visible}
        onHide={onClose}
        footer={footer}
        style={{ width: "450px" }}
      >
        <p className="mb-6">
          Fields marked with <span className="text-red-500">*</span> are mandatory.
        </p>
        <form
          id="maintenance-form"
          onSubmit={handleSave}
          className="p-fluid grid grid-cols-1 gap-4"
        >
          <div className="p-field">
            <label>Maintenance Type<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.maintenance_type}
              options={["preventive", "corrective", "predictive"].map((type) => ({
                label: type,
                value: type,
              }))}
              onChange={(e) => handleSelectChange("maintenance_type", e.value)}
              className="w-full"
              placeholder="Select type"
            />
          </div>

          <div className="p-field">
            <label>Technician<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.technician_id}
              options={employees.map((emp) => ({
                label: `${emp.first_name} ${emp.last_name}`,
                value: emp.id,
              }))}
              loading={employeesLoading}
              onChange={(e) => handleSelectChange("technician_id", e.value)}
              className="w-full"
              placeholder="Select technician"
            />
          </div>

          <div className="p-field">
            <label>Scheduled Date<span className="text-red-500">*</span></label>
            <Calendar
              value={formState.scheduled_date || null}
              onChange={(e) => handleDateChange("scheduled_date", e.value)}
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>Completed Date<span className="text-red-500">*</span></label>
            <Calendar
              value={formState.completed_date || null}
              onChange={(e) => handleDateChange("completed_date", e.value)}
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>Description</label>
            <InputText
              name="description"
              value={formState.description || ""}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label>Actions Taken</label>
            <InputText
              name="actions_taken"
              value={formState.actions_taken || ""}
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
