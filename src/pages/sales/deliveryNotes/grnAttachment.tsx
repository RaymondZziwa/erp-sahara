import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Icon } from "@iconify/react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { DeliveryNote } from "../../../redux/slices/types/sales/deliveryNotes";

interface GRNAttachmentProps {
  deliveryNote: DeliveryNote;
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface GRNFormData {
  grn_number: string;
  grn_date: string;
  grn_remarks: string;
  grn_attachment: File | null;
}

const GRNAttachment: React.FC<GRNAttachmentProps> = ({
  deliveryNote,
  visible,
  onClose,
  onSave,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<GRNFormData>({
    grn_number: `GRN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    grn_date: new Date().toISOString().split('T')[0],
    grn_remarks: "",
    grn_attachment: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormState(prev => ({ 
        ...prev, 
        grn_date: date.toISOString().split('T')[0] 
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setFormState(prev => ({ ...prev, grn_attachment: file }));
    }
  };

  const removeFile = () => {
    setFormState(prev => ({ ...prev, grn_attachment: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.grn_attachment) {
      alert("Please select a file to upload");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("grn_number", formState.grn_number);
      formData.append("grn_date", formState.grn_date);
      formData.append("grn_remarks", formState.grn_remarks);
      formData.append("grn_attachment", formState.grn_attachment);

      console.log("Submitting GRN FormData:");
      console.log("GRN Number:", formState.grn_number);
      console.log("GRN Date:", formState.grn_date);
      console.log("GRN Remarks:", formState.grn_remarks);
      console.log("GRN Attachment:", formState.grn_attachment.name);

      await axios.post(
        SALES_ENDPOINTS.DELIVERY_NOTES.ATTACH_GRN(deliveryNote.id),
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onSave();
      onClose();
      
      // Reset form
      setFormState({
        grn_number: `GRN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        grn_date: new Date().toISOString().split('T')[0],
        grn_remarks: "",
        grn_attachment: null,
      });
    } catch (error) {
      console.error("Error attaching GRN:", error);
      alert("Failed to attach GRN. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
        disabled={isSubmitting}
      />
      <Button
        label="Attach GRN"
        icon="pi pi-check"
        loading={isSubmitting}
        onClick={handleSubmit}
        disabled={!formState.grn_attachment}
      />
    </div>
  );

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'solar:document-bold-duotone';
      case 'doc':
      case 'docx':
        return 'solar:document-text-bold-duotone';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'solar:gallery-bold-duotone';
      default:
        return 'solar:document-bold-duotone';
    }
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Image File';
      default:
        return 'Document';
    }
  };

  return (
    <Dialog
      header={`Attach GRN - ${deliveryNote.delivery_number}`}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
      modal
    >
      <form onSubmit={handleSubmit} className="p-fluid space-y-4">
        <div className="space-y-4">
          {/* GRN Number */}
          <div className="field">
            <label htmlFor="grn_number" className="text-sm font-medium text-gray-700">
              GRN Number *
            </label>
            <InputText
              id="grn_number"
              name="grn_number"
              value={formState.grn_number}
              onChange={handleInputChange}
              className="w-full mt-1"
              required
            />
          </div>

          {/* GRN Date */}
          <div className="field">
            <label htmlFor="grn_date" className="text-sm font-medium text-gray-700">
              GRN Date *
            </label>
            <Calendar
              id="grn_date"
              value={new Date(formState.grn_date)}
              onChange={(e) => handleDateChange(e.value as Date)}
              dateFormat="yy-mm-dd"
              className="w-full mt-1"
              required
            />
          </div>

          {/* GRN Remarks */}
          <div className="field">
            <label htmlFor="grn_remarks" className="text-sm font-medium text-gray-700">
              Remarks
            </label>
            <InputTextarea
              id="grn_remarks"
              name="grn_remarks"
              value={formState.grn_remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="All items received in good condition"
              className="w-full mt-1"
            />
          </div>

          {/* File Upload */}
          <div className="field">
            <label htmlFor="grn_attachment" className="text-sm font-medium text-gray-700">
              GRN Attachment *
            </label>
            <div className="mt-1">
              {!formState.grn_attachment ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="grn_attachment"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="grn_attachment"
                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                  >
                    <Icon icon="solar:cloud-upload-bold-duotone" className="text-3xl mb-2 block mx-auto" />
                    <div className="font-medium">Click to upload GRN document</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Supports PDF, Word, JPG, PNG (Max 10MB)
                    </div>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon 
                        icon={getFileIcon(formState.grn_attachment.name)} 
                        className="text-blue-500 mr-3" 
                        fontSize={24} 
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {formState.grn_attachment.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getFileType(formState.grn_attachment.name)} • 
                          {(formState.grn_attachment.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      icon="pi pi-times"
                      className="p-button-text p-button-danger p-button-sm"
                      onClick={removeFile}
                      type="button"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">About GRN</h4>
            <p className="text-xs text-blue-700">
              Goods Received Note (GRN) is a document used to confirm the receipt of goods. 
              It should include details about the items received, their condition, and any discrepancies.
            </p>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default GRNAttachment;