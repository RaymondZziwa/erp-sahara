import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { toast, ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";
import useWarehouses from "../../../../../hooks/inventory/useWarehouses";
import useAuth from "../../../../../hooks/useAuth";
import { createRequest } from "../../../../../utils/api";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import useProductionMaterialRequests from "../../../../../hooks/manufacturing/workCenter/useProductionMaterialRequests";

interface IssueItem {
  request_id: string;
  issued_quantity: number | "";
}

interface IssueRequestProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

const IssueRequest: React.FC<IssueRequestProps> = ({ visible, onClose, onSave }) => {
  const { id: production_order_id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { data: warehouses, loading: warehousesLoading } = useWarehouses();
  const { data: requestsData, refresh } = useProductionMaterialRequests({ id: production_order_id });

  const [warehouseId, setWarehouseId] = useState<string>("");
  const [items, setItems] = useState<IssueItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (requestsData && requestsData.length) {
      // Filter by production_order_id
      const filteredItems = requestsData
        .filter((r) => r.production_order_id === production_order_id)
        .map((r) => ({
          request_id: r.id,                       // the request itself
          issued_quantity: Number(r.issued_quantity) || 0,
          item_name: r.material?.name || "Item",  // get name from material
          requested_quantity: Number(r.requested_quantity) || 0,
        }));
      setItems(filteredItems);
    }
  }, [requestsData, production_order_id]);
  

  const handleQuantityChange = (index: number, value: number) => {
    const updated = [...items];
    updated[index].issued_quantity = value;
    setItems(updated);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!warehouseId || items.some((i) => !i.issued_quantity)) {
      toast.warn("Please select warehouse and enter all quantities");
      return;
    }

    const payload = {
      warehouse_id: warehouseId,
      items: items.map((i) => ({
        request_id: i.request_id,
        issued_quantity: Number(i.issued_quantity),
      })),
    };

    setIsSubmitting(true);
    try {
      await createRequest(
        MANUFACTURING_ENDPOINTS.PRODUCTION_MATERIALS_REQUESTS.ISSUE(production_order_id),
        token.access_token,
        payload,
        onSave,
        "POST"
      );
      onSave();
      onClose();
      setItems([]);
      setWarehouseId("");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to issue materials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog
        header="Issue Material Request"
        visible={visible}
        onHide={onClose}
        className="w-[400px]"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={onClose}
              className="p-button-text !bg-red-500 hover:!bg-red-400 text-white"
              disabled={isSubmitting}
            />
            <Button
              label="Submit"
              icon="pi pi-check"
              loading={isSubmitting}
              form="issue-form"
              type="submit"
              disabled={isSubmitting}
            />
          </div>
        }
      >
        <form id="issue-form" className="flex flex-col gap-4" onSubmit={handleSave}>
          <div className="flex flex-col">
            <label>
              Warehouse <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={warehouseId}
              options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
              onChange={(e) => setWarehouseId(e.value)}
              placeholder="Select Warehouse"
              className="w-full"
              disabled={warehousesLoading}
              required
            />
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
                <span className="flex-1">{item.item_name || "Item"}</span>
                <InputText
                type="number"
                value={item.issued_quantity}
                onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                placeholder="Issued Quantity"
                className="w-32"
                required
                />
            </div>
            ))}

        </form>
      </Dialog>
    </>
  );
};

export default IssueRequest;
