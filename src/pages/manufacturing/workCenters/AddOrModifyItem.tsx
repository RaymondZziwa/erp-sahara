import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { WorkCenter } from "../../../redux/slices/types/manufacturing/WorkCenter";
import { InputTextarea } from "primereact/inputtextarea";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
// import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import { Dropdown } from "primereact/dropdown";
import { toast } from "react-toastify";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: WorkCenter;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<WorkCenter>>({
    name: "",
    description: "",
    location: "",
    capacity_per_day_uom: "", //Unit of measure unit or hours
    capacity_per_day: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  // const { data: uom } = useUnitsOfMeasurement();
  const uom = [
    {
      id: 1,
      name: "hours",
    },
    {
      id: 2,
      name: "units",
    },
  ];
  // console.log("uom", uom);

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({}); // Reset formState when adding a new item
    }
  }, [item]);

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
        if (!formState.name ||
          !formState.location ||
          !formState.capacity_per_day_uom ||
          !formState.capacity_per_day
        ) {
          setIsSubmitting(false);
          toast.warn('Fill in all the mandatory fields');
          return;
        }
      
        try {
          const data = {
            ...formState,
            capacity_per_day: Number(formState.capacity_per_day),
          };

          const method = item?.id ? "PUT" : "POST";
          const endpoint = item?.id
            ? MANUFACTURING_ENDPOINTS.WORK_CENTERS.UPDATE(item.id.toString())
            : MANUFACTURING_ENDPOINTS.WORK_CENTERS.ADD;
          await createRequest(endpoint, token.access_token, data, onSave, method);
          // Reset form state
          setFormState({
            name: "",
            location: "",
            capacity_per_day_uom: "",
            capacity_per_day: 0,
            description: ""
          });
      
          // Call onSave and onClose
          //toast.success('Loan type created successfully')
          onSave();
          onClose(); // Close the modal after saving
        } catch (error) {
          console.error("Error saving work center:", error);
          toast.error("An error occurred while saving work center.");
        } finally {
          setIsSubmitting(false);
        }
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
  const handleSelectChange = (name: keyof WorkCenter, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  return (
    <Dialog
      header={item?.id ? "Edit Work Center" : "Add Work Center"}
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
          <label htmlFor="name">Name<span className="text-red-500">*</span></label>
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
          <label htmlFor="location">Location<span className="text-red-500">*</span></label>
          <InputText
            id="location"
            name="location"
            value={formState.location || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="capacity_per_day_uom">Capacity Per Day Units<span className="text-red-500">*</span></label>
          <Dropdown
            filter
            id="capacity_per_day_uom"
            name="capacity_per_day_uom"
            value={formState.capacity_per_day_uom}
            options={uom.map((center) => ({
              value: center.name,
              label: center.name,
            }))}
            required
            onChange={(e) =>
              handleSelectChange("capacity_per_day_uom", e.value)
            }
            placeholder="Select a unit"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="capacity_per_day">Capacity Per Day<span className="text-red-500">*</span></label>
          <InputText
            id="capacity_per_day"
            name="capacity_per_day"
            value={formState.capacity_per_day?.toString() || ""}
            onChange={handleInputChange}
            className="w-full"
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
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
