export interface ReminderStats {
  appointments_per_month: Appointmentspermonth[];
  reminders_per_month: Appointmentspermonth[];
}

interface Appointmentspermonth {
  month: string;
  count: number;
}
