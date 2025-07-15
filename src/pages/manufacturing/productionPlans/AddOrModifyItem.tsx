import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import useEmployees from "../../../hooks/hr/useEmployees";
import useEquipment from "../../../hooks/manufacturing/workCenter/useEquipment";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";
import { useParams } from "react-router-dom";


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
  const [formState, setFormState] = useState({
    machine_id: "",
    quantity: "",
    start_time: "",
    end_time: "",
    shift: "",
    assigned_operator_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {id} = useParams()
  const { token } = useAuth();
  const { data: equipment, loading: equipmentLoading } = useEquipment();
  const { data: operators, loading: operatorsLoading } = useEmployees(); // replace if different

  useEffect(() => {
    if (item) {
      setFormState({
        machine_id: item.machine_id || "",
        quantity: item.quantity || "",
        start_time: item.start_time || "",
        end_time: item.end_time || "",
        shift: item.shift || "",
        assigned_operator_id: item.assigned_operator_id || "",
      });
    } else {
      setFormState({
        machine_id: "",
        quantity: "",
        start_time: "",
        end_time: "",
        shift: "",
        assigned_operator_id: "",
      });
    }
  }, [item]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      machine_id: formState.machine_id,
      quantity: Number(formState.quantity),
      start_time: new Date(formState.start_time),
      end_time: new Date(formState.end_time),
      shift: formState.shift,
      assigned_operator_id: formState.assigned_operator_id,
    };

    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.PRODUCTION_PLAN_SCHEDULES.UPDATE(item.id.toString())
      : MANUFACTURING_ENDPOINTS.PRODUCTION_PLAN_SCHEDULES.ADD(id);

    const method = item?.id ? "PUT" : "POST";

    await createRequest(endpoint, token.access_token, payload, onSave, method);

    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:!bg-red-400 text-white"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="lead-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Machine Assignment" : "Assign Machine to Operator"}
      visible={visible}
      className="w-full sm:w-4/5 md:w-2/5"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="lead-form"
        onSubmit={handleSave}
        className="space-y-4 grid grid-cols-1 gap-4"
      >
        <Dropdown
          name="machine_id"
          value={formState.machine_id}
          options={equipment.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          onChange={handleInputChange}
          placeholder="Select Machine"
          filter
          loading={equipmentLoading}
          className="w-full"
        />

        <Dropdown
          name="assigned_operator_id"
          value={formState.assigned_operator_id}
          options={operators.map((op) => ({
            value: op.id,
            label: `${op.first_name} ${op.last_name}`,
          }))}
          onChange={handleInputChange}
          placeholder="Select Operator"
          filter
          loading={operatorsLoading}
          className="w-full"
        />

        <InputText
          name="quantity"
          value={formState.quantity}
          onChange={handleInputChange}
          placeholder="Quantity"
        />

        <Dropdown
          name="shift"
          value={formState.shift}
          options={[
            { label: "Morning", value: "morning" },
            { label: "Evening", value: "evening" },
            { label: "Night", value: "night" },
          ]}
          onChange={handleInputChange}
          placeholder="Select Shift"
        />

        <Calendar
          value={formState.start_time ? new Date(formState.start_time) : null}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              start_time: (e.value as Date).toISOString(),
            }))
          }
          showTime
          showIcon
          placeholder="Start Time"
        />

        <Calendar
          value={formState.end_time ? new Date(formState.end_time) : null}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              end_time: (e.value as Date).toISOString(),
            }))
          }
          showTime
          showIcon
          placeholder="End Time"
        />
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
