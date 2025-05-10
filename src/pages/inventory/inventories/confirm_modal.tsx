import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";

interface ConfirmProps {
  record_id: number;
  warehouse_id: number;
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  refresh: any
}

const ConfirmModal: React.FC<ConfirmProps> = ({
  visible,
  onClose,
  record_id,
  onSave,
  warehouse_id,
  refresh
}) => {
  const [formState, setFormState] = useState({
    quantity: 1,
    received_by: "",
    delivered_by:"",
    warehouse_id,
    delivery_remarks:"",
    movement_date:""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

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

    try {
      const method = "POST";
      const endpoint = `/inventories/${record_id}/confirmreceiptstockmovement`

      const data = formState;
      await createRequest(
        endpoint,
        token.access_token,
        { ...data },
        onSave,
        method
      );
      setIsSubmitting(false);

      onSave();
      onClose(); // Close the modal after saving
      refresh()
    } catch (error) {
      console.error("Error saving item", error);
      // Handle error here
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
        label={record_id ? "Update" : "Submit"}
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
      header={record_id && "Confirm Transfer"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4"
      >
        <div className="p-field">
          <label className="font-semibold" htmlFor="quantity">
            Quantity
          </label>
          <InputText
            id="quantity"
            name="quantity"
            type="number"
            value={formState.quantity?.toString() || ""}
            onChange={handleInputChange}
            required
            className="w-full"
            min='1'
          />
        </div>
        <div className="p-field">
          <label className="font-semibold" htmlFor="received_by">
            Received by
          </label>
          <InputText
            id="received_by"
            name="received_by"
            type="text"
            value={formState.received_by}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold" htmlFor="recieved_by">
            Delivered by
          </label>
          <InputText
            id="delivered_by"
            name="delivered_by"
            type="text"
            value={formState.delivered_by}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold" htmlFor="received_date">
            Received Date
          </label>
          <InputText
            id="movement_date"
            name="movement_date"
            type="date"
            value={
              formState.movement_date || new Date().toISOString().slice(0, 9)
            }
            onChange={handleInputChange}
            className="w-full"
            required   
          />
        </div>

        <div className="p-field">
          <label className="font-semibold" htmlFor="delivery_remarks">
            Delivery Remarks (Optional)
          </label>
          <InputText
            id="delivery_remarks"
            name="delivery_remarks"
            value={formState.delivery_remarks}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>    
      </form>
    </Dialog>
  );
};

export default ConfirmModal
