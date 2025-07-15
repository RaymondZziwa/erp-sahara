import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";

interface CommunicationProvider {
  id?: string;
  name: string;
  type: "internal" | "external" | "aggregator";
  base_url: string | null;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CommunicationProvider;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<Omit<CommunicationProvider, "id">>({
    name: "",
    type: "internal",
    base_url: "",
  });

  useEffect(() => {
    if (item) {
      const { id, ...rest } = item;
      setFormState(rest);
    } else {
      setFormState({
        name: "",
        type: "internal",
        base_url: "",
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (value: string) => {
    setFormState((prev) => ({ ...prev, type: value as CommunicationProvider["type"] }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? RECRUITMENT_ENDPOINTS.JOB_BOARDS.UPDATE(item.id)
      : RECRUITMENT_ENDPOINTS.JOB_BOARDS.ADD;

    const payload = {
      ...formState,
      base_url: formState.base_url?.trim() === "" ? null : formState.base_url,
    };

    await createRequest(endpoint, token.access_token, payload, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();

    setFormState({ name: "", type: "internal", base_url: "" });
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        form="provider-form"
      />
    </div>
  );

  const typeOptions = [
    { label: "Internal", value: "internal" },
    { label: "External", value: "external" },
    { label: "Aggregator", value: "aggregator" },
  ];

  return (
    <Dialog
      header={item?.id ? "Edit Job Board" : "Add Job Board"}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="provider-form" onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-semibold">
              Name <span className="text-red-500">*</span>
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

          <div>
            <label className="block mb-1 font-semibold">Type</label>
            <Dropdown
              value={formState.type}
              options={typeOptions}
              onChange={(e) => handleDropdownChange(e.value)}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="base_url" className="block mb-1 font-semibold">
              Base URL (Optional)
            </label>
            <InputText
              id="base_url"
              name="base_url"
              value={formState.base_url ?? ""}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
