export interface Reminder {
  id: number;
  drug_name: string;
  drug_id: number;
  frequency: string;
  form: string;
  prescription: string;
  period: string;
  time: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  utc_time: string;
  user: User;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}
