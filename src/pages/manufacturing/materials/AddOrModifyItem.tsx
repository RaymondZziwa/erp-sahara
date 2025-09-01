import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { toast } from "react-toastify";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: any;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: uoms = [] } = useUnitsOfMeasurement(); 

  const [formState, setFormState] = useState({
    name: "",
    uom: "",
    safety_stock_level: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        uom: item.uom || "",
        safety_stock_level: item.safety_stock_level || 0,
      });
    } else {
      setFormState({
        name: "",
        uom: "",
        safety_stock_level: 0,
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { name, uom, safety_stock_level } = formState;

    if (!name || !uom || !safety_stock_level) {
      toast.warn("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name,
        uom,
        safety_stock_level,
      };

      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? MANUFACTURING_ENDPOINTS.MATERIALS.UPDATE(item.id.toString())
        : MANUFACTURING_ENDPOINTS.MATERIALS.ADD;

      await createRequest(endpoint, token.access_token, payload, onSave, method);
      setFormState({ name: "", uom: "", safety_stock_level: 0 });
      onSave();
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save.");
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
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        type="submit"
        form="item-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Material" : "Add Material"}
      visible={visible}
      onHide={onClose}
      footer={footer}
      style={{ width: "400px" }}
    >
      <p className="mb-6">
        Fields marked with <span className="text-red-500">*</span> are mandatory.
      </p>
      <form
        id="item-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div>
          <label htmlFor="name">Name<span className="text-red-500">*</span></label>
          <InputText
            id="name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="uom">Unit of Measure<span className="text-red-500">*</span></label>
          <Dropdown
            id="uom"
            value={formState.uom}
            options={uoms.map((u: any) => ({ label: u.name, value: u.id }))}
            onChange={(e) => setFormState((prev) => ({ ...prev, uom: e.value }))}
            placeholder="Select UOM"
            required
          />
        </div>

        <div>
          <label htmlFor="safety_stock_level">Safety Stock Level<span className="text-red-500">*</span></label>
          <InputNumber
            id="safety_stock_level"
            value={formState.safety_stock_level}
            onValueChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                safety_stock_level: e.value || 0,
              }))
            }
            mode="decimal"
            showButtons
            min={0}
            required
            useGrouping={false}
            placeholder="0"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
