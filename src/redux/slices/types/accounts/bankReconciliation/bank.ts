interface Branch {
  name: string;
  contact_person: string;
  contact_phone: string;
}

export interface Bank {
  name: string;
  email: string;
  description: string;
  branches: Branch[];
}
