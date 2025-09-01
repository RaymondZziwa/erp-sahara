export const SETTINGS_ENDPOINTS = {
    ROLES: {
        GET_ALL: '/roles'
    },
    PERMISSIONS: {
        GET_ALL: '/roles/service-permissions',
        ATTACH: (id: any) => `/roles/${id}/attach-permissions`
    }
}