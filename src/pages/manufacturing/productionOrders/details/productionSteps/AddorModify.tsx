import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { toast, ToastContainer } from "react-toastify";
import useAuth from "../../../../../hooks/useAuth";
import useEmployees from "../../../../../hooks/hr/useEmployees";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import { createRequest } from "../../../../../utils/api";
import { useParams } from "react-router-dom";

interface Step {
  step_number: number;
  description: string;
  operator_id: string;
}

interface AddOrModifyProductionStepProps {
  visible: boolean;
  item: any;
  onClose: () => void;
  onSave: () => void;
}

const AddOrModifyProductionStep: React.FC<AddOrModifyProductionStepProps> = ({
  visible,
  item,
  onClose,
  onSave,
}) => {
  const { id } = useParams<{ id: string }>();
  const [steps, setSteps] = useState<Step[]>([
    { step_number: 1, description: "", operator_id: "" },
  ]);

  useEffect(() => {
    if (item) {
      // If modifying a single step
      if (item.step_number !== undefined) {
        setSteps([{
          step_number: item.step_number,
          description: item.description || "",
          operator_id: item.operator_id || "",
        }]);
      } 
      // If item contains multiple steps
      else if (item.steps && item.steps.length > 0) {
        setSteps(item.steps.map((s: any, idx: number) => ({
          step_number: s.step_number || idx + 1,
          description: s.description || "",
          operator_id: s.operator_id || "",
        })));
      }
    } else {
      setSteps([{ step_number: 1, description: "", operator_id: "" }]);
    }
  }, [item]);
  
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: employees, loading: employeesLoading } = useEmployees();

  // Handle change for a specific step
  const handleChange = (index: number, field: keyof Step, value: any) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  // Add a new blank step
  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { step_number: prev.length + 1, description: "", operator_id: "" },
    ]);
  };

  // Remove a step
  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate steps
    if (steps.some((s) => !s.description || !s.operator_id)) {
      toast.warn("Please fill in all fields for each step");
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = MANUFACTURING_ENDPOINTS.PRODUCTION_STEPS.ADD;
      const payload = {
        production_order_id: id,
        steps: steps,
      };

      await createRequest(endpoint, token.access_token, payload, onSave, "POST");
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error saving production steps");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-between gap-2">
      <Button
        label="Add Step"
        icon="pi pi-plus"
        onClick={addStep}
        className="p-button-outlined"
        size="small"
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={onClose}
          className="p-button-text !bg-red-500 hover:!bg-red-400 text-white"
          size="small"
          disabled={isSubmitting}
        />
        <Button
          label="Submit"
          icon="pi pi-check"
          form="steps-form"
          loading={isSubmitting}
          disabled={isSubmitting}
          size="small"
        />
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item ? "Modify Step" : "Add Step"}
        visible={visible}
        footer={footer}
        onHide={onClose}
        className="w-[600px]"
      >
        <p className="mb-6">
          Fields marked with <span className="text-red-500">*</span> are mandatory.
        </p>

        <form id="steps-form" className="flex flex-col gap-6" onSubmit={handleSave}>
          {steps.map((step, index) => (
            <div
              key={index}
              className="border p-4 rounded-md flex flex-col gap-4 relative"
            >
              <h4 className="font-semibold">Step {index + 1}</h4>

              {/* Step Number */}
              <div className="flex flex-col">
                <label>Step Number<span className="text-red-500">*</span></label>
                <InputText
                  value={step.step_number}
                  type="number"
                  onChange={(e) =>
                    handleChange(index, "step_number", Number(e.target.value))
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label>Description<span className="text-red-500">*</span></label>
                <InputText
                  value={step.description}
                  onChange={(e) => handleChange(index, "description", e.target.value)}
                  required
                />
              </div>

              {/* Operator */}
              <div className="flex flex-col">
                <label>Operator<span className="text-red-500">*</span></label>
                <Dropdown
                  value={step.operator_id}
                  options={employees.map((emp: any) => ({
                    label: `${emp.first_name} ${emp.last_name}`,
                    value: emp.id,
                  }))}
                  onChange={(e) => handleChange(index, "operator_id", e.value)}
                  loading={employeesLoading}
                  placeholder="Select Operator"
                  className="w-full"
                  required
                />
              </div>

              {/* Remove Step */}
              {steps.length > 1 && (
                <Button
                  icon="pi pi-trash"
                  className="p-button-text text-red-500 absolute top-2 right-2"
                  onClick={() => removeStep(index)}
                  type="button"
                />
              )}
            </div>
          ))}
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifyProductionStep;
