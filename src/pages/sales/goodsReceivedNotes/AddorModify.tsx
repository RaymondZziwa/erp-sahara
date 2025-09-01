import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { FileUpload } from "primereact/fileupload";

import useAuth from "../../../hooks/useAuth";

import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { GoodsReceivedNote } from "../../../redux/slices/types/sales/goodsReceived";
import { apiRequest } from "../../../utils/api";

interface AddOrModifyGRNProps {
  visible: boolean;
  onClose: () => void;
  item?: GoodsReceivedNote;
  onSave: () => void;
}

const AddOrModifyGRN: React.FC<AddOrModifyGRNProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<Partial<GoodsReceivedNote>>({
    buyer_grn_date: new Date().toISOString().split("T")[0],
    is_grn_received: true,
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  useEffect(() => {
    if (item) {
      setFormState(item);
    } else {
      setFormState({
        buyer_grn_date: new Date().toISOString().split("T")[0],
        is_grn_received: true,
      });
    }
    setAttachmentFile(null);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: { checked: boolean }) => {
    setFormState((prev) => ({ ...prev, is_grn_received: e.checked }));
  };

  const handleFileSelect = (e: any) => {
    if (e.files && e.files.length > 0) {
      setAttachmentFile(e.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    if (formState.delivery_note_id) formData.append("delivery_note_id", formState.delivery_note_id);
    if (formState.buyer_grn_number) formData.append("buyer_grn_number", formState.buyer_grn_number);
    if (formState.buyer_grn_date) formData.append("buyer_grn_date", formState.buyer_grn_date);
    if (formState.is_grn_received !== undefined)
      formData.append("is_grn_received", String(formState.is_grn_received));
    if (formState.grn_remarks) formData.append("grn_remarks", formState.grn_remarks);
    if (formState.received_by) formData.append("received_by", formState.received_by);
    if (attachmentFile) formData.append("grn_attachment", attachmentFile);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.GRN.UPDATE(item.id)
      : SALES_ENDPOINTS.GRN.ADD;

    await apiRequest(endpoint, token.access_token, formData, onSave, method);

    setIsSubmitting(false);
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" icon="pi pi-times" onClick={onClose} className="p-button-text" />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        type="submit"
        form="grn-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Goods Received Note" : "Add Goods Received Note"}
      visible={visible}
      style={{ width: "50vw" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="grn-form" onSubmit={handleSubmit} className="p-fluid space-y-4">
        <div>
          <label>Delivery Note ID *</label>
          <InputText
            name="delivery_note_id"
            value={formState.delivery_note_id || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Buyer GRN Number *</label>
          <InputText
            name="buyer_grn_number"
            value={formState.buyer_grn_number || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Buyer GRN Date *</label>
          <InputText
            name="buyer_grn_date"
            type="date"
            value={formState.buyer_grn_date || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            inputId="isReceived"
            checked={formState.is_grn_received}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="isReceived">GRN Received</label>
        </div>

        <div>
          <label>Remarks</label>
          <InputTextarea
            name="grn_remarks"
            value={formState.grn_remarks || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Received By *</label>
          <InputText
            name="received_by"
            value={formState.received_by || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Attachment</label>
          <FileUpload
            mode="basic"
            chooseLabel="Choose File"
            customUpload
            auto
            uploadHandler={handleFileSelect}
            accept=".pdf,.jpg,.png,.doc,.docx"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyGRN;
