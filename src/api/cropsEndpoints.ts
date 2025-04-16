export const CROPS_ENDPOINTS = {
    CROPS: {
      GET_ALL: "/farm/crops",
      GET_BY_ID: (id: string) => `/farm/crops/${id}`,
      ADD: "/farm/crops/create",
      UPDATE: (id: string) => `/farm/crops/${id}/update`,
      DELETE: (id: string) => `/farm/crops/${id}/delete`,
    },
}