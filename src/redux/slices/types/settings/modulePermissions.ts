interface Permission {
    id: number;
    name: string;
    guard_name: string;
    service_id: string;
  }
  
export interface ModulePermission {
    id: string;
    name: string;
    amount: string;
    description: string;
    permissions: Permission[];
  }
  