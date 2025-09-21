// Interface for a single item in the request
interface RequestItem {
    item_id: string;
    requested_quantity: number;
    notes?: string;
  }
  
  // Interface for the whole request
  export interface ProductionMaterialRequest {
    request_date: string; // format: YYYY-MM-DD
    items: RequestItem[];
  }
  