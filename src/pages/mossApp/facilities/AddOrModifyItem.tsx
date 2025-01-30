import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createMossAppRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Facility } from "../../../redux/slices/types/mossApp/Facility";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Facility;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Facility>>({
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
      setFormState({ name: "" });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!formState.name) {
      return; // You can handle validation error here
    }
    const data = formState;
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MOSS_APP_ENDPOINTS.FACILITIES.UPDATE(item.id.toString())
      : MOSS_APP_ENDPOINTS.FACILITIES.ADD;
    await createMossAppRequest(
      endpoint,
      token.access_token,
      data,
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
        size="small"
      />
      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        size="small"
        form="item-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Item" : "Add Category"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="location">Location</label>
            <InputText
              id="location"
              name="location"
              value={formState.location}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
            <label htmlFor="latitude">Latitude</label>
            <InputText
              id="latitude"
              name="latitude"
              value={formState.latitude}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
            <label htmlFor="logitude">Longitude</label>
            <InputText
              id="logitude"
              name="logitude"
              value={formState.logitude}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
