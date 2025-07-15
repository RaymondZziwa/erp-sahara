import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { MultiSelect } from "primereact/multiselect";
import { ToastContainer, toast } from "react-toastify";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useWorkCenters from "../../../hooks/manufacturing/workCenter/useWorkCenters";

import { Equipment } from "../../../redux/slices/types/manufacturing/Equipment";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Equipment;
  onSave: () => void;
}

const capabilityOptions = [
  { label: "Cutting", value: "cutting" },
  { label: "Drilling", value: "drilling" },
  { label: "Welding", value: "welding" },
  { label: "Polishing", value: "polishing" },
];

const statusOptions = [
  { label: "Operational", value: "operational" },
  { label: "Under Maintenance", value: "under_maintenance" },
  { label: "Out of Order", value: "out_of_order" },
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: workCenters, loading: workCentersLoading } = useWorkCenters();

  const [formState, setFormState] = useState<Partial<Equipment>>({
    name: "",
    code: "",
    workstation_id: "",
    status: "operational",
    capabilities: [],
    hourly_rate: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({
        name: "",
        code: "",
        workstation_id: "",
        status: "operational",
        capabilities: [],
        hourly_rate: 0,
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

    const { name, code, workstation_id, status, capabilities, hourly_rate } = formState;

    if (!name || !code || !workstation_id || !status || !capabilities?.length || !hourly_rate) {
      toast.warn("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? MANUFACTURING_ENDPOINTS.EQUIPMENT.UPDATE(item.id.toString())
        : MANUFACTURING_ENDPOINTS.EQUIPMENT.ADD;

      const payload = {
        name,
        code,
        workstation_id,
        status,
        capabilities,
        hourly_rate: parseFloat(hourly_rate?.toString() || "0"),
      };

      await createRequest(endpoint, token.access_token, payload, onSave, method);
      setFormState({
        name: "",
        code: "",
        workstation_id: "",
        status: "operational",
        capabilities: [],
        hourly_rate: 0,
      });
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save equipment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text !bg-red-500 hover:bg-red-400"
        onClick={onClose}
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        form="equipment-form"
        type="submit"
        size="small"
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header={item?.id ? "Edit Equipment" : "Add Equipment"}
        visible={visible}
        onHide={onClose}
        footer={footer}
        style={{ width: "500px" }}
      >
        <p className="mb-4">
          Fields marked with <span className="text-red-500">*</span> are mandatory.
        </p>
        <form id="equipment-form" onSubmit={handleSave} className="grid gap-4">
          <div>
            <label>Name<span className="text-red-500">*</span></label>
            <InputText
              name="name"
              value={formState.name || ""}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label>Code<span className="text-red-500">*</span></label>
            <InputText
              name="code"
              value={formState.code || ""}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label>Workstation<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.workstation_id}
              options={workCenters.map((w) => ({ label: w.name, value: w.id }))}
              onChange={(e) => setFormState((prev) => ({ ...prev, workstation_id: e.value }))}
              placeholder="Select Workstation"
              loading={workCentersLoading}
              className="w-full"
            />
          </div>

          <div>
            <label>Status<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.status}
              options={statusOptions}
              onChange={(e) => setFormState((prev) => ({ ...prev, status: e.value }))}
              placeholder="Select Status"
              className="w-full"
            />
          </div>

          <div>
            <label>Capabilities<span className="text-red-500">*</span></label>
            <MultiSelect
              value={formState.capabilities || []}
              options={capabilityOptions}
              onChange={(e) => setFormState((prev) => ({ ...prev, capabilities: e.value }))}
              placeholder="Select Capabilities"
              display="chip"
              className="w-full"
            />
          </div>

          <div>
            <label>Hourly Rate<span className="text-red-500">*</span></label>
            <InputNumber
              value={formState.hourly_rate || 0}
              onValueChange={(e) => setFormState((prev) => ({ ...prev, hourly_rate: e.value || 0 }))}
              mode="decimal"
              min={0}
              className="w-full"
              placeholder="0.00"
              useGrouping={false}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifyItem;
