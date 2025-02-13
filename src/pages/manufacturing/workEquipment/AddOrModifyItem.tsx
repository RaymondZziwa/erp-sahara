import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { Equipment } from "../../../redux/slices/types/manufacturing/Equipment";
import { Dropdown } from "primereact/dropdown";
import useWorkCenters from "../../../hooks/manufacturing/workCenter/useWorkCenters";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Equipment;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Equipment>>({
    name: "",
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

  const handleSelectChange = (name: keyof Equipment, value: any) => {
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

    // Basic validation
    if (!formState.name || !formState.maintenance_every_after) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.EQUIPMENT.UPDATE(item.id.toString())
      : MANUFACTURING_ENDPOINTS.EQUIPMENT.ADD;
    await createRequest(
      endpoint,
      token.access_token,
      { ...data, mantenance_every_after: formState.maintenance_every_after },
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };
  const { data: workCenters, loading: workCentersLoading } = useWorkCenters();

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
      header={item?.id ? "Edit Equipment" : "Add Equipment"}
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
          <label htmlFor="name">Name</label>
          <InputText
            id="name"
            name="name"
            value={formState.name || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="work_center_id">Work Center</label>
          <Dropdown
            id="work_center_id"
            name="work_center_id"
            value={formState.work_center_id}
            options={workCenters.map((center) => ({
              value: center.id,
              label: center.name,
            }))}
            required
            loading={workCentersLoading}
            onChange={(e) => handleSelectChange("work_center_id", e.value)}
            placeholder="Select a WorkCenter"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="maintenance_every_after">
            Maintenance every after
          </label>
          <InputText
            id="maintenance_every_after"
            name="maintenance_every_after"
            type="number"
            value={formState.maintenance_every_after?.toString() || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="work_center_id">Maintainance Period</label>
          <Dropdown
            id="maintenance_period"
            name="maintenance_period"
            value={formState.maintenance_period}
            options={["day", "month", "week", "year"].map((center) => ({
              value: center,
              label: center,
            }))}
            required
            onChange={(e) => handleSelectChange("maintenance_period", e.value)}
            placeholder="Select a period"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
