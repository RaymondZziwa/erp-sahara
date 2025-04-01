export interface Warehouse {
  id: number;
  warehouse_type: number;
  organisation_id: number;
  name: string;
  location: string;
}

export interface WarehouseType {
  id: number;
  name: string;
  description: string;
}