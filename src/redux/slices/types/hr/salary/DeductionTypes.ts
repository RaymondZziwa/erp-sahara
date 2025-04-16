export interface DeductionType {
  id: number;
  organisation_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;

  // Added fields to match expected payload
  is_tax: boolean;
  deduction_accounting_type: "income" | "expense" | "payable" | "asset";
  account_id: number;
  calculation_method: "amount" | "percent";
  deduction_is: "mandatory" | "optional" | "adjustable";
  amount: number;
}
