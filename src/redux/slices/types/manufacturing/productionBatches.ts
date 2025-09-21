interface ProductionInput {
    material_request_id: string;
    quantity: number;
  }
  
  type ProductionStatus = "planned" | "in_progress" | "completed";
  


export interface ProductionBatch {
    production_schedule_id: string;
    status: ProductionStatus;
    inputs: ProductionInput[];
  }
  