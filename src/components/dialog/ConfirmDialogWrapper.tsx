import React from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ConfirmDialogWrapperProps {
  message?: string;
  header?: string;
  icon?: string;
  position?:
    | "top"
    | "center"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  onAccept?: () => void;
  onReject?: () => void;
  TriggerComponent: React.ReactElement;
}

const ConfirmDialogWrapper: React.FC<ConfirmDialogWrapperProps> = ({
  message = "Are you sure?",
  header = "Confirmation",
  icon = "pi pi-info-circle",
  position = "top",
  onAccept,
  onReject,
  TriggerComponent,
}) => {
  const showConfirmDialog = () => {
    confirmDialog({
      message,
      header,
      icon,
      position,
      accept: () => {
        toast.success("Action confirmed", {
          // position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        if (onAccept) onAccept();
      },
      reject: () => {
        toast.warn("Action rejected", {
          // position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        if (onReject) onReject();
      },
    });
  };

  // Clone the trigger component and add the onClick handler
  const clonedTrigger = React.cloneElement(TriggerComponent, {
    onClick: showConfirmDialog,
  });

  return (
    <>
      <ToastContainer />
      <ConfirmDialog />
      {clonedTrigger}
    </>
  );
};

export default ConfirmDialogWrapper;
