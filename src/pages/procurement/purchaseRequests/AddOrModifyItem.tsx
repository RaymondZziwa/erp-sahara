//@ts-nocheck
import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import { PurchaseRequest } from "../../../redux/slices/types/procurement/PurchaseRequests";
import useDepartments from "../../../hooks/hr/useDepartments";
import useEmployees from "../../../hooks/hr/useEmployees";
import useBudgets from "../../../hooks/budgets/useBudgets";
import { Icon } from "@iconify/react";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useItems from "../../../hooks/inventory/useItems";
import { Checkbox } from "primereact/checkbox";
import useServices from "../../../hooks/procurement/useServices";
import { baseURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import axios from "axios";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import useProcTypes from "../../../hooks/procurement/useProcTypes";

interface PurchaseRequestItem {
  id?: number;
  item_id: number;
  quantity: number;
  budget_item_id: number;
  uom: string;
  specifications: string;
  description: string;
  estimated_unit_price: number;
  currency_id: number;
  item_type: "Item" | "Service" | "None";
  custom_name?: string;
}

interface FormState extends Omit<PurchaseRequest, "items"> {
  items: PurchaseRequestItem[];
  priority: "Low" | "Medium" | "High";
}

type PurchaseRequestFormProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onSubmit: (data: FormData | PurchaseRequest) => void;
  products: { id: number; name: string; price: number; unit: string }[];
  currencies: { id: number; name: string }[];
  initialData?: PurchaseRequest;
};



const priorityOptions = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({
  visible,
  onClose,
  initialData,
  onSave,
}) => {

  useEffect(()=> {
    console.log('initpr', initialData)
  }, [])
  const { token, user } = useAuth();
  const { data: products } = useItems();
  const { data: services = [] } = useServices();
  const { data: departments } = useDepartments();
  const { data: employees } = useEmployees();
  const { data: budgets } = useBudgets();
  const { data: currencies } = useCurrencies();
  const { data: uoms } = useUnitsOfMeasurement();
  const { data: types } = useProcTypes();

  const [formState, setFormState] = useState<FormState>({
    title: initialData?.title || "",
    type: initialData?.type || "",
    id: initialData?.id || 0,
    description: initialData?.description || "",
    budget_id: initialData?.budget_id || null,
    employee_id: initialData?.employee_id || null,
    department_id: initialData?.department_id || 0,
    status: initialData?.status || "Pending",
    priority: initialData?.priority || "Medium",
    items: initialData?.items || [],
  });

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (employees?.length && user?.id) {
      const matchingEmployee = employees.find((e) => e.user.id === user.id);
      if (matchingEmployee) {
        setFormState((prev) => ({
          ...prev,
          employee_id: matchingEmployee.id,
        }));
      }
    }
  }, [employees, user]);

 const departmentOptions = useMemo(
   () => departments?.map((d) => ({ label: d.name, value: d.id })) || [],
   [departments]
 );

 const employeeOptions = useMemo(
   () =>
     employees?.map((e) => ({
       label: `${e.first_name} ${e.last_name}`,
       value: e.id,
     })) || [],
   [employees]
 );

 const budgetOptions = useMemo(
   () => budgets?.map((b) => ({ label: b.name, value: b.id })) || [],
   [budgets]
 );

 const currencyOptions = useMemo(
   () => currencies?.map((c) => ({ label: c.name, value: c.id })) || [],
   [currencies]
 );

 const uomOptions = useMemo(
   () => uoms?.map((u) => ({ label: u.name, value: u.id })) || [],
   [uoms]
 );

 const priorityOptions = useMemo(
   () => [
     { label: "Low", value: "Low" },
     { label: "Medium", value: "Medium" },
     { label: "High", value: "High" },
   ],
   []
 );

 const typeOptions = useMemo(
   () => types?.map((t) => ({ label: t.name, value: t.id })) || [],
   [types]
 );


  useEffect(() => {
    if (initialData) {
      setFormState({
        title: initialData.title,
        type: initialData?.type,
        id: initialData.id,
        description: initialData.description,
        budget_id: initialData.budget_id,
        employee_id: initialData.employee_id,
        department_id: initialData.department_id,
        status: initialData.status,
        priority: initialData.priority || "Medium",
        items: initialData.items.map((item) => ({
          ...item,
          item_type: item.type || "none",
        })),
      });

      if (initialData.budget_id && budgets) {
        const budget = budgets.find((b) => b.id === initialData.budget_id);
        if (budget) setSelectedBudget(budget);
      }
    } else {
      setFormState({
        title: "",
        type: "",
        id: 0,
        description: "",
        budget_id: null,
        employee_id: 0,
        department_id: 0,
        status: "Pending",
        priority: "Medium",
        items: [],
      });
    }
  }, [initialData, budgets]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...formState.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]:
        name === "quantity" || name === "estimated_unit_price"
          ? Number(value)
          : value,
    };
    setFormState({ ...formState, items: updatedItems });
  };

  const handleDropdownChange = (
    e: { value: any },
    index: number,
    field: keyof PurchaseRequestItem
  ) => {
    const updatedItems = [...formState.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: e.value,
    };
    setFormState({ ...formState, items: updatedItems });
  };

