import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { toast, ToastContainer } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { BillOfMaterial } from "../../../redux/slices/types/manufacturing/BillOfMaterial";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import useItems from "../../../hooks/inventory/useItems";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: BillOfMaterial;
  onSave: () => void;
}

interface BomItemPayload {
  item_id: string;
  quantity: number;
  uom_id: string;
  notes?: string | null;
}

interface BomPayload {
  item_id: string;
  version?: string | null;
  notes?: string | null;
  bom_items: BomItemPayload[];
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<BomPayload>>({
    bom_items: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: uom } = useUnitsOfMeasurement();
  const { data: items, loading: itemsLoading } = useItems();

  useEffect(() => {
    if (item) {
      setFormState({
        item_id: item.item_id,
        version: item.version || "",
        notes: item.notes || "",
        bom_items: item.bom_items?.map((b) => ({
          item_id: b.item_id,
          quantity: b.quantity,
          uom_id: b.uom_id,
          notes: b.notes || "",
        })) || [],
      });
    } else {
      setFormState({
        item_id: "",
        version: "",
        notes: "",
        bom_items: [],
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    fieldName?: string
  ) => {
    const { name, value } = e.target;
    if (index !== undefined && fieldName) {
      const updatedBom = [...(formState.bom_items || [])];
      updatedBom[index] = { ...updatedBom[index], [fieldName]: value };
      setFormState((prev) => ({ ...prev, bom_items: updatedBom }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (
    index: number | null,
    field: keyof BomItemPayload | keyof BomPayload,
    value: any
  ) => {
    if (index !== null) {
      const updatedBom = [...(formState.bom_items || [])];
      updatedBom[index] = { ...updatedBom[index], [field]: value };
      setFormState((prev) => ({ ...prev, bom_items: updatedBom }));
    } else {
      setFormState((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addBomItem = () => {
    setFormState((prev) => ({
      ...prev,
      bom_items: [
        ...(prev.bom_items || []),
        { item_id: "", quantity: 0, uom_id: "", notes: "" },
      ],
    }));
  };

  const removeBomItem = (index: number) => {
    const updatedBom = formState.bom_items?.filter((_, i) => i !== index);
    setFormState((prev) => ({ ...prev, bom_items: updatedBom }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.item_id || !formState.bom_items?.length) {
      toast.warn("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    const payload: BomPayload = {
      item_id: formState.item_id,
      version: formState.version || null,
      notes: formState.notes || null,
      bom_items: formState.bom_items.map((b) => ({
        item_id: b.item_id,
        quantity: b.quantity,
        uom_id: b.uom_id,
        notes: b.notes || null,
      })),
    };

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? MANUFACTURING_ENDPOINTS.BILL_OF_MATERIAL.UPDATE(item.id.toString())
        : MANUFACTURING_ENDPOINTS.BILL_OF_MATERIAL.ADD;

      await createRequest(endpoint, token.access_token, payload, onSave, method);
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save BOM");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:!bg-red-400 text-white"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        onClick={handleSave}
        form="bom-form"
        loading={isSubmitting}
        disabled={isSubmitting}
        size="small"
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item?.id ? "Edit Bill Of Material" : "Add Bill Of Material"}
        visible={visible}
        footer={footer}
        onHide={onClose}
        className="w-full md:w-3/4"
      >
        <p className="mb-6">
          Fields marked with <span className="text-red-500">*</span> are mandatory.
        </p>

        <form id="bom-form" className="grid grid-cols-2 gap-4">
          {/* Main Item & Version */}
          <div className="flex flex-col">
            <label>Item<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.item_id}
              options={items.map((i) => ({ value: i.id, label: i.name }))}
              onChange={(e) => handleSelectChange(null, "item_id", e.value)}
              filter
              placeholder="Select Item"
              className="w-full"
              required
            />
          </div>

          <div className="flex flex-col">
            <label>Version</label>
            <InputText
              value={formState.version || ""}
              name="version"
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          {/* Notes spanning full width */}
          <div className="col-span-2 flex flex-col">
            <label>Notes</label>
            <InputTextarea
              value={formState.notes || ""}
              name="notes"
              onChange={handleInputChange}
              className="w-full"
              rows={4}
            />
          </div>

          {/* BOM Items Table */}
          <div className="col-span-2">
            <label className="text-lg font-medium">BOM Items<span className="text-red-500">*</span></label>
            <div className="border border-gray-300 rounded p-2 mt-2 space-y-2">
              {formState.bom_items?.map((b, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-center">
                  <Dropdown
                    value={b.item_id}
                    options={items.filter((item)=> item.item_category.is_final_product === 0).map((i) => ({ value: i.id, label: i.name }))}
                    onChange={(e) => handleSelectChange(index, "item_id", e.value)}
                    placeholder="Raw Material"
                    className="col-span-2 w-full"
                  />
                  <InputNumber
                    value={b.quantity}
                    onValueChange={(e) => handleSelectChange(index, "quantity", e.value)}
                    placeholder="Qty"
                    className="col-span-1 w-full"
                    min={0}
                  />
                  <Dropdown
                    value={b.uom_id}
                    options={uom.map((u) => ({ value: u.id, label: u.name }))}
                    onChange={(e) => handleSelectChange(index, "uom_id", e.value)}
                    placeholder="UOM"
                    className="col-span-1 w-full"
                  />
                  <InputText
                    value={b.notes || ""}
                    placeholder="Notes"
                    onChange={(e) => handleInputChange(e, index, "notes")}
                    className="col-span-1 w-full"
                  />
                  <Button
                    icon="pi pi-trash"
                    className="!bg-red-500 hover:!bg-red-600 !text-white col-span-1"
                    onClick={() => removeBomItem(index)}
                    type="button"
                  />
                </div>
              ))}
              <Button
                label="Add BOM Item"
                icon="pi pi-plus"
                onClick={addBomItem}
                type="button"
                className="mt-2"
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifyItem;
