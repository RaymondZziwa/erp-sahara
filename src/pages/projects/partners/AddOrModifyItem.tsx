import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { PROJECTS_ENDPOINTS } from "../../../api/projectsEndpoints";
import { Partner } from "../../../redux/slices/types/projects/Partner";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partner;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Partner>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({});
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

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? PROJECTS_ENDPOINTS.PARTNERS.UPDATE(item.id.toString())
      : PROJECTS_ENDPOINTS.PARTNERS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    setFormState({});
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
        form="partner-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Partner" : "Add Partner"}
      visible={visible}
      className="max-w-md md:max-w-2xl"
      // style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="partner-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="partner_name">Name</label>
          <InputText
            id="partner_name"
            name="partner_name"
            value={formState.partner_name || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            name="email"
            value={formState.email || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="phone">Phone</label>
          <InputText
            id="phone"
            name="phone"
            value={formState.phone || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="address">Address</label>
          <InputText
            id="address"
            name="address"
            value={formState.address || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="website">Website</label>
          <InputText
            id="website"
            name="website"
            value={formState.website || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="contact_person">Contact Person</label>
          <InputText
            id="contact_person"
            name="contact_person"
            value={formState.contact_person || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="contact_person_email">Contact Person Email</label>
          <InputText
            id="contact_person_email"
            name="contact_person_email"
            value={formState.contact_person_email || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="contact_person_phone">Contact Person Phone</label>
          <InputText
            id="contact_person_phone"
            name="contact_person_phone"
            value={formState.contact_person_phone || ""}
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
            required
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
