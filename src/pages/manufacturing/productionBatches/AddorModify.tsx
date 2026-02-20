import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { toast } from "react-toastify";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import useProductionPlanSchedule from "../../../hooks/manufacturing/workCenter/useProductionPlanSchedules";
import { useParams } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import useProductionMaterialRequests from "../../../hooks/manufacturing/workCenter/useProductionMaterialRequests";

export interface ProductionInput {
  material_request_id: string;
  quantity: number;
}

export type ProductionStatus = "planned" | "in_progress" | "completed";

export interface ProductionBatch {
  production_schedule_id?: string;
  status: ProductionStatus;
  inputs: ProductionInput[];
}

interface AddOrModifyBatchProps {
  visible: boolean;
  onClose: () => void;
  batch?: ProductionBatch;
  onSave: () => void;
}

const AddOrModifyBatch: React.FC<AddOrModifyBatchProps> = ({
  visible,
  onClose,
  batch,
  onSave,
}) => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const {data} = useProductionPlanSchedule({id})
    const {data: pmrs} = useProductionMaterialRequests({id})

    const [formState, setFormState] = useState<ProductionBatch>({
    production_schedule_id: "",
    status: "planned",
    inputs: [{ material_request_id: "", quantity: 0 }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (batch) {
      setFormState({
        status: batch.status,
        inputs: batch.inputs.length > 0 ? batch.inputs : [{ material_request_id: "", quantity: 0 }],
      });
    } else {
      setFormState({ production_schedule_id: "", status: "planned", inputs: [{ material_request_id: "", quantity: 0 }] });
    }
  }, [batch]);

  const handleInputChange = (
    index: number,
    field: keyof ProductionInput,
    value: string | number
  ) => {
    const newInputs = [...formState.inputs];
    newInputs[index][field] = value as any;
    setFormState((prev) => ({ ...prev, inputs: newInputs }));
  };

  const addInput = () => {
    setFormState((prev) => ({
      ...prev,
      inputs: [...prev.inputs, { material_request_id: "", quantity: 0 }],
    }));
  };

  const removeInput = (index: number) => {
    const newInputs = [...formState.inputs];
    newInputs.splice(index, 1);
    setFormState((prev) => ({ ...prev, inputs: newInputs }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.status || formState.inputs.some((i) => !i.material_request_id || i.quantity <= 0)) {
      toast.warn("Please fill in all required fields and quantities.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: ProductionBatch = { ...formState };
      const method = batch?.production_schedule_id ? "PUT" : "POST";
      const endpoint = batch?.production_schedule_id
        ? MANUFACTURING_ENDPOINTS.PRODUCTION_BATCHES.UPDATE(batch.production_schedule_id)
        : MANUFACTURING_ENDPOINTS.PRODUCTION_BATCHES.ADD;

      await createRequest(endpoint, token.access_token, payload, onSave, method);
      setFormState({ status: "planned", inputs: [{ material_request_id: "", quantity: 0 }] });
      onSave();
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error?.response?.data?.message || "Failed to save batch.");
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
        label={batch?.production_schedule_id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        type="submit"
        form="batch-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={batch?.production_schedule_id ? "Edit Production Batch" : "Add Production Batch"}
      visible={visible}
      onHide={onClose}
      footer={footer}
      style={{ width: "500px" }}
    >
          <form id="batch-form" onSubmit={handleSave} className="p-fluid grid grid-cols-1 gap-4">
          <div className="w-full">
      <label className="block mb-1 font-medium text-gray-700">Select Production Schedule</label>
      <Dropdown
        value={formState.production_schedule_id}
        options={data.map((plan) => ({
            value: plan.id,
            label: `${new Date(plan.start_time).toLocaleString()} - ${new Date(plan.end_time).toLocaleString()}`,
        }))}
        onChange={(e) =>
            setFormState((prev) => ({ ...prev, production_schedule_id: e.value }))
        }
        placeholder="Select a Production Schedule"
        className="w-full"
        />

    </div>
        <div className="w-full">
        <label className="block mb-1 font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
        </label>
        <Dropdown
            value={formState.status}
            options={[
            { label: "Planned", value: "planned" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
            ]}
            onChange={(e) =>
            setFormState((prev) => ({ ...prev, status: e.value as ProductionStatus }))
            }
            placeholder="Select status"
            className="w-full"
        />
        </div>


        <div>
          <label>Inputs<span className="text-red-500">*</span></label>
          {formState.inputs.map((input, idx) => (
            <div key={idx} className="flex gap-2 items-center mb-2">
                {/* Material Request Dropdown */}
                <Dropdown
                value={input.material_request_id}
                options={
                    pmrs?.map((req) => ({
                    label: `${req.material.name} (${req.production_order.order_number})`,
                    value: req.id,
                    })) || []
                }
                onChange={(e) => handleInputChange(idx, "material_request_id", e.value)}
                placeholder="Select Material Request"
                className="flex-1"
                filter
                showClear
                />

                {/* Quantity Input */}
                <InputNumber
                placeholder="Quantity"
                value={input.quantity}
                onValueChange={(e) => handleInputChange(idx, "quantity", e.value || 0)}
                min={0}
                className="w-32"
                mode="decimal"
                useGrouping={false}
                />

                {/* Remove Button */}
                {formState.inputs.length > 1 && (
                <Button
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={() => removeInput(idx)}
                />
                )}
            </div>
            ))}

          <Button label="Add Input" type="button" icon="pi pi-plus" onClick={addInput} className="mt-2" />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyBatch;
