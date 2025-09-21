import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ToastContainer, toast } from "react-toastify";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import useAuth from "../../../../hooks/useAuth";
import { Equipment } from "../../../../redux/slices/types/manufacturing/Equipment";
import { createRequest } from "../../../../utils/api";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Equipment;
  onSave: () => void;
}

const statusOptions = [
  { label: "Running", value: "running" },
//   { label: "Idle", value: "idle" },
  { label: "Under Maintenance", value: "maintenance" },
  { label: "Out of Service", value: "out_of_service" },
//   { label: "Error", value: "error" },
];

const UpdateMachineStatus: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();

  const [formState, setFormState] = useState<Partial<Equipment>>({
    status: "operational",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({
        status: "operational",
      });
    }
  }, [item]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { status } = formState;

    if (!status) {
      toast.warn("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = "PUT";
      const endpoint = MANUFACTURING_ENDPOINTS.EQUIPMENT.UPDATE_STATUS(item?.id.toString())

      const payload = {
        status,
      };

      await createRequest(endpoint, token.access_token, payload, () => {
        onSave();
        onClose();
      }, method);

      setFormState({
        status: "operational",
      });
    } catch (err) {
      toast.error("Failed to save equipment.");
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
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        form="equipment-form"
        type="submit"
        size="small"
      />
    </div>
  );

  return (
    <>
      <Dialog
        header="Update Machine Status"
        visible={visible}
        onHide={onClose}
        footer={footer}
        style={{ width: "500px" }}
      >
        <p className="mb-4">
          Fields marked with <span className="text-red-500">*</span> are mandatory.
        </p>
        <form id="equipment-form" onSubmit={handleSave} className="grid gap-4">
          <div>
            <label>
              Status<span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formState.status}
              options={statusOptions}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, status: e.value }))
              }
              placeholder="Select Status"
              className="w-full"
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default UpdateMachineStatus
