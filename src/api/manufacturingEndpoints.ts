export const MANUFACTURING_ENDPOINTS = {
  WORK_CENTERS: {
    GET_ALL: "/manufacturing/workstations",
    GET_BY_ID: (id: string) => `/manufacturing/workstations/${id}`,
    ADD: "/manufacturing/workstations/create",
    UPDATE: (id: string) => `/manufacturing/workstations/${id}/update`,
    DELETE: (id: string) => `/manufacturing/workstations/${id}/delete`,
  },
  MATERIALS: {
    GET_ALL: "/manufacturing/materials",
    GET_BY_ID: (id: string) => `/manufacturing/materials/${id}`,
    ADD: "/manufacturing/materials/create",
    UPDATE: (id: string) => `/manufacturing/materials/${id}/update`,
    DELETE: (id: string) => `/manufacturing/materials/${id}/delete`,
  },
  WORK_CENTER_ORDERS: {
    GET_ALL: "/manufacturing/production_orders",
    GET_BY_ID: (id: string) => `/manufacturing/production_orders/${id}`,
    ADD: "/manufacturing/production_orders/create",
    UPDATE: (id: string) => `/manufacturing/production_orders/${id}/update`,
    DELETE: (id: string) => `/manufacturing/production_orders/${id}/delete`,
  },
  EQUIPMENT: {
    GET_ALL: "/manufacturing/machines",
    GET_BY_ID: (id: string) => `/manufacturing/machines/${id}`,
    ADD: "/manufacturing/machines/create",
    UPDATE: (id: string) => `/manufacturing/machines/${id}/update`,
    DELETE: (id: string) => `/manufacturing/machines/${id}/delete`,
  },
  EQUIPMENT_ASSIGNMENTS: {
    GET_ALL: "/manufacturing/machineassignments",
    GET_BY_ID: (id: string) => `/manufacturing/machineassignments/${id}`,
    ADD: "/manufacturing/machineassignments/create",
    UPDATE: (id: string) => `/manufacturing/machineassignments/${id}/update`,
    DELETE: (id: string) => `/manufacturing/machineassignments/${id}/delete`,
  },
  BILL_OF_MATERIAL: {
    GET_ALL: "/manufacturing/bom",
    GET_BY_ID: (id: string) => `/manufacturing/bom/${id}`,
    ADD: "/manufacturing/bom/create",
    UPDATE: (id: string) => `/manufacturing/bom/${id}/update`,
    DELETE: (id: string) => `/manufacturing/bom/${id}/delete`,
  },
  PRODUCTION_PLANS: {
    GET_ALL: (id: string) => `/manufacturing/${id}/schedules`,
    GET_BY_ID: (id: string) => `/manufacturing/productionplans/${id}`,
    ADD: "/manufacturing/productionplans/create",
    UPDATE: (id: string) => `/manufacturing/productionplans/${id}/update`,
    DELETE: (id: string) => `/manufacturing/productionplans/${id}/delete`,
  },
  PRODUCTION_PLAN_SCHEDULES: {
    GET_ALL: (productionPlanId: string) =>
      `/manufacturing/productionplans/${productionPlanId}/schedules`,
    GET_BY_ID: (id: string) => `/manufacturing/productionplans/${id}`,
    ADD: (id: string) => `/manufacturing/${id}/schedules/create`,
    UPDATE: (id: string) =>
      `/manufacturing/productionplans/schedules/${id}/update`,
    DELETE: (id: string) =>
      `/manufacturing/productionplans/schedules/${id}/delete`,
  },
  PRODUCTION_PLAN_MATERIALS: {
    GET_ALL: (productionPlanId: string) =>
      `/manufacturing/productionplans/${productionPlanId}/materialplans`,
    GET_BY_ID: (id: string) =>
      `/manufacturing/productionplans/3/materialplans/${id}`,
    ADD: "/manufacturing/productionplans/materialplans/create",
    UPDATE: (id: string) =>
      `/manufacturing/productionplans/materialplans/${id}/update`,
    DELETE: (id: string) => `/manufacturing/productionplans/${id}/delete`,
  },
  PRODUCTION_LINES: {
    GET_ALL: "/manufacturing/productionlines",
    GET_BY_ID: (id: string) => `/manufacturing/productionlines/${id}`,
    ADD: "/manufacturing/productionlines/create",
    UPDATE: (id: string) => `/manufacturing/productionlines/${id}/update`,
    DELETE: (id: string) => `/manufacturing/productionlines/${id}/delete`,
  },
  EQUIPMENT_MAINTANANCE_LOG: {
    GET_ALL: (equipmentId: string) =>
      `/manufacturing/machines/${equipmentId}/maintenancelogs`,
    GET_BY_ID: (equpmentId: string, id: string) =>
      `/manufacturing/machines/${equpmentId}/maintenancelogs/${id}`,
    ADD: (equipmentId: string) =>
      `/manufacturing/machines/${equipmentId}/maintenancelogs/create`,
    UPDATE: (equpmentId: string, id: string) =>
      `/manufacturing/machines/${equpmentId}/maintenancelogs/${id}/update`,
    DELETE: (equpmentId: string, id: string) =>
      `/manufacturing/machines/${equpmentId}/maintenancelogs/${id}/delete`,
  },
  CENTER_TASKS: {
    GET_ALL: (centerId: string) =>
      `/manufacturing/workorders/${centerId}/tasks`,
    GET_BY_ID: (id: string) => `/manufacturing/workstations/${id}`,
    ADD: (centerId: string) =>
      `/manufacturing/workorders/${centerId}/tasks/create`,
    UPDATE: (centerId: string, id: string) =>
      `/manufacturing/workorders/${centerId}/tasks/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `/manufacturing/workorders/${centerId}/tasks/${id}/delete`,
  },
  CENTER_CAPACITY_LOG: {
    GET_ALL: (centerId: string) =>
      `/manufacturing/workstations/${centerId}/capacitylog`,
    GET_BY_ID: (id: string) => `/manufacturing/workstations/${id}`,
    ADD: (centerId: string) =>
      `/manufacturing/workstations/${centerId}/capacitylog/create`,
    UPDATE: (centerId: string, id: string) =>
      `/manufacturing/workstations/${centerId}/capacitylog/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `/manufacturing/workstations/${centerId}/capacitylog/${id}/delete`,
  },
  CENTER_DOWNTIME_LOG: {
    GET_ALL: (centerId: string) =>
      `/manufacturing/workstations/${centerId}/downtimelog`,
    GET_BY_ID: (id: string) => `/manufacturing/workstations/${id}`,
    ADD: (centerId: string) =>
      `/manufacturing/workstations/${centerId}/downtimelog/create`,
    UPDATE: (centerId: string, id: string) =>
      `/manufacturing/workstations/${centerId}/downtimelog/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `/manufacturing/workstations/${centerId}/downtimelog/${id}/delete`,
  },

  PRODUCTION_OUTPUT: {
    GET_ALL: `/manufacturing/outputs`,
    GET_BY_ID: (id: string) => `/manufacturing/outputs/${id}`,
    ADD: `/manufacturing/outputs/create`,
    UPDATE: (id: string) =>
      `/manufacturing/outputs/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `/manufacturing/${id}/outputs/${id}/delete`,
  },
};
