export interface ItemAttribue {
  id: number;
  organisation_id: number;
  name: string;
  values: Value[];
}

interface Value {
  id: number;
  attribute_id: number;
  value: string;
}

export interface ItemAttributeValue {
  id: number;
  attribute_id: number;
  value: string;
}
