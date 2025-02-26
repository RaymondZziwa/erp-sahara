import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import useProductionLines from "../../../hooks/manufacturing/workCenter/useProductionLines";
import { MachineAssignment } from "../../../redux/slices/types/manufacturing/MachineAssignment";
import useEquipment from "../../../hooks/manufacturing/workCenter/useEquipment";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: MachineAssignment;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<MachineAssignment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: productionLines, loading: productionLinesLoading } =
    useProductionLines();
  const { data: equipment, loading: equipmentLoading } = useEquipment();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({
        machine_id: 0,
        production_line_id: 0,
        assigned_at: new Date().toISOString().slice(0, 10),
        released_at: null,
      });
    }
  }, [item]);

  // Handle form input changes
  const handleSelectChange = (name: keyof MachineAssignment, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.machine_id ||
      !formState.production_line_id ||
      !formState.assigned_at
    ) {
      setIsSubmitting(false);
      console.log("error");

      return; // Handle validation error
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.EQUIPMENT_ASSIGNMENTS.UPDATE(item.id.toString())
      : MANUFACTURING_ENDPOINTS.EQUIPMENT_ASSIGNMENTS.ADD;

    await createRequest(
      endpoint,
      token.access_token,
      {
        ...formState,

        assigned_at: new Date(formState.assigned_at).toISOString().slice(0, 10),
        released_at: formState.released_at
          ? new Date(formState.released_at).toISOString().slice(0, 10)
          : null,
      },
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:!bg-red-400 text-white"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="machine-assignment-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Machine Assignment" : "Add Machine Assignment"}
      visible={visible}
      className="w-full sm:w-4/5 md:w-1/4"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="machine-assignment-form"
        onSubmit={handleSave}
        className="space-y-4 grid grid-cols-1 gap-4"
      >
        <div className="flex flex-col space-y-2">
          <label htmlFor="machine_id" className="text-lg font-medium">
            Machine
          </label>
          <Dropdown
            id="machine_id"
            name="machine_id"
            value={formState.machine_id}
            options={equipment.map((line) => ({
              value: line.id,
              label: line.name,
            }))}
            required
            filter
            loading={equipmentLoading}
            onChange={(e) => handleSelectChange("machine_id", e.value)}
            placeholder="Select a Machine"
            className="w-full"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="production_line_id" className="text-lg font-medium">
            Production Line
          </label>
          <Dropdown
            id="production_line_id"
            name="production_line_id"
            value={formState.production_line_id}
            options={productionLines.map((line) => ({
              value: line.id,
              label: line.name,
            }))}
            required
            filter
            loading={productionLinesLoading}
            onChange={(e) => handleSelectChange("production_line_id", e.value)}
            placeholder="Select a Production Line"
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="assigned_at" className="text-lg font-medium">
            Assigned At
          </label>
          <Calendar
            id="assigned_at"
            name="assigned_at"
            value={
              formState.assigned_at ? new Date(formState.assigned_at) : null
            }
            onChange={(e) => handleSelectChange("assigned_at", e.value)}
            required
            className="w-full"
            placeholder="Select Assignment Date"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="released_at" className="text-lg font-medium">
            Released At
          </label>
          <Calendar
            id="released_at"
            name="released_at"
            value={
              formState.released_at ? new Date(formState.released_at) : null
            }
            onChange={(e) => handleSelectChange("released_at", e.value)}
            className="w-full"
            placeholder="Select Release Date (optional)"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
