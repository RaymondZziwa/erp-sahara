export interface ProductionOrder {
    work_order_id: string;
    quantity: number;
    start_date: string; // ISO date string: "YYYY-MM-DD"
    expected_completion_date: string; // ISO date string
    priority: "low" | "medium" | "high" | "urgent";
  }

  export interface ProductionOrderStep {
    step_number: number;
    description: string;
    operator_id: string; // Employee ID
  }
  
  export interface ProductionOrder {
    production_order_id: string;
    steps: ProductionOrderStep[];
  }
  