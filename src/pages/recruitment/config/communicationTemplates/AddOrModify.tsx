import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import useCommunicationTypes from "../../../../hooks/recruitment/useCommunicationTypes";

interface CommunicationTemplate {
  id?: string;
  name: string;
  communication_type_id: string;
  subject: string;
  content: string;
  variables: string[];
  is_system: boolean;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CommunicationTemplate;
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
  const { data: types } = useCommunicationTypes();

  const [formState, setFormState] = useState<Omit<CommunicationTemplate, "id">>({
    name: "",
    communication_type_id: "",
    subject: "",
    content: "",
    variables: [],
    is_system: false,
  });

  useEffect(() => {
    if (item) {
      const { id, variables, type, ...rest } = item;
  
      // Convert JSON string to array if needed
      const parsedVariables = Array.isArray(variables)
        ? variables
        : (() => {
            try {
              const parsed = JSON.parse(variables);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })();
  
      setFormState({
        ...rest,
        variables: parsedVariables,
        communication_type_id: item.communication_type_id || item.type?.id || "",
      });
    } else {
      setFormState({
        name: "",
        communication_type_id: "",
        subject: "",
        content: "",
        variables: [],
        is_system: false,
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariablesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vars = e.target.value.split(",").map((v) => v.trim()).filter(Boolean);
    setFormState((prev) => ({ ...prev, variables: vars }));
  };

  const handleDropdownChange = (value: string) => {
    setFormState((prev) => ({ ...prev, communication_type_id: value }));
  };

  const handleCheckboxChange = (e: any) => {
    setFormState((prev) => ({ ...prev, is_system: e.checked }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? RECRUITMENT_ENDPOINTS.COMMUNICATION_TEMPLATES.UPDATE(item.id)
      : RECRUITMENT_ENDPOINTS.COMMUNICATION_TEMPLATES.ADD;

    await createRequest(endpoint, token.access_token, formState, onSave, method);
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
        className="p-button-text !bg-red-500"
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        form="template-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Communication Template" : "Add Communication Template"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="template-form" onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-semibold">
              Template Name <span className="text-red-500">*</span>
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
            <label className="block mb-1 font-semibold">Communication Type</label>
            <Dropdown
              value={formState.communication_type_id}
              options={
                types?.map((t) => ({ label: t.name, value: t.id })) || []
              }
              onChange={(e) => handleDropdownChange(e.value)}
              className="w-full"
              placeholder="Select Communication Type"
              filter
            />
          </div>

          <div>
            <label htmlFor="subject" className="block mb-1 font-semibold">
              Subject
            </label>
            <InputText
              id="subject"
              name="subject"
              value={formState.subject}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="content" className="block mb-1 font-semibold">
              Content
            </label>
            <InputTextarea
              id="content"
              name="content"
              value={formState.content}
              onChange={handleInputChange}
              rows={5}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="variables" className="block mb-1 font-semibold">
              Variables (comma-separated)
            </label>
            <InputText
              id="variables"
              name="variables"
              value={formState.variables.join(", ")}
              onChange={handleVariablesChange}
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <Checkbox
              inputId="is_system"
              checked={formState.is_system}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="is_system" className="ml-2">
              System Template
            </label>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
