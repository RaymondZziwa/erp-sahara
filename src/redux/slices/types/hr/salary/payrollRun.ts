export interface PayrollGross {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  basic_pay: string;
  allowances_total: string;
  overtime_total: string;
  gross_pay: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PayrollRun {
  id: string;
  payroll_schedule_id: string;
  name: string;
  run_date: string; // e.g. "2025-09-26"
  remarks: string;
  status: string; // e.g. "generated"
  generated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  grosses: PayrollGross[];
}
