import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";

import { createRequest } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { Crop } from "../../redux/slices/types/crops/Crop";
import { CROPS_ENDPOINTS } from "../../api/cropsEndpoints";

interface AddOrModifyCropProps {
  visible: boolean;
  onClose: () => void;
  item?: Crop;
  onSave: () => void;
}

const cropTypeOptions = [
  "Cash Crop",
  "Horticultural",
  "Oilseed",
  "Root and Tuber",
  "Leguminous",
  "Cereal",
];

const AddOrModifyCrop: React.FC<AddOrModifyCropProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Crop>>({
    name: "",
    description: "",
    growth_period: "",
    crop_type: "Cereal",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({
        name: "",
        description: "",
        growth_period: "",
        crop_type: "Cereal",
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Crop, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.name || !formState.crop_type) {
      setIsSubmitting(false);
      return;
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? CROPS_ENDPOINTS.CROPS.UPDATE(item.id.toString()) // Use UPDATE endpoint
      : CROPS_ENDPOINTS.CROPS.ADD; // Use ADD endpoint

    await createRequest(endpoint, token.access_token, formState, onSave, method);
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
        form="crop-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Crop" : "Add Crop"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="crop-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="name">Crop Name*</label>
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
          <label htmlFor="crop_type">Crop Type*</label>
          <Dropdown
            id="crop_type"
            name="crop_type"
            value={formState.crop_type}
            options={cropTypeOptions.map((opt) => ({ label: opt, value: opt }))}
            onChange={(e) => handleSelectChange("crop_type", e.value)}
            placeholder="Select Crop Type"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="growth_period">Growth Period</label>
          <InputText
            id="growth_period"
            name="growth_period"
            value={formState.growth_period || ""}
            onChange={handleInputChange}
            className="w-full"
            placeholder="e.g., 90-120 days"
          />
        </div>

        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description || ""}
            onChange={handleInputChange}
            className="w-full"
            rows={3}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyCrop;