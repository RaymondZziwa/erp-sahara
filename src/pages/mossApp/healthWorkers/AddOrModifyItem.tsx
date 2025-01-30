import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { User } from "../../../redux/slices/types/mossApp/Users";

interface AddOrModifyUserProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  item?: User; // Adjust type as per your data structure
}

const countries = [
  { label: "Country 1", value: "1" },
  { label: "Country 2", value: "2" },
  { label: "Country 3", value: "3" },
  // Add more countries as needed
];

const AddOrModifyItem: React.FC<AddOrModifyUserProps> = ({
  visible,
  onClose,
  onSave,
  item,
}) => {
  const [formState, setFormState] = useState({
    first_name: "",
    last_name: "",
    organisation_name: "",
    email: "",
    phone_number: "",
    country_id: "",
    password: "",
    password_confirmation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({
        first_name: item.first_name || "",
        last_name: item.last_name || "",
        organisation_name: "",
        email: item.email || "",
        phone_number: item.phone_no || "",
        country_id: item.country_id,
        password: "", // Password should not be pre-filled
        password_confirmation: "",
      });
    } else {
      setFormState({
        first_name: "",
        last_name: "",
        organisation_name: "",
        email: "",
        phone_number: "",
        country_id: "",
        password: "",
        password_confirmation: "",
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

  const handleDropdownChange = (e: { value: string }) => {
    setFormState((prevState) => ({
      ...prevState,
      country_id: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Perform validation here if necessary

    onSave(formState);
    setIsSubmitting(false);
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
        form="user-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit User" : "Add User"}
      visible={visible}
      style={{ width: "720px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="user-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="first_name">First Name</label>
          <InputText
            id="first_name"
            name="first_name"
            value={formState.first_name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="last_name">Last Name</label>
          <InputText
            id="last_name"
            name="last_name"
            value={formState.last_name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="organisation_name">Organisation Name</label>
          <InputText
            id="organisation_name"
            name="organisation_name"
            value={formState.organisation_name}
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
            value={formState.email}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="phone_number">Phone Number</label>
          <InputText
            id="phone_number"
            name="phone_number"
            value={formState.phone_number}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="country_id">Country</label>
          <Dropdown
            id="country_id"
            name="country_id"
            value={formState.country_id}
            options={countries}
            onChange={handleDropdownChange}
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="password">Password</label>
          <Password
            id="password"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
            required
            className="w-full"
            toggleMask
          />
        </div>
        <div className="p-field">
          <label htmlFor="password_confirmation">Confirm Password</label>
          <Password
            id="password_confirmation"
            name="password_confirmation"
            value={formState.password_confirmation}
            onChange={handleInputChange}
            required
            className="w-full"
            toggleMask
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
