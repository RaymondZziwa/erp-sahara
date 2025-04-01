export const ASSETSENDPOINTS = {
    ASSETCATEGORIES: {
      GET_ALL: "/erp/assets/assetcategories",
      GET_BY_ID: (id: string) => `/erp/assets/assetcategories/${id}`,
      ADD: "/erp/assets/assetcategories/create",
      UPDATE: (id: string) => `/erp/assets/assetcategories/${id}/update`,
      DELETE: (id: string) => `/erp/assets/assetcategories/${id}/delete`,
    },
    ASSETS: {
      GET_ALL: "/erp/assets",
      GET_BY_ID: (id: string) => `/erp/assets/assets/${id}`,
      ADD: "/erp/assets/create",
      UPDATE: (id: string) => `/erp/assets/assets/${id}/update`,
      DELETE: (id: string) => `/erp/assets/assets/${id}/delete`,
      PAYMENTS: {
        CREATE: (assetId: string) => `/erp/assets/${assetId}/assetpayments/create`,
      },
      INCOMES: {
        CREATE: (assetId: string) => `/erp/assets/${assetId}/assetincomes/create`,
      },
      EXPENSES: {
        CREATE: (assetId: string) => `/erp/assets/${assetId}/assetexpenses/create`,
      },
    },
  };