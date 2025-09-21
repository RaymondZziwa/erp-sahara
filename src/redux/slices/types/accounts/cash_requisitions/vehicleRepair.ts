export interface VehicleRepair {
  truck_id: string;
  requested_by?: string | null;
  request_details: string;
  last_quantity_fuel_used: number;
  last_mileage: number;
}
