import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import useAuth from "../../../../hooks/useAuth";
import useProductionLines from "../../../../hooks/manufacturing/workCenter/useProductionLines";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import { createRequest } from "../../../../utils/api";

import useItems from "../../../../hooks/inventory/useItems";
import { ProductionPlanMaterial } from "../../../../redux/slices/types/manufacturing/ProductionPlanMaterials";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ProductionPlanMaterial;
  onSave: () => void;
  productionPlanId: string;
}

interface ProductionPlanMaterialAdd {
  production_plan_id: number;
  materials: Material[];
}

interface Material {
  item_id: string;
  material_required_date: string;
  quantity: string;
  material_cost: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  productionPlanId,
}) => {
  const [formState, setFormState] = useState<
    Partial<ProductionPlanMaterialAdd>
  >({
    materials: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: productionPlans, loading: productionPlansLoading } =
    useProductionLines();

  const { data: items, loading: itemsLoading } = useItems();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({ materials: [] });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      const updatedmaterials = [...(formState.materials || [])];
      updatedmaterials[index] = {
        ...updatedmaterials[index],
        [name]: value,
      };
      setFormState((prevState) => ({
        ...prevState,
        materials: updatedmaterials,
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
    field: "material_required_date",
    index: number
  ) => {
    const updatedmaterials = [...(formState.materials || [])];
    updatedmaterials[index] = {
      ...updatedmaterials[index],
      [field]: value.toISOString(),
    };
    setFormState((prevState) => ({
      ...prevState,
      materials: updatedmaterials,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.production_plan_id || !formState.materials?.length) {
      setIsSubmitting(false);
      return;
    }

    const data: Partial<ProductionPlanMaterialAdd> = {
      ...formState,
      materials: formState.materials.map((schedule) => ({
        ...schedule,
        material_required_date: new Date(schedule.material_required_date)
          .toISOString()
          .slice(0, 10),
      })),
      production_plan_id: Number(productionPlanId),
      // quantity:Number(formState.materials[0].quantity),
    };

    let isoString = formState.materials[0].material_required_date;

    // Convert to MySQL-compatible format (YYYY-MM-DD HH:MM:SS)
    let mysqlDate = isoString.replace("T", " ").replace("Z", "");
    console.log(mysqlDate);

    const updateData = {
      production_plan_id: Number(productionPlanId),
      item_id: formState.materials[0].item_id,
      material_required_date: mysqlDate,
      quantity: formState.materials[0].quantity,
      material_cost: formState.materials[0].material_cost,
    };
    console.log(updateData);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.PRODUCTION_PLAN_MATERIALS.UPDATE(
          item.id.toString()
        )
      : MANUFACTURING_ENDPOINTS.PRODUCTION_PLAN_MATERIALS.ADD;

    await createRequest(
      endpoint,
      token.access_token,
      item?.id ? updateData : data,
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
      materials: [
        ...(prevState.materials || []),
        {
          item_id: "",
          material_cost: "",
          material_required_date: "",
          quantity: "",
        },
      ],
    }));
  };

  const removeScheduleItem = (index: number) => {
    const updatedmaterials = formState.materials?.filter((_, i) => i !== index);
    setFormState((prevState) => ({
      ...prevState,
      materials: updatedmaterials,
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
          {formState.materials?.map((bomItem, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end"
            >
              <Dropdown
                filter
                name="item_id"
                loading={itemsLoading}
                value={bomItem.item_id}
                options={items.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                onChange={(e) => handleInputChange(e as any, index)}
                placeholder="Work Order"
              />
              <InputText
                name="material_cost"
                value={bomItem.material_cost}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Cost"
              />
              <InputText
                name="quantity"
                value={bomItem.quantity}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Quantity"
              />

              <Calendar
                value={new Date(bomItem.material_required_date)}
                onChange={(e) =>
                  handleDateChange(
                    e.value as Date,
                    "material_required_date",
                    index
                  )
                }
                placeholder="Start Time"
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
