export const API_ENDPOINTS = {
  USERS: {
    GET_ALL: "/api/users",
    GET_BY_ID: (id: string) => `/api/users/${id}`,
    ADD: "/api/users/add",
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}/delete`,
  },
  CURRENCIES: {
    GET_ALL: "/accounts/currencies",
    GET_BY_ID: (id: string) => `/currencies/${id}`,
    ADD: "/accounts/currencies/add",
    UPDATE: (id: string) => `/accounts/currencies/${id}`,
    DELETE: (id: string) => `/accounts/currencies/${id}/delete`,
  },
  PAYMENT_METHODS: {
    GET_ALL: "/accounts/paymentmethod",
    GET_BY_ID: (id: string) => `/currencies/${id}`,
    ADD: "/accounts/paymentmethod/create",
    UPDATE: (id: string) => `/accounts/currencies/${id}`,
    DELETE: (id: string) => `/accounts/currencies/${id}/delete`,
  },
  ITEMS: {
    GET_ALL: "/api/items",
    ADD: "/api/items/add",
    UPDATE: (id: string) => `/api/items/${id}`,
    DELETE: (id: string) => `/api/items/${id}/delete`,
  },
  PURCHASE_REQUESTS: {
    GET_ALL: "/procurement/purchase_requests",
    GET_BY_ID: (id: string) => `/procurement/purchase_requests/${id}`,
    ADD: "/procurement/purchase_requests/create",
    UPDATE: (id: string) => `/procurement/purchase_requests/${id}/update`,
    DELETE: (id: string) => `/procurement/purchase_requests/${id}/delete`,
  },
  PROCUREMENT_TYPES: {
    GET_ALL: '/procurement/procurement-types',
    ADD: '/procurement/procurement-types/create',
    MODIFY: (id: string) =>  `/procurement/procurement-types/${id}/update`,
    DELETE: (id: string) => `/procurement/procurement-types/${id}/delete`
  },
  REQUEST_FOR_QUOTATION: {
    GET_ALL: "/procurement/rfq",
    GET_BY_ID: (id: string) => `/procurement/rfq/${id}`,
    ADD: "/procurement/rfq/create",
    UPDATE: (id: string) => `/procurement/rfq/${id}/update`,
    DELETE: (id: string) => `/procurement/rfq/${id}/delete`,
  },
  BIDS: {
    GET_ALL: "/procurement/supplier-quotations",
    GET_BY_ID: (id: string) => `/procurement/bids/${id}`,
    ADD: "/procurement/bids/create",
    UPDATE: (id: string) => `/procurement/supplier-quotations/${id}/update`,
    DELETE: (id: string) => `/procurement/supplier-quotations/${id}/delete`,
  },
  BID_EVALUATION: {
    GET_ALL: "/procurement/evaluations",
    GET_BY_ID: (id: string) => `/procurement/evaluations/${id}`,
    ADD: "/procurement/evaluations/create",
    UPDATE: (id: string) => `/procurement/evaluations/${id}/update`,
    DELETE: (id: string) => `/procurement/quotation-evaluations/${id}/delete`,
  },
  BID_EVALUATION_CRITERIA: {
    GET_ALL: "/procurement/evaluation-criteria",
    GET_BY_ID: (id: string) => `/procurement/evaluation_criteria/${id}`,
    ADD: "/procurement/evaluation_criteria/create",
    UPDATE: (id: string) => `/procurement/evaluation_criteria/${id}/update`,
    DELETE: (id: string) => `/procurement/evaluation-criteria/${id}/delete`,
  },
  SUPPLIERS: {
    GET_ALL: "/people/suppliers",
    GET_BY_ID: (id: string) => `/procurement/suppliers/${id}`,
    ADD: "/procurement/suppliers/create",
    UPDATE: (id: string) => `/procurement/suppliers/${id}/update`,
    DELETE: (id: string) => `/procurement/suppliers/${id}/delete`,
  },
  PURCHASE_ORDERS: {
    GET_ALL: "/procurement/purchase_orders",
    GET_BY_ID: (id: string) => `/procurement/purchase_orders/${id}`,
    ADD: "/procurement/purchase_orders/create",
    UPDATE: (id: string) => `/procurement/purchase_orders/${id}/update`,
    UPDATE_STATUS: (id: string) =>
      `/procurement/purchase_orders/${id}/updatestatus`,
    DELETE: (id: string) => `/procurement/purchase_orders/${id}/delete`,
  },
  GOODS_RECEIVED_NOTE: {
    GET_ALL: "/procurement/grns",
    GET_BY_ID: (id: string) => `/procurement/grns/${id}`,
    ADD: "/procurement/grns/create",
    UPDATE: (id: string) => `/procurement/grns/${id}/update`,
    DELETE: (id: string) => `/procurement/grns/${id}/delete`,
  },
  SERVICES: {
    GET_ALL: '/services',
    ADD: '/services/create',
    MODIFY: (id: string) => `/services/${id}/update`,
    DELETE: (id: string) => `/services/${id}`
  }
};
