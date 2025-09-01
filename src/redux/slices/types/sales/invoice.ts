export interface Invoice {
    id: string; // UUID format, e.g., "deabf1b1-096d-45a9-a594-47b416901808"
    sale_order_id: string;
    grn_id?: string | null; // Nullable GRN reference
    issue_date: string; // ISO date string, e.g., "2025-07-14"
    due_date: string;   // ISO date string, e.g., "2025-07-31"
    currency_id: string;

    status: 'draft' | 'sent'; // Can be expanded if you use more statuses
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;

    notes?: string | null;
    payment_instructions?: string | null;

    items: InvoiceItem[];
    
}

export interface InvoiceItem {
    sale_order_item_id: string;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    tax_amount: number;
  }