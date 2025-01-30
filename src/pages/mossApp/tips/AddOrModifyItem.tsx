import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createMossAppRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import { Tip } from "../../../redux/slices/types/mossApp/Tip";
import { InputTextarea } from "primereact/inputtextarea";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Tip>;
  onSave: () => void;
}

interface AddTip {
  title: string;
  tip: string;
  id?: string | number;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialState: AddTip = {
    tip: "",
    title: "",
  };

  const [formState, setFormState] = useState<AddTip>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        tip: item.tip || "",
        title: item.title || "",
      });
    } else {
      setFormState(initialState);
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

    const method = formState.id ? "PUT" : "POST";
    const endpoint = formState.id
      ? MOSS_APP_ENDPOINTS.TIPS.UPDATE(formState.id.toString())
      : MOSS_APP_ENDPOINTS.TIPS.ADD;

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
      header={formState.id ? "Edit Tip" : "Add Tip"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave} className="p-4">
        <div className="">
          <div className="p-field">
            <label htmlFor="title">Title</label>
            <InputText
              id="title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>
          <div className="p-field mt-2">
            <label htmlFor="tip">Tip</label>
            <InputTextarea
              id="tip"
              name="tip"
              value={formState.tip}
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
