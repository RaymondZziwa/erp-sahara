import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { baseURL } from "../../utils/api";

const api = axios.create({ baseURL });

interface AddOrModifyAttachmentModalProps {
  visible: boolean;
  onClose: () => void;
  assetId: number;
  onSave: () => void;
}

const AddOrModifyAttachmentModal: React.FC<AddOrModifyAttachmentModalProps> = ({
  visible,
  onClose,
  assetId,
  onSave,
}) => {
  const { token } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token?.access_token) {
        config.headers.Authorization = `Bearer ${token.access_token}`;
      }
      return config;
    });
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.warn("Please upload at least one file.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("attachment", file));
    formData.append("description", description);

    setIsSubmitting(true);
    try {
        await api.post(
        `assets/${assetId}/assetattachments/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Attachment uploaded successfully.");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast.error("Failed to upload attachment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header="Upload Attachment"
      visible={visible}
      style={{ width: "500px" }}
      onHide={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text !bg-red-500 hover:bg-red-400"
            onClick={onClose}
            disabled={isSubmitting}
          />
          <Button
            label="Submit"
            icon="pi pi-check"
            className="p-button-success"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="p-fluid grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="attachments">
              Upload File(s) <span className="text-red-500">*</span>
            </label>
            <input
              id="attachments"
              type="file"
              multiple
              accept="*"
              onChange={(e) => {
                const selected = e.target.files;
                if (selected) {
                  setFiles(Array.from(selected));
                }
              }}
              className="block w-full text-sm text-gray-700"
            />
            {files.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {files.map((file, i) => (
                  <li key={i}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <InputTextarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description for the files"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyAttachmentModal;
