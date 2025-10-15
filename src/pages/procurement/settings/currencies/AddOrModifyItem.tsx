import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { Currency } from "../../../../redux/slices/types/procurement/Currency";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Currency;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Currency>>({
    name: "",
    code: "",
    is_base_currency: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        code: item.code || "",
        is_base_currency: item.is_base_currency || false,
      });
    } else {
      setFormState({
        name: "",
        code: "",
        is_base_currency: false,
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSwitchChange = (value: boolean) => {
    setFormState((prevState) => ({
      ...prevState,
      is_base_currency: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name) {
      setIsSubmitting(false);
      return;
    }

    const data = {
      name: formState.name,
      code: formState.code,
      is_base_currency: formState.is_base_currency,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? `/accounts/currencies/${item.id}/update`
      : "/accounts/currencies/create";

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex gap-2 justify-end">
      <Button
        size="small"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
        size="small"
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Currency" : "Add Currency"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid space-y-3">
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
            <label htmlFor="code">Code</label>
            <InputText
              id="code"
              name="code"
              value={formState.code}
              onChange={handleInputChange}
            />
          </div>

          <div className="p-field flex items-center justify-between">
            <label htmlFor="is_base_currency" className="mb-0">
              Is Base Currency
            </label>
            <InputSwitch
              id="is_base_currency"
              checked={formState.is_base_currency}
              onChange={(e) => handleSwitchChange(e.value as boolean)}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
