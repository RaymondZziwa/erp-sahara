// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { TabView, TabPanel } from "primereact/tabview";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useBudgets from "../../../hooks/budgets/useBudgets";
import useBudgetCategories from "../../../hooks/budgets/useBudgetCategories";
import useProjects from "../../../hooks/projects/useProjects";
import useChartOfAccounts from "../../../hooks/accounts/useChartOfAccounts";
import useAssetsAccounts from "../../../hooks/accounts/useAssetsAccounts";
import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Budget;
  onSave: () => void;
}

interface BudgetAllocation {
  name: string;
  project_id: string;
  activity_id: string;
  allocated_amount: number | null;
  description: string;
}

interface BudgetItem {
  name: string;
  type: string;
  amount: number | "";
  currency_id: number;
  chart_of_account_id: string;
  budget_allocation_id: string | null;
  description: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    parent_id: null,
    budget_category_id: "",
  });

  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const { token } = useAuth();
  const { data: budgets } = useBudgets();
  const { data: categories = [] } = useBudgetCategories();
  const { data: projects } = useProjects();
  const { expenseAccounts, incomeAccounts } = useAssetsAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        description: item.description || "",
        parent_id: item.parent_id || null,
        budget_category_id: item.budget_category_id || "",
      });
      // You might want to load existing allocations and items here if editing
    } else {
      setFormState({
        name: "",
        description: "",
        parent_id: null,
        budget_category_id: "",
      });
      setAllocations([]);
      setItems([]);
    }
  }, [item]);

  const fetchActivitiesByProject = async (projectId: string) => {
    try {
      const res = await createRequest(
        `/projects/${projectId}/activities`,
        token.access_token
      );
      setActivities(res.activities || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAllocationChange = (index: number, field: string, value: any) => {
    const updatedAllocations = [...allocations];
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      [field]: value,
      ...(field === "project_id" ? { activity_id: "" } : {}),
    };
    setAllocations(updatedAllocations);

    if (field === "project_id") {
      fetchActivitiesByProject(value);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const addAllocation = () => {
    setAllocations([
      ...allocations,
      {
        name: "",
        project_id: "",
        activity_id: "",
        allocated_amount: null,
        description: "",
      },
    ]);
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        type: "",
        amount: "",
        currency_id: item?.currency_id || 0,
        chart_of_account_id: "",
        budget_allocation_id: null,
        description: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name || !formState.budget_category_id) {
      console.log("Missing required fields");
      setIsSubmitting(false);
      return;
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? BUDGETS_ENDPOINTS.BUDGETS.UPDATE(item.id.toString())
      : BUDGETS_ENDPOINTS.BUDGETS.ADD;

    const payload = {
      ...formState,
      parent_id: formState.parent_id ?? null,
      allocations,
      items,
    };

    await createRequest(endpoint, token.access_token, payload, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="!bg-red-500 hover:!bg-red-400 text-white"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        form="budget-form"
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        disabled={isSubmitting}
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Budget" : "Add Budget"}
      visible={visible}
      className="max-w-4xl w-full"
      footer={footer}
      onHide={onClose}
    >
      <form id="budget-form" onSubmit={handleSubmit}>
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Basic Info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="budget_category_id" className="block mb-1">
                  Budget Category
                </label>
                <Dropdown
                  id="budget_category_id"
                  name="budget_category_id"
                  value={formState.budget_category_id}
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      budget_category_id: e.value,
                    }))
                  }
                  className="w-full"
                  placeholder="Select Category"
                />
              </div>

              <div>
                <label htmlFor="name" className="block mb-1">
                  Budget Name
                </label>
                <InputText
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              

              <div className="md:col-span-2">
                <label htmlFor="description" className="block mb-1">
                  Description
                </label>
                <InputTextarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="parent_id" className="block mb-1">
                  Parent Budget (<span className="font-bold">Optional</span>)
                </label>
                <Dropdown
                  id="parent_id"
                  name="parent_id"
                  value={formState.parent_id}
                  options={budgets.map((b) => ({
                    label: b.name,
                    value: b.id,
                  }))}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      parent_id: e.value,
                    }))
                  }
                  className="w-1/2"
                  showClear
                  placeholder="Select parent budget"
                />
              </div>
            </div>
          </TabPanel>

          {/* <TabPanel header="Allocations">
            <div className="space-y-4 mt-4">
              {allocations.map((allocation, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
                  <div>
                    <label className="block mb-1">Name</label>
                    <InputText
                      value={allocation.name}
                      onChange={(e) =>
                        handleAllocationChange(index, "name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Project</label>
                    <Dropdown
                      placeholder="Select Project"
                      value={allocation.project_id}
                      options={projects?.map((proj) => ({
                        label: proj.name,
                        value: proj.id,
                      })) || []}
                      onChange={(e) =>
                        handleAllocationChange(index, "project_id", e.value)
                      }
                      filter
                      showClear
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Activity</label>
                    <Dropdown
                      placeholder="Select Activity"
                      value={allocation.activity_id}
                      options={activities.map((act) => ({
                        label: act.name,
                        value: act.id,
                      }))}
                      onChange={(e) =>
                        handleAllocationChange(index, "activity_id", e.value)
                      }
                      disabled={!allocation.project_id}
                      filter
                      showClear
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Allocated Amount</label>
                    <InputNumber
                      value={allocation.allocated_amount}
                      onValueChange={(e) =>
                        handleAllocationChange(index, "allocated_amount", e.value)
                      }
                      mode="currency"
                      currency="USD"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1">Description</label>
                    <InputText
                      value={allocation.description}
                      onChange={(e) =>
                        handleAllocationChange(index, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="p-button-danger p-button-outlined !bg-red-500"
                      onClick={() => removeAllocation(index)}
                      size="small"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                label="Add Allocation"
                icon="pi pi-plus"
                onClick={addAllocation}
                className="w-max"
                size="small"
              />
            </div>
          </TabPanel> */}

          <TabPanel header="Items">
  <div className="space-y-4 mt-4">
    {items.map((item, index) => (
      <div key={index} className=" gap-1 p-1 border rounded">
        
        <div className="flex flex-row gap-2 w-full">
          {/* First Row - All inputs except description */}
        <div className="flex flex-row gap-2 w-full">
          <div className="col-span-3">
            <label className="block mb-1">Name</label>
            <InputText
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
              required
            />
          </div>
          
          <div className="col-span-2">
            <label className="block mb-1">Type</label>
            <Dropdown
              placeholder="Select Type"
              value={item.type}
              options={[
                { label: "Expense", value: "expense" },
                { label: "Revenue", value: "revenue" },
              ]}
              onChange={(e) => handleItemChange(index, "type", e.value)}
            />
          </div>
          
          <div className="col-span-2">
            <label className="block mb-1">Amount</label>
            <InputNumber
              value={item.amount}
              onValueChange={(e) => handleItemChange(index, "amount", e.value || "")}
              mode="currency"
              currency="TZS"
              required
            />
          </div>
          
          <div className="col-span-3">
            <label className="block mb-1">Account</label>
            <Dropdown
              filter
              value={item.chart_of_account_id}
              options={
                (item.type === "revenue" ? incomeAccounts : expenseAccounts || []).map(
                  (acc) => ({ label: acc.name, value: acc.id })
                )
              }
              onChange={(e) => handleItemChange(index, "chart_of_account_id", e.value)}
              placeholder="Select Account"
            />
          </div>
        </div>
        </div>
        {/* Second Row - Full width description */}
        <div className="col-span-full">
          <label className="block mb-1">Description</label>
          <InputTextarea
            rows={4}
            value={item.description}
            onChange={(e) => handleItemChange(index, "description", e.target.value)}
            className="w-3/4"
          />
        </div>
        
        {/* Delete Button - Bottom right */}
        <div className="col-span-full flex justify-end">
          <Button
            type="button"
            icon="pi pi-trash"
            className="p-button-danger p-button-outlined !bg-red-500 mt-2"
            onClick={() => removeItem(index)}
            size="small"
          />
        </div>
      </div>
    ))}
    
    <Button
      type="button"
      label="Add Item"
      icon="pi pi-plus"
      onClick={addItem}
      className="w-max"
      size="small"
    />
  </div>
</TabPanel>
        </TabView>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;