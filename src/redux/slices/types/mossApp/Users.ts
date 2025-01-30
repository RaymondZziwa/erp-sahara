export interface User {
  id: number;
  country_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  display_name: string;
  gender: string;
  email: null | string;
  phone_no: null | string;
  email_verified_at: null;
  profile_picture: null | string;
  joining_date: string;
  pin: null;
  account_type: string;
  account_status: string;
  points: string;
  firebase_token: null | string;
  created_at: string;
  updated_at: string;
  user_code: null | string;
  id_type: null;
  id_number: null;
  id_attachment: null;
}
