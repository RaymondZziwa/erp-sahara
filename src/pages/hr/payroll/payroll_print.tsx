import React from "react";
import Logo from "../../../assets/images/logos/ltcu.jpeg";

interface PayrollData {
  id: number;
  organisation_id: string;
  employee_id: number;
  payroll_period_id: number;
  gross_salary: string;
  total_deductions: string;
  net_salary: string;
  tax_amount: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  payslips: null;
  payroll_period: {
    id: number;
    organisation_id: string;
    period_name: string;
    start_date: string;
    end_date: string;
    is_closed: number;
    created_at: string;
    updated_at: string;
  };
  employee: {
    id: number;
    organisation_id: string;
    employee_code: null;
    first_name: string;
    last_name: string;
    other_name: null;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    marital_status: string;
    salutation: string;
    address: string;
    city: null;
    state: string;
    postal_code: null;
    country: string;
    photo: null;
    hire_date: string;
    tax_identification_number: null;
    department_id: number;
    designation_id: number;
    salary_structure_id: number;
    supervisor_id: null;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

interface Props {
  reportName: string;
  data: PayrollData[];
}

export class PrintableContent extends React.Component<Props> {
  render() {
    const { reportName, data } = this.props;
    const today = new Date();

    const formattedDateTime = today.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div style={{ color: "black", padding: "10px", fontSize: "16px" }}>
        <div className="flex flex-col justify-center items-center">
          <img src={Logo} alt="" className="w-20 h-18 mb-4" />
          <div className="flex flex-col justify-center items-center">
            <p className="font-bold text-2xl">
              Lake Tanganyika Co-operative Union Limited
            </p>
            <p className="font-bold text-xl">P.O BOX 251</p>
            <p className="font-bold text-xl">MPANDA-KATAVI</p>
            <p className="font-bold text-xl">www.latcu.co.tz</p>
            <p className="font-bold text-xl">TIN: 102-778-057</p>
            <p className="font-bold text-xl">Printed at {formattedDateTime}</p>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center mt-8">
          <p className="font-bold text-2xl">{reportName}</p>
        </div>

        {/* Payroll Data Table */}
        <table className="w-full mt-8 border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-2">Employee Name</th>
              <th className="border border-gray-200 p-2">Payroll Period</th>
              <th className="border border-gray-200 p-2">Gross Salary</th>
              <th className="border border-gray-200 p-2">Total Deductions</th>
              <th className="border border-gray-200 p-2">Tax Amount</th>
              <th className="border border-gray-200 p-2">Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="border border-gray-200 p-2">
                  {item.employee.first_name} {item.employee.last_name}
                </td>
                <td className="border border-gray-200 p-2">
                  {item.payroll_period.period_name}
                </td>
                <td className="border border-gray-200 p-2">
                  {item.gross_salary}
                </td>
                <td className="border border-gray-200 p-2">
                  {item.total_deductions}
                </td>
                <td className="border border-gray-200 p-2">
                  {item.tax_amount}
                </td>
                <td className="border border-gray-200 p-2">
                  {item.net_salary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
