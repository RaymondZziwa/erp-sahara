import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import useItemPurchases from "../../../../hooks/procurement/itemPurchases/useItemPurchases";

import { formatDate } from "../../../../utils/dateUtils";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Fieldset } from "primereact/fieldset";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";

interface ViewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment?: {
    id: string;
    good_beans_percentage: number;
    defect_percentage: number;
    moisture_percentage: number;
    remarks: string;
    approvals: [];                
    status: string;
    created_at: string;
    assessor?: {
      first_name: string;
      last_name: string;
    };
  };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  purchase?: {
    id: string;
  };
}

const ViewAssessmentModal: React.FC<ViewAssessmentModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onApprove,
  onReject,
  purchase
}) => {
  const { token } = useAuth();
  const { refresh } = useItemPurchases();
  const [formData, setFormData] = useState({
    good_beans_percentage: 0,
    defect_percentage: 0,
    moisture_percentage: 0,
    remarks: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (assessment) {
      setFormData({
        good_beans_percentage: assessment.good_beans_percentage || 0,
        defect_percentage: assessment.defect_percentage || 0,
        moisture_percentage: assessment.moisture_percentage || 0,
        remarks: ""
      });
    }
  }, [assessment]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (name: string, value: number | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: value || 0,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiRequest(
        `/purchases/${purchase?.id}/qa/${assessment?.id}/update`,
        "PUT",
        token.access_token,
        {
          good_beans_percentage: formData.good_beans_percentage,
          defect_percentage: formData.defect_percentage,
          moisture_percentage: formData.moisture_percentage,
          remarks: formData.remarks,
        }
      );
      toast.success("Assessment updated successfully");
      refresh();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update assessment");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !assessment) return null;

  return (
    <Dialog
      header="Assessment Details"
      visible={isOpen}
      style={{ width: '40rem' }}
      breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      modal
      className="p-fluid"
      onHide={onClose}
    >
      {(formData.moisture_percentage > 16) && (
        <div className="p-4">
          <Message
            severity="error"
            text={`Warning! Moisture is above 16% (currently ${formData.moisture_percentage}%).`}
            className="w-full text-lg font-medium"
          />
        </div>
      )}
      <div className="grid gap-4">
        {/* Quality Metrics */}
        <Fieldset legend="Quality Metrics" toggleable>
          <div className="grid gap-4">
            <div className="field">
              <label htmlFor="goodBeans" className="font-medium block mb-2">
                Good Beans (%)
              </label>
              <InputNumber
                id="goodBeans"
                name="good_beans_percentage"
                value={formData.good_beans_percentage}
                onValueChange={(e) => handleNumberChange('good_beans_percentage', e.value)}
                mode="decimal"
                min={0}
                max={100}
                minFractionDigits={1}
                maxFractionDigits={2}
                suffix="%"
                disabled={assessment.status === "approved"}
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="defects" className="font-medium block mb-2">
                Defects (%)
              </label>
              <InputNumber
                id="defects"
                name="defect_percentage"
                value={formData.defect_percentage}
                onValueChange={(e) => handleNumberChange('defect_percentage', e.value)}
                mode="decimal"
                min={0}
                max={100}
                minFractionDigits={1}
                maxFractionDigits={2}
                suffix="%"
                disabled={assessment.status === "approved"}
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="moisture" className="font-medium block mb-2">
                Moisture (%)
              </label>
              <InputNumber
                id="moisture"
                name="moisture_percentage"
                value={formData.moisture_percentage}
                onValueChange={(e) => handleNumberChange('moisture_percentage', e.value)}
                mode="decimal"
                min={0}
                max={100}
                minFractionDigits={1}
                maxFractionDigits={2}
                suffix="%"
                disabled={assessment.status === "approved"}
                className="w-full"
              />
            </div>
          </div>
        </Fieldset>

        {/* Remarks */}
        <div className="field">
          <label htmlFor="remarks" className="font-medium block mb-2">
            Assessment Remarks
          </label>
          <InputTextarea
            id="remarks"
            value={assessment?.remarks}
            onChange={handleChange}
            rows={3}
            autoResize
            className="w-full"
            readOnly
            disabled
          />
        </div>
        {
          assessment?.status !== "approved" && (
          <div className="field">
            <label htmlFor="remarks" className="font-medium block mb-2">
              Your Remarks
            </label>
            <InputTextarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              autoResize
              className="w-full"
            />
          </div>
          )
         }

        {/* Assessment Info */}
        <Fieldset legend="Assessment Info" toggleable collapsed>
  <div className="space-y-4">
    {/* Assessment Summary */}
    <div className="grid gap-2 text-sm">
      <div className="flex justify-between">
        <span className="font-medium">Assessed By:</span>
        <span>
          {assessment.assessor?.first_name} {assessment.assessor?.last_name}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Status:</span>
        <span
          className={`font-semibold ${
            assessment.status === "approved"
              ? "text-green-600"
              : assessment.status === "rejected"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {assessment.status}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Created At:</span>
        <span>{formatDate(assessment.created_at)}</span>
      </div>
    </div>

    {/* Approvals */}
    {assessment.approvals.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Approvals</h4>
        {assessment.approvals.map((approval: any, index: number) => (
          <div
            key={index}
            className="p-3 rounded-lg border border-gray-200 bg-gray-50"
          >
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Approver:</span>
              <span>{approval.approved_by?.last_name}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Status:</span>
              <span
                className={`font-semibold ${
                  approval.status === "approved"
                    ? "text-green-600"
                    : approval.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {approval.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Remarks:</span>
              <span>{approval.remarks || "No remarks"}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</Fieldset>


       

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
         
          
        {assessment.status !== "approved" && (
  <>
    <Button
      label="Update"
      icon="pi pi-save"
      loading={isSaving}
      onClick={handleSave}
      style={{
        backgroundColor: "#2563eb", // blue-600
        borderColor: "#2563eb",
        color: "white",
      }}
    />
    <Button
      label="Reject"
      icon="pi pi-times-circle"
      onClick={() => onReject(formData.remarks)}
      style={{
        backgroundColor: "#dc2626", // red-600
        borderColor: "#dc2626",
        color: "white",
      }}
    />
    {
                (formData.moisture_percentage <= 16) && (
                  <Button
      label="Approve"
      icon="pi pi-check-circle"
      onClick={() => onApprove(formData.remarks)}
      style={{
        backgroundColor: "#14b8a6",// green-600
        borderColor: "#16a34a",
        color: "white",
      }}
    />
      )     
    }
  </>
)}


        </div>
      </div>
    </Dialog>
  );
};

export default ViewAssessmentModal;