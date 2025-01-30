import activitiesSlice from "../slices/projects/activitiesSlice";
import activityPlansSlice from "../slices/projects/activityPlansSlice";
import activityPrograms from "../slices/projects/activityPrograms";
import activityServicesSlice from "../slices/projects/activityServicesSlice";
import ageGroupsSlice from "../slices/projects/ageGroupsSlice";
import partnersSlice from "../slices/projects/partnersSlice";
import projectCategoriesSlice from "../slices/projects/projectCategoriesSlice";
import projectParametersSlice from "../slices/projects/projectActivityParametersSlice";
import projectRolesSlice from "../slices/projects/projectRolesSlice";
import projectTeamSlice from "../slices/projects/projectTeamSlice";
import sectorsSlice from "../slices/projects/sectorsSlice";
import activityParameterResultsSlice from "../slices/projects/activityParameterResultsSlice";

export const PROJECTS_REDUCERS = {
  projectCategories: projectCategoriesSlice,
  sectors: sectorsSlice,
  partners: partnersSlice,
  ageGroups: ageGroupsSlice,
  projectActivities: activitiesSlice,
  projectActivityPlans: activityPlansSlice,
  projectActivityPrograms: activityPrograms,
  projectActivityServices: activityServicesSlice,
  projectRoles: projectRolesSlice,
  projectTeam: projectTeamSlice,
  projectACtivityParameters: projectParametersSlice,
  activityParameterResults: activityParameterResultsSlice,
};
