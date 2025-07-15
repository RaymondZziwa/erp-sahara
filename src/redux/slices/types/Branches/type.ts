export interface Branch {
    name: string;
    code: string;
    phone_number: string;
    postal_address: string;
    email: string;
    country_id?: string | null; // Nullable
    timezone?: string | null;   // Nullable
    // currency?: string | null; // Uncomment if needed
}
  
export interface Country {
    id: string;
    name: string;
}
