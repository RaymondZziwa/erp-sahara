export interface JobBoard {
    id: string;
    name: string,
    type: string,
    base_url: string,  
}

export interface CommissionStructure {
    id: string;
    name: string;
    commission_type: 'recruiter_placement' | 'recruiter_temp' | 'candidate_finder' | 'referral';
    type: 'percentage' | 'fixed_amount';
    amount: number;
    calculation_basis: 'placement_fee' | 'salary' | 'duration';
    rules: any[] | null; // You can replace `any` with a more specific type if rules have structure
}

export interface Skill {
    id: string;
    name: string;
    description?: string; // Optional field
}

export interface InvoiceSequence {
    id: string;
    prefix: string;
    use_year_month: boolean;   // changed from number to boolean for clarity
    use_branch_number: boolean;
    last_sequence: number;
}

export interface CandidateSequence {
        id: string;
        name: string;
        legal_name: string;
        tax_id: string;
        website: string;
        industry: string;
        description: string;
        company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5001+';
 }
  

 export interface CommunicationType {
    id: string;
    name: string;
    description?: string; // Optional field
 }

 export interface CommunicationTemplate {
    id: string;
    name: string;
    communication_type_id: string;
    subject: string;
    content: string;
    variables: string[];
    is_system: boolean; // defaults to true if not specified
 }
  
 export interface Candidate {
    salutation: "Mr" | "Mrs" | "Miss" | "Ms" | "Dr" | "Prof" | "Rev" | "Eng" | "Hon" | "Sir" | "Lady";
    first_name: string;
    last_name: string;
    other_name?: string | null;
    email: string;
    phone: string;
    gender: "male" | "female";
    marital_status: "single" | "married" | "divorced" | "widowed";
    branch_id: string;
    date_of_birth: string; // ISO date string e.g. "1995-06-10"
    profile_picture?: string | null;
    location?: string | null;
    current_job_title?: string | null;
    current_employer?: string | null;
    years_experience?: number | null;
    availability: string; // e.g. "Immediate"
    salary_expectations?: number | null;
    notice_period?: string | null; // e.g. "2 weeks"
    source: "Website" | "Walk-ins" | "LinkedIn" | "Google" | "Referrals" | "Internal Candidates" | "Socials" | "Others";
    linkedin_url?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;
    consent_date?: string | null; // ISO date string e.g. "2025-06-30"
    data_retention_period?: number | null; // presumably months or years
    resume?: string | null; // path or URL to resume file
  
    skills: Array<{
      skill_id: string;
      proficiency_level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
      years_experience?: number | null;
      last_used?: string | null; // ISO date string e.g. "2024-12-15"
      is_primary: boolean;
    }>;
  
    qualifications: Array<{
      institution: string;
      award: "PLE" | "O-Level" | "A-Level" | "Certificate" | "Diploma" | "Degree" | "PGD" | "Masters" | "PHD";
      field_of_study: string;
      start_date?: string | null; // ISO date string e.g. "2017-08-01"
      end_date?: string | null; // ISO date string e.g. "2021-05-30"
      is_completed: boolean;
      attachment?: string | null; // path or URL to attachment file
    }>;
  }
  
  export interface BillingTerm {
    id?: number; // Optional if creating
    billing_type: "monthly" | "hourly" | "annually"; // or string if open-ended
    rate: number;
    currency: string;
    payment_due_days: number;
  
    fee_percentage: number;
    min_fee: number;
    max_fee: number;
  
    expenses_billable: boolean;
    expense_markup_percentage: number;
  
    discount_type: "percentage" | "fixed"; // or string if dynamic
    discount_amount: number;
  
    notes?: string;
  }

  export interface Contact {
    organisation_id?: string; // Optional – only present for secondary contacts
    first_name: string;
    last_name: string;
    position: string;
    email: string;
    phone?: string;
    mobile?: string;
    is_primary: boolean;
    preferred_communication_methods?: string[]; // Optional – may not exist for secondary contacts
    notes?: string;
  }
  
  export interface Address {
    street_address_1: string;
    street_address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_primary: boolean;
  }
  
  export interface Company {
    name: string;
    legal_name: string;
    tax_id: string;
    website: string;
    industry: string;
    description: string;
    company_size: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1001-5000" | "5001+";
    contacts: Contact[];
    addresses: Address[];
  }
  
  export interface JobOrder {
    company_id: string; // UUID
    manager_id: string; // UUID
    title: string;
    job_reference: string;
    description: string;
    requirements: string;
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'closed' | 'paused';
    positions: number;
    positions_filled: number;
    start_date: string; // ISO date string (e.g., '2025-07-15')
    end_date: string;   // ISO date string (e.g., '2025-12-31')
    deadline: string;   // ISO date string (e.g., '2025-07-10')
    location_type: 'onsite' | 'remote' | 'hybrid';
    location_details: string;
  }
  
  export interface JobDistribution {
    job_order_id: string; // UUID
    job_board_id: string; // UUID
    distributed_by: string; // UUID
  
    external_reference_id?: string | null;
    status: "pending" | "active";
    posted_at?: string | null; // ISO date string
    removed_at?: string | null; // ISO date string
  
    distribution_metadata?: string | null; // JSON string
    notes?: string | null;
  }

  export interface JobContractTerms {
    job_order_id: string; // UUID
    company_id: string;   // UUID
    title: string;
    type: "direct-hire" | "contract" | "temp-to-perm" | "master";
    start_date: string;   // ISO date string (e.g. "2025-05-01")
    end_date: string;     // ISO date string (e.g. "2026-01-02")
    terms?: string | null;
    payment_terms?: string | null;
    termination_terms?: string | null;
    status: "draft" | "active" | "expired" | "terminated";
    signed_date: string;  // ISO date string (e.g. "2025-01-01")
    signed_by: string;    // UUID of the signer
    document_path?: File | null; // Optional contract file (used with FormData)
  }

  export interface CompanyCommunication {
    company_id: string;
    company_contact_id?: string | null;
    job_order_id?: string | null;
    initiated_by?: string | null; // Can default to logged-in user
    type: 'email' | 'call' | 'meeting' | 'note' | 'document';
    subject: string;
    content: string;
    direction: 'inbound' | 'outbound';
    date_time: string; // ISO 8601 date-time string
    needs_follow_up: boolean;
    follow_up_date?: string; // Optional depending on needs_follow_up
    follow_up_notes?: string;
    metadata?: string; // JSON string (can be parsed if needed)
  }

