import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";

import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import useItems from "../../../hooks/inventory/useItems";
import { createRequest } from "../../../utils/api";
import { Variant } from "../../../redux/slices/types/inventory/Variants";
import { Column } from "primereact/column";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Variant>;
  onSave: () => void;
}

interface NewVariant {
  item_id: number;
  name: string;
  sku: string;
  price: number | string;
  stock: number;
  attributes: { key: string; value: string }[];
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem: Partial<NewVariant> = {
    attributes: [],
  };

  const [formState, setFormState] = useState<Partial<NewVariant>>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ key: "", value: "" });

  const { token } = useAuth();
  const { data: items } = useItems();


  useEffect(() => {
    if (item) {
      const parsedAttributes = item.attributes
        ? JSON.parse(item.attributes as string).map((value: string) => ({
            key: "Color", // Assuming the key is "Color" here
            value,
          }))
        : [];

      setFormState({
        ...item,
        attributes: parsedAttributes,
      });
    } else {
      setFormState(initialItem);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e: DropdownChangeEvent) => {
    const { name } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.item_id || !formState.item_id) {
      setIsSubmitting(false);
      return;
    }

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? INVENTORY_ENDPOINTS.VARIANTS.UPDATE(item.id.toString())
        : INVENTORY_ENDPOINTS.VARIANTS.ADD;

      const data = {
        ...formState,
        attributes: formState.attributes?.map((attr) => attr.value) || [],
      };

      await createRequest(endpoint, token.access_token, data, onSave, method);
      setIsSubmitting(false);

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving item", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAttribute = () => {
    setFormState((prevState) => ({
      ...prevState,
      attributes: [...(prevState.attributes || []), newAttribute],
    }));
    setNewAttribute({ key: "", value: "" });
  };

  const deleteAttribute = (index: number) => {
    setFormState((prevState) => ({
      ...prevState,
      attributes: (prevState.attributes || []).filter((_, i) => i !== index),
    }));
  };

  const footer = (
    <div className="flex justify-end space-x-2">
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
        type="submit"
        form="item-form"
        size="small"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Variant" : "Add Variant"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4"
      >
        <div className="p-field">
          <label htmlFor="item_id">Item</label>
          <Dropdown
            name="item_id"
            value={formState.item_id}
            onChange={handleDropdownChange}
            options={items}
            optionLabel="name"
            optionValue="id"
            placeholder="Select item"
            filter
            className="w-full md:w-14rem"
          />
        </div>
        <div className="p-field">
          <label htmlFor="price">Price</label>
          <InputText
            id="price"
            name="price"
            type="number"
            value={formState.price?.toString() || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="sku">SKU</label>
          <InputText
            id="sku"
            name="sku"
            value={formState.sku?.toString() || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="stock">Stock</label>
          <InputText
            id="stock"
            name="stock"
            type="number"
            value={formState.stock?.toString() || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field col-span-2">
          <label htmlFor="attributes">Attributes</label>
          <div className="mb-3">
            <div className="flex gap-2 mb-2">
              <InputText
                value={newAttribute.key}
                placeholder="Key"
                onChange={(e) =>
                  setNewAttribute((prev) => ({ ...prev, key: e.target.value }))
                }
                className="w-1/2"
              />
              <InputText
                value={newAttribute.value}
                placeholder="Value"
                onChange={(e) =>
                  setNewAttribute((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                className="w-1/2"
              />
              <Button
                label="Add"
                icon="pi pi-plus"
                onClick={addAttribute}
                disabled={!newAttribute.key || !newAttribute.value}
                className="p-button-sm"
              />
            </div>
            <DataTable value={formState.attributes} className="p-datatable-sm">
              <Column field="key" header="Key" />
              <Column field="value" header="Value" />
              <Column
                header="Actions"
                body={(_, col) => (
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    className="p-button-danger p-button-sm"
                    onClick={() => deleteAttribute(col.rowIndex)}
                  />
                )}
              />
            </DataTable>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
