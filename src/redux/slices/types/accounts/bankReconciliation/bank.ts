export interface Branch {
  name: string;
  contact_person: string;
  contact_phone: string;
}

export interface Bank {
  id: string;
  name: string;
  email: string;
  description: string;
  branches: Branch[];
}

export interface BankAccount {
  id: string;
  bank_id: string;
  bank_branch_id?: string | null;
  currency_id: string;
  name: string;
  account_no: string;
  branch_code?: string | null;
  swift_code?: string | null;
  description?: string | null;
}
