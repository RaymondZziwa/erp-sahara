import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import {toast} from "react-toastify"
import { apiRequest } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";

interface ConfirmDeleteDialogProps {
  visible: boolean;
  apiPath: string;
  onClose: () => void;
  onConfirm: () => void;
  body?: Object;
  //refresh?: () => void
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  visible,
  apiPath,
  onClose,
  onConfirm,
  //refresh,
  body,
}) => {
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

      toast.success("Record deleted successfully");

      onConfirm(); // Notify parent component of success
    } catch (error) {
      toast.error(error?.response?.data?.message);
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
