export interface QaSetting {
    id: string;
    key: string;
    value: string;
    description: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }
  