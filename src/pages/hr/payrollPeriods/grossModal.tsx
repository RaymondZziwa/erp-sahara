import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import useDeductionTypes from "../../../hooks/hr/salary/useDeductionTypes";
import { apiRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import { Button } from "primereact/button";

interface EmployeeGross {
  id: string;
  employee_id: string;
  basic_pay: string;
  allowances_total: string;
  overtime_total: string;
  gross_pay: string;
  employee: {
    first_name: string;
    last_name: string;
  };
}

interface GrossesModalProps {
  run: {
    id: string;
    name: string;
    grosses: EmployeeGross[];
  };
  onClose: () => void;
}

interface Deduction {
  employee_id: string;
  deduction_type_id: string;
  value: number;
  start_date?: string | null;
  end_date?: string | null;
}

const GrossesModal: React.FC<GrossesModalProps> = ({ run, onClose }) => {
  const { data: deductionTypes } = useDeductionTypes();
  const [activeEmployee, setActiveEmployee] = useState<EmployeeGross | null>(null);
  const [deductions, setDeductions] = useState<Record<string, Deduction[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newDeduction, setNewDeduction] = useState<Partial<Deduction>>({});
    const { token } = useAuth();
    
  const handleAddDeduction = () => {
    if (activeEmployee && newDeduction.deduction_type_id && newDeduction.value !== undefined) {
      const empId = activeEmployee.employee_id;
      const empDeds = deductions[empId] || [];
      setDeductions({
        ...deductions,
        [empId]: [
          ...empDeds,
          {
            employee_id: empId,
            deduction_type_id: newDeduction.deduction_type_id,
            value: Number(newDeduction.value),
            start_date: newDeduction.start_date || null,
            end_date: newDeduction.end_date || null,
          },
        ],
      });
      setNewDeduction({});
    }
  };

  const handleSubmitAll = async () => {
    const allDeductions: Deduction[] = Object.values(deductions).flat();
    setIsSubmitting(true)
      try {
        await apiRequest(`/payroll-runs/${run.id}/deductions`, "POST", token.access_token, { deductions: allDeductions });
        toast.success('Deductions applied successfully')
      setIsSubmitting(false)
      onClose();
    } catch (err) {
      console.error(err);
        alert("Error submitting deductions");
        setIsSubmitting(false)
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-700">
            Payroll Grosses – {run.name}
          </h2>
          <Icon
            icon="solar:close-circle-bold"
            className="cursor-pointer text-gray-500 hover:text-gray-700"
            fontSize={28}
            onClick={onClose}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-right">Basic Pay</th>
                <th className="p-3 text-right">Allowances</th>
                <th className="p-3 text-right">Overtime</th>
                <th className="p-3 text-right">Gross Pay</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {run.grosses.map((g) => (
                <tr key={g.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{g.employee.first_name} {g.employee.last_name}</td>
                  <td className="p-3 text-right">{g.basic_pay}</td>
                  <td className="p-3 text-right">{g.allowances_total}</td>
                  <td className="p-3 text-right">{g.overtime_total}</td>
                  <td className="p-3 text-right font-semibold">{g.gross_pay}</td>
                  <td className="p-3 text-center">
                    <button
                      className="px-3 py-1 text-sm rounded bg-teal-500 text-white hover:bg-teal-600"
                      onClick={() => setActiveEmployee(g)}
                    >
                      Add Deductions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={onClose}>
            Cancel
          </button>
          <Button className="px-4 py-2 rounded bg-teal-500 text-white hover:bg-teal-600" onClick={handleSubmitAll} loading={isSubmitting}>
            Submit Deductions
          </Button>
        </div>

        {/* Deduction Modal */}
        {activeEmployee && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Deductions – {activeEmployee.employee.first_name} {activeEmployee.employee.last_name}
                </h3>
                <Icon
                  icon="solar:close-circle-bold"
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  fontSize={24}
                  onClick={() => setActiveEmployee(null)}
                />
              </div>

              {/* Existing deductions */}
                <ul className="mb-4 text-sm text-gray-600 space-y-1">
                {(deductions[activeEmployee.employee_id] || []).map((d, idx) => {
                    const typeName = deductionTypes?.find((dt: any) => dt.id === d.deduction_type_id)?.name || d.deduction_type_id;
                    return (
                    <li key={idx} className="border p-2 rounded bg-gray-50 flex justify-between items-center">
                        <span>
                        <strong>Type:</strong> {typeName} | 
                        <strong> Value:</strong> {d.value}
                        {d.start_date && ` | Start: ${d.start_date}`}
                        {d.end_date && ` | End: ${d.end_date}`}
                        </span>
                        {/* Optional: Delete button */}
                        <button
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={() => {
                            const empId = activeEmployee.employee_id;
                            setDeductions({
                            ...deductions,
                            [empId]: deductions[empId].filter((_, i) => i !== idx)
                            });
                        }}
                        >
                        Delete
                        </button>
                    </li>
                    );
                })}
                </ul>


              {/* Add new deduction */}
              <div className="space-y-3 mb-4">
                <Dropdown
                  options={deductionTypes?.map((dt: any) => ({ label: dt.name, value: dt.id }))}
                  value={newDeduction.deduction_type_id}
                  onChange={(e) => setNewDeduction({ ...newDeduction, deduction_type_id: e.value })}
                  placeholder="Select Deduction Type"
                  className="w-full"
                />
                <InputNumber
                  value={newDeduction.value}
                  onValueChange={(e) => setNewDeduction({ ...newDeduction, value: e.value })}
                  placeholder="Value"
                  className="w-full"
                  mode="decimal"
                />
                <div className="flex gap-2">
                  <Calendar
                    value={newDeduction.start_date ? new Date(newDeduction.start_date) : null}
                    onChange={(e) => setNewDeduction({ ...newDeduction, start_date: e.value?.toISOString().split("T")[0] })}
                    placeholder="Start Date"
                    className="flex-1"
                  />
                  <Calendar
                    value={newDeduction.end_date ? new Date(newDeduction.end_date) : null}
                    onChange={(e) => setNewDeduction({ ...newDeduction, end_date: e.value?.toISOString().split("T")[0] })}
                    placeholder="End Date"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="px-4 py-2 rounded bg-teal-500 text-white hover:bg-teal-600"
                  onClick={handleAddDeduction}
                >
                  Add Deduction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrossesModal;
