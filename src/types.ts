export interface Registration {
  id: number;
  username: string;
  description: string;
  reason: string;
  image: string | null;
  createdAt: string;
}

export interface RegistrationFormData {
  username: string;
  description: string;
  reason: string;
  image: string | null;
}
