import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createMossAppRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import { AppointmentType } from "../../../redux/slices/types/mossApp/AppointmentType";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<AppointmentType>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialState: Partial<AppointmentType> = {
    name: "",
  };

  const [formState, setFormState] =
    useState<Partial<AppointmentType>>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState(initialState);
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
    const method = formState.id ? "PUT" : "POST";
    const endpoint = formState.id
      ? MOSS_APP_ENDPOINTS.APPOINTMENT_TYPES.UPDATE(formState.id.toString())
      : MOSS_APP_ENDPOINTS.APPOINTMENT_TYPES.ADD;
    await createMossAppRequest(
      endpoint,
      token.access_token,
      formState,
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
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label={formState.id ? "Update" : "Add"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={formState.id ? "Edit AppointmentType" : "Add AppointmentType"}
      visible={visible}
      style={{ width: "" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave} className="p-4">
        <div className="">
          <div className="p-field">
            <label htmlFor="name">AppointmentType Name</label>
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
