import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import useAuth from "../../../../hooks/useAuth";
import useProductionLines from "../../../../hooks/manufacturing/workCenter/useProductionLines";
import { ProductionPlanSchedule } from "../../../../redux/slices/types/manufacturing/ProductionPlanSchedule";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import { createRequest } from "../../../../utils/api";
import useWorkCenterOrders from "../../../../hooks/manufacturing/workCenter/useWorkCentersOrders";
import useEquipment from "../../../../hooks/manufacturing/workCenter/useEquipment";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ProductionPlanSchedule;
  onSave: () => void;
  productionPlanId: string;
}

interface ProductionPlanScheduleAdd {
  production_plan_id: number;
  schedules: Schedule[];
}

interface Schedule {
  work_order_id: number;
  machine_id: number;
  start_time: string;
  end_time: string;
  description: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  productionPlanId,
}) => {
  const [formState, setFormState] = useState<
    Partial<ProductionPlanScheduleAdd>
  >({
    schedules: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: productionPlans, loading: productionPlansLoading } =
    useProductionLines();
  const { data: workOrders, loading: workOrdersLoading } =
    useWorkCenterOrders();
  const { data: equipment, loading: equipmentLoading } = useEquipment();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({ schedules: [] });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      const updatedSchedules = [...(formState.schedules || [])];
      updatedSchedules[index] = {
        ...updatedSchedules[index],
        [name]: value,
      };
      setFormState((prevState) => ({
        ...prevState,
        schedules: updatedSchedules,
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (
    value: Date,
    field: "start_time" | "end_time",
    index: number
  ) => {
    const updatedSchedules = [...(formState.schedules || [])];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value.toISOString(),
    };
    setFormState((prevState) => ({
      ...prevState,
      schedules: updatedSchedules,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.production_plan_id || !formState.schedules?.length) {
      setIsSubmitting(false);
      return;
    }

    const data: Partial<ProductionPlanScheduleAdd> = {
      ...formState,
      production_plan_id: Number(productionPlanId),
      schedules: formState.schedules.map((schedule) => ({
        ...schedule,
        start_time: new Date(schedule.start_time).toISOString().slice(0, 10),
        end_time: new Date(schedule.end_time).toISOString().slice(0, 10),
      })),
    };

    const updateData = {
      production_plan_id: Number(productionPlanId),
      machine_id: formState.schedules[0].machine_id,
      start_time: new Date(formState.schedules[0].start_time)
        .toISOString()
        .slice(0, 10),
      end_time: new Date(formState.schedules[0].end_time)
        .toISOString()
        .slice(0, 10),
      description: formState.schedules[0].description,
      work_order_id: formState.schedules[0].work_order_id,
    };

    let actualData = item?.id ? updateData : data;
    console.log("actualData", actualData);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.PRODUCTION_PLAN_SCHEDULES.UPDATE(
          item.id.toString()
        )
      : MANUFACTURING_ENDPOINTS.PRODUCTION_PLAN_SCHEDULES.ADD;

    await createRequest(
      endpoint,
      token.access_token,
      actualData,
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const addScheduleItem = () => {
    setFormState((prevState) => ({
      ...prevState,
      schedules: [
        ...(prevState.schedules || []),
        {
          work_order_id: 0,
          machine_id: 0,
          start_time: "",
          end_time: "",
          description: "",
        },
      ],
    }));
  };

  const removeScheduleItem = (index: number) => {
    const updatedSchedules = formState.schedules?.filter((_, i) => i !== index);
    setFormState((prevState) => ({
      ...prevState,
      schedules: updatedSchedules,
    }));
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
      header={item?.id ? "Edit Plan Schedule" : "Add Plan Schedule"}
      visible={visible}
      className="w-full sm:w-4/5 md:w-1/2"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="lead-form"
        onSubmit={handleSave}
        className="space-y-4 grid grid-cols-1 gap-4"
      >
        <div className="flex flex-col space-y-2">
          <label htmlFor="production_plan_id" className="text-lg font-medium">
            Production Plan
          </label>
          <Dropdown
            id="production_plan_id"
            name="production_plan_id"
            value={formState.production_plan_id}
            options={productionPlans.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            required
            filter
            loading={productionPlansLoading}
            onChange={(e) => handleInputChange(e as any)}
            placeholder="Select an Item"
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium">Schedule Items</label>
          {formState.schedules?.map((bomItem, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end"
            >
              <Dropdown
                name="work_order_id"
                loading={workOrdersLoading}
                value={bomItem.work_order_id}
                options={workOrders.map((item) => ({
                  value: item.id,
                  label: item.order_number,
                }))}
                onChange={(e) => handleInputChange(e as any, index)}
                placeholder="Work Order"
              />
              <Dropdown
                name="machine_id"
                loading={equipmentLoading}
                value={bomItem.machine_id}
                options={equipment.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                onChange={(e) => handleInputChange(e as any, index)}
                placeholder="Machine"
              />
              <Calendar
                value={new Date(bomItem.start_time)}
                onChange={(e) =>
                  handleDateChange(e.value as Date, "start_time", index)
                }
                placeholder="Start Time"
              />
              <Calendar
                value={new Date(bomItem.end_time)}
                onChange={(e) =>
                  handleDateChange(e.value as Date, "end_time", index)
                }
                placeholder="End Time"
              />
              <InputText
                name="description"
                value={bomItem.description}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Description"
              />
              <Button
                type="button"
                icon="pi pi-trash"
                onClick={() => removeScheduleItem(index)}
                className="p-button-danger !bg-red-500"
              />
            </div>
          ))}
          <Button
            type="button"
            label="Add Schedule"
            icon="pi pi-plus"
            onClick={addScheduleItem}
            className="p-button-info mt-2 w-max"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
