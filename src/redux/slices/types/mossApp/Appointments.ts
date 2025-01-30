export interface Appointment {
  id: number;
  facility_id: number;
  processed_by: null;
  appointment_type_id: number;
  description: string;
  status: string;
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  appointment_code: string;
  feedback: null;
  rating: null;
  utc_time: string;
  appointment_comments_count: number;
  facility: Facility;
  appointment_type: Appointmenttype;
  patient: Patient;
}

interface Patient {
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

interface Appointmenttype {
  id: number;
  name: string;
}

interface Facility {
  id: number;
  name: string;
  location: string;
}
