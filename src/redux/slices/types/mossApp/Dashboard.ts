export interface MossAppDashboardStats {
  user_statistics: Userstatistics;
  appointment_statistics: Appointmentstatistics;
  reminder_statistics: Reminderstatistics;
  drug_statistics: Drugstatistics;
  general_insights: Generalinsights;
}

interface Generalinsights {
  user_engagement: number;
  reminder_success_rate: number;
}

interface Drugstatistics {
  total_drugs: number;
}

interface Reminderstatistics {
  total_reminders: number;
  completed_reminders: number;
  upcoming_reminders: number;
  reminders_per_day: Appointmentsperday[];
}

interface Appointmentstatistics {
  total_appointments: number;
  upcoming_appointments: number;
  completed_appointments: number;
  missed_appointments: number;
  appointments_per_day: Appointmentsperday[];
}

interface Appointmentsperday {
  date: string;
  count: number;
}

interface Userstatistics {
  total_users: number;
  new_users_last_7_days: number;
  new_users_last_30_days: number;
  active_users: number;
  top_users_by_appointments: Topusersbyappointment[];
}

interface Topusersbyappointment {
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
  user_code: null;
  id_type: null;
  id_number: null;
  id_attachment: null;
  appointments_count: number;
}
