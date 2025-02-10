export const INVENTORY_ENDPOINTS = {
  INVENTORIES: {
    GET_ALL: "/erp/inventories",
    GET_BY_ID: (id: string) => `/erp/inventories/${id}`,
    ADD: "/erp/inventories/create",
    STOCK_OUT: "/erp/inventories/sendtomilling",
    UPDATE: (id: string) => `/erp/inventories/${id}/update`,
    DELETE: (id: string) => `/erp/inventories/${id}/delete`,
  },
  UOM: {
    GET_ALL: "/erp/inventories/uom",
    GET_BY_ID: (id: string) => `/erp/inventories/uom/${id}`,
    ADD: "/erp/inventories/uom/create",
    UPDATE: (id: string) => `/erp/inventories/uom/${id}/update`,
    DELETE: (id: string) => `/erp/inventories/uom/${id}/delete`,
  },
  VARIANTS: {
    GET_ALL: "/erp/inventories/variants",
    GET_BY_ID: (id: string) => `/erp/inventories/variants/${id}`,
    ADD: "/erp/inventories/variants/create",
    UPDATE: (id: string) => `/erp/inventories/variants/${id}/update`,
    DELETE: (id: string) => `/erp/inventories/variants/${id}/delete`,
  },
  WARE_HOUSES: {
    GET_ALL: "/erp/people/warehouses",
    GET_BY_ID: (id: string) => `/erp/people/warehouses/${id}`,
    ADD: "/erp/people/warehouses/create",
    UPDATE: (id: string) => `/erp/people/warehouses/${id}/update`,
    DELETE: (id: string) => `/erp/people/warehouses/${id}/delete`,
  },
  BRANDS: {
    GET_ALL: "/erp/inventories/brands",
    GET_BY_ID: (id: string) => `/erp/inventories/brands/${id}`,
    ADD: "/erp/inventories/brands/create",
    UPDATE: (id: string) => `/erp/inventories/brands/${id}/update`,
    DELETE: (id: string) => `/erp/inventories/brands/${id}/delete`,
  },
  STOCK_MOVEMENTS: {
    GET_ALL: "/erp/inventories/reports/stockmovements",
    GET_BY_ID: (id: string) => `/erp/inventories/stockmovement/${id}`,
    ADD: "/erp/inventories/stockmovement",
    UPDATE: (id: string) => `/erp/inventories/stockmovement/${id}/update`,
    DELETE: (id: string) => `/erp/inventories/stockmovement/${id}/delete`,
  },
  ITEM_ATTRIBUTES: {
    GET_ALL: "/erp/inventories/attributes",
    GET_BY_ID: (id: string) => `/erp/inventories/attributes/${id}`,
    ADD: "/erp/inventories/attributes/create",
    UPDATE: (id: string) => `/erp/inventories/attributes/${id}/update`,
    DELETE: (id: string) => `/erp/inventories/attributes/${id}/delete`,
  },
  ITEM_ATTRIBUTE_VALUES: {
    GET_ALL: (attributeId: string) =>
      `/erp/inventories/attributes/${attributeId}/values`,
    GET_BY_ID: (id: string) => `/erp/inventories/attributes/${id}`,
    ADD: (attributeId: string) =>
      `/erp/inventories/attributes/${attributeId}/values/create`,
    UPDATE: (attributeId: string, valueId: string) =>
      `/erp/inventories/attributes/${attributeId}/values/${valueId}/update`,
    DELETE: (id: string) => `/erp/inventories/attributes/${id}/delete`,
  },
  CURRENCIES: {
    GET_ALL: "/erp/currencies",
    GET_BY_ID: (id: string) => `/erp/currencies/${id}`,
    ADD: "/erp/currencies/add",
    UPDATE: (id: string) => `/erp/currencies/${id}`,
    DELETE: (id: string) => `/erp/currencies/${id}`,
  },
  ITEM_CATEGORIES: {
    GET_ALL: "/erp/inventories/item_categories",
    ADD: "/erp/inventories/item_categories/create",
    UPDATE: (id: string) => `/erp/inventories/item_categories/${id}/update`,
    DELETE: (id: string) => `/erp/inventories/item_categories/${id}/delete`,
  },
  ITEMS: {
    GET_ALL: "/erp/inventories/items",
    ADD: "/erp/inventories/items/create",
    UPDATE: (id: string) => `/erp/inventories/items/${id}/update`,
    DELETE: (id: string) => `/erp/inventories/items/${id}/delete`,
  },

  SUPPLIERS: {
    GET_ALL: "/erp/people/suppliers",
    GET_BY_ID: (id: string) => `/erp/people/suppliers/${id}`,
    ADD: "/erp/people/suppliers/create",
    UPDATE: (id: string) => `/erp/people/suppliers/${id}/update`,
    DELETE: (id: string) => `/erp/people/suppliers/${id}`,
  },

  CUSTOMERS: {
    GET_ALL: "/erp/people/customers",
    GET_BY_ID: (id: string) => `/erp/people/customers/${id}`,
    ADD: "/erp/people/customers/create",
    UPDATE: (id: string) => `/erp/people/customers/${id}/update`,
    DELETE: (id: string) => `/erp/people/customers/${id}`,
  },
  TRUCKS: {
    GET_ALL: "/erp/people/trucks",
    GET_BY_ID: (id: string) => `/erp/people/trucks/${id}`,
    ADD: "/erp/people/trucks/create",
    UPDATE: (id: string) => `/erp/people/trucks/${id}/update`,
    DELETE: (id: string) => `/erp/people/trucks/${id}`,
  },
  DRIVERS: {
    GET_ALL: "/erp/people/drivers",
    GET_BY_ID: (id: string) => `/erp/people/drivers/${id}`,
    ADD: "/erp/people/drivers/create",
    UPDATE: (id: string) => `/erp/people/drivers/${id}/update`,
    DELETE: (id: string) => `/erp/people/drivers/${id}`,
  },
};
