import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { Dropdown } from "primereact/dropdown";
import useWarehouses from "../../../../hooks/inventory/useWarehouses";

interface DisburseModalProps {
  visible: boolean;
  onHide: () => void;
  requisition: any;        // full requisition object from parent
  onSubmit: (payload: any) => void;
}

const DisburseModal: React.FC<DisburseModalProps> = ({
  visible,
  onHide,
  requisition,
  onSubmit,
}) => {
  const token = useSelector((state: RootState) => state.userAuth.token);
  const user = useSelector((state: RootState) => state.userAuth.user.employee_id);
  const { data: warehouses } = useWarehouses()
  const [notes, setNotes] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  const handleSubmit = async () => {
    if (!requisition) return;

    const payload = {
      notes,
      from_warehouse_id: selectedWarehouse,
      items: requisition.items.map((item: any) => ({
        store_requisition_item_id: item.id,
        requested_item_id: item.item_id, 
        quantity_issued: item.approved_quantity ?? 0,
        received_by: user, 
      })),
    };

    try {
      await apiRequest(
        ACCOUNTS_ENDPOINTS.STORE_REQUISITIONS.DISBURSE(requisition.id),
        "POST",
        token.access_token,
        payload
      );
      toast.success("Requisition has been successfully fulfilled");
      onSubmit(payload);
      onHide();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to disburse");
    }
  };

  return (
    <Dialog
      header={`Disburse Requisition - ${requisition?.requisition_no || ""}`}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="flex flex-col gap-3">
                <Dropdown
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.value)}
          options={warehouses?.map((warehouse) => ({
            label: warehouse.name,
            value: warehouse.id
          }))}
          placeholder="Select warehouse"
          className="w-full"
          filter
        />
        <InputTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notes e.g. Issued items for requisition #123"
          className="w-full"
        />

        <Button
          label="Disburse"
          icon="pi pi-check"
          className="p-button-success"
          onClick={handleSubmit}
        />
      </div>
    </Dialog>
  );
};

export default DisburseModal;
