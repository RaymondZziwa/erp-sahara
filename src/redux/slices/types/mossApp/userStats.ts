export interface UserStatistics {
    total_users: number;
  
    per_country: Record<string, number>; // e.g. "Uganda": 438
  
    per_condition: Record<string, number>; // e.g. "HIV": 416
  
    user_interests: Record<string, number>; // e.g. "Football": 92
  
    per_age_group: Record<string, number>; // e.g. "30+": 282
  
    per_gender: {
      male: number;
      Female: number;
      [key: string]: number; // in case new genders are added
    };
  }