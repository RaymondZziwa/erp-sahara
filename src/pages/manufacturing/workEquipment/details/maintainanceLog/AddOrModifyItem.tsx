import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { MaintainanceLog } from "../../../../../redux/slices/types/manufacturing/maintainanceLog";
import useAuth from "../../../../../hooks/useAuth";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import { createRequest } from "../../../../../utils/api";
import useEmployees from "../../../../../hooks/hr/useEmployees";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";

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
    maintenance_date: null,
    maintenance_end_date: null,

    mantenance_every_after: 0,
    status: "in-progress", //'completed', 'pending', 'in-progress'
  });
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

  const handleSelectChange = (name: keyof MaintainanceLog, value: any) => {
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // @ts-expect-error
    const formatDate = (date: Date): Date => date.toISOString().slice(0, 10);

    // Basic validation
    if (
      !formState.performed_by ||
      !formState.status ||
      !formState.mantenance_every_after
    ) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data = {
      ...formState,
      mantenance_every_after: Number(formState.mantenance_every_after),
    };
    console.log(data, "sd");

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.EQUIPMENT_MAINTANANCE_LOG.UPDATE(
          item.id.toString()
        )
      : MANUFACTURING_ENDPOINTS.EQUIPMENT_MAINTANANCE_LOG.ADD(equpmentId);
    await createRequest(
      endpoint,
      token.access_token,
      {
        ...data,
      },
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };
  const { data: employees, loading: employeesLoading } = useEmployees();

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
  return (
    <Dialog
      header={item?.id ? "Edit Equipment Log" : "Add Equipment Log"}
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
          <label htmlFor="work_center_id">Performed By</label>
          <Dropdown
            loading={employeesLoading}
            id="performed_by"
            name="performed_by"
            value={formState.performed_by}
            options={employees.map((employee) => ({
              value: employee.id,
              label: employee.first_name + " " + employee.last_name,
            }))}
            required
            onChange={(e) => handleSelectChange("performed_by", e.value)}
            placeholder="Select a period"
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
            placeholder="Select a period"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="mantenance_every_after">
            Maintenance every after
          </label>
          <InputText
            id="mantenance_every_after"
            name="mantenance_every_after"
            type="number"
            value={formState.mantenance_every_after?.toString() || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        {/* Actual End Date */}
        <div className="p-field">
          <label htmlFor="maintenance_date">Maintenance Date</label>
          <Calendar
            id="maintenance_date"
            name="maintenance_date"
            value={formState.maintenance_date || null}
            onChange={(e) => handleDateChange("maintenance_date", e.value)}
            dateFormat="yy-mm-dd"
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="maintenance_end_date">Mantenance End Date</label>
          <Calendar
            id="maintenance_end_date"
            name="maintenance_end_date"
            value={formState.maintenance_end_date || null}
            onChange={(e) => handleDateChange("maintenance_end_date", e.value)}
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
