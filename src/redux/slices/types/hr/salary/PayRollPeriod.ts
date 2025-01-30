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
