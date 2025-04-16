export const PROJECTS_ENDPOINTS = {
  CATEGORIES: {
    GET_ALL: "/projects/categories",
    GET_BY_ID: (id: string) => `/projects/categories/${id}`,
    ADD: "/projects/categories/create",
    UPDATE: (id: string) => `/projects/categories/${id}/update`,
    DELETE: (id: string) => `/projects/categories/${id}/delete`,
  },
  SECTORS: {
    GET_ALL: "/projects/sectors",
    GET_BY_ID: (id: string) => `/projects/sectors/${id}`,
    ADD: "/projects/sectors/create",
    UPDATE: (id: string) => `/projects/sectors/${id}/update`,
    DELETE: (id: string) => `/projects/sectors/${id}/delete`,
  },
  PARTNERS: {
    GET_ALL: "/projects/partners",
    GET_BY_ID: (id: string) => `/projects/partners/${id}`,
    ADD: "/projects/partners/create",
    UPDATE: (id: string) => `/projects/partners/${id}/update`,
    DELETE: (id: string) => `/projects/partners/${id}/delete`,
  },
  PROJECTS: {
    GET_ALL: "/projects",
    GET_BY_ID: (id: string) => `/projects/${id}`,
    ADD: "/projects/create",
    UPDATE: (id: string) => `/projects/${id}/update`,
    DELETE: (id: string) => `/projects/${id}/delete`,
  },
  AGE_GROUPS: {
    GET_ALL: "/projects/agegroups",
    GET_BY_ID: (id: string) => `/projects/agegroups/${id}`,
    ADD: "/projects/agegroups/create",
    UPDATE: (id: string) => `/projects/agegroups/${id}/update`,
    DELETE: (id: string) => `/projects/agegroups/${id}/delete`,
  },
  PROJECT_ACTIVITIES: {
    GET_ALL: (id: string) => `/projects/${id}/activities`,
    GET_BY_ID: (id: string) => `/projects/${id}/activities`,
    ADD: (id: string) => `/projects/${id}/activities/create`,
    UPDATE: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/update`,
    DELETE: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/delete`,
  },
  ROLES: {
    GET_ALL: (projectId: string) => `/projects/${projectId}/projectroles`,
    GET_BY_ID: (projectId: string) => `/projects/${projectId}/projectroles`,
    ADD: (projectId: string) =>
      `/projects/${projectId}/projectroles/create`,
    UPDATE: (projectId: string, roleId: string) =>
      `/projects/${projectId}/projectroles/${roleId}/update`,
    DELETE: (projectId: string, roleId: string) =>
      `/projects/${projectId}/projectroles/${roleId}/delete`,
  },
  PROJECT_TEAMS: {
    GET_ALL: (projectId: string) => `/projects/${projectId}/projectteams`,
    GET_BY_ID: (projectId: string) => `/projects/${projectId}/projectteams`,
    ADD: (projectId: string) =>
      `/projects/${projectId}/projectteams/create`,
    UPDATE: (projectId: string, teamId: string) =>
      `/projects/${projectId}/projectteams/${teamId}/update`,
    DELETE: (projectId: string, teamId: string) =>
      `/projects/${projectId}/projectteams/${teamId}/delete`,
  },
  PROJECT_ACTIVITY_PLANS: {
    GET_ALL: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/plans`,
    GET_BY_ID: (projectId: string) => `/projects/${projectId}/activities`,
    ADD: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/plans/create`,
    UPDATE: (projectId: string, activityId: string, planId: string) =>
      `/projects/${projectId}/activities/${activityId}/plans/${planId}/update`,
    DELETE: (projectId: string, activityId: string, planId: string) =>
      `/projects/${projectId}/activities/${activityId}/plans/${planId}/delete`,
  },
  PROJECT_ACTIVITY_PROGRAMS: {
    GET_ALL: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/programs`,
    GET_BY_ID: (projectId: string) => `/projects/${projectId}/activities`,
    ADD: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/programs/create`,
    UPDATE: (projectId: string, activityId: string, planId: string) =>
      `/projects/${projectId}/activities/${activityId}/programs/${planId}/update`,
    DELETE: (projectId: string, activityId: string, planId: string) =>
      `/projects/${projectId}/activities/${activityId}/programs/${planId}/delete`,
  },
  PROJECT_ACTIVITY_PARAMETERS: {
    GET_ALL: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/parameters`,
    GET_BY_ID: (projectId: string) => `/projects/${projectId}/activities`,
    ADD: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/parameters/create`,
    UPDATE: (projectId: string, activityId: string, parameterId: string) =>
      `/projects/${projectId}/activities/${activityId}/parameters/${parameterId}/update`,
    DELETE: (projectId: string, activityId: string, parameterId: string) =>
      `/projects/${projectId}/activities/${activityId}/parameters/${parameterId}/delete`,
  },
  PROJECT_ACTIVITY_PARAMETER_RESULTS: {
    GET_ALL: (projectId: string, activityId: string, parameterId: string) =>
      `/projects/${projectId}/activities/${activityId}/parameter/${parameterId}/parameterresults`,
    GET_BY_ID: (
      projectId: string,
      activityId: string,
      parameterId: string,
      parameterResultId: string
    ) =>
      `/projects/${projectId}/activities/${activityId}/parameter/${parameterId}/parameterresults/${parameterResultId}`,
    ADD: (projectId: string, activityId: string, parameterId: string) =>
      `/projects/${projectId}/activities/${activityId}/parameter/${parameterId}/parameterresults/create`,
    UPDATE: (
      projectId: string,
      activityId: string,
      parameterId: string,
      parameterResultId: string
    ) =>
      `/projects/${projectId}/activities/${activityId}/parameter/${parameterId}/parameterresults/${parameterResultId}/update`,
    DELETE: (
      projectId: string,
      activityId: string,
      parameterId: string,
      parameterResultId: string
    ) =>
      `/projects/${projectId}/activities/${activityId}/parameter/${parameterId}/parameterresults/${parameterResultId}/delete`,
  },
  PROJECT_ACTIVITY_SERVICES: {
    GET_ALL: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/services`,
    GET_BY_ID: (projectId: string) => `/projects/${projectId}/activities`,
    ADD: (projectId: string, activityId: string) =>
      `/projects/${projectId}/activities/${activityId}/services/create`,
    UPDATE: (projectId: string, activityId: string, planId: string) =>
      `/projects/${projectId}/activities/${activityId}/services/${planId}/update`,
    DELETE: (projectId: string, activityId: string, planId: string) =>
      `/projects/${projectId}/activities/${activityId}/services/${planId}/delete`,
  },
};