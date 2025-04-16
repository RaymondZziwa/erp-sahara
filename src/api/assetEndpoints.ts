export const ASSETSENDPOINTS = {
    ASSETCATEGORIES: {
      GET_ALL: "/assets/assetcategories",
      GET_BY_ID: (id: string) => `/assets/assetcategories/${id}`,
      ADD: "/assets/assetcategories/create",
      UPDATE: (id: string) => `/assets/assetcategories/${id}/update`,
      DELETE: (id: string) => `/assets/assetcategories/${id}/delete`,
    },
    ASSETS: {
      GET_ALL: "/assets",
      GET_BY_ID: (id: string) => `/assets/assets/${id}`,
      ADD: "/assets/create",
      UPDATE: (id: string) => `/assets/assets/${id}/update`,
      DELETE: (id: string) => `/assets/assets/${id}/delete`,
      PAYMENTS: {
        CREATE: (assetId: string) => `/assets/${assetId}/assetpayments/create`,
      },
      INCOMES: {
        CREATE: (assetId: string) => `/assets/${assetId}/assetincomes/create`,
      },
      EXPENSES: {
        CREATE: (assetId: string) => `/assets/${assetId}/assetexpenses/create`,
      },
    },
  };