import { Employee } from "../Employee";

export interface PayRollPeriod {
  period_name: string;
  start_date: string | null;
  end_date: string | null;
  organisation_id: number;
  updated_at: string;
  created_at: string;
  id: number;
  payroll_date: string | null;
  pay_frequency: string; // Monthly, Weekly, Bi-Weekly, Hourly
}

export interface Payroll {
  id: string;
  employee_id: number;
  payroll_period_id: number;
  gross_salary: number;
  total_deductions: number;
  payroll_period: PayRollPeriod;
  employee: Employee;
  net_salary: number;
  tax_amount: number;
}