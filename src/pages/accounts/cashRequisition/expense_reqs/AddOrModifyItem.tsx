import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import useBudgets from "../../../../hooks/budgets/useBudgets";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
import useDepartments from "../../../../hooks/hr/useDepartments";
import useAssetsAccounts from "../../../../hooks/accounts/useAssetsAccounts";
import { Budget } from "../../../../redux/slices/types/budgets/Budget";
import { toast } from "react-toastify";
import { apiRequest, baseURL } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { InputTextarea } from "primereact/inputtextarea";
import axios from "axios";

interface RequisitionFormState {
  title: string;
  date_expected: Date | null;
  budget_id: string;
  department_id: string;
  items: {
    unit_cost: number;
    budget_item_id: string;
    quantity: number;
    specifications: string | null;
    chart_of_account_id: string | null;
    currency_id: string;
  }[];
}

interface Props {
  visible: boolean;
  onHide: () => void;
  onSubmit: () => void;
  item?: any;
}

const AddOrModifyRequisition: React.FC<Props> = ({ visible, onHide, onSubmit, item }) => {
  const { data: budgets } = useBudgets();
  const { data: departments } = useDepartments();
  const [useUpload, setUseUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: currencies } = useCurrencies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useSelector((state: RootState) => state.userAuth.token);
  const baseCurrency = useSelector((state: RootState) => state.userAuth?.user?.organisation?.base_currency?.id) || "";
  const isBudgetMandatory = useSelector((state: RootState) => state.userAuth?.user?.organisation?.is_budget_mandatory) || "";
  const user = useSelector((state: RootState) => state.userAuth?.user);
  const {
    expenseAccounts,
  } = useAssetsAccounts();

  const [formState, setFormState] = useState<RequisitionFormState>({
    title: "",
    date_expected: null,
    budget_id: "",
    department_id: "",
    items: [
      {
        unit_cost: 0,
        budget_item_id: "",
        quantity: 1,
        specifications: "",
        chart_of_account_id: null,
        currency_id: baseCurrency || "",
      },
    ],
  });

  useEffect(() => {
    if (item) {
      setFormState({
        title: item.title || "",
        date_expected: item.date_expected ? new Date(item.date_expected) : null,
        budget_id: item.budget_id || "",
        department_id: item.department_id || "",
        items: item.cash_requisition_items?.length
          ? item.cash_requisition_items.map((i: any) => ({
              unit_cost: i.unit_cost || 0,
              budget_item_id: i.budget_item_id || "",
              quantity: i.quantity || 1,
              specifications: i.specifications || "",
              chart_of_account_id: i.chart_of_account_id || null,
              currency_id: baseCurrency || "",
            }))
          : [
              {
                unit_cost: 0,
                budget_item_id: "",
                quantity: 1,
                specifications: "",
                chart_of_account_id: null,
                currency_id: baseCurrency || "",
              },
            ],
      });
    } else {
      // reset to default blank form
      setFormState({
        title: "",
        date_expected: null,
        budget_id: "",
        department_id: "",
        items: [
          {
            unit_cost: 0,
            budget_item_id: "",
            quantity: 1,
            specifications: "",
            chart_of_account_id: null,
            currency_id: baseCurrency || "",
          },
        ],
      });
    }
  }, [item]);
  

  const selectedBudget: Budget | null =
    budgets.find((budget) => budget.id === formState.budget_id) || null;

  const addItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          unit_cost: 0,
          budget_item_id: "",
          quantity: 1,
          specifications: "",
          chart_of_account_id: null,
          currency_id: baseCurrency || "",
        },
      ],
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleFileSelect = (event: any) => {
    const file = event.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (useUpload && selectedFile) {
        const formData = new FormData();
        formData.append('title', formState.title);
        formData.append('date_expected', formState.date_expected ? formState.date_expected.toISOString().split("T")[0] : '');
        formData.append('requester_id', user?.employee?.id);
        formData.append('file', selectedFile);

        await axios.post(
          baseURL + ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.UPLOAD_ITEM_TEMPLATE,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token.access_token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
        toast.success("Expense Requisition uploaded successfully");
      } else {
        // Handle regular form submission
        const payload = {
          title: formState.title,
          date_expected: formState.date_expected ? formState.date_expected.toISOString().split("T")[0] : null,
          budget_id: formState.budget_id,
          department_id: formState.department_id,
          items: formState.items.map((item) => {
            const itemPayload: any = {
              unit_cost: item.unit_cost,
              quantity: item.quantity,
              specifications: item.specifications || null,
              currency_id: item.currency_id,
            };

            if (formState.budget_id) {
              itemPayload.budget_item_id = item.budget_item_id;
            } else {
              itemPayload.chart_of_account_id = item.chart_of_account_id;
            }

            return itemPayload;
          }),
        };
        
        await apiRequest(
          item ? ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.UPDATE(item?.id) : ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.ADD,
          item ? "PUT" : "POST",
          token.access_token,
          payload
        );
        toast.success(item ? "Expense Requisition modified successfully" : "Expense Requisition saved successfully");
      }
    } catch (error) {
      toast.error(error?.response?.data.message);
    } finally {
      // Reset form state
      setFormState({
        title: "",
        date_expected: null,
        budget_id: "",
        department_id: "",
        items: [
          {
            unit_cost: 0,
            budget_item_id: "",
            quantity: 1,
            specifications: "",
            chart_of_account_id: null,
            currency_id: baseCurrency || "",
          },
        ],
      });
      setSelectedFile(null);
      setUseUpload(false);
    }
    setIsSubmitting(false);
    onSubmit();
    onHide();
  };

  return (
    <Dialog
      header={item ? "Modify Expense Requisition" : "Create Expense Requisition"}
      visible={visible}
      onHide={onHide}
      style={{ width: "50vw" }}
    >
      <div className="grap-2">
        {/* First row: Title and Date Expected */}
        <div className="w-full flex flex-row gap-2">
          <div className="w-full">
            <label htmlFor="title">Title</label>
            <InputText
              id="title"
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div className="w-full">
            <label htmlFor="date_expected">Date Expected</label>
            <Calendar
              id="date_expected"
              value={formState.date_expected}
              onChange={(e) =>
                setFormState({ ...formState, date_expected: e.value as Date })
              }
              showIcon
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>
        </div>

        {/* Second row: Budget and Department */}
        <div className="flex flex-row gap-2">
          <div className="w-full">
            <label htmlFor="budget_id">Budget</label>
            <Dropdown
              id="budget_id"
              value={formState.budget_id}
              options={budgets.map(b => ({ label: b.name, value: b.id }))}
              onChange={(e) =>
                setFormState({ ...formState, budget_id: e.value })
              }
              placeholder="Select Budget"
              className="w-full"
            />
          </div>
          
          <div className="w-full">
            <label htmlFor="department_id">Department</label>
            <Dropdown
              id="department_id"
              value={formState.department_id}
              options={departments.map(d => ({ label: d.name, value: d.id }))}
              onChange={(e) =>
                setFormState({ ...formState, department_id: e.value })
              }
              placeholder="Select Department"
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <label className="inline-flex items-center space-x-2 cursor-pointer mt-2">
        <span className="text-gray-700">Wish to upload items?</span>
        <input
          type="checkbox"
          checked={useUpload}
          onChange={(e) => setUseUpload(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
      </label>
      
      {useUpload ? (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Browse
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />

          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600">
              Selected file: {selectedFile.name}
            </div>
          )}
        </div>

      ) : (
        <>
          <div className="mt-2">
            {/* Items Section */}
            <div className="col-12">
              <div className="flex flex-row justify-between align-items-center mb-3">
                <h4 className="text-xl p-4">Items</h4>
                <Button
                  label="Add Item"
                  icon="pi pi-plus"
                  className="p-button-success !p-2 h-10"
                  onClick={addItem}
                />
              </div>
              
              {formState.items.map((item, index) => (
                <div key={index} className="grid gap-2 border-1 border-200 border-round-md p-3 mb-3 surface-50">
                  <div className="col-12 flex justify-content-between align-items-center mb-2">
                    <span className="flex flex-row gap-1 justify-center items-center">
                      <h5>Item {index + 1}</h5>
                      {formState.items.length > 1 && (
                        <Button
                          icon="pi pi-trash"
                          className="!h-10 !bg-red-500 !rounded-full !w-10"
                          onClick={() => removeItem(index)}
                        />
                      )}
                    </span>
                  </div>
                  
                  {/* Budget Item and Quantity - 2 per row */}
                  <div className="flex flex-row gap-2">
                    <div className="w-full">
                      <label>Item</label>
                      <Dropdown
                        value={formState.budget_id ? item.budget_item_id : item.chart_of_account_id}
                        options={!formState.budget_id ?
                          expenseAccounts.map((line) => ({
                            label: line.name,
                            value: line.id
                          }))
                        :
                        (selectedBudget?.items || []).map(budgetItem => ({
                          label: budgetItem.name,
                          value: budgetItem.id,
                        }))}
                        onChange={(e) => updateItem(index, formState.budget_id ?  "budget_item_id" : "chart_of_account_id", e.value)}
                        placeholder="Select Item"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="w-full">
                      <label>Quantity</label>
                      <InputNumber
                        value={item.quantity}
                        onValueChange={(e) => updateItem(index, "quantity", e.value || 1)}
                        className="w-full"
                        min={1}
                      />
                    </div>
                    <div className="col-12 md:col-6">
                      <label>Unit Cost</label>
                      <InputNumber
                        value={item.unit_cost}
                        onValueChange={(e) => updateItem(index, "unit_cost", e.value || 0)}
                        className="w-full"
                        currency={currencies.find(c => c.id === item.currency_id)?.code}
                        min={0}
                      />
                    </div>
                  </div>
                  
                  {/* Specifications - Full width */}
                  <div className="col-12">
                    <label>Specifications</label>
                    <InputTextarea
                      value={item.specifications || ""}
                      onChange={(e) => updateItem(index, "specifications", e.target.value)}
                      placeholder="Enter specifications"
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          label={isSubmitting ? "Saving..." : "Save"} 
          icon="pi pi-check" 
          onClick={handleSubmit} 
          disabled={isSubmitting || (useUpload && !selectedFile)}
          loading={isSubmitting}
        />
      </div>
    </Dialog>
  );
};

export default AddOrModifyRequisition;