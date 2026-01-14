export type Role = 'student' | 'instructor' | 'president' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  ref_id: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

