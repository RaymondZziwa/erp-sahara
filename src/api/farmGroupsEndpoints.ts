export const FARM_GROUPS_ENDPOINTS = {
    FARM_GROUPS: {
      GET_ALL: "/erp/farm/farmgroups",
      GET_BY_ID: (id: string) => `/erp/farm/farmgroups/${id}`,
      ADD: "/erp/farm/farmgroups/create",
      UPDATE: (id: string) => `/erp/farm/farmgroups/${id}/update`,
      DELETE: (id: string) => `/erp/farm/farmgroups${id}/delete`,
    },
}