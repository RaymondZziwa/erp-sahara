// @ts-nocheck
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
import useDeductionTypes from "../../../hooks/hr/salary/useDeductionTypes";
import useAllowanceTypes from "../../../hooks/hr/salary/useAllowanceTypes";

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
  const { token } = useAuth();
  const { data: employees } = useEmployees();
  const { data: payrollPeriods, refresh } = usePayrollPeriods();
  const { data: allDeductions } = useDeductionTypes();
  const { data: allAllowances } = useAllowanceTypes();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    employee_id: "",
    payroll_schedule: "",
    gross_salary: 0,
    payroll_date: null as Nullable<Date>,
    payment_method: "bank_transfer",
    notes: "Paid",
  });
  const [deductions, setDeductions] = useState([
    { deduction_id: "", amount: 0 },
  ]);
  const [allowances, setAllowances] = useState([
    { allowance_id: "", amount: 0 },
  ]);

  useEffect(() => {
    if (!payrollPeriods) refresh();
  }, []);

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
        payroll_date: item.payroll_date ? new Date(item.payroll_date) : null,
      });
      setDeductions(item.deductions || [{ deduction_id: "", amount: 0 }]);
      setAllowances(item.allowances || [{ allowance_id: "", amount: 0 }]);
    } else {
      resetForm();
    }
  }, [item]);

  const resetForm = () => {
    setFormState({
      employee_id: "",
      payroll_schedule: "",
      gross_salary: 0,
      payroll_date: null,
      payment_method: "bank_transfer",
      notes: "Paid",
    });
    setDeductions([{ deduction_id: "", amount: 0 }]);
    setAllowances([{ allowance_id: "", amount: 0 }]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = isNaN(Number(value)) ? value : Number(value);
    setFormState((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleDateChange = (name: string, value: Nullable<Date>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    if (name === "employee_id") {
      const selectedEmployee = employees.find((emp) => emp.id === value);
      if (selectedEmployee) {
        setFormState((prev) => ({
          ...prev,
          gross_salary: selectedEmployee.salary_structure.basic_salary || 0,
        }));
      }
    }
  };

  const handleDynamicChange = (
    type: "deductions" | "allowances",
    index: number,
    field: "deduction_id" | "allowance_id" | "amount",
    value: any
  ) => {
    const updater = type === "deductions" ? [...deductions] : [...allowances];
    updater[index][field] = field === "amount" ? Number(value) : value;
    type === "deductions" ? setDeductions(updater) : setAllowances(updater);
  };

  const addRow = (type: "deductions" | "allowances") => {
    const newRow = { [`${type.slice(0, -1)}_id`]: "", amount: 0 };
    type === "deductions"
      ? setDeductions((prev) => [...prev, newRow])
      : setAllowances((prev) => [...prev, newRow]);
  };

  const removeRow = (type: "deductions" | "allowances", index: number) => {
    const updater = type === "deductions" ? [...deductions] : [...allowances];
    updater.splice(index, 1);
    type === "deductions" ? setDeductions(updater) : setAllowances(updater);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.employee_id ||
      !formState.payroll_schedule ||
      !formState.payroll_date
    ) {
      toast.warn("All required fields must be filled");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...formState,
      total_bonuses: 0,
      total_overtime: 0,
      payroll_date: formState.payroll_date?.toISOString().split("T")[0],
      deductions: deductions.filter((d) => d.deduction_id && d.amount > 0),
      allowances: allowances.filter((a) => a.allowance_id && a.amount > 0),
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.PAYROLL.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.PAYROLL.ADD;

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
        className="p-button-text p-button-danger"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        disabled={isSubmitting}
        type="submit"
        form="payroll-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Payroll Entry" : "Add Payroll Entry"}
      visible={visible}
      style={{ width: "50vw", maxWidth: "700px" }}
      footer={footer}
      onHide={onClose}
      className="payroll-dialog"
    >
      <form id="payroll-form" onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee */}
          <div className="field">
            <label htmlFor="employee_id" className="block font-medium mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="employee_id"
              name="employee_id"
              value={formState.employee_id}
              options={employees.map((emp) => ({
                label: `${emp.first_name} ${emp.last_name}`,
                value: emp.id,
              }))}
              onChange={handleDropdownChange}
              filter
              placeholder="Select Employee"
              className="w-full"
              required
            />
          </div>

          {/* Payroll Period */}
          <div className="field">
            <label
              htmlFor="payroll_schedule"
              className="block font-medium mb-1"
            >
              Payroll Period <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="payroll_schedule"
              name="payroll_schedule"
              value={formState.payroll_schedule}
              options={payrollPeriods.map((p) => ({
                label: `${p.start_date} - ${p.end_date}`,
                value: p.id,
              }))}
              onChange={handleDropdownChange}
              filter
              placeholder="Select Period"
              className="w-full"
              required
            />
          </div>

          {/* Gross Salary */}
          <div className="field">
            <label htmlFor="gross_salary" className="block font-medium mb-1">
              Gross Salary
            </label>
            <InputText
              id="gross_salary"
              name="gross_salary"
              value={formState.gross_salary}
              disabled
              className="w-full"
            />
          </div>

          {/* Payroll Date */}
          <div className="field">
            <label htmlFor="payroll_date" className="block font-medium mb-1">
              Payroll Date <span className="text-red-500">*</span>
            </label>
            <Calendar
              id="payroll_date"
              name="payroll_date"
              value={formState.payroll_date}
              onChange={(e) => handleDateChange("payroll_date", e.value)}
              dateFormat="yy-mm-dd"
              showIcon
              className="w-full"
              required
            />
          </div>

          {/* Payment Method */}
          <div className="field">
            <label htmlFor="payment_method" className="block font-medium mb-1">
              Payment Method
            </label>
            <Dropdown
              id="payment_method"
              name="payment_method"
              value={formState.payment_method}
              options={[
                { label: "Bank Transfer", value: "bank_transfer" },
                { label: "Cash", value: "cash" },
                { label: "Cheque", value: "cheque" },
              ]}
              onChange={handleDropdownChange}
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="field md:col-span-2">
            <label htmlFor="notes" className="block font-medium mb-1">
              Notes
            </label>
            <InputText
              id="notes"
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Deductions Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-lg">Deductions</h5>
            <Button
              label="Add Deduction"
              icon="pi pi-plus"
              type="button"
              onClick={() => addRow("deductions")}
              className="p-button-text p-button-sm"
            />
          </div>

          <div className="space-y-3">
            {deductions.map((d, index) => (
              <div
                key={`deduction-${index}`}
                className="flex gap-3 items-center"
              >
                <Dropdown
                  value={d.deduction_id}
                  options={allDeductions.map((a) => ({
                    label: a.name,
                    value: a.id,
                  }))}
                  onChange={(e) =>
                    handleDynamicChange(
                      "deductions",
                      index,
                      "deduction_id",
                      e.value
                    )
                  }
                  placeholder="Select Deduction"
                  className="flex-1"
                />
                <InputText
                  type="number"
                  value={d.amount}
                  onChange={(e) =>
                    handleDynamicChange(
                      "deductions",
                      index,
                      "amount",
                      e.target.value
                    )
                  }
                  placeholder="Amount"
                  className="w-32"
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger p-button-outlined"
                  type="button"
                  onClick={() => removeRow("deductions", index)}
                  disabled={deductions.length <= 1}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Allowances Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-lg">Allowances</h5>
            <Button
              label="Add Allowance"
              icon="pi pi-plus"
              type="button"
              onClick={() => addRow("allowances")}
              className="p-button-text p-button-sm"
            />
          </div>

          <div className="space-y-3">
            {allowances.map((a, index) => (
              <div
                key={`allowance-${index}`}
                className="flex gap-3 items-center"
              >
                <Dropdown
                  value={a.allowance_id}
                  options={allAllowances.map((a) => ({
                    label: a.name,
                    value: a.id,
                  }))}
                  onChange={(e) =>
                    handleDynamicChange(
                      "allowances",
                      index,
                      "allowance_id",
                      e.value
                    )
                  }
                  placeholder="Select Allowance"
                  className="flex-1"
                />
                <InputText
                  type="number"
                  value={a.amount}
                  onChange={(e) =>
                    handleDynamicChange(
                      "allowances",
                      index,
                      "amount",
                      e.target.value
                    )
                  }
                  placeholder="Amount"
                  className="w-32"
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger p-button-outlined"
                  type="button"
                  onClick={() => removeRow("allowances", index)}
                  disabled={allowances.length <= 1}
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
