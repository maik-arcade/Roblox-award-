export interface Registration {
  id: string;
  username: string;
  description: string;
  reason: string;
  gender: string;
  category: string;
  image: string | null;
  createdAt: string;
}

export interface RegistrationFormData {
  username: string;
  description: string;
  reason: string;
  gender: string;
  category: string;
  image: string | null;
}
