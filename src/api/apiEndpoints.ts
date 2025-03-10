export const API_ENDPOINTS = {
  USERS: {
    GET_ALL: "/api/users",
    GET_BY_ID: (id: string) => `/api/users/${id}`,
    ADD: "/api/users/add",
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}/delete`,
  },
  CURRENCIES: {
    GET_ALL: "/erp/accounts/currencies",
    GET_BY_ID: (id: string) => `/erp/currencies/${id}`,
    ADD: "/erp/accounts/currencies/add",
    UPDATE: (id: string) => `/erp/accounts/currencies/${id}`,
    DELETE: (id: string) => `/erp/accounts/currencies/${id}/delete`,
  },
  PAYMENT_METHODS: {
    GET_ALL: "/erp/accounts/paymentmethod",
    GET_BY_ID: (id: string) => `/erp/currencies/${id}`,
    ADD: "/erp/accounts/paymentmethod/create",
    UPDATE: (id: string) => `/erp/accounts/currencies/${id}`,
    DELETE: (id: string) => `/erp/accounts/currencies/${id}/delete`,
  },
  ITEMS: {
    GET_ALL: "/api/items",
    ADD: "/api/items/add",
    UPDATE: (id: string) => `/api/items/${id}`,
    DELETE: (id: string) => `/api/items/${id}/delete`,
  },
  PURCHASE_REQUESTS: {
    GET_ALL: "/erp/procurement/purchase_requests",
    GET_BY_ID: (id: string) => `/erp/procurement/purchase_requests/${id}`,
    ADD: "/erp/procurement/purchase_requests/create",
    UPDATE: (id: string) => `/erp/procurement/purchase_requests/${id}/update`,
    DELETE: (id: string) => `/erp/procurement/purchase_requests/${id}/delete`,
  },
  REQUEST_FOR_QUOTATION: {
    GET_ALL: "/erp/procurement/rfq",
    GET_BY_ID: (id: string) => `/erp/procurement/rfq/${id}`,
    ADD: "/erp/procurement/rfq/create",
    UPDATE: (id: string) => `/erp/procurement/rfq/${id}/update`,
    DELETE: (id: string) => `/erp/procurement/rfq/${id}/delete`,
  },
  BIDS: {
    GET_ALL: "/erp/procurement/bids",
    GET_BY_ID: (id: string) => `/erp/procurement/bids/${id}`,
    ADD: "/erp/procurement/bids/create",
    UPDATE: (id: string) => `/erp/procurement/bids/${id}/update`,
    DELETE: (id: string) => `/erp/procurement/bids/${id}/delete`,
  },
  BID_EVALUATION: {
    GET_ALL: "/erp/procurement/evaluations",
    GET_BY_ID: (id: string) => `/erp/procurement/evaluations/${id}`,
    ADD: "/erp/procurement/evaluations/create",
    UPDATE: (id: string) => `/erp/procurement/evaluations/${id}/update`,
    DELETE: (id: string) => `/erp/procurement/evaluations/${id}/delete`,
  },
  BID_EVALUATION_CRITERIA: {
    GET_ALL: "/erp/procurement/evaluation_criteria",
    GET_BY_ID: (id: string) => `erp/procurement/evaluation_criteria/${id}`,
    ADD: "/erp/procurement/evaluation_criteria/create",
    UPDATE: (id: string) => `/erp/procurement/evaluation_criteria/${id}/update`,
    DELETE: (id: string) => `/erp/procurement/evaluation_criteria/${id}/delete`,
  },
  SUPPLIERS: {
    GET_ALL: "/erp/procurement/suppliers",
    GET_BY_ID: (id: string) => `/erp/procurement/suppliers/${id}`,
    ADD: "/erp/procurement/suppliers/create",
    UPDATE: (id: string) => `/erp/procurement/suppliers/${id}/update`,
    DELETE: (id: string) => `/erp/procurement/suppliers/${id}/delete`,
  },
  PURCHASE_ORDERS: {
    GET_ALL: "/erp/procurement/purchase_orders",
    GET_BY_ID: (id: string) => `/erp/procurement/purchase_orders/${id}`,
    ADD: "/erp/procurement/purchase_orders/create",
    UPDATE: (id: string) => `/erp/procurement/purchase_orders/${id}/update`,
    UPDATE_STATUS: (id: string) =>
      `/erp/procurement/purchase_orders/${id}/updatestatus`,
    DELETE: (id: string) => `/erp/procurement/purchase_orders/${id}/delete`,
  },
  GOODS_RECEIVED_NOTE: {
    GET_ALL: "/erp/procurement/grns",
    GET_BY_ID: (id: string) => `/erp/procurement/grns/${id}`,
    ADD: "/erp/procurement/grns/create",
    UPDATE: (id: string) => `/erp/procurement/grns/${id}/update`,
    DELETE: (id: string) => `/erp/procurement/grns/${id}/delete`,
  },
};
