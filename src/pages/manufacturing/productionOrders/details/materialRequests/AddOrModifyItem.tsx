import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { toast, ToastContainer } from "react-toastify";
import useItems from "../../../../../hooks/inventory/useItems";
import useAuth from "../../../../../hooks/useAuth";
import { createRequest } from "../../../../../utils/api";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import { useParams } from "react-router-dom";
import useUnitsOfMeasurement from "../../../../../hooks/inventory/useUnitsOfMeasurement";

interface ItemRequest {
  uom_id: any;
  item_id: string;
  requested_quantity: number | "";
  notes: string;
}

interface AddOrModifyRequestProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: any; // optional for editing
}

const AddOrModifyRequest: React.FC<AddOrModifyRequestProps> = ({
  visible,
  onClose,
  onSave,
  item,
}) => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { data: itemsOptions, loading: itemsLoading } = useItems();
  const {data: uoms} = useUnitsOfMeasurement()

  const [requestDate, setRequestDate] = useState<Date>(new Date());
  const [items, setItems] = useState<ItemRequest[]>([
    { item_id: "", requested_quantity: "", uom_id: "", notes: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill if editing
  useEffect(() => {
    if (item) {
      setRequestDate(item.request_date ? new Date(item.request_date) : new Date());
      setItems(item.items || [{ item_id: "", requested_quantity: "", notes: "" }]);
    }
  }, [item]);

  const handleItemChange = (index: number, field: keyof ItemRequest, value: any) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { item_id: "", requested_quantity: "", notes: "" , uom_id: ""}]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!requestDate || items.some((i) => !i.item_id || !i.requested_quantity)) {
      toast.warn("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      request_date: requestDate.toISOString().split("T")[0], // YYYY-MM-DD
      items: items.map((i) => ({
        item_id: i.item_id,
        requested_quantity: Number(i.requested_quantity),
        notes: i.notes,
        uom_id: i.uom_id,
      })),
    };

    try {
      const endpoint = item?.id ? MANUFACTURING_ENDPOINTS.PRODUCTION_MATERIALS_REQUESTS.UPDATE(id, item?.id) : MANUFACTURING_ENDPOINTS.PRODUCTION_MATERIALS_REQUESTS.ADD(id);
      await createRequest(endpoint, token.access_token, payload, onSave, item?.id ? "PUT" : "POST");
      onSave();
      onClose();
      setItems([{ item_id: "", requested_quantity: "", notes: "" , uom_id: ""}]);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item ? "Edit Material Request" : "New Material Request"}
        visible={visible}
        onHide={onClose}
        className="w-[850px]"
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
              label={item ? "Update" : "Submit"}
              icon="pi pi-check"
              loading={isSubmitting}
              form="request-form"
              type="submit"
              disabled={isSubmitting}
            />
          </div>
        }
      >
        <form id="request-form" className="flex flex-col gap-4" onSubmit={handleSave}>
          <div className="flex flex-col">
            <label>Request Date<span className="text-red-500">*</span></label>
            <Calendar
              value={requestDate}
              onChange={(e) => setRequestDate(e.value as Date)}
              showIcon
            />
          </div>

          {items.map((i, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                {/* Item Selection */}
                <Dropdown
                  value={i.item_id}
                  options={itemsOptions.map((it) => ({ label: it.name, value: it.id }))}
                  onChange={(e) => handleItemChange(idx, "item_id", e.value)}
                  placeholder="Select Item"
                  filter
                  className="w-full"
                  disabled={itemsLoading}
                />

                {/* Quantity */}
                <InputText
                  type="number"
                  placeholder="Quantity"
                  value={i.requested_quantity}
                  onChange={(e) => handleItemChange(idx, "requested_quantity", e.target.value)}
                  className="w-24"
                />

                {/* Unit of Measurement */}
                <Dropdown
                  value={i.uom_id || ""}
                  options={uoms?.map((uom) => ({ label: uom.name, value: uom.id })) || []}
                  onChange={(e) => handleItemChange(idx, "uom_id", e.value)}
                  placeholder="UOM"
                  filter
                  className="w-28"
                  disabled={!uoms || uoms.length === 0}
                />

                {/* Notes */}
                <InputText
                  placeholder="Notes"
                  value={i.notes}
                  onChange={(e) => handleItemChange(idx, "notes", e.target.value)}
                  className="flex-1"
                />

                {/* Remove Item */}
                {items.length > 1 && (
                  <Button
                    icon="pi pi-trash"
                    className="!bg-red-500"
                    type="button"
                    onClick={() => removeItem(idx)}
                  />
                )}
              </div>
            ))}

          <Button
            type="button"
            label="Add Item"
            icon="pi pi-plus"
            onClick={addItem}
            className="p-button-info mt-2 w-max"
          />
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifyRequest;
