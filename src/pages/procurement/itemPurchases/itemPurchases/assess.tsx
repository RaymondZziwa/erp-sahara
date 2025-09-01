import React, { useState, useEffect } from "react";
import { apiRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { toast } from "react-toastify";
import useItemPurchases from "../../../../hooks/procurement/itemPurchases/useItemPurchases";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";

interface EditAssessmentModalProps {
  visible: boolean;
  purchaseId: string;
  initialData?: {
    good_beans_percentage: number;
    defect_percentage: number;
    moisture_percentage: number;
    remarks: string;
  };
  onClose: () => void;
  onSave?: (payload: {
    good_beans_percentage: number;
    defect_percentage: number;
    moisture_percentage: number;
    remarks: string;
  }) => void;
}

const EditAssessmentModal: React.FC<EditAssessmentModalProps> = ({
  visible,
  initialData,
  onClose,
  purchaseId,
  onSave,
}) => {
  const { refresh } = useItemPurchases();
  const [goodBeans, setGoodBeans] = useState<number>(0);
  const [defects, setDefects] = useState<number>(0);
  const [moisture, setMoisture] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (initialData) {
      setGoodBeans(initialData.good_beans_percentage || 0);
      setDefects(initialData.defect_percentage || 0);
      setMoisture(initialData.moisture_percentage || 0);
      setRemarks(initialData.remarks || "");
    }
  }, [initialData, visible]);

  const validateInputs = () => {
    const total = goodBeans + defects;
    if (total > 100) {
      toast.error("Sum of Good Beans and Defects cannot exceed 100%");
      return false;
    }
    if (moisture < 0 || moisture > 100) {
      toast.error("Moisture must be between 0% and 100%");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    setIsSubmitting(true);
    const payload = {
      good_beans_percentage: goodBeans,
      defect_percentage: defects,
      moisture_percentage: moisture,
      remarks,
    };

    try {
      await apiRequest(
        `/purchases/${purchaseId}/qa/create`,
        "POST",
        token.access_token,
        payload
      );
      toast.success("Assessment saved successfully");
      refresh();
      if (onSave) onSave(payload);
    } catch (error) {
      console.error("Failed to save assessment:", error);
      toast.error(error?.response?.data?.message || "Failed to save assessment");
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog
      header={initialData ? "Edit Assessment" : "Add Assessment"}
      visible={visible}
      style={{ width: '24rem' }}
      breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      modal
      className="p-fluid"
      onHide={onClose}
    >
      <form onSubmit={handleSubmit} className="mt-4">
        {/* Good Beans Input */}
        <div className="field mb-4">
          <label htmlFor="goodBeans" className="font-medium">
            Good Beans (%)
          </label>
          <InputNumber
            id="goodBeans"
            value={goodBeans}
            onValueChange={(e) => setGoodBeans(e.value || 0)}
            mode="decimal"
            min={0}
            max={100}
            minFractionDigits={1}
            maxFractionDigits={2}
            className="w-full"
            required
          />
        </div>

        {/* Defects Input */}
        <div className="field mb-4">
          <label htmlFor="defects" className="font-medium">
            Defects (%)
          </label>
          <InputNumber
            id="defects"
            value={defects}
            onValueChange={(e) => setDefects(e.value || 0)}
            mode="decimal"
            min={0}
            max={100}
            minFractionDigits={1}
            maxFractionDigits={2}
            className="w-full"
            required
          />
        </div>

        {/* Moisture Input */}
        <div className="field mb-4">
          <label htmlFor="moisture" className="font-medium">
            Moisture (%)
          </label>
          <InputNumber
            id="moisture"
            value={moisture}
            onValueChange={(e) => setMoisture(e.value || 0)}
            mode="decimal"
            min={0}
            max={100}
            minFractionDigits={1}
            maxFractionDigits={2}
            className="w-full"
            required
          />
        </div>

        {/* Remarks Input */}
        <div className="field mb-6">
          <label htmlFor="remarks" className="font-medium">
            Remarks
          </label>
          <InputTextarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            autoResize
            className="w-full"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          
          <Button
            type="submit"
            label="Save Assessment"
            icon="pi pi-check"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default EditAssessmentModal;