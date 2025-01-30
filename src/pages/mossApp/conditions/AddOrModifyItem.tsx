import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { createMossAppRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Icon } from "@iconify/react";
import {
  Condition,
  SubCondition,
} from "../../../redux/slices/types/mossApp/Conditions";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import useConditions from "../../../hooks/mossApp/useConditions";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Condition>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialState: Partial<Condition> = {
    name: "",
    conditions: [],
  };

  const initialSubCondition: SubCondition = {
    id: 0, // or some other default value
    name: "",
    condition_id: 0,
    created_at: "", // initialize with empty string if necessary
    updated_at: "",
    deleted_at: null,
  };

  const [formState, setFormState] = useState<Partial<Condition>>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: conditions } = useConditions();

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState(initialState);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      setFormState((prevState) => ({
        ...prevState,
        conditions: prevState.conditions?.map((subCondition, idx) =>
          idx === index ? { ...subCondition, [name]: value } : subCondition
        ),
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleDropdownChange = (
    e: DropdownChangeEvent,
    index: number,
    field: string
  ) => {
    const { value } = e;
    setFormState((prevState) => ({
      ...prevState,
      conditions: prevState.conditions?.map((subCondition, idx) =>
        idx === index ? { ...subCondition, [field]: value } : subCondition
      ),
    }));
  };

  const handleAddSubCondition = () => {
    setFormState((prevState) => ({
      ...prevState,
      conditions: [...(prevState.conditions || []), { ...initialSubCondition }],
    }));
  };

  const handleRemoveSubCondition = (indexToRemove: number) => {
    setFormState((prevState) => ({
      ...prevState,
      conditions: prevState.conditions?.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = formState.id ? "PUT" : "POST";
    const endpoint = formState.id
      ? MOSS_APP_ENDPOINTS.HEALTH_CONDITIONS.UPDATE(formState.id.toString())
      : MOSS_APP_ENDPOINTS.HEALTH_CONDITIONS.ADD;
    await createMossAppRequest(
      endpoint,
      token.access_token,
      {
        name: formState.name,
        condition_id:
          formState.conditions && formState?.conditions?.length > 0
            ? formState?.conditions[0].condition_id
            : undefined,
      },
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
      header={formState.id ? "Edit Condition" : "Add Condition"}
      visible={visible}
      style={{ width: "1025px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-field">
            <label htmlFor="name">Condition Name</label>
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

        <div className="mt-4">
          <h3>Main Conditions</h3>
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formState.conditions?.map((subCondition, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    <Dropdown
                      id={`condition_id${index}`}
                      value={subCondition.condition_id}
                      onChange={(e) =>
                        handleDropdownChange(e, index, "condition_id")
                      }
                      options={conditions}
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select a condition"
                      filter
                      className="w-full"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Icon
                      icon="solar:trash-bin-trash-bold"
                      className="text-red-500 cursor-pointer"
                      fontSize={20}
                      onClick={() => handleRemoveSubCondition(index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <Button
              disabled={
                formState.conditions && formState?.conditions?.length > 0
              }
              type="button"
              label="Add Main Condition"
              icon="pi pi-plus"
              onClick={handleAddSubCondition}
              className="p-button-secondary w-full sm:w-auto"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
