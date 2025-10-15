import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import useBudgets from "../../../../hooks/budgets/useBudgets";
import useDepartments from "../../../../hooks/hr/useDepartments";
import useTrucks from "../../../../hooks/inventory/useTrucks";
import useProjects from "../../../../hooks/projects/useProjects";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { FuelRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useFuelRequisitions from "../../../../hooks/accounts/cash_requisitions/useFuelRequisitions";
import { toast } from "react-toastify";
import { InputTextarea } from "primereact/inputtextarea";

interface DialogState {
    currentAction: "add" | "edit" | "" ;
    selectedItem?: FuelRequisition;
  }
  
  interface Props {
    dialogState: DialogState;
    setDialogState: (state: DialogState) => void;
    requisition?: FuelRequisition;
  }

const AddorModify: React.FC<Props> = ({ dialogState, setDialogState }) => {
  const { data: departments } = useDepartments();
  const { data: trucks } = useTrucks();
  const { data: projects } = useProjects();
    const { data: budgets } = useBudgets();
    const { refresh } = useFuelRequisitions()
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
    
    const selectedBudget = budgets.find((budgets) => budgets.id === selectedBudgetId)

  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
    
  const handleSubmit = async () => {
      try {
    setIsSubmitting(true);
      const payload = {
        ...formData,
        budget_item_id: formData.budget_item_id || null,
          project_id: formData.project_id || null,
          last_quantity_fuel_used: formData.last_quantity_fuel_used.toString(),
          last_mileage: formData.last_mileage.toString()
      };

      if (dialogState.currentAction === "add") {
        await apiRequest(
          ACCOUNTS_ENDPOINTS.FUEL_REQUISITIONS.ADD,
          "POST",
          token,
          payload
        );
        toast.success("Requisition saved successfully")
      } else if (dialogState.currentAction === "edit" && dialogState?.selectedItem) {
        await apiRequest(
          ACCOUNTS_ENDPOINTS.FUEL_REQUISITIONS.UPDATE(dialogState.selectedItem.id),
          "POST",
          token,
          payload
        );
        toast.success("Requisition modified successfully")
      }

        refresh()
          setDialogState({ selectedItem: undefined, currentAction: "" });
          setIsSubmitting(false);
    } catch (err) {
      toast.error(err?.response?.data?.message)
          console.error("Error submitting requisition:", err);
          setIsSubmitting(false);
    }
  };

const [formData, setFormData] = useState({
  department_id: "",
  truck_id: "",
  budget_item_id: null,
  project_id: null,
  amount: 0,
  trip: "",
  total_round_kilometers: 0,
  reason: "",
  last_quantity_fuel_used: "",
  last_mileage: "",
});



useEffect(() => {
    if (dialogState.currentAction === "edit" && dialogState.selectedItem) {
      const item = dialogState.selectedItem;
      setFormData({
        department_id: item.department_id,
        truck_id: item.truck_id,
        budget_item_id: item.budget_item_id,
        project_id: item.project_id,
        amount: item.amount || 0,
        trip: item.trip || "",
        total_round_kilometers: item.total_round_kilometers || 0,
        reason: item.reason || "",
        last_quantity_fuel_used: item.last_quantity_fuel_used || "",
        last_mileage: item.last_mileage || "",
      });
      setSelectedBudgetId(item.budget_item_id || null);
    } else if (dialogState.currentAction === "add") {
      // reset form when adding new
      setFormData({
        department_id: "",
        truck_id: "",
        budget_item_id: null,
        project_id: null,
        amount: 0,
        trip: "",
        total_round_kilometers: 0,
        reason: "",
        last_quantity_fuel_used: "",
        last_mileage: "",
      });
      setSelectedBudgetId(null);
    }
  }, [dialogState.selectedItem, dialogState.currentAction]);
  
  

  return (
    <Dialog
      header={
        dialogState.currentAction === "add"
          ? "Add Fuel Requisition"
          : "Edit Fuel Requisition"
      }
      visible={!!dialogState.currentAction}
      style={{ width: "40vw" }}
      modal
      onHide={() =>
        setDialogState({ selectedItem: undefined, currentAction: "" })
      }
    >
         <div className="p-fluid grid grid-cols-2 gap-4">
  {/* Department */}
  <div>
    <label htmlFor="department">Department<span className="text-red-500">*</span></label>
    <Dropdown
      id="department"
      value={formData.department_id}
      options={departments?.map((dept) => ({
        label: dept.name,
        value: dept.id,
      }))}
      onChange={(e) =>
        setFormData({ ...formData, department_id: e.value })
      }
      placeholder="Select Department"
    />
  </div>

  {/* Truck */}
  <div>
    <label htmlFor="truck">Truck<span className="text-red-500">*</span></label>
    <Dropdown
      id="truck"
      value={formData.truck_id}
      options={trucks?.map((truck) => ({
        label: truck.license_plate,
        value: truck.id,
      }))}
      onChange={(e) =>
        setFormData({ ...formData, truck_id: e.value })
      }
      placeholder="Select Truck"
    />
  </div>

  {/* Budget */}
  <div>
    <label htmlFor="budget">Budget</label>
    <Dropdown
      id="budget"
      value={selectedBudgetId}
      options={budgets?.map((budget) => ({
        label: budget.name,
        value: budget.id,
      }))}
      onChange={(e) => setSelectedBudgetId(e.value)}
      placeholder="Select Budget"
    />
  </div>

  {/* Budget Item */}
  <div>
    <label htmlFor="budget_item_id">Budget Item</label>
    <Dropdown
      id="budget_item_id"
      value={formData.budget_item_id}
      options={selectedBudget?.items?.map((item) => ({
        label: item.name,
        value: item.id,
      }))}
      onChange={(e) =>
        setFormData({ ...formData, budget_item_id: e.value })
      }
      placeholder="Select Budget Item"
      showClear
    />
  </div>

  {/* Project */}
  <div>
    <label htmlFor="project_id">Project</label>
    <Dropdown
      id="project_id"
      value={formData.project_id}
      options={projects?.map((project) => ({
        label: project.name,
        value: project.id,
      }))}
      onChange={(e) =>
        setFormData({ ...formData, project_id: e.value })
      }
      placeholder="Select Project"
    />
  </div>

  {/* Quantity */}
  <div>
    <label htmlFor="quantity">Quantity (Liters)<span className="text-red-500">*</span></label>
    <InputNumber
      id="quantity"
      value={formData.amount}
      onValueChange={(e) =>
        setFormData({ ...formData, amount: e.value || 0 })
      }
      min={0}
      mode="decimal"
      showButtons
    />
  </div>

  {/* Trip */}
  <div>
    <label htmlFor="trip">Trip<span className="text-red-500">*</span></label>
    <InputText
      id="trip"
      value={formData.trip}
      onChange={(e) =>
        setFormData({ ...formData, trip: e.target.value })
      }
    />
  </div>

  {/* Total Round Kilometres */}
  <div>
    <label htmlFor="total_round_kilometers">Total Round Kilometres<span className="text-red-500">*</span></label>
    <InputNumber
      id="total_round_kilometers"
      value={formData.total_round_kilometers}
      onValueChange={(e) =>
        setFormData({ ...formData, total_round_kilometers: e.value || 0 })
      }
    />
  </div>


  {/* Last Fuel Used */}
  <div>
    <label htmlFor="last_quantity_fuel_used">Last Fuel Used (L)<span className="text-red-500">*</span></label>
    <InputNumber
      id="last_quantity_fuel_used"
      value={Number(formData.last_quantity_fuel_used)}
      onValueChange={(e) =>
        setFormData({ ...formData, last_quantity_fuel_used: e.value || 0 })
      }
      suffix="L"
      min={0}
    />
  </div>

  {/* Last Mileage */}
  <div>
    <label htmlFor="last_mileage">Last Mileage (km)<span className="text-red-500">*</span></label>
    <InputNumber
      id="last_mileage"
      value={Number(formData.last_mileage)}
      onValueChange={(e) =>
        setFormData({ ...formData, last_mileage: e.value || 0 })
      }
      suffix="km"
      min={0}
    />
              </div>
              {/* Reason */}
              <div className="col-span-2">
                <label htmlFor="reason">Reason<span className="text-red-500">*</span></label>
                <InputTextarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Fuel refill for delivery"
                  rows={3}    
                  autoResize         
                />
              </div>
            </div>
  
      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <Button
            label={isSubmitting ? "Saving..." : "Save"}
            disabled={isSubmitting}
            loading={isSubmitting}
            icon="pi pi-check"
            className="p-button-primary"
            onClick={handleSubmit}
        />
      </div>
    </Dialog>
  );  
};

export default AddorModify;
