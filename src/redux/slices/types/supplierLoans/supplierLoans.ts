export interface SupplierLoanRequest {
    supplier_id: string;              // UUID of the supplier
    requested_amount: number;         // Amount requested (in currency units)
    interest_rate: string;            // Interest rate in percentage
    installments: string;              // Number of repayment installments
    purpose: string;                   // Purpose of the loan
    requested_at: string;              // ISO date string when request was made
    expected_repayment_date: string;   // ISO date string of expected repayment
  }
  