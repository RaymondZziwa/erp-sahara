export const INVENTORY_ENDPOINTS = {
  INVENTORIES: {
    GET_ALL: "/inventories",
    GET_BY_ID: (id: string) => `/inventories/${id}`,
    ADD: "/inventories/create",
    STOCK_OUT: "/inventories/sendtomilling",
    UPDATE: (id: string) => `/inventories/items/${id}/update`,
    DELETE: (id: string) => `/inventories/items/${id}/delete`,
    STOCK_MVT: "/inventories",
    REVERSE: "/inventories/reverse"
  },
  UOM: {
    GET_ALL: "/inventories/uom",
    GET_BY_ID: (id: string) => `/inventories/uom/${id}`,
    ADD: "/inventories/uom/create",
    UPDATE: (id: string) => `/inventories/uom/${id}/update`,
    DELETE: (id: string) => `/inventories/uom/${id}/delete`,
  },
  VARIANTS: {
    GET_ALL: "/inventories/variants",
    GET_BY_ID: (id: string) => `/inventories/variants/${id}`,
    ADD: "/inventories/variants/create",
    UPDATE: (id: string) => `/inventories/variants/${id}/update`,
    DELETE: (id: string) => `/inventories/variants/${id}/delete`,
  },
  WARE_HOUSES: {
    GET_ALL: "/people/warehouses",
    GET_BY_ID: (id: string) => `/people/warehouses/${id}`,
    ADD: "/people/warehouses/create",
    UPDATE: (id: string) => `/people/warehouses/${id}/update`,
    DELETE: (id: string) => `/people/warehouses/${id}/delete`,
  },
  BRANDS: {
    GET_ALL: "/inventories/brands",
    GET_BY_ID: (id: string) => `/inventories/brands/${id}`,
    ADD: "/inventories/brands/create",
    UPDATE: (id: string) => `/inventories/brands/${id}/update`,
    DELETE: (id: string) => `/inventories/brands/${id}/delete`,
  },
  STOCK_MOVEMENTS: {
    GET_ALL: "/inventories/reports/stockmovements",
    GET_BY_ID: (id: string) => `/inventories/stockmovement/${id}`,
    ADD: "/inventories/stockmovement",
    UPDATE: (id: string) => `/inventories/stockmovement/${id}/update`,
    DELETE: (id: string) => `/inventories/stockmovement/${id}/delete`,
  },
  ITEM_ATTRIBUTES: {
    GET_ALL: "/inventories/attributes",
    GET_BY_ID: (id: string) => `/inventories/attributes/${id}`,
    ADD: "/inventories/attributes/create",
    UPDATE: (id: string) => `/inventories/attributes/${id}/update`,
    DELETE: (id: string) => `/inventories/attributes/${id}/delete`,
  },
  ITEM_ATTRIBUTE_VALUES: {
    GET_ALL: (attributeId: string) =>
      `/inventories/attributes/${attributeId}/values`,
    GET_BY_ID: (id: string) => `/inventories/attributes/${id}`,
    ADD: (attributeId: string) =>
      `/inventories/attributes/${attributeId}/values/create`,
    UPDATE: (attributeId: string, valueId: string) =>
      `/inventories/attributes/${attributeId}/values/${valueId}/update`,
    DELETE: (id: string) => `/inventories/attributes/${id}/delete`,
  },
  CURRENCIES: {
    GET_ALL: "/currencies",
    GET_BY_ID: (id: string) => `/currencies/${id}`,
    ADD: "/currencies/add",
    UPDATE: (id: string) => `/currencies/${id}`,
    DELETE: (id: string) => `/currencies/${id}`,
  },
  ITEM_CATEGORIES: {
    GET_ALL: "/inventories/item_categories",
    ADD: "/inventories/item_categories/create",
    UPDATE: (id: string) => `/inventories/item_categories/${id}/update`,
    DELETE: (id: string) => `/inventories/item_categories/${id}/delete`,
  },
  ITEMS: {
    GET_ALL: "/inventories/items",
    ADD: "/inventories/items/create",
    UPDATE: (id: string) => `/inventories/items/${id}/update`,
    DELETE: (id: string) => `/inventories/items/${id}/delete`,
  },
  SUPPLIERS: {
    GET_ALL: "/people/suppliers",
    GET_BY_ID: (id: string) => `/people/suppliers/${id}`,
    ADD: "/people/suppliers/create",
    UPDATE: (id: string) => `/people/suppliers/${id}/update`,
    DELETE: (id: string) => `/people/suppliers/${id}`,
  },
  CUSTOMERS: {
    GET_ALL: "/people/customers",
    GET_BY_ID: (id: string) => `/people/customers/${id}`,
    ADD: "/people/customers/create",
    UPDATE: (id: string) => `/people/customers/${id}/update`,
    DELETE: (id: string) => `/people/customers/${id}/delete`,
  },
  TRUCKS: {
    GET_ALL: "/people/trucks",
    GET_BY_ID: (id: string) => `/people/trucks/${id}`,
    ADD: "/people/trucks/create",
    UPDATE: (id: string) => `/people/trucks/${id}/update`,
    DELETE: (id: string) => `/people/trucks/${id}/delete`,
  },
  DRIVERS: {
    GET_ALL: "/people/drivers",
    GET_BY_ID: (id: string) => `/people/drivers/${id}`,
    ADD: "/people/drivers/create",
    UPDATE: (id: string) => `/people/drivers/${id}/update`,
    DELETE: (id: string) => `/people/drivers/${id}/delete`,
  },
  WAREHOUSE_TYPES: {
    GET_ALL: "/people/warehousetypes",
    GET_BY_ID: (id: string) => `/people/warehousetypes/${id}`,
    ADD: "/people/warehousetypes/create",
    UPDATE: (id: string) => `/people/warehousetypes/${id}/update`,
    DELETE: (id: string) => `/people/warehousetypes/${id}/delete`,
  }
};
