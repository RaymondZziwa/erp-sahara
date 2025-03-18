//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Payroll } from "../../../redux/slices/types/hr/salary/PayRollPeriod";
import { Nullable } from "primereact/ts-helpers";
import { toast } from "react-toastify";
import useEmployees from "../../../hooks/hr/useEmployees";
import usePayrollPeriods from "../../../hooks/hr/usePayRollPeriods";
import { InputText } from "primereact/inputtext";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Payroll;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Payroll>>({
    payroll_employee: 0,
    payroll_period_id: 0,
    gross_salary: 0,
    total_deductions: 0,
    net_salary: 0,
    tax_amount: 0,
    payroll_date: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: employees } = useEmployees();
  const { data: payrollPeriods, refresh } = usePayrollPeriods();
  const { token } = useAuth();

  useEffect(()=> {
    if(!payrollPeriods) {
      refresh()
    }
  }, [])

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({
        payroll_employee: 0,
        payroll_period_id: 0,
        gross_salary: 0,
        total_deductions: 0,
        net_salary: 0,
        tax_amount: 0,
        payroll_date: null,
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = isNaN(Number(value)) ? value : Number(value);

    setFormState((prevState) => {
      if (name === "total_deductions") {
        const grossSalary = prevState.gross_salary || 0; // Ensure gross_salary is not undefined
        return {
          ...prevState,
          total_deductions: numericValue,
          net_salary: grossSalary - numericValue, // Calculate net salary
        };
      }

      return {
        ...prevState,
        [name]: numericValue,
      };
    });
  };


  const handleDateChange = (name: string, value: Nullable<Date>) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "payroll_employee") {
      const selectedEmployee = employees.find((emp) => emp.id === value);
      if (selectedEmployee) {
        setFormState((prevState) => ({
          ...prevState,
          gross_salary: selectedEmployee.salary_structure.basic_salary || 0,
        }));
      }
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedData = {
      ...formState,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.PAYROLL.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.PAYROLL.ADD;

    if (!formState.payroll_period_id) {
      setIsSubmitting(false);
      return toast.warn("Payroll date is required");
    }

    await createRequest(
      endpoint,
      token.access_token,
      formattedData,
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose();
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
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="payroll-period-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Payroll Entry" : "Add Payroll Entry"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="payroll-period-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        {/* Employee Selection */}
        <div className="p-field">
          <label htmlFor="employee_id">Select Employee</label>
          <Dropdown
            filter
            id="employee_id"
            name="payroll_employee"
            value={formState.payroll_employee}
            options={employees.map((employee) => ({
              value: employee.id,
              label: `${employee.first_name} ${employee.last_name}`,
            }))}
            onChange={handleDropdownChange}
            required
            className="w-full"
          />
        </div>

        {/* Payroll Period Selection */}
        <div className="p-field">
          <label htmlFor="payroll_period_id">Select Payroll Period</label>
          <Dropdown
            filter
            id="payroll_period_id"
            name="payroll_period_id"
            value={formState.payroll_period_id}
            options={payrollPeriods.map((period) => ({
              value: period.id,
              label: period.period_name,
            }))}
            onChange={handleDropdownChange}
            required
            className="w-full"
          />
        </div>

        {/* Gross Salary (Auto-filled) */}
        <div className="p-field">
          <label htmlFor="gross_salary">Gross Salary</label>
          <InputText
            id="gross_salary"
            name="gross_salary"
            type="number"
            value={formState.gross_salary}
            onChange={handleInputChange}
            className="w-full"
            disabled
          />
        </div>

        {/* Total Deductions */}
        <div className="p-field">
          <label htmlFor="total_deductions">Total Deductions</label>
          <InputText
            id="total_deductions"
            name="total_deductions"
            type="number"
            value={formState.total_deductions}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        {/* Net Salary */}
        <div className="p-field">
          <label htmlFor="net_salary">Net Salary</label>
          <InputText
            id="net_salary"
            name="net_salary"
            type="number"
            value={formState.gross_salary - (formState.total_deductions || 0)}
            className="w-full"
            disabled
          />
        </div>

        {/* Payroll Date */}
        <div className="p-field">
          <label htmlFor="payroll_date">Payroll Date</label>
          <Calendar
            placeholder="Choose payroll date"
            id="payroll_date"
            name="payroll_date"
            value={
              formState.payroll_date ? new Date(formState.payroll_date) : null
            }
            onChange={(e) => handleDateChange("payroll_date", e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            required
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;