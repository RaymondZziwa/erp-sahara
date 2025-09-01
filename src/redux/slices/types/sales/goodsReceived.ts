export interface GoodsReceivedNote {
    id: string; // UUID format, e.g., "deabf1b1-096d-45a9-a594-47b416901808"
    delivery_note_id: string; // e.g., "deabf1b1-096d-45a9-a594-47b416901808"
    buyer_grn_number: string; // e.g., "7a74e6ed43ad"
    buyer_grn_date: string; // ISO format: "2025-08-01"
    is_grn_received: boolean;
    grn_remarks: string;
    received_by: string; // UUID of the person who received
    grn_attachment?: string | null; // Optional file path or URL to attachment
  }
  