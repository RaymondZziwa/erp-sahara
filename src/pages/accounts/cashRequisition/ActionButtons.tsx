import React from "react";
import { useNavigate } from "react-router-dom";
import { CashRequisition } from "../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import { SplitButton } from "primereact/splitbutton";

const ActionButtons = ({
  cashRequisition,
  setDialogState,
}: {
  cashRequisition: CashRequisition;
  setDialogState: React.Dispatch<
    React.SetStateAction<{
      selectedItem: CashRequisition | undefined;
      currentAction: "delete" | "edit" | "add" | "";
    }>
  >;
}) => {
  const navigate = useNavigate();
  const items = [
    {
      label: "Approve",
      icon: "pi pi-eye",
      classNames: "!bg-green-500",
      command: () => {
        // Navigate to the details page
        navigate("/cash-requsuitions/req/" + cashRequisition.id);
      },
    },
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => {
        setDialogState({
          currentAction: "edit",
          selectedItem: cashRequisition,
        });
      },
    },

    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {
        setDialogState({
          currentAction: "delete",
          selectedItem: cashRequisition,
        });
      },
    },
  ];

  return (
    <div className="card">
      <div
        style={{ height: "40px" }}
        className="flex align-items-center justify-content-center"
      >
        <SplitButton icon="pi pi-align-center" model={items} />
      </div>
    </div>
  );
};

export default ActionButtons;
