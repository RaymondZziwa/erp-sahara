export interface ItemCategory {
  id: number;
  organisation_id: number;
  name: string;
  is_final_product: boolean;
  parent_id: null;
  description: string;
  items: any[];
}
