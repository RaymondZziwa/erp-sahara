import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../utils/api";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { ProductionLine } from "../../../redux/slices/types/manufacturing/ProductionLine";

import useAuth from "../../../hooks/useAuth";
// import useWorkCenterOrders from "../../../hooks/manufacturing/workCenter/useWorkCentersOrders";
import useWorkCenters from "../../../hooks/manufacturing/workCenter/useWorkCenters";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ProductionLine;
  onSave: () => void;
}

interface ProductionLineAdd {
  work_center_id: number;
  name: string;
  status: string;
  description: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<ProductionLineAdd>>({
    work_center_id: 0,
    name: "",
    status: "idle", // Default value is "idle"
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: items, loading: itemsLoading } = useWorkCenters();

  // Initialize the form state with the existing item, if available
  useEffect(() => {
    if (item) {
      setFormState({
        work_center_id: item.work_center_id,
        name: item.name,
        status: item.status || "idle", // Ensure default status is "idle"
        description: item.description,
      });
    } else {
      setFormState({
        work_center_id: 0,
        name: "",
        status: "idle", // Default value is "idle"
        description: "",
      });
    }
  }, [item]);

  // Handle the input change for any form field
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle dropdown selection changes
  const handleSelectChange = (name: keyof ProductionLineAdd, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.name || !formState.status) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    console.log("Saving...", formState);

    const data: Partial<ProductionLineAdd> = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.PRODUCTION_LINES.UPDATE(item.id.toString())
      : MANUFACTURING_ENDPOINTS.PRODUCTION_LINES.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
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
        form="lead-form"
        size="small"
      />
    </div>
  );

  // Options for the status dropdown
  const statusOptions = [
    { label: "Idle", value: "idle" },
    { label: "Running", value: "running" },
    { label: "Maintenance", value: "maintenance" },
  ];

  return (
    <Dialog
      header={item?.id ? "Edit Production Line" : "Add Production Line"}
      visible={visible}
      className="w-full sm:w-4/5 md:w-1/2"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="lead-form"
        onSubmit={handleSave}
        className="space-y-4 grid grid-cols-1 gap-4"
      >
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-lg font-medium">
            Name
          </label>
          <InputText
            id="name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="status" className="text-lg font-medium">
            Status
          </label>
          <Dropdown
            id="status"
            name="status"
            value={formState.status}
            options={statusOptions}
            required
            onChange={(e) => handleSelectChange("status", e.value)}
            placeholder="Select Status"
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="description" className="text-lg font-medium">
            Description
          </label>
          <InputText
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="work_center_id" className="text-lg font-medium">
            Work Center
          </label>
          <Dropdown
            id="work_center_id"
            name="work_center_id"
            value={formState.work_center_id}
            options={items.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            required
            filter
            loading={itemsLoading}
            onChange={(e) => handleSelectChange("work_center_id", e.value)}
            placeholder="Select a Work Center"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
