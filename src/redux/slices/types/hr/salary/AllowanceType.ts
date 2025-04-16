export interface AllowanceType {
  id: number;
  organisation_id: number;
  name: string;
  description: string;
  calculation_method: string, //amount" or "percent""
  allowance_is:string;  //mandatory, optional,adjustable
  amount: number,
  created_at: string;
  updated_at: string;
  allowances: any[];
}
