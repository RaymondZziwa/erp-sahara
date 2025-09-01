export const SUPPLIER_LOAN_ENDPOINTS = {
    SUPPLIER_LOANS: {
      GET_ALL: "/supplierloans/status/all",
      GET_BY_ID: (id: string) => `/supplierloans/${id}`,
      ADD: "/supplierloans/create",
        UPDATE: (id: string) => `/supplierloans/${id}/update`,
        APPROVE: (id: string) => `/supplierloans/${id}/approve`,
        REJECT: (id: string) => `/supplierloans/${id}/reject`,
    DISBURSE: (id: string) => `/supplierloans/${id}/disburse`,
      PAY: (id: string) => `/supplierloans/${id}/pay`,
    },
  };
  