const handleTypeChange = (
  index: number,
  item_type: "Item" | "Service" | "None"
) => {
  const updatedItems = [...formState.items];
  updatedItems[index] = {
    ...updatedItems[index],
    item_type,
    item_id: 0,
    custom_name: item_type === "None" ? "" : undefined,
  };
  setFormState({ ...formState, items: updatedItems });
};

  const handleChange = (field: keyof FormState, value: any) => {
    if (field === "budget_id") {
      const budget = budgets?.find((b) => b.id === value) || null;
      setSelectedBudget(budget);
    }
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: 0,
          quantity: 1,
          budget_item_id: null,
          uom: "",
          specifications: "",
          description: "",
          estimated_unit_price: 0,
          currency_id: currencies?.[0]?.id || 0,
          item_type: "None",
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formState.items.filter((_, i) => i !== index);
    setFormState({ ...formState, items: updatedItems });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    const formPayload = new FormData();
    formPayload.append("title", formState.title);
    formPayload.append("description", formState.description);
    if (formState.budget_id !== null) {
      formPayload.append("budget_id", formState.budget_id.toString());
    }
    formPayload.append("employee_id", formState.employee_id.toString());
    formPayload.append("department_id", formState.department_id.toString());
    formPayload.append("status", formState.status);
    formPayload.append("priority", formState.priority);
    formPayload.append("items", JSON.stringify(formState.items));
    formPayload.append("procurement_type_id", formState.type);
    attachments.forEach((file) => {
      formPayload.append("attachments", file);
    });

    try {
      if(initialData) {
        await axios.post(
          `${baseURL}/procurement/purchase_requests/${initialData.id}/update`,
          formPayload,
          {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Purchase request modified successfully");
        onSave();
        onClose();
      }else {
        await axios.post(
          `${baseURL}/procurement/purchase_requests/create`,
          formPayload,
          {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Purchase request saved successfully");
        onSave();
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data.message);
    }
  };

  return (
    <Dialog
      header="Purchase Request"
      visible={visible}
      onHide={onClose}
      className="w-[80vw]"
      style={{ width: "90vw", maxWidth: "1200px" }}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">
              Title <span className="text-red-700">*</span>
            </label>
            <InputText
              value={formState.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="font-semibold">
              Requisition Type <span className="text-red-700">*</span>
            </label>
            <Dropdown
              value={formState.type}
              options={
                types?.map((e) => ({
                  label: `${e.name}`,
                  value: e.id,
                })) || []
              }
              onChange={(e) => handleChange("type", e.value)}
              placeholder="Select Requisition Type"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="font-semibold">
              Priority <span className="text-red-700">*</span>
            </label>
            <Dropdown
              value={formState.priority}
              options={priorityOptions}
              onChange={(e) => handleChange("priority", e.value)}
              placeholder="Select Priority"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="font-semibold">
              Department <span className="text-red-700">*</span>
            </label>
            <Dropdown
              value={formState.department_id}
              options={departmentOptions}
              onChange={(e) => handleChange("department_id", e.value)}
              placeholder="Select Department"
              className="w-full"
              filter
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
          <div>
            <label className="font-semibold">Budget</label>
            <Dropdown
              value={formState.budget_id}
              options={budgetOptions}
              onChange={(e) => handleChange("budget_id", e.value)}
              placeholder="Select Budget"
              className="w-full"
              filter
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </div>
          <div>
            <label className="font-semibold">
              Requested By <span className="text-red-700">*</span>
            </label>
            <Dropdown
              value={formState.employee_id}
              options={employeeOptions}
              onChange={(e) => handleChange("employee_id", e.value)}
              placeholder="Select Employee"
              className="w-full"
              filter
              optionLabel="label"
              optionValue="value"
              disabled={!employeeOptions.length}
            />
          </div>
        </div>

        <div>
          <label className="font-semibold">Description</label>
          <InputTextarea
            value={formState.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full"
            rows={3}
          />
        </div>

        <div>
          <label className="font-semibold">Attachments</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
          {attachments.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
              {attachments.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Items *</h3>
          <div className="overflow-x-auto">
            <table className="min-w-max table-auto w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 min-w-[150px]">
                    Type<span className="text-red-700">*</span>
                  </th>
                  <th className="border px-4 py-2 min-w-[150px]">
                    Item/Service
                  </th>
                  <th className="border px-4 py-2 min-w-[120px]">
                    Quantity<span className="text-red-700">*</span>
                  </th>
                  <th className="border px-4 py-2 min-w-[120px]">UOM</th>
                  <th className="border px-4 py-2 min-w-[150px]">
                    Budget Item
                  </th>
                  <th className="border px-4 py-2 min-w-[200px]">
                    Specifications
                  </th>
                  <th className="border px-4 py-2 min-w-[250px]">
                    Description<span className="text-red-700">*</span>
                  </th>
                  <th className="border px-4 py-2 min-w-[150px]">
                    Cost Estimate
                  </th>
                  <th className="border px-4 py-2 min-w-[120px]">
                    Currency<span className="text-red-700">*</span>
                  </th>
                  <th className="border px-4 py-2 min-w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {formState.items.map((item, index) => (
                  <tr key={index} className="whitespace-nowrap">
                    <td className="border px-4 py-2 min-w-[150px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <Checkbox
                            inputId={`item-type-item-${index}`}
                            checked={item.item_type === "Item"}
                            onChange={() => handleTypeChange(index, "Item")}
                          />
                          <label
                            htmlFor={`item-type-item-${index}`}
                            className="ml-2"
                          >
                            Item
                          </label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            inputId={`item-type-service-${index}`}
                            checked={item.item_type === "Service"}
                            onChange={() => handleTypeChange(index, "Service")}
                          />
                          <label
                            htmlFor={`item-type-service-${index}`}
                            className="ml-2"
                          >
                            Service
                          </label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            inputId={`item-type-none-${index}`}
                            checked={item.item_type === "None"}
                            onChange={() => handleTypeChange(index, "None")}
                          />
                          <label
                            htmlFor={`item-type-none-${index}`}
                            className="ml-2"
                          >
                            None
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="border px-4 py-2 min-w-[150px]">
                      {item.item_type === "None" ? (
                        <InputText
                          value={item.custom_name || ""}
                          onChange={(e) => {
                            const updatedItems = [...formState.items];
                            updatedItems[index].custom_name = e.target.value;
                            setFormState({ ...formState, items: updatedItems });
                          }}
                          placeholder="Enter item name"
                          className="w-full"
                        />
                      ) : (
                        <Dropdown
                          value={item.item_id}
                          onChange={(e) =>
                            handleDropdownChange(e, index, "item_id")
                          }
                          options={
                            item.item_type === "Item" ? products : services
                          }
                          optionLabel="name"
                          optionValue="id"
                          placeholder={`Select ${item.item_type}`}
                          filter
                          className="w-full"
                        />
                      )}
                    </td>

                    <td className="border px-4 py-2 min-w-[120px]">
                      <InputNumber
                        name="quantity"
                        value={item.quantity}
                        onValueChange={(e) => {
                          const updatedItems = [...formState.items];
                          updatedItems[index].quantity = e.value || 0;
                          setFormState({ ...formState, items: updatedItems });
                        }}
                        className="w-full"
                        min={1}
                        showButtons
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[120px]">
                      <Dropdown
                        value={item.uom}
                        onChange={(e) => handleDropdownChange(e, index, "uom")}
                        options={
                          uoms?.map((c) => ({
                            label: c.name,
                            value: c.id,
                          })) || []
                        }
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select uom"
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[150px]">
                      <Dropdown
                        value={item.budget_item_id}
                        onChange={(e) =>
                          handleDropdownChange(e, index, "budget_item_id")
                        }
                        options={selectedBudget?.items || []}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select an item"
                        filter
                        className="w-full"
                        disabled={!selectedBudget}
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[200px]">
                      <InputText
                        name="specifications"
                        value={item.specifications}
                        onChange={(e) => handleInputChange(e, index)}
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[250px]">
                      <InputTextarea
                        name="description"
                        value={item.description}
                        onChange={(e) => handleInputChange(e, index)}
                        rows={1}
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[150px]">
                      <InputNumber
                        name="estimated_unit_price"
                        value={item.estimated_unit_price}
                        onValueChange={(e) => {
                          const updatedItems = [...formState.items];
                          updatedItems[index].estimated_unit_price =
                            e.value || 0;
                          setFormState({ ...formState, items: updatedItems });
                        }}
                        className="w-full"
                        mode="currency"
                        currency={
                          currencies?.find((c) => c.id === item.currency_id)
                            ?.code || "USD"
                        }
                        locale="en-US"
                      />
                    </td>
                    <td className="border px-4 py-2 min-w-[120px]">
                      <Dropdown
                        value={item.currency_id}
                        options={currencyOptions}
                        onChange={(e) =>
                          handleDropdownChange(e, index, "currency_id")
                        }
                        placeholder="Select Currency"
                        className="w-full"
                        optionLabel="label"
                        optionValue="value"
                        disabled={!currencyOptions.length}
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
          <Button
            label="Add Item"
            icon="pi pi-plus"
            onClick={addItem}
            className="w-fit mt-2"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white border-none px-4 py-2 rounded"
          >
            <i className="pi pi-times" />
            Cancel
          </button>

          <Button
            label="Submit"
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={formState.items.length === 0}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default PurchaseRequestForm;
