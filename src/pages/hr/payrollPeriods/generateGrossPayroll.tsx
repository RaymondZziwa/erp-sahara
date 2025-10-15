import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ToastContainer, toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { apiRequest } from "../../../utils/api";
import usePayrollPeriods from "../../../hooks/hr/usePayRollPeriods";

interface GenerateGrossPayrollModalProps {
  visible: boolean;
    schedule: any;
  onClose: () => void;
}

const GenerateGrossPayrollModal: React.FC<GenerateGrossPayrollModalProps> = ({
  visible,
    onClose,
  schedule
}) => {
  const [formState, setFormState] = useState({
    include_overtime: true,
    include_allowances: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useSelector((state: RootState) => state.userAuth.token);
  const {refresh} = usePayrollPeriods()

  const handleCheckboxChange = (e: any) => {
    const { name, checked } = e;
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    
    try {
      // Call the onGenerate callback with the payload
      await apiRequest(`/payroll-runs/${schedule.id}/grosses/calculate`, "POST", token.access_token, formState)
      toast.success("Gross payroll generated successfully!");
      
      // Close the modal after successful generation
      onClose();
      
      // Reset form state
      setFormState({
        include_overtime: true,
        include_allowances: true,
      });
      refresh()
    } catch (error) {
      console.error("Error generating gross payroll:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form state and close modal
    setFormState({
      include_overtime: true,
      include_allowances: true,
    });
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text p-button-secondary !bg-red-500"
        onClick={handleCancel}
        disabled={isSubmitting}
      />
      <Button
        label="Generate"
        icon="pi pi-cog"
        loading={isSubmitting}
        onClick={handleGenerate}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header="Generate Gross Payroll"
        visible={visible}
        style={{ width: "450px" }}
        footer={footer}
        onHide={handleCancel}
        closable={!isSubmitting}
      >
        <div className="grid gap-6">
          <p className="text-gray-600">
            Select the components to include in the gross payroll calculation:
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                inputId="include_overtime"
                name="include_overtime"
                checked={formState.include_overtime}
                onChange={(e) => handleCheckboxChange({
                  name: "include_overtime",
                  checked: e.checked
                })}
                disabled={isSubmitting}
              />
              <label htmlFor="include_overtime" className="cursor-pointer flex-1">
                <div className="font-medium">Include Overtime</div>
                <div className="text-sm text-gray-500">
                  Include overtime hours and rates in the payroll calculation
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                inputId="include_allowances"
                name="include_allowances"
                checked={formState.include_allowances}
                onChange={(e) => handleCheckboxChange({
                  name: "include_allowances",
                  checked: e.checked
                })}
                disabled={isSubmitting}
              />
              <label htmlFor="include_allowances" className="cursor-pointer flex-1">
                <div className="font-medium">Include Allowances</div>
                <div className="text-sm text-gray-500">
                  Include all employee allowances in the payroll calculation
                </div>
              </label>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              <strong>Note:</strong> The payroll will be generated based on the current 
              employee data and selected components. This action cannot be undone.
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default GenerateGrossPayrollModal;