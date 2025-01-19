export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}