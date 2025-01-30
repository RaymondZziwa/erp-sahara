export interface Brand {
  id: number;
  name: string;
  logo: null | File | string;
  created_at: string;
  updated_at: string;
  items: any[];
}
