export interface Usuario {
  id: string;
  email: string | null;
  displayName: string | null;
  role: 'customer' | 'admin';
}
