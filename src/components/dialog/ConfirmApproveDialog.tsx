import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { apiRequest, mossAppApiRequest } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";

interface ConfirmApproveDialogProps {
  visible: boolean;
  apiPath: string;
  onClose: () => void;
  onConfirm: () => void;
  type: "moss" | "other";
  method?: "POST" | "PUT";
  body?: Object;
}

const ConfirmApproveDialog: React.FC<ConfirmApproveDialogProps> = ({
  visible,
  apiPath,
  onClose,
  onConfirm,
  body,
  type = "other",
  method = "POST",
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const data =
        type === "moss"
          ? await mossAppApiRequest<ServerResponse<unknown>>(
              apiPath,
              method,
              token.access_token,
              body
            )
          : await apiRequest<ServerResponse<unknown>>(
              apiPath,
              method,
              token.access_token,
              body
            );

      toast.success(data.message ?? "Record approved successfully", {
        autoClose: 3000,
      });
      onConfirm(); // Notify parent component of success
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve record",
        {
          autoClose: 3000,
        }
      );
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
        onClick={handleApprove}
        className="p-button-text !bg-green-500 text-white"
        disabled={loading}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header="Approval Confirmation"
        visible={visible}
        style={{ width: "350px" }}
        footer={footer}
        onHide={onClose}
      >
        <p>Do you want to approve this record?</p>
      </Dialog>
    </>
  );
};

export default ConfirmApproveDialog;
