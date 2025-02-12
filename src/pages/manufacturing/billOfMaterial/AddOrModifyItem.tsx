import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { BillOfMaterial } from "../../../redux/slices/types/manufacturing/BillOfMaterial";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import useItems from "../../../hooks/inventory/useItems";
import { InputText } from "primereact/inputtext";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: BillOfMaterial;
  onSave: () => void;
}
interface BomAdd {
  item_id: number;
  version: string;
  bom_items: Bomitem[];
}

interface Bomitem {
  raw_material_id: number;
  quantity: number;
  unit_of_measurement: number;
}
const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<BomAdd>>({
    bom_items: [], // Initialize with an empty BOM item array
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: uom } = useUnitsOfMeasurement();
  const { data: items, loading: itemsLoading } = useItems();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
        bom_items: item.bo_items.map((item) => ({
          quantity: +item.quantity,
          raw_material_id: item.raw_material_id,
          unit_of_measurement: +item.unit_of_measurement,
        })),
      });
    } else {
      // console.log(item);

      setFormState({ bom_items: [] }); // Reset to an empty BOM item array for new items
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      // Update BOM item
      const updatedBomItems = [...(formState.bom_items || [])];
      updatedBomItems[index] = {
        ...updatedBomItems[index],
        [name]: value,
      };
      setFormState((prevState) => ({
        ...prevState,
        bom_items: updatedBomItems,
      }));
    } else {
      // Update main form field (e.g., version, item_id)
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: keyof BillOfMaterial, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (
      !formState.item_id ||
      !formState.version ||
      !formState.bom_items?.length
    ) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data: Partial<BillOfMaterial> = { ...formState };
    console.log("ff", data);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MANUFACTURING_ENDPOINTS.BILL_OF_MATERIAL.UPDATE(item.id.toString())
      : MANUFACTURING_ENDPOINTS.BILL_OF_MATERIAL.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const addBomItem = () => {
    setFormState((prevState) => ({
      ...prevState,
      bom_items: [
        ...(prevState.bom_items || []),
        {
          bill_of_material_id: 0,
          created_at: "",
          id: 0,
          quantity: 0,
          raw_material_id: 0,
          unit_of_measurement: 0,
          updated_at: "",
        },
      ],
    }));
  };

  const removeBomItem = (index: number) => {
    const updatedBomItems = formState.bom_items?.filter((_, i) => i !== index);
    setFormState((prevState) => ({
      ...prevState,
      bom_items: updatedBomItems,
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
      header={item?.id ? "Edit Bill Of Material" : "Add Bill Of Material"}
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
          <label htmlFor="item_id" className="text-lg font-medium">
            Item
          </label>
          <Dropdown
            id="item_id"
            name="item_id"
            value={formState.item_id}
            options={items.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            required
            filter
            loading={itemsLoading}
            onChange={(e) => handleSelectChange("item_id", e.value)}
            placeholder="Select an Item"
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="version" className="text-lg font-medium">
            Version
          </label>
          <InputText
            id="version"
            name="version"
            value={formState.version}
            onChange={handleInputChange} // Handle version input
            required
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium">Bill Of Material Items</label>
          {formState.bom_items?.map((bomItem, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
            >
              <div className="col-span-2">
                <label
                  htmlFor={`raw_material_id_${index}`}
                  className="text-lg font-medium"
                >
                  Raw Material
                </label>
                <Dropdown
                  id={`raw_material_id_${index}`}
                  name="raw_material_id"
                  value={bomItem.raw_material_id}
                  options={items.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  required
                  filter
                  onChange={(e) => handleInputChange(e as any, index)}
                  placeholder="Select Raw Material"
                  className="w-full"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor={`quantity_${index}`}
                  className="text-lg font-medium"
                >
                  Quantity
                </label>
                <InputNumber
                  id={`quantity_${index}`}
                  name="quantity"
                  value={bomItem.quantity}
                  onValueChange={(e) => handleInputChange(e as any, index)}
                  required
                  className="w-full"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor={`unit_of_measurement_${index}`}
                  className="text-lg font-medium"
                >
                  UOM
                </label>
                <Dropdown
                  id={`unit_of_measurement_${index}`}
                  name="unit_of_measurement"
                  value={bomItem.unit_of_measurement}
                  options={uom.map((unit) => ({
                    value: unit.id,
                    label: unit.name,
                  }))}
                  required
                  onChange={(e) => handleInputChange(e as any, index)}
                  placeholder="Select UOM"
                  className="w-full"
                />
              </div>

              <div className="col-span-2">
                <Button
                  icon="pi pi-trash"
                  onClick={() => removeBomItem(index)}
                  className="!bg-red-500  p-button-danger w-full"
                />
              </div>
            </div>
          ))}

          <Button
            label="Add BOM Item"
            icon="pi pi-plus"
            onClick={addBomItem}
            className="p-button-info mt-2"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
