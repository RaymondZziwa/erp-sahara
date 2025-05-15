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
      UPDATE: (id: string) => `/assets/${id}/update`,
      DELETE: (id: string) => `/assets/${id}/delete`,
      PAYMENTS: {
        CREATE: (assetId: string) => `/assets/${assetId}/assetpayments/create`,
        GET_ALL: (assetId: string) => `/assets/${assetId}/assetpayments`,
        REVERSE: (assetId: string) => `/assets/${assetId}/reverse`
      },
      INCOMES: {
        CREATE: (assetId: string) => `/assets/${assetId}/assetincomes/create`,
        GET_ALL: (assetId: string) => `assets/${assetId}/assetincomes`
      },
      EXPENSES: {
        CREATE: (assetId: string) => `/assets/${assetId}/assetexpenses/create`,
        GET_ALL: (assetId: string) => `/assets/${assetId}/assetexpenses`,
      },
      ASSIGNMENTS: {
        GET_ALL: '/assets/assetassignment',
        CREATE: 'assets/assetassignment/create',
        UPDATE: (assignment_id: string) => `assets/assetassignment/${assignment_id}/update`,
        DELETE: (assignment_id: string) => `/assets/assetassignment/${assignment_id}/delete`
      },
      MAINTENANCE: {
        CREATE: '/assets/assetmaintenance/create',
        MODIFY: (id: string) => `/assets/assetmaintenance/${id}/update`,
        DELETE: (id: string) => `/assets/assetmaintenance/${id}/delete`,
        GET_ALL: '/assets/assetmaintenance'
      }
    },
    INCOME_TYPES: {
      GET_ALL: "/assets/assetincometypes",
      ADD: "assets/assetincometypes/create",
      MODIFY: (id: string) => `assets/assetincometypes/${id}/update`,
      DELETE: (id: string) => `assets/assetincometypes/${id}/delete`,
    }
  };