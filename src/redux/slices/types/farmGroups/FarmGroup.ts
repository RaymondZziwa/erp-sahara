export interface Customer {
  id?: number;
  organisation_id?: number;
  organization_name: string;
  email?: string;
  organization_type?: string;
  industry?: string;
  primary_contact_person?: string;
  contact_person_title?: string;
  phone_number?: string;
  headquarters_address?: string;
  billing_address?: string;
  shipping_address?: string;
  payment_terms?: string;
  bank_details?: string;
  tax_identification_number?: string;
  credit_limit?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FarmGroup {
  id: number;
  organisation_id: number;
  customer_id: number;
  number_of_members: number;
  description?: string;
  customer?: Customer; 
  created_at?: string;
  updated_at?: string;
}

  