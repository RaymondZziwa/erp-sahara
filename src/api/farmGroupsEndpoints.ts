export const FARM_GROUPS_ENDPOINTS = {
    FARM_GROUPS: {
      GET_ALL: "/farm/farmgroups",
      GET_BY_ID: (id: string) => `/farm/farmgroups/${id}`,
      ADD: "/farm/farmgroups/create",
      UPDATE: (id: string) => `/farm/farmgroups/${id}/update`,
      DELETE: (id: string) => `/farm/farmgroups/${id}/delete`,
    },
}