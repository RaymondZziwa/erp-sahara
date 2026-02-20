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
  const [step, setStep] = useState(1); // Step 1: Main Info, Step 2: BOM Items, Step 3: Review

  const { token } = useAuth();
  const { data: uom } = useUnitsOfMeasurement();
  const { data: items, loading: itemsLoading } = useItems();

  // Prefill when editing
  useEffect(() => {
    if (item) {
      setFormState({
        item_id: item.item_id,
        version: item.version || "",
        notes: item.notes || "",
        bom_items:
          item.bom_items?.map((b) => ({
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

  // Helpers
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!formState.item_id || !formState.bom_items?.length) {
      toast.warn("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    const payload: BomPayload = {
      item_id: formState.item_id!,
      version: formState.version || null,
      notes: formState.notes || null,
      bom_items: formState.bom_items.map((b) => ({
        item_id: b.item_id!,
        quantity: b.quantity!,
        uom_id: b.uom_id!,
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
      toast.error("Failed to save Bill of Material");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Footer Buttons (Dynamic per Step)
  const footer = (
    <div className="flex justify-between">
      {step > 1 && (
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          onClick={() => setStep(step - 1)}
          className="p-button-text"
        />
      )}
      <div className="flex gap-2 ml-auto">
        {step < 3 && (
          <Button
            label="Next"
            icon="pi pi-arrow-right"
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && !formState.item_id) ||
              (step === 2 && (formState.bom_items?.length ?? 0) === 0)
            }
          />
        )}
        {step === 3 && (
          <Button
            label={item?.id ? "Update" : "Submit"}
            icon="pi pi-check"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        )}
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={onClose}
          className="p-button-text !bg-red-500 hover:!bg-red-400 text-white"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={
          item?.id
            ? "Edit Bill Of Material"
            : "Add Bill Of Material"
        }
        visible={visible}
        footer={footer}
        onHide={onClose}
        className="w-full md:w-3/4"
      >
        {/* Step indicators */}
        <div className="flex justify-center mb-4 space-x-3">
          {["Main Info", "BOM Items", "Review"].map((label, i) => (
            <div
              key={i}
              className={`px-3 py-1 rounded-full text-sm ${
                step === i + 1
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Step {i + 1}: {label}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label>
                Item <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formState.item_id}
                options={items.map((i) => ({
                  value: i.id,
                  label: i.name,
                }))}
                onChange={(e) =>
                  handleSelectChange(null, "item_id", e.value)
                }
                filter
                placeholder="Select Item"
                className="w-full"
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

            <div className="col-span-2 flex flex-col">
              <label>Notes</label>
              <InputTextarea
                value={formState.notes || ""}
                name="notes"
                onChange={handleInputChange}
                className="w-full"
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="text-lg font-medium">
              Bill Of Material Items <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded p-2 mt-2 space-y-2">
              {formState.bom_items?.map((b, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-2 items-center"
                >
                  <Dropdown
                    value={b.item_id}
                    options={items
                      .filter(
                        (item) =>
                          item.item_category.is_final_product === 0
                      )
                      .map((i) => ({ value: i.id, label: i.name }))}
                    onChange={(e) =>
                      handleSelectChange(index, "item_id", e.value)
                    }
                    placeholder="Raw Material"
                    className="col-span-2 w-full"
                  />
                  <InputNumber
                    value={b.quantity}
                    onValueChange={(e) =>
                      handleSelectChange(index, "quantity", e.value)
                    }
                    placeholder="Qty"
                    className="col-span-1 w-full"
                    min={0}
                  />
                  <Dropdown
                    value={b.uom_id}
                    options={uom.map((u) => ({
                      value: u.id,
                      label: u.name,
                    }))}
                    onChange={(e) =>
                      handleSelectChange(index, "uom_id", e.value)
                    }
                    placeholder="UOM"
                    className="col-span-1 w-full"
                  />
                  <InputText
                    value={b.notes || ""}
                    placeholder="Notes"
                    onChange={(e) =>
                      handleInputChange(e, index, "notes")
                    }
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
        )}

        {step === 3 && (
          <div className="p-3">
            <h3 className="font-semibold text-lg mb-2">Review Your BOM</h3>
            <p>
              <strong>Item:</strong>{" "}
              {items.find((i) => i.id === formState.item_id)?.name}
            </p>
            <p>
              <strong>Version:</strong> {formState.version || "-"}
            </p>
            <p>
              <strong>Notes:</strong> {formState.notes || "-"}
            </p>

            <table className="w-full border-collapse mt-3 text-sm">
              <thead>
                <tr className="border-b">
                  <th>Raw Material</th>
                  <th>Qty</th>
                  <th>UOM</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {formState.bom_items?.map((b, i) => (
                  <tr key={i} className="border-b text-center">
                    <td>
                      {items.find((x) => x.id === b.item_id)?.name}
                    </td>
                    <td>{b.quantity}</td>
                    <td>{uom.find((u) => u.id === b.uom_id)?.name}</td>
                    <td>{b.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default AddOrModifyItem;
