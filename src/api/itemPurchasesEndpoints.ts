export const ITEMPURCHASES_ENDPOINTS = {
    SETTINGS: {
        GET_SETTINGS: "/purchases/qasettings",
        UPDATE_SETTINGS: "/purchases/qasettings/update"
    },

    ITEM_PURCHASES: {
        GET_ITEM_PURCHASES: "/purchases/itemdelivery",
        GET_ITEM_PURCHASE: (id: string) => `/purchases/item-purchases/${id}`,
        CREATE_ITEM_PURCHASE: "/purchases/itemdelivery/create",
        UPDATE_ITEM_PURCHASE: (id: string) => `/purchases/item-purchases/${id}/update`,
        DELETE_ITEM_PURCHASE: (id: string) => `/purchases/item-purchases/${id}/delete`,
        APPROVE_ITEM_PURCHASE: (id: string) => `/purchases/item-purchases/${id}/approve`,
        REJECT_ITEM_PURCHASE: (id: string) => `/purchases/item-purchases/${id}/reject`,
    },

    SETTLEMENTS: {
        PAY: (id: string) => `purchases/settlements/${id}/pay`,
        GET_SETTLEMENTS: "/purchases/settlements?status=pending",
    }
}