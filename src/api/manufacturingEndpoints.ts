export const MANUFACTURING_ENDPOINTS = {
  WORK_CENTERS: {
    GET_ALL: "/erp/manfucaturing/workcenters",
    GET_BY_ID: (id: string) => `/erp/manfucaturing/workcenters/${id}`,
    ADD: "/erp/manfucaturing/workcenters/create",
    UPDATE: (id: string) => `/erp/manfucaturing/workcenters/${id}/update`,
    DELETE: (id: string) => `/erp/manfucaturing/workcenters/${id}/delete`,
  },
  WORK_CENTER_ORDERS: {
    GET_ALL: "/erp/manfucaturing/workorders",
    GET_BY_ID: (id: string) => `/erp/manfucaturing/workorders/${id}`,
    ADD: "/erp/manfucaturing/workorders/create",
    UPDATE: (id: string) => `/erp/manfucaturing/workorders/${id}/update`,
    DELETE: (id: string) => `/erp/manfucaturing/workorders/${id}/delete`,
  },
  EQUIPMENT: {
    GET_ALL: "/erp/manfucaturing/machines",
    GET_BY_ID: (id: string) => `/erp/manfucaturing/machines/${id}`,
    ADD: "/erp/manfucaturing/machines/create",
    UPDATE: (id: string) => `/erp/manfucaturing/machines/${id}/update`,
    DELETE: (id: string) => `/erp/manfucaturing/machines/${id}/delete`,
  },
  EQUIPMENT_ASSIGNMENTS: {
    GET_ALL: "/erp/manfucaturing/machineassignments",
    GET_BY_ID: (id: string) => `/erp/manfucaturing/machineassignments/${id}`,
    ADD: "/erp/manfucaturing/machineassignments/create",
    UPDATE: (id: string) =>
      `/erp/manfucaturing/machineassignments/${id}/update`,
    DELETE: (id: string) =>
      `/erp/manfucaturing/machineassignments/${id}/delete`,
  },
  BILL_OF_MATERIAL: {
    GET_ALL: "/erp/manfucaturing/bom",
    GET_BY_ID: (id: string) => `/erp/manfucaturing/bom/${id}`,
    ADD: "/erp/manfucaturing/bom/create",
    UPDATE: (id: string) => `/erp/manfucaturing/bom/${id}/update`,
    DELETE: (id: string) => `/erp/manfucaturing/bom/${id}/delete`,
  },
  PRODUCTION_PLANS: {
    GET_ALL: "/erp/manfucaturing/productionplans",
    GET_BY_ID: (id: string) => `/erp/manfucaturing/productionplans/${id}`,
    ADD: "/erp/manfucaturing/productionplans/create",
    UPDATE: (id: string) => `/erp/manfucaturing/productionplans/${id}/update`,
    DELETE: (id: string) => `/erp/manfucaturing/productionplans/${id}/delete`,
  },
  PRODUCTION_PLAN_SCHEDULES: {
    GET_ALL: (productionPlanId: string) =>
      `/erp/manfucaturing/productionplans/${productionPlanId}/schedules`,
    GET_BY_ID: (id: string) => `/erp/manfucaturing/productionplans/${id}`,
    ADD: "/erp/manfucaturing/productionplans/schedules/create",
    UPDATE: (id: string) =>
      `/erp/manfucaturing/productionplans/schedules/${id}/update`,
    DELETE: (id: string) =>
      `/erp/manfucaturing/productionplans/schedules/${id}/delete`,
  },
  PRODUCTION_PLAN_MATERIALS: {
    GET_ALL: (productionPlanId: string) =>
      `/erp/manfucaturing/productionplans/${productionPlanId}/materialplans`,
    GET_BY_ID: (id: string) =>
      `/manfucaturing/productionplans/3/materialplans/${id}`,
    ADD: "/erp/manfucaturing/productionplans/materialplans/create",
    UPDATE: (id: string) =>
      `/erp/manfucaturing/productionplans/materialplans/${id}/update`,
    DELETE: (id: string) => `/erp/manfucaturing/productionplans/${id}/delete`,
  },
  PRODUCTION_LINES: {
    GET_ALL: "/erp/manfucaturing/productionlines",
    GET_BY_ID: (id: string) => `/erp/manfucaturing/productionlines/${id}`,
    ADD: "/erp/manfucaturing/productionlines/create",
    UPDATE: (id: string) => `/erp/manfucaturing/productionlines/${id}/update`,
    DELETE: (id: string) => `/erp/manfucaturing/productionlines/${id}/delete`,
  },
  EQUIPMENT_MAINTANANCE_LOG: {
    GET_ALL: (equipmentId: string) =>
      `/erp/manfucaturing/machines/${equipmentId}/maintenancelogs`,
    GET_BY_ID: (equpmentId: string, id: string) =>
      `/erp/manfucaturing/machines/${equpmentId}/maintenancelogs/${id}`,
    ADD: (equipmentId: string) =>
      `/erp/manfucaturing/machines/${equipmentId}/maintenancelogs/create`,
    UPDATE: (equpmentId: string, id: string) =>
      `/erp/manfucaturing/machines/${equpmentId}/maintenancelogs/${id}/update`,
    DELETE: (equpmentId: string, id: string) =>
      `/erp/manfucaturing/machines/${equpmentId}/maintenancelogs/${id}/delete`,
  },
  CENTER_TASKS: {
    GET_ALL: (centerId: string) =>
      `/erp/manfucaturing/workorders/${centerId}/tasks`,
    GET_BY_ID: (id: string) => `/erp/manfucaturing/workcenters/${id}`,
    ADD: (centerId: string) =>
      `/erp/manfucaturing/workorders/${centerId}/tasks/create`,
    UPDATE: (centerId: string, id: string) =>
      `/erp/manfucaturing/workorders/${centerId}/tasks/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `/erp/manfucaturing/workorders/${centerId}/tasks/${id}/delete`,
  },
  CENTER_CAPACITY_LOG: {
    GET_ALL: (centerId: string) =>
      `/erp/manfucaturing/workcenters/${centerId}/capacitylog`,
    GET_BY_ID: (id: string) => `/erp/manfucaturing/workcenters/${id}`,
    ADD: (centerId: string) =>
      `/erp/manfucaturing/workcenters/${centerId}/capacitylog/create`,
    UPDATE: (centerId: string, id: string) =>
      `/erp/manfucaturing/workcenters/${centerId}/capacitylog/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `/erp/manfucaturing/workcenters/${centerId}/capacitylog/${id}/delete`,
  },
  CENTER_DOWNTIME_LOG: {
    GET_ALL: (centerId: string) =>
      `/erp/manfucaturing/workcenters/${centerId}/downtimelog`,
    GET_BY_ID: (id: string) => `/erp/manfucaturing/workcenters/${id}`,
    ADD: (centerId: string) =>
      `/erp/manfucaturing/workcenters/${centerId}/downtimelog/create`,
    UPDATE: (centerId: string, id: string) =>
      `/erp/manfucaturing/workcenters/${centerId}/downtimelog/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `/erp/manfucaturing/workcenters/${centerId}/downtimelog/${id}/delete`,
  },
};
