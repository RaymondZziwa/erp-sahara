import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import { createRequest } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { FarmGroup } from "../../redux/slices/types/farmGroups/FarmGroup";
import { FARM_GROUPS_ENDPOINTS } from "../../api/farmGroupsEndpoints";

interface AddOrModifyFarmGroupProps {
  visible: boolean;
  onClose: () => void;
  item?: FarmGroup;
  onSave: () => void;
}

const AddOrModifyFarmGroup: React.FC<AddOrModifyFarmGroupProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<FarmGroup>>({
    number_of_members: 0,
    customer: {
      organization_name: "",
      email: "",
      primary_contact_person: "",
      phone_number: "",
      headquarters_address: "",
      description: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        number_of_members: item.number_of_members,
        customer: {
          organization_name: item.customer?.organization_name ?? "",
          email: item.customer?.email ?? "",
          primary_contact_person: item.customer?.primary_contact_person ?? "",
          phone_number: item.customer?.phone_number ?? "",
          headquarters_address: item.customer?.headquarters_address ?? "",
          description: item.description ?? "",
        },
      });
    } else {
      setFormState({
        number_of_members: 0,
        customer: {
          organization_name: "",
          email: "",
          primary_contact_person: "",
          phone_number: "",
          headquarters_address: "",
          description: "",
        },
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name in formState.customer!) {
      setFormState((prev) => ({
        ...prev,
        customer: { ...prev.customer!, [name]: value },
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.customer?.organization_name || (formState.number_of_members ?? 0) <= 0) {
      setIsSubmitting(false);
      return;
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? FARM_GROUPS_ENDPOINTS.FARM_GROUPS.UPDATE(item.id.toString())
      : FARM_GROUPS_ENDPOINTS.FARM_GROUPS.ADD;

    const payload = {
      number_of_members: formState.number_of_members,
      description: formState.customer?.description,
      customer: {
        organization_name: formState.customer?.organization_name,
        email: formState.customer?.email,
        primary_contact_person: formState.customer?.primary_contact_person,
        phone_number: formState.customer?.phone_number,
        headquarters_address: formState.customer?.headquarters_address,
      },
    };

    await createRequest(endpoint, token.access_token, payload, onSave, method);
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
        form="farmgroup-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Farm Group" : "Add Farm Group"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="farmgroup-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="organization_name">Organization Name*</label>
          <InputText
            id="organization_name"
            name="organization_name"
            value={formState.customer?.organization_name || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="number_of_members">Number of Members*</label>
          <InputText
            id="number_of_members"
            name="number_of_members"
            type="number"
            value={formState.number_of_members?.toString() ?? "0"}
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
            value={formState.customer?.email || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="primary_contact_person">Primary Contact Person</label>
          <InputText
            id="primary_contact_person"
            name="primary_contact_person"
            value={formState.customer?.primary_contact_person || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="phone_number">Phone Number</label>
          <InputText
            id="phone_number"
            name="phone_number"
            value={formState.customer?.phone_number || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="headquarters_address">Headquarters Address</label>
          <InputText
            id="headquarters_address"
            name="headquarters_address"
            value={formState.customer?.headquarters_address || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.customer?.description || ""}
            onChange={handleInputChange}
            className="w-full"
            rows={3}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyFarmGroup;
