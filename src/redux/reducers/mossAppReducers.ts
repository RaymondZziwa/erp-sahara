import appointmentsSlice from "../slices/mossApp/appointmentsSlice";
import appointmentTyesSlice from "../slices/mossApp/appointmentTyesSlice";
import communitiesSlice from "../slices/mossApp/communitiesSlice";
import conditionsSlice from "../slices/mossApp/conditionsSlice";
import dashboardSlice from "../slices/mossApp/dashboardSlice";
import drugsSlice from "../slices/mossApp/drugsSlice";
import facilitiesSlice from "../slices/mossApp/facilitiesSlice";
import interestsSlice from "../slices/mossApp/interestsSlice";
import remindersSlice from "../slices/mossApp/remindersSlice";
import reminderStatsSlice from "../slices/mossApp/reminderStatsSlice";
import slidersReducer from "../slices/mossApp/slidersSlice";
import storiesSlice from "../slices/mossApp/storiesSlice";
import tipsSlice from "../slices/mossApp/tipsSlice";
import usersSlice from "../slices/mossApp/usersSlice";
import healthWorkersSlice from "../slices/mossApp/healthWorkersSice";

const MOSS_APP_REDUCERS = {
  sliders: slidersReducer,
  healthConditioons: conditionsSlice,
  interests: interestsSlice,
  reminders: remindersSlice,
  drugs: drugsSlice,
  facilities: facilitiesSlice,
  tips: tipsSlice,
  communities: communitiesSlice,
  stories: storiesSlice,
  users: usersSlice,
  appointmentTyes: appointmentTyesSlice,
  appointments: appointmentsSlice,
  dashboardStats: dashboardSlice,
  reminderStats: reminderStatsSlice,
  healthWorkers: healthWorkersSlice,
};
export default MOSS_APP_REDUCERS;
