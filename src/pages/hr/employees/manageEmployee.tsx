import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

import useEmployees from "../../../hooks/hr/useEmployees";
import useAllowanceTypes from "../../../hooks/hr/salary/useAllowanceTypes";
import useDeductionTypes from "../../../hooks/hr/salary/useDeductionTypes";
import useLoanTypes from "../../../hooks/hr/salary/useLoanTypes";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { apiRequest } from "../../../utils/api";

interface Allowance {
  id: string;
  allowance_type_id: string;
  allowance_type?: {
    name: string;
  };
  value: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface Deduction {
  id: string;
  deduction_type_id: string;
  deduction_type?: {
    name: string;
  };
  value: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface Loan {
  id: string;
  type_id: string;
  loan_type?: {
    name: string;
  };
  amount: number;
  installment_amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_code?: string;
  allowances: Allowance[];
  deductions: Deduction[];
  loans: Loan[];
}

const ManageEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: RootState) => state.userAuth.token);
  const { data: employees, refresh: refreshEmployees } = useEmployees();

  // Hooks for types
  const { data: allowanceTypes } = useAllowanceTypes();
  const { data: deductionTypes } = useDeductionTypes();
  const { data: loanTypes } = useLoanTypes();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeIndex, setActiveIndex] = useState(0); // 0 = Allowances, 1 = Deductions, 2 = Loans
  const [dialogVisible, setDialogVisible] = useState(false);

  // Form state for all three types
  const [formData, setFormData] = useState({
    typeId: "",
    value: 0,
    amount: 0,
    installment_amount: 0,
    start_date: null as Date | null,
    end_date: null as Date | null,
  });

  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (id && employees) {
      const foundEmployee = employees.find((emp: Employee) => emp.id === id);
      setEmployee(foundEmployee || null);
    }
  }, [id, employees]);

  const openDialogForAdd = () => {
    setFormData({
      typeId: "",
      value: 0,
      amount: 0,
      installment_amount: 0,
      start_date: null,
      end_date: null,
    });
    setEditId(null);
    setDialogVisible(true);
  };

  const openDialogForEdit = (item: Allowance | Deduction | Loan) => {
    const startDate = item.start_date ? new Date(item.start_date) : null;
    const endDate = item.end_date ? new Date(item.end_date) : null;
    
    if ('allowance_type_id' in item) {
      // Allowance or Deduction
      setFormData({
        typeId: item.allowance_type_id || (item as any).deduction_type_id,
        value: item.value,
        amount: 0,
        installment_amount: 0,
        start_date: startDate,
        end_date: endDate,
      });
    } else {
      // Loan
      setFormData({
        typeId: item.type_id,
        value: 0,
        amount: item.amount,
        installment_amount: item.installment_amount,
        start_date: startDate,
        end_date: endDate,
      });
    }
    setEditId(item.id);
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!id || !employee) {
      toast.error("Employee data is missing");
      return;
    }

    let payload: any;
    let endpoint: string;
    let method = "POST";

    // Common validation
    if (!formData.typeId) {
      toast.warn("Please select a type");
      return;
    }

    if (activeIndex === 0 || activeIndex === 1) {
      // Allowances or Deductions
      if (formData.value <= 0) {
        toast.warn("Value must be greater than 0");
        return;
      }

      const itemData = {
        [`${activeIndex === 0 ? 'allowance' : 'deduction'}_type_id`]: formData.typeId,
        value: formData.value,
        start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null,
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
      };

      if (activeIndex === 0) {
        // Allowance
        payload = { allowances: [itemData] };
        endpoint = HUMAN_RESOURCE_ENDPOINTS.EMPLOYEES.ADD_ALLOWANCE(id);
      } else {
        // Deduction
        payload = { deductions: [itemData] };
        endpoint = HUMAN_RESOURCE_ENDPOINTS.EMPLOYEES.ADD_DEDUCTION(id);
      }
    } else {
      // Loans
      if (formData.amount <= 0) {
        toast.warn("Loan amount must be greater than 0");
        return;
      }
      if (formData.installment_amount <= 0) {
        toast.warn("Installment amount must be greater than 0");
        return;
      }
      if (!formData.start_date) {
        toast.warn("Start date is required");
        return;
      }
      if (!formData.end_date) {
        toast.warn("End date is required");
        return;
      }

      payload = {
        type_id: formData.typeId,
        amount: formData.amount,
        installment_amount: formData.installment_amount,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
      };

      endpoint = HUMAN_RESOURCE_ENDPOINTS.EMPLOYEE_LOANS.ADD(id);
    }

    try {
      await apiRequest(endpoint, method, token.access_token, payload);
      
      // Refresh employee data to get updated allowances/deductions/loans
      refreshEmployees();
      
      toast.success(
        `${getActiveTabName()} ${editId ? "updated" : "added"} successfully`
      );
      setDialogVisible(false);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error saving data");
    }
  };

  const handleDelete = async (item: Allowance | Deduction | Loan) => {
    if (!id) return;

    let endpoint: string;
    const itemId = item.id;

    if (activeIndex === 0) {
      endpoint = HUMAN_RESOURCE_ENDPOINTS.EMPLOYEES.DELETE_ALLOWANCE(id, itemId);
    } else if (activeIndex === 1) {
      endpoint = HUMAN_RESOURCE_ENDPOINTS.EMPLOYEES.DELETE_DEDUCTION(id, itemId);
    } else {
      endpoint = HUMAN_RESOURCE_ENDPOINTS.EMPLOYEE_LOANS.DELETE(id, itemId);
    }

    try {
      await apiRequest(endpoint, "DELETE", token.access_token);
      refreshEmployees();
      toast.success(`${getActiveTabName()} deleted successfully`);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item");
    }
  };

  const getActiveTabName = () => {
    switch (activeIndex) {
      case 0: return "Allowance";
      case 1: return "Deduction";
      case 2: return "Loan";
      default: return "Item";
    }
  };

  const currencyTemplate = (rowData: { value?: number; amount?: number; installment_amount?: number }) => {
    const amount = rowData.value || rowData.amount || rowData.installment_amount || 0;
    return amount.toLocaleString('en-UG', { style: 'currency', currency: 'UGX' });
  };

  const dateTemplate = (rowData: { start_date?: string; end_date?: string; created_at?: string }, field: string) => {
    const dateStr = rowData[field as keyof typeof rowData] as string;
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const nameTemplate = (rowData: Allowance | Deduction | Loan) => {
    if ('allowance_type' in rowData && rowData.allowance_type) {
      return rowData.allowance_type.name;
    }
    if ('deduction_type' in rowData && rowData.deduction_type) {
      return rowData.deduction_type.name;
    }
    if ('loan_type' in rowData && rowData.loan_type) {
      return rowData.loan_type.name;
    }
    
    // Fallback: Try to find name from type IDs
    const typeId = 'allowance_type_id' in rowData ? rowData.allowance_type_id : 
                   'deduction_type_id' in rowData ? rowData.deduction_type_id : 
                   (rowData as Loan).type_id;
    
    if (activeIndex === 0 && allowanceTypes) {
      return allowanceTypes.find(type => type.id === typeId)?.name || "-";
    }
    if (activeIndex === 1 && deductionTypes) {
      return deductionTypes.find(type => type.id === typeId)?.name || "-";
    }
    if (activeIndex === 2 && loanTypes) {
      return loanTypes.find(type => type.id === typeId)?.name || "-";
    }
    
    return "-";
  };

  const actionTemplate = (rowData: Allowance | Deduction | Loan) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-sm p-button-success"
        onClick={() => openDialogForEdit(rowData)}
        tooltip="Edit"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-sm p-button-danger !bg-red-500"
        onClick={() => handleDelete(rowData)}
        tooltip="Delete"
      />
    </div>
  );

  const getTableData = () => {
    if (!employee) return [];
    
    switch (activeIndex) {
      case 0: return employee.allowances || [];
      case 1: return employee.deductions || [];
      case 2: return employee.loans || [];
      default: return [];
    }
  };

  if (!employee) {
    return (
      <Card>
        <div className="flex justify-center items-center h-32">
          <p>Loading employee data...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <ToastContainer />

      {/* Employee Financial Management */}
      <Card title="Employee Financial Management" className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <strong>Employee:</strong> {employee.first_name} {employee.last_name}
          </div>
          <div>
            <strong>Employee Code:</strong> {employee.employee_code || "N/A"}
          </div>
          <div>
            <strong>Total Allowances:</strong> {employee.allowances?.length || 0}
          </div>
          <div>
            <strong>Total Deductions:</strong> {employee.deductions?.length || 0}
          </div>
          <div className="md:col-span-2">
            <strong>Total Loans:</strong> {employee.loans?.length || 0}
          </div>
        </div>
      </Card>

      {/* Allowances / Deductions / Loans Tabs */}
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        {/* Allowances Tab */}
        <TabPanel header="Allowances">
          <div className="flex justify-end mb-4">
            <Button
              label="Add Allowance"
              icon="pi pi-plus"
              onClick={openDialogForAdd}
              size="small"
            />
          </div>
          <DataTable value={getTableData()} responsiveLayout="scroll" paginator rows={10}>
            <Column field="allowance_type.name" header="Name" body={nameTemplate} />
            <Column field="value" header="Value" body={currencyTemplate} />
            <Column header="Start Date" body={(rowData) => dateTemplate(rowData, 'start_date')} />
            <Column header="End Date" body={(rowData) => dateTemplate(rowData, 'end_date')} />
            <Column header="Created" body={(rowData) => dateTemplate(rowData, 'created_at')} />
            <Column header="Actions" body={actionTemplate} style={{ width: "120px" }} />
          </DataTable>
        </TabPanel>

        {/* Deductions Tab */}
        <TabPanel header="Deductions">
          <div className="flex justify-end mb-4">
            <Button
              label="Add Deduction"
              icon="pi pi-plus"
              onClick={openDialogForAdd}
              size="small"
            />
          </div>
          <DataTable value={getTableData()} responsiveLayout="scroll" paginator rows={10}>
            <Column field="deduction_type.name" header="Name" body={nameTemplate} />
            <Column field="value" header="Value" body={currencyTemplate} />
            <Column header="Start Date" body={(rowData) => dateTemplate(rowData, 'start_date')} />
            <Column header="End Date" body={(rowData) => dateTemplate(rowData, 'end_date')} />
            <Column header="Created" body={(rowData) => dateTemplate(rowData, 'created_at')} />
            <Column header="Actions" body={actionTemplate} style={{ width: "120px" }} />
          </DataTable>
        </TabPanel>

        {/* Loans Tab */}
        <TabPanel header="Loans">
          <div className="flex justify-end mb-4">
            <Button
              label="Add Loan"
              icon="pi pi-plus"
              onClick={openDialogForAdd}
              size="small"
            />
          </div>
          <DataTable value={getTableData()} responsiveLayout="scroll" paginator rows={10}>
            <Column field="loan_type.name" header="Loan Type" body={nameTemplate} />
            <Column field="amount" header="Loan Amount" body={currencyTemplate} />
            <Column field="installment_amount" header="Installment Amount" body={currencyTemplate} />
            <Column header="Start Date" body={(rowData) => dateTemplate(rowData, 'start_date')} />
            <Column header="End Date" body={(rowData) => dateTemplate(rowData, 'end_date')} />
            <Column header="Created" body={(rowData) => dateTemplate(rowData, 'created_at')} />
            <Column header="Actions" body={actionTemplate} style={{ width: "120px" }} />
          </DataTable>
        </TabPanel>
      </TabView>

      {/* Add/Edit Dialog */}
      <Dialog
        header={`${editId ? "Edit" : "Add"} ${getActiveTabName()}`}
        visible={dialogVisible}
        style={{ width: "500px" }}
        onHide={() => setDialogVisible(false)}
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setDialogVisible(false)}
              className="p-button-text !bg-red-500"
              size="small"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSave}
              size="small"
            />
          </div>
        }
      >
        <div className="grid gap-4">
          {/* Type Dropdown */}
          <div className="p-field">
            <label htmlFor="type">
              {getActiveTabName()} Type<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="type"
              value={formData.typeId}
              options={
                activeIndex === 0 
                  ? allowanceTypes?.map((a) => ({ label: a.name, value: a.id })) 
                  : activeIndex === 1 
                  ? deductionTypes?.map((d) => ({ label: d.name, value: d.id }))
                  : loanTypes?.map((l) => ({ label: l.name, value: l.id }))
              }
              onChange={(e) => setFormData({ ...formData, typeId: e.value })}
              placeholder={`Select ${getActiveTabName()} Type`}
              className="w-full"
            />
          </div>

          {/* Amount/Value Field */}
          {activeIndex === 2 ? (
            <>
              <div className="p-field">
                <label htmlFor="amount">
                  Loan Amount<span className="text-red-500">*</span>
                </label>
                <InputNumber
                  id="amount"
                  value={formData.amount}
                  onValueChange={(e) => setFormData({ ...formData, amount: e.value ?? 0 })}
                  className="w-full"
                />
              </div>
              <div className="p-field">
                <label htmlFor="installment_amount">
                  Installment Amount<span className="text-red-500">*</span>
                </label>
                <InputNumber
                  id="installment_amount"
                  value={formData.installment_amount}
                  onValueChange={(e) => setFormData({ ...formData, installment_amount: e.value ?? 0 })}
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <div className="p-field">
              <label htmlFor="value">
                Amount<span className="text-red-500">*</span>
              </label>
              <InputNumber
                id="value"
                value={formData.value}
                onValueChange={(e) => setFormData({ ...formData, value: e.value ?? 0 })}
                className="w-full"
              />
            </div>
          )}

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-field">
              <label htmlFor="start_date">
                Start Date{activeIndex === 2 ? <span className="text-red-500">*</span> : ""}
              </label>
              <Calendar
                id="start_date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.value as Date })}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
              />
            </div>
            <div className="p-field">
              <label htmlFor="end_date">
                End Date{activeIndex === 2 ? <span className="text-red-500">*</span> : ""}
              </label>
              <Calendar
                id="end_date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.value as Date })}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ManageEmployee;