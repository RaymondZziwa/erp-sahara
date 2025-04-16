import { Employee } from "../Employee";

export interface PayRollPeriod {
  id: number;
  organisation_id: number;
  period_name: string;
  start_date: string | null;
  end_date: string | null;
  payroll_date: string | null;
  pay_frequency: string; // You can remove this if you're using payment_every_after instead
  is_repetitive: boolean;
  payment_every_after: 'Monthly' | 'Weekly' | 'Bi-Weekly' | 'Hourly';
  paytime: 'Day' | 'End';
  pay_day: number;
  created_at: string;
  updated_at: string;
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