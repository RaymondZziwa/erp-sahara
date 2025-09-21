import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

// Example options (replace with API data)
const warehouses = [
  { label: "Main Warehouse", value: "b1a2c3d4-5678-4ef1-9012-abcdef123456" },
  { label: "Secondary Warehouse", value: "x9y8z7w6-1234-4ef1-9012-abcdef654321" },
];

const items = [
  { label: "Steel Rod", value: "f2a86d55-14f2-4c3f-99e6-3c2ef8857b8a" },
  { label: "Cement Bag", value: "a1b2c3d4-14f2-4c3f-99e6-3c2ef8857zzz" },
];

const uoms = [
  { label: "Kilogram (kg)", value: "d3f4567a-89b0-4cde-9012-abcdef987654" },
  { label: "Bag", value: "u1o2m3i4-5678-4cde-9012-abcdef444321" },
];

const steps = [
  { label: "Mixing", value: "e1f2a3b4-5678-4cde-9012-abcdef987321" },
  { label: "Packaging", value: "s1t2e3p4-5678-4cde-9012-abcdef123123" },
];

export default function RecordProductionOutput() {
  const [formData, setFormData] = useState({
    warehouse_id: "",
    items: [
      {
        item_id: "",
        uom_id: "",
        quantity: 0,
        step_id: "",
      },
    ],
  });

  const handleSubmit = () => {
    console.log("Submitting Payload:", formData);
    // API call here...
  };

  return (
    <div className="p-4 space-y-4 border rounded shadow-md bg-white">
      {/* Warehouse */}
      <div>
        <label className="block mb-2 font-medium">Warehouse</label>
        <Dropdown
          value={formData.warehouse_id}
          options={warehouses}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, warehouse_id: e.value }))
          }
          placeholder="Select Warehouse"
          className="w-full"
        />
      </div>

      {/* Items (only 1 for now) */}
      {formData.items.map((item, idx) => (
        <div
          key={idx}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          {/* Item */}
          <div>
            <label className="block mb-2 font-medium">Item</label>
            <Dropdown
              value={item.item_id}
              options={items}
              onChange={(e) =>
                setFormData((prev) => {
                  const updated = [...prev.items];
                  updated[idx].item_id = e.value;
                  return { ...prev, items: updated };
                })
              }
              placeholder="Select Item"
              className="w-full"
            />
          </div>

          {/* UOM */}
          <div>
            <label className="block mb-2 font-medium">UOM</label>
            <Dropdown
              value={item.uom_id}
              options={uoms}
              onChange={(e) =>
                setFormData((prev) => {
                  const updated = [...prev.items];
                  updated[idx].uom_id = e.value;
                  return { ...prev, items: updated };
                })
              }
              placeholder="Select UOM"
              className="w-full"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block mb-2 font-medium">Quantity</label>
            <InputNumber
              value={item.quantity}
              onValueChange={(e) =>
                setFormData((prev) => {
                  const updated = [...prev.items];
                  updated[idx].quantity = e.value ?? 0;
                  return { ...prev, items: updated };
                })
              }
              className="w-full"
              min={0}
            />
          </div>

          {/* Step */}
          <div>
            <label className="block mb-2 font-medium">Step</label>
            <Dropdown
              value={item.step_id}
              options={steps}
              onChange={(e) =>
                setFormData((prev) => {
                  const updated = [...prev.items];
                  updated[idx].step_id = e.value;
                  return { ...prev, items: updated };
                })
              }
              placeholder="Select Step"
              className="w-full"
            />
          </div>
        </div>
      ))}

      {/* Submit */}
      <Button
        label="Submit"
        icon="pi pi-check"
        onClick={handleSubmit}
        className="w-full"
      />
    </div>
  );
}
