export interface Opportunity {
    lead_id?: string | null; // UUID, nullable
    assigned_to?: string | null; // User ID or name, nullable
    title: string; // Required
    description?: string | null; // Nullable
    value?: string | null; // Nullable, consider changing to number if it's monetary
    stage: 'new' | 'initial' | 'negotiation' | 'proposal' | 'closed_won' | 'closed_lost'; // Required enum
    expected_close_date?: string | null; // ISO date string, nullable
}
  