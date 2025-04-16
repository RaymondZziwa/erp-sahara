export const MANUFACTURING_ENDPOINTS = {
  WORK_CENTERS: {
    GET_ALL: "manfucaturing/workcenters",
    GET_BY_ID: (id: string) => `manfucaturing/workcenters/${id}`,
    ADD: "manfucaturing/workcenters/create",
    UPDATE: (id: string) => `manfucaturing/workcenters/${id}/update`,
    DELETE: (id: string) => `manfucaturing/workcenters/${id}/delete`,
  },
  WORK_CENTER_ORDERS: {
    GET_ALL: "manfucaturing/workorders",
    GET_BY_ID: (id: string) => `manfucaturing/workorders/${id}`,
    ADD: "manfucaturing/workorders/create",
    UPDATE: (id: string) => `manfucaturing/workorders/${id}/update`,
    DELETE: (id: string) => `manfucaturing/workorders/${id}/delete`,
  },
  EQUIPMENT: {
    GET_ALL: "manfucaturing/machines",
    GET_BY_ID: (id: string) => `manfucaturing/machines/${id}`,
    ADD: "manfucaturing/machines/create",
    UPDATE: (id: string) => `manfucaturing/machines/${id}/update`,
    DELETE: (id: string) => `manfucaturing/machines/${id}/delete`,
  },
  EQUIPMENT_ASSIGNMENTS: {
    GET_ALL: "manfucaturing/machineassignments",
    GET_BY_ID: (id: string) => `manfucaturing/machineassignments/${id}`,
    ADD: "manfucaturing/machineassignments/create",
    UPDATE: (id: string) => `manfucaturing/machineassignments/${id}/update`,
    DELETE: (id: string) => `manfucaturing/machineassignments/${id}/delete`,
  },
  BILL_OF_MATERIAL: {
    GET_ALL: "manfucaturing/bom",
    GET_BY_ID: (id: string) => `manfucaturing/bom/${id}`,
    ADD: "manfucaturing/bom/create",
    UPDATE: (id: string) => `manfucaturing/bom/${id}/update`,
    DELETE: (id: string) => `manfucaturing/bom/${id}/delete`,
  },
  PRODUCTION_PLANS: {
    GET_ALL: "manfucaturing/productionplans",
    GET_BY_ID: (id: string) => `manfucaturing/productionplans/${id}`,
    ADD: "manfucaturing/productionplans/create",
    UPDATE: (id: string) => `manfucaturing/productionplans/${id}/update`,
    DELETE: (id: string) => `manfucaturing/productionplans/${id}/delete`,
  },
  PRODUCTION_PLAN_SCHEDULES: {
    GET_ALL: (productionPlanId: string) =>
      `manfucaturing/productionplans/${productionPlanId}/schedules`,
    GET_BY_ID: (id: string) => `manfucaturing/productionplans/${id}`,
    ADD: "manfucaturing/productionplans/schedules/create",
    UPDATE: (id: string) =>
      `manfucaturing/productionplans/schedules/${id}/update`,
    DELETE: (id: string) =>
      `manfucaturing/productionplans/schedules/${id}/delete`,
  },
  PRODUCTION_PLAN_MATERIALS: {
    GET_ALL: (productionPlanId: string) =>
      `manfucaturing/productionplans/${productionPlanId}/materialplans`,
    GET_BY_ID: (id: string) =>
      `manfucaturing/productionplans/3/materialplans/${id}`,
    ADD: "manfucaturing/productionplans/materialplans/create",
    UPDATE: (id: string) =>
      `manfucaturing/productionplans/materialplans/${id}/update`,
    DELETE: (id: string) => `manfucaturing/productionplans/${id}/delete`,
  },
  PRODUCTION_LINES: {
    GET_ALL: "manfucaturing/productionlines",
    GET_BY_ID: (id: string) => `manfucaturing/productionlines/${id}`,
    ADD: "manfucaturing/productionlines/create",
    UPDATE: (id: string) => `manfucaturing/productionlines/${id}/update`,
    DELETE: (id: string) => `manfucaturing/productionlines/${id}/delete`,
  },
  EQUIPMENT_MAINTANANCE_LOG: {
    GET_ALL: (equipmentId: string) =>
      `manfucaturing/machines/${equipmentId}/maintenancelogs`,
    GET_BY_ID: (equpmentId: string, id: string) =>
      `manfucaturing/machines/${equpmentId}/maintenancelogs/${id}`,
    ADD: (equipmentId: string) =>
      `manfucaturing/machines/${equipmentId}/maintenancelogs/create`,
    UPDATE: (equpmentId: string, id: string) =>
      `manfucaturing/machines/${equpmentId}/maintenancelogs/${id}/update`,
    DELETE: (equpmentId: string, id: string) =>
      `manfucaturing/machines/${equpmentId}/maintenancelogs/${id}/delete`,
  },
  CENTER_TASKS: {
    GET_ALL: (centerId: string) =>
      `manfucaturing/workorders/${centerId}/tasks`,
    GET_BY_ID: (id: string) => `manfucaturing/workcenters/${id}`,
    ADD: (centerId: string) =>
      `manfucaturing/workorders/${centerId}/tasks/create`,
    UPDATE: (centerId: string, id: string) =>
      `manfucaturing/workorders/${centerId}/tasks/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `manfucaturing/workorders/${centerId}/tasks/${id}/delete`,
  },
  CENTER_CAPACITY_LOG: {
    GET_ALL: (centerId: string) =>
      `manfucaturing/workcenters/${centerId}/capacitylog`,
    GET_BY_ID: (id: string) => `manfucaturing/workcenters/${id}`,
    ADD: (centerId: string) =>
      `manfucaturing/workcenters/${centerId}/capacitylog/create`,
    UPDATE: (centerId: string, id: string) =>
      `manfucaturing/workcenters/${centerId}/capacitylog/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `manfucaturing/workcenters/${centerId}/capacitylog/${id}/delete`,
  },
  CENTER_DOWNTIME_LOG: {
    GET_ALL: (centerId: string) =>
      `manfucaturing/workcenters/${centerId}/downtimelog`,
    GET_BY_ID: (id: string) => `manfucaturing/workcenters/${id}`,
    ADD: (centerId: string) =>
      `manfucaturing/workcenters/${centerId}/downtimelog/create`,
    UPDATE: (centerId: string, id: string) =>
      `manfucaturing/workcenters/${centerId}/downtimelog/${id}/update`,
    DELETE: (centerId: string, id: string) =>
      `manfucaturing/workcenters/${centerId}/downtimelog/${id}/delete`,
  },
};
