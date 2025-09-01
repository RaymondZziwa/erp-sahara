import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../utils/api";
import useStoreRequisitions from "../../../../hooks/accounts/cash_requisitions/useStoreRequisitions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import useWarehouses from "../../../../hooks/inventory/useWarehouses";
import useDepartments from "../../../../hooks/hr/useDepartments";
import useEmployees from "../../../../hooks/hr/useEmployees";
import useItems from "../../../../hooks/inventory/useItems";
import useUnitsOfMeasurement from "../../../../hooks/inventory/useUnitsOfMeasurement";
import { StoreRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";

interface DialogState {
  currentAction: "add" | "edit" | "";
  selectedItem?: StoreRequisition;
}

interface AddorModifyProps {
  dialogState: DialogState;
  setDialogState: (state: DialogState) => void;
}

const AddorModify = ({
  dialogState,
  setDialogState,
}: AddorModifyProps) => {
  const { refresh } = useStoreRequisitions();
  const { data: warehouses } = useWarehouses();
  const { data: departments } = useDepartments();
  const { data: employees } = useEmployees();
  const { data: items } = useItems();
  const { data: uoms } = useUnitsOfMeasurement();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    department_id: "",        
    requested_by: "",   
    priority: "medium",
    items: [
      {
        item_id: "",    
        uom_id: "",    
        requested_quantity: 1,
        warehouse_id: "",
        specification: "",  
        purpose: "",   
      },
    ],
  });

  // Populate form when editing
  useEffect(() => {
    if (dialogState.currentAction === "edit" && dialogState.selectedItem) {
      setFormData(dialogState.selectedItem);
    }
  }, [dialogState.currentAction, dialogState.selectedItem]);

  const handleFormChange = (field: keyof StoreRequisition, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: "",
          uom_id: "",
          requested_quantity: 1,
          warehouse_id: "",
          specification: "",
          purpose: "",
        },
      ],
    }));
  };
  
  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      toast.warning("At least one item is required");
      return;
    }
    
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems.splice(index, 1);
      return { ...prev, items: updatedItems };
    });
  };

  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.department_id || !formData.requested_by) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    // Check items
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.item_id || !item.purpose || !item.requested_quantity) {
        toast.error(`Please fill all required fields for item ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  const priorityOptions = [
    //{ label: "Urgent", value: "urgent" },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ];
  
  const token = useSelector((state: RootState) => state.userAuth?.token);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true)
    try {
        if (dialogState.currentAction === "add") {
            await apiRequest(ACCOUNTS_ENDPOINTS.STORE_REQUISITIONS.ADD, "POST", token.access_token, formData);
            toast.success("Store requisition saved successfully")
      } else if (
        dialogState.currentAction === "edit" &&
        dialogState.selectedItem
        ) {
        await ACCOUNTS_ENDPOINTS.STORE_REQUISITIONS.UPDATE(dialogState?.selectedItem?.id)
        toast.success("Store requisition modified successfully");
        setIsSubmitting(false)
        }
        refresh();
        setDialogState({ selectedItem: undefined, currentAction: "" });    
    } catch (error) {
      console.error("Error submitting requisition:", error);
        toast.error(error?.response?.data?.message);
        setIsSubmitting(false)
    }
  };

  return (
    <Dialog
      header={
        dialogState.currentAction === "add"
          ? "Add Store Requisition"
          : "Edit Store Requisition"
      }
      visible={
        dialogState.currentAction === "add" ||
        dialogState.currentAction === "edit"
      }
      style={{ width: "90vw", maxWidth: "800px" }}
      onHide={() =>
        setDialogState({ selectedItem: undefined, currentAction: "" })
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Dropdown */}
        <div className="field">
          <label htmlFor="department">Department<span className="text-red-500">*</span></label>
          <Dropdown
            id="department"
            options={departments?.map((d) => ({ label: d.name, value: d.id })) || []}
            value={formData.department_id}
            onChange={(e) => handleFormChange("department_id", e.value)}
            placeholder="Select Department"
            filter
            className="w-full"
            required
          />
        </div>

        {/* Requested By Dropdown */}
        <div className="field">
          <label htmlFor="requested_by">Requested By<span className="text-red-500">*</span></label>
          <Dropdown
            id="requested_by"
            options={
              employees?.map((e) => ({
                label: `${e.first_name} ${e.last_name}`,
                value: e.id,
              })) || []
            }
            value={formData.requested_by}
            onChange={(e) => handleFormChange("requested_by", e.value)}
            placeholder="Select Employee"
            filter
            className="w-full"
            required
          />
        </div>

        {/* Priority */}
        <div className="field">
          <label htmlFor="priority">Priority<span className="text-red-500">*</span></label>
          <Dropdown
            id="priority"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => handleFormChange("priority", e.value)}
            placeholder="Select Priority"
            className="w-full"
            required
          />
        </div>

        {/* Items Section */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-semibold mb-2">Items</h4>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item */}
                  <div className="field">
                    <label htmlFor={`item-${index}`}>Item<span className="text-red-500">*</span></label>
                    <Dropdown
                      id={`item-${index}`}
                      options={items?.map((i) => ({ label: i.name, value: i.id })) || []}
                      value={item.item_id}
                      onChange={(e) => handleItemChange(index, "item_id", e.value)}
                      placeholder="Select Item"
                      filter
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Unit of Measure */}
                  <div className="field">
                    <label htmlFor={`uom-${index}`}>Unit of Measure<span className="text-red-500">*</span></label>
                    <Dropdown
                      id={`uom-${index}`}
                      options={uoms?.map((u) => ({ label: u.name, value: u.id })) || []}
                      value={item.uom_id}
                      onChange={(e) => handleItemChange(index, "uom_id", e.value)}
                      placeholder="Select UOM"
                      filter
                      className="w-full"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="field">
                    <label htmlFor={`quantity-${index}`}>Quantity<span className="text-red-500">*</span></label>
                    <InputNumber
                      id={`quantity-${index}`}
                      value={item.requested_quantity}
                      onValueChange={(e) =>
                        handleItemChange(index, "requested_quantity", e.value || 1)
                      }
                      min={1}
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Warehouse */}
                  <div className="field">
                    <label htmlFor={`warehouse-${index}`}>Preferred Warehouse<span className="text-red-500">*</span></label>
                    <Dropdown
                      id={`warehouse-${index}`}
                      options={warehouses?.map((w) => ({ label: w.name, value: w.id })) || []}
                      value={item.warehouse_id}
                      onChange={(e) => handleItemChange(index, "warehouse_id", e.value)}
                      placeholder="Select Warehouse"
                      filter
                      className="w-full"
                    />
                  </div>

                  {/* Specification */}
                  <div className="field md:col-span-2">
                    <label htmlFor={`specification-${index}`}>Specification<span className="text-red-500">*</span></label>
                    <InputText
                      id={`specification-${index}`}
                      value={item.specification}
                      onChange={(e) => handleItemChange(index, "specification", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Purpose */}
                  <div className="field md:col-span-2">
                    <label htmlFor={`purpose-${index}`}>Purpose<span className="text-red-500">*</span></label>
                    <InputText
                      id={`purpose-${index}`}
                      value={item.purpose}
                      onChange={(e) => handleItemChange(index, "purpose", e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger p-button-text"
                    onClick={() => removeItem(index)}
                    tooltip="Remove Item"
                    disabled={formData.items.length <= 1}
                  />
                </div>
              </div>
            ))}
            <Button icon="pi pi-plus" label="Add Item" onClick={addItem} className="p-button-outlined w-full" />
          </div>
        </div>

        {/* Cancel / Submit Buttons */}
        <div className="flex justify-end gap-2 mt-4 md:col-span-2">
         
        <Button
            label={
                isSubmitting
                ? "Saving..."
                : dialogState.currentAction === "add"
                ? "Create"
                : "Update"
            }
            disabled={isSubmitting}
            loading={isSubmitting}
            icon="pi pi-check"
            onClick={handleSubmit}
        />

        </div>
      </div>
    </Dialog>
  );
};

export default AddorModify;