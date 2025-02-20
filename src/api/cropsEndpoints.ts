export const CROPS_ENDPOINTS = {
    CROPS: {
      GET_ALL: "/erp/farm/crops",
      GET_BY_ID: (id: string) => `/erp/farm/crops/${id}`,
      ADD: "/erp/farm/crops/create",
      UPDATE: (id: string) => `/erp/farm/crops/${id}/update`,
      DELETE: (id: string) => `/erp/farm/crops${id}/delete`,
    },
}