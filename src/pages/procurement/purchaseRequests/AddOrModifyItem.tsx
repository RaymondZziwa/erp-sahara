import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import useItems from "../../../hooks/inventory/useItems";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
// import { UserAuthType } from "../../../redux/slices/types/user/userAuth";
import useDepartments from "../../../hooks/hr/useDepartments";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useEmployees from "../../../hooks/hr/useEmployees";
import useBudgets from "../../../hooks/budgets/useBudgets";
import { Budget } from "../../../redux/slices/types/budgets/Budget";

interface PurchaseRequestItem {
  item_id: number;
  quantity: string;
  specifications: string;
  purpose: string;
  cost_estimate: number;
  currency_id: string;
  budget_item_id: string | null;
}

interface PurchaseRequest {
  budget: string | null;
  id: number;
  title: string;
  request_comment: string;
  project_id: null;
  department_id: number;
  request_date: string;
  requested_by: number;
  approval_level: string;
  items: PurchaseRequestItem[];
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  purchaseRequest?: Partial<PurchaseRequest>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  purchaseRequest,
  onSave,
}) => {
  const initialItem: PurchaseRequestItem = {
    item_id: 0,
    quantity: "",
    specifications: "",
    purpose: "",
    cost_estimate: 0,
    currency_id: "",
    budget_item_id: null,
  };

  const initialState: PurchaseRequest = {
    id: 0,
    title: "",
    request_comment: "",
    project_id: null,
    department_id: 0,
    request_date: "",
    requested_by: 0,
    approval_level: "",
    budget: null,
    items: [initialItem],
  };

  const [formState, setFormState] = useState<PurchaseRequest>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const levels = useSelector((state: RootState) => state.levels.data);
  const { data: currencies } = useCurrencies();
  const { data: departments } = useDepartments();
  const { token } = useAuth();
  const { data: items } = useItems();
  const { data: employees } = useEmployees();
  const { data: budgets } = useBudgets();
  const [selectedBudget, setSelectedBudget] = useState<Budget>();

  useEffect(() => {
    if (purchaseRequest) {
      setFormState((prev) => {
        return {
          ...prev,
          requested_by: prev.requested_by,
          department_id: prev.department_id ?? null,
          project_id: null,
          request_comment: prev.request_comment ?? null,
        };
      });
    } else {
      setFormState(initialState);
    }
  }, [purchaseRequest]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemIndex?: number
  ) => {
    const { name, value } = e.target;
    if (itemIndex !== undefined) {
      setFormState((prevState) => ({
        ...prevState,
        items: prevState.items.map((item, index) =>
          index === itemIndex ? { ...item, [name]: value } : item
        ),
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleDropdownChange = (
    e: DropdownChangeEvent,
    itemIndex: number,
    field: string
  ) => {
    const { value } = e;
    setFormState((prevState) => ({
      ...prevState,
      items: prevState.items.map((item, index) =>
        index === itemIndex ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = () => {
    setFormState((prevState) => ({
      ...prevState,
      items: [...prevState.items, { ...initialItem }],
    }));
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setFormState((prevState) => ({
      ...prevState,
      items: prevState.items.filter((_, index) => index !== indexToRemove),
    }));
  };

  interface BudgetChangeEvent {
    target: {
      value: string | number;
    };
  }

  const handleBudget = (e: BudgetChangeEvent): void => {
    const { value } = e.target;

    const filteredBudget = budgets.filter((budget) => budget.id === value)[0];
    setSelectedBudget(filteredBudget);

    setFormState((prevState) => ({
      ...prevState,
      budget: String(value), // Convert value to string
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(formState);
    try {
      const method = formState.id ? "PUT" : "POST";
      const endpoint = formState.id
        ? API_ENDPOINTS.PURCHASE_REQUESTS.UPDATE(formState.id.toString())
        : API_ENDPOINTS.PURCHASE_REQUESTS.ADD;

      console.log("method", method);

      await createRequest(
        endpoint,
        token.access_token,
        formState,
        onSave,
        method
      );

      onSave();
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.log(error);
    }
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
        loading={isSubmitting}
        disabled={isSubmitting}
        label={formState.id ? "Update" : "Add"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={formState.id ? "Edit Purchase Request" : "Add Purchase Request"}
      visible={visible}
      style={{ width: "1025px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-field">
            <label htmlFor="name">Name</label>
            <InputText
              id="title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>
          <div className="p-field">
            <label htmlFor="name">Request Date</label>
            <InputText
              id="name"
              name="request_date"
              type="date"
              value={formState.request_date}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Add approval level
            </label>
            <select
              name="approval_level"
              value={formState.approval_level}
              onChange={(e) =>
                setFormState((prevState) => ({
                  ...prevState,
                  approval_level: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Approval Level</option>
              {levels &&
                levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Department</label>
            <select
              name="department_id"
              value={formState.department_id}
              onChange={(e) =>
                setFormState((prevState) => ({
                  ...prevState,
                  department_id: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Department</option>
              {departments &&
                departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Requested By</label>
            <select
              name="requested_by"
              value={formState.requested_by}
              onChange={(e) =>
                setFormState((prevState) => ({
                  ...prevState,
                  requested_by: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Employee</option>
              {employees &&
                employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Budget</label>
            <select
              name="budget"
              value={formState.budget ?? ""} // Convert null to an empty string
              onChange={(e) => handleBudget(e)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Budget</option>
              {budgets &&
                budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="p-field sm:col-span-2">
            <label htmlFor="request_comment">Request Comment</label>
            <InputTextarea
              id="request_comment"
              name="request_comment"
              value={formState.request_comment}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-4">
          <h3>Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-max table-auto">
              <thead>
                <tr>
                  <th className="border px-4 py-2 min-w-[150px]">Item</th>
                  <th className="border px-4 py-2 min-w-[120px]">Quantity</th>
                  <th className="border px-4 py-2 min-w-[150px]">
                    Budget Item
                  </th>
                  <th className="border px-4 py-2 min-w-[200px]">
                    Specifications
                  </th>
                  <th className="border px-4 py-2 min-w-[250px]">Purpose</th>
                  <th className="border px-4 py-2 min-w-[150px]">
                    Cost Estimate
                  </th>
                  <th className="border px-4 py-2 min-w-[120px]">Currency</th>
                  <th className="border px-4 py-2 min-w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {formState.items.map((item, index) => (
                  <tr key={index} className="whitespace-nowrap">
                    <td className="border px-4 py-2 min-w-[150px]">
                      <Dropdown
                        id={`item_id${index}`}
                        value={item.item_id}
                        onChange={(e) =>
                          handleDropdownChange(e, index, "item_id")
                        }
                        options={items}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select an item"
                        filter
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[120px]">
                      <InputText
                        id={`quantity_${index}`}
                        name="quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(e, index)}
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[150px]">
                      <Dropdown
                        id={`budget_item_id${index}`}
                        value={item.budget_item_id}
                        onChange={(e) =>
                          handleDropdownChange(e, index, "budget_item_id")
                        }
                        options={selectedBudget ? selectedBudget.items : []}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select an item"
                        filter
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[200px]">
                      <InputText
                        id={`specification_${index}`}
                        name="specifications"
                        type="text"
                        value={item.specifications}
                        onChange={(e) => handleInputChange(e, index)}
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[250px]">
                      <InputTextarea
                        id={`purpose_${index}`}
                        name="purpose"
                        value={item.purpose}
                        onChange={(e) => handleInputChange(e, index)}
                        rows={1}
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[150px]">
                      <InputText
                        id={`cost_estimate_${index}`}
                        name="cost_estimate"
                        type="number"
                        value={item.cost_estimate.toString()}
                        onChange={(e) => handleInputChange(e, index)}
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[120px]">
                      <Dropdown
                        id={`currency_${index}`}
                        value={item.currency_id}
                        onChange={(e) =>
                          handleDropdownChange(e, index, "currency_id")
                        }
                        options={currencies}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select currency"
                        filter
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[100px] text-center">
                      <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="text-red-500 cursor-pointer"
                        fontSize={20}
                        onClick={() => handleRemoveItem(index)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Button
              type="button"
              label="Add Item"
              icon="pi pi-plus"
              onClick={handleAddItem}
              className="p-button-secondary w-full sm:w-auto"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
