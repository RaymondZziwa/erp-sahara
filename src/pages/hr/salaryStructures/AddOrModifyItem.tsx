import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { SalaryStructure } from "../../../redux/slices/types/hr/SalaryStructure";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { toast, ToastContainer } from "react-toastify";

interface AddOrModifySalaryStructureProps {
  visible: boolean;
  onClose: () => void;
  item?: SalaryStructure;
  onSave: () => void;
}

const AddOrModifySalaryStructure: React.FC<AddOrModifySalaryStructureProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<SalaryStructure>>({
    structure_name: "",
    basic_salary: "",
    overtime_rate: 0,
    bonus_percentage: 0,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({
        structure_name: "",
        basic_salary: "",
        overtime_rate: 0,
        bonus_percentage: 0,
        comment: "",
      });
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
    
      // Basic validation
      if (!formState.structure_name || 
        !formState?.basic_salary || 
        !formState?.bonus_percentage ||
        !formState?.overtime_rate
      ) {
        setIsSubmitting(false);
        toast.warn('Fill in all the mandatory fields');
        return;
      }
    
      try {
        const data = { ...formState };
        const method = item?.id ? "PUT" : "POST";
        const endpoint = item?.id
          ? HUMAN_RESOURCE_ENDPOINTS.SALARY_STRUCTURES.UPDATE(item.id.toString())
          : HUMAN_RESOURCE_ENDPOINTS.SALARY_STRUCTURES.ADD;
        await createRequest(endpoint, token.access_token, data, onSave, method);
    
        // Reset form state
        setFormState({
          structure_name: "",
          basic_salary: "",
          bonus_percentage: 0,
          overtime_rate: 0,
          comment: ""
        });
    
        // Call onSave and onClose
        onSave();
        onClose(); // Close the modal after saving
      } catch (error) {
        console.error("Error saving salary structure:", error);
        toast.error("An error occurred while saving salary structure.");
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
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="salary-structure-form"
        size="small"
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
    <Dialog
      header={item?.id ? "Edit Salary Structure" : "Add Salary Structure"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <p className="mb-6">
          Fields marked with a red asterik (<span className="text-red-500">*</span>) are mandatory.
       </p>
      <form
        id="salary-structure-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="structure_name">Structure Name<span className="text-red-500">*</span></label>
          <InputText
            id="structure_name"
            name="structure_name"
            value={formState.structure_name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="basic_salary">Basic Salary<span className="text-red-500">*</span></label>
          <InputText
            id="basic_salary"
            name="basic_salary"
            value={formState.basic_salary}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="overtime_rate">Overtime Rate<span className="text-red-500">*</span></label>
          <InputText
            id="overtime_rate"
            name="overtime_rate"
            value={formState.overtime_rate?.toString()}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="bonus_percentage">Bonus Percentage<span className="text-red-500">*</span></label>
          <InputText
            id="bonus_percentage"
            name="bonus_percentage"
            value={formState.bonus_percentage?.toString()}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="comment">Comment</label>
          <InputTextarea
            id="comment"
            name="comment"
            value={formState.comment}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
    </>
  );
};

export default AddOrModifySalaryStructure;
