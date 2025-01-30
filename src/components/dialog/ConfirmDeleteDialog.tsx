import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";

import { apiRequest } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";

interface ConfirmDeleteDialogProps {
  visible: boolean;
  apiPath: string;
  onClose: () => void;
  onConfirm: () => void;
  body?: Object;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  visible,
  apiPath,
  onClose,
  onConfirm,
  body,
}) => {
  const toast = useRef<Toast>(null);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<ServerResponse<unknown>>(
        apiPath,
        "DELETE",
        token.access_token,
        body
      );

      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: data.message ?? "Record deleted successfully",
        life: 3000,
      });
      onConfirm(); // Notify parent component of success
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          (error instanceof Error && error.message) ??
          "Failed to delete record",
        life: 3000,
      });
    } finally {
      setLoading(false);
      onClose(); // Close the modal
    }
  };

  const footer = (
    <div className="flex justify-end gap-1">
      <Button
        label="No"
        icon="pi pi-times"
        onClick={onClose}
        size="small"
        className="p-button-text !bg-red-500 text-white mr-2"
        disabled={loading}
      />
      <Button
        size="small"
        label="Yes"
        icon="pi pi-check"
        onClick={handleDelete}
        className="p-button-text !bg-green-500 text-white"
        // autoFocus
        disabled={loading}
        loading={loading} // Add loading spinner to the button
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Delete Confirmation"
        visible={visible}
        style={{ width: "350px" }}
        footer={footer}
        onHide={onClose}
      >
        <p>Do you want to delete this record?</p>
      </Dialog>
    </>
  );
};

export default ConfirmDeleteDialog;
