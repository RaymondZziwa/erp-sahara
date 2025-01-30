export interface Story {
  id: number;
  title: string;
  story: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  comments_count: number;
  user: User;
}

interface User {
  id: number;
  country_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  display_name: string;
  gender: string;
  email: string;
  phone_no: null;
  email_verified_at: null;
  profile_picture: string;
  joining_date: string;
  pin: null;
  account_type: string;
  account_status: string;
  points: string;
  firebase_token: string;
  created_at: string;
  updated_at: string;
  user_code: null;
  id_type: null;
  id_number: null;
  id_attachment: null;
}
