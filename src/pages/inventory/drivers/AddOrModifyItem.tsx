import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";

import { RadioButton } from "primereact/radiobutton";
import { Driver } from "../../../redux/slices/types/inventory/Driver";
import useEmployees from "../../../hooks/hr/useEmployees";
import { Dropdown } from "primereact/dropdown";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Driver;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Driver>>({
    status: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: employees } = useEmployees();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({ license_number: "", status: 1 });
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
    console.log(formState);

    if (!formState.staff_id || !formState.license_number) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }
    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.DRIVERS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.DRIVERS.ADD;
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
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
        form="driver-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit driver" : "Add driver"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="driver-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="staff_id">Staff Member</label>
          <Dropdown
            id={`staff_id`}
            value={formState.staff_id}
            onChange={(e) => setFormState({ ...formState, staff_id: e.value })}
            options={employees.map((employee) => ({
              value: employee.id,
              label: `${employee.last_name} ${employee.last_name}`,
            }))}
            placeholder="Select a member"
            filter
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="license_number">License number</label>
          <InputText
            id="license_number"
            name="license_number"
            value={formState.license_number}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="availability">Availability Status</label>
          {[
            { name: "available", value: 1 },
            { name: "not-available", value: 0 },
          ].map((status) => {
            return (
              <div key={status.value} className="flex align-items-center my-2">
                <RadioButton
                  inputId={status.value.toString()}
                  name="status"
                  value={status.value}
                  onChange={(e) =>
                    setFormState({ ...formState, status: e.value })
                  }
                  checked={status.value === formState.status}
                />
                <label
                  htmlFor={status.value.toString()}
                  className="ml-2 capitalize"
                >
                  {status.name}
                </label>
              </div>
            );
          })}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
