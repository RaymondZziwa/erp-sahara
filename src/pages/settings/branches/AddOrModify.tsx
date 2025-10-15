import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Branch } from "../../../redux/slices/types/Branches/type";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import useCountries from "../../../hooks/Branches/useCountries";
import { Dropdown } from "primereact/dropdown";

interface AddOrModifyBranchProps {
  visible: boolean;
  onClose: () => void;
  branch?: Branch;
  onSave: () => void;
}

const AddOrModifyBranch: React.FC<AddOrModifyBranchProps> = ({
  visible,
  onClose,
  branch,
  onSave,
}) => {
  const [formState, setFormState] = useState<Omit<Branch, "id">>({
    name: "",
    code: "",
    phone_number: "",
    postal_address: "",
    email: "",
    country_id: "",
    timezone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const {data: countries} = useCountries()
  const { token } = useAuth();

  useEffect(() => {
    if (branch) {
      setFormState({
        name: branch.name || "",
        code: branch.code || "",
        phone_number: branch.phone_number || "",
        postal_address: branch.postal_address || "",
        email: branch.email || "",
        country_id: branch.country_id || "",
        timezone: branch.timezone || "",
        // currency: branch.currency || ""
      });
    } else {
      setFormState({
        name: "",
        code: "",
        phone_number: "",
        postal_address: "",
        email: "",
        country_id: "",
        timezone: "",
        // currency: ""
      });
    }
  }, [branch]);

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

    const method = branch?.id ? "PUT" : "POST";
    const endpoint = branch?.id
      ? API_ENDPOINTS.BRANCHES.MODIFY(branch.id.toString())
      : API_ENDPOINTS.BRANCHES.ADD;

    await createRequest(endpoint, token.access_token, formState, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        label={branch?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="branch-form"
      />
    </div>
  );

  return (
    <Dialog
  header={branch?.id ? "Edit Branch" : "Add Branch"}
  visible={visible}
  style={{ width: "600px" }}
  footer={footer}
  onHide={onClose}
>
  <p className="mb-4 text-sm">
    Fields marked with <span className="text-red-500">*</span> are required.
  </p>
  <form id="branch-form" onSubmit={handleSave} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="name" className="block mb-1 font-medium">
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
        <label htmlFor="code" className="block mb-1 font-medium">
          Code <span className="text-red-500">*</span>
        </label>
        <InputText
          id="code"
          name="code"
          value={formState.code}
          onChange={handleInputChange}
          required
          className="w-full"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="phone_number" className="block mb-1 font-medium">
          Phone Number
        </label>
        <InputText
          id="phone_number"
          name="phone_number"
          value={formState.phone_number}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <InputText
          id="email"
          name="email"
          value={formState.email}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label htmlFor="country_id" className="block mb-1 font-medium">
        Country <span className="text-red-500">*</span>
      </label>
      <Dropdown
        id="country_id"
        name="country_id"
        value={formState.country_id}
        onChange={(e) =>
          setFormState((prev) => ({ ...prev, country_id: e.value }))
        }
        options={countries.map((c) => ({
          label: c.country_name,
          value: c.id,
        }))}
        placeholder="Select a Country"
        className="w-full"
        filter
        showClear
      />
    </div>

      <div>
        <label htmlFor="timezone" className="block mb-1 font-medium">
          Timezone
        </label>
        <InputText
          id="timezone"
          name="timezone"
          value={formState.timezone}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
    </div>

    <div>
      <label htmlFor="postal_address" className="block mb-1 font-medium">
        Postal Address
      </label>
      <InputTextarea
        id="postal_address"
        name="postal_address"
        value={formState.postal_address}
        onChange={handleInputChange}
        className="w-full"
        rows={3}
      />
    </div>
  </form>
</Dialog>

  );
};

export default AddOrModifyBranch;
