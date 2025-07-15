import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";

interface CommunicationType {
  id?: string;
  name: string;
  description: string;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CommunicationType;
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

  const [formState, setFormState] = useState<Omit<CommunicationType, "id">>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (item) {
      const { id, ...rest } = item;
      setFormState(rest);
    } else {
      setFormState({ name: "", description: "" });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? RECRUITMENT_ENDPOINTS.COMMUNICATION_TYPES.UPDATE(item.id)
      : RECRUITMENT_ENDPOINTS.COMMUNICATION_TYPES.ADD;

    await createRequest(endpoint, token.access_token, formState, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
    setFormState({ name: "", description: "" });
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
        form="comm-type-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Communication Type" : "Add Communication Type"}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="comm-type-form" onSubmit={handleSave}>
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
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