export interface JobApplication {
    id: string
    job_order_id: string;
    candidate_id: string;
    source: string;
    status: 'applied' | 'interviewing' | 'offered' | 'hired' | 'rejected'; // Extend as needed
    rating: number; // Typically 1–5
    cover_letter: string;
    application_answers: {
      experience_years: string;
      willing_to_relocate: boolean;
      preferred_location: string;
    };
    is_active: boolean;
  }

  export interface InterviewFeedback {
    technical_skills: number;
    communication: number;
    comments: string;
  }
  
  export interface InterviewParticipant {
    employee_id: string;
    is_required: boolean;
    response_status?: 'pending' | 'accepted' | 'declined' | null;
  }
  
  export type InterviewType = 'video' | 'in-person' | 'phone'; // extend as needed
  export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'; // extend as needed
  
  export interface Interview {
    application_id: string;
    interviewer_id: string;
    type: InterviewType;
    status: InterviewStatus;
    scheduled_at: string; // ISO date string
    duration: number; // in minutes
    location?: string | null;
    notes?: string | null;
    feedback?: InterviewFeedback | null;
    participants: InterviewParticipant[];
  }

  export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'withdrawn'; // Extend as needed
export type PayFrequency = 'monthly' | 'annual' | 'weekly' | 'bi-weekly'; // Extend as needed

export interface JobOffer {

  application_id: string;

  offer_number: string;
  salary: number;
  currency_id: string;
  pay_frequency: PayFrequency;
  start_date: string; // ISO date string (e.g. "2025-08-01")

  benefits: string;
  notes: string;
  status: OfferStatus;

  document_path: string;
}

  
  
  