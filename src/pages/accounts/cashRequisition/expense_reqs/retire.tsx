import React, { useState } from 'react';
import axios from "axios";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { CashRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import { baseURL } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import useCashRequisitions from "../../../../hooks/accounts/cash_requisitions/useCashRequsitions";
import { toast } from "react-toastify";

interface RetireModalProps {
  visible: boolean;
  requisition: CashRequisition | null;
  onHide: () => void;
}

const RetireModal: React.FC<RetireModalProps> = ({ visible, requisition, onHide }) => {
  const token = useSelector((state: RootState) => state.userAuth.token);
  const { refresh } = useCashRequisitions();
  const [notes, setNotes] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileSelect = (event: any) => {
    setFiles(event.files);
  };

  const handleFileRemove = () => {
    setFiles([]);
  };

  const handleRetirement = async () => {
    if (!requisition) return;
    
    try {
      setLoading(true);
      
      // Create FormData for submission
      const formData = new FormData();
      formData.append('notes', notes);
      
      // Always ensure attachments is an array, even if empty
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('attachments[]', file); // Note the [] for array format
        });
      } else {
        // Append empty array if no files selected
        formData.append('attachments', '[]');
      }

      const response = await axios.post(
        `${baseURL}/accounts/cash-requisitions/${requisition.id}/retirement`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success("Requisition retired successfully!");
        refresh();
        onHide();
        // Reset form
        setNotes('');
        setFiles([]);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to retire requisition");
    } finally {
      setLoading(false);
    }
  };


  const footerContent = (
    <div className='flex flex-row justify-end gap-2'>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={onHide} 
        className="p-button-text !bg-red-500" 
      />
      <Button 
        label="Retire" 
        icon="pi pi-check" 
        onClick={handleRetirement} 
        autoFocus 
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog 
      header="Retire Requisition" 
      visible={visible} 
      style={{ width: '50vw' }} 
      onHide={onHide}
      footer={footerContent}
    >
      {requisition && (
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="notes">Retirement Notes *</label>
            <InputTextarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={5} 
              placeholder="Enter details about how the funds were used..."
              className={!notes.trim() ? 'p-invalid' : ''}
            />
            {!notes.trim() && <small className="p-error">Retirement notes are required</small>}
          </div>
          
          <div className="p-field" style={{ marginTop: '1rem' }}>
            <label htmlFor="attachments">Supporting Documents</label>
            <FileUpload
              id="attachments"
              name="attachments"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              maxFileSize={10000000}
              onSelect={handleFileSelect}
              onClear={handleFileRemove}
              customUpload
              uploadHandler={handleFileSelect}
              chooseLabel="Select Files"
              cancelLabel="Remove All"
            />
            <small className="p-d-block">Upload receipts or supporting documents (Max 10MB per file)</small>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default RetireModal;