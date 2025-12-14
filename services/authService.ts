import users from '../data/users.json';
import { User, Role } from '../types';

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  return null;
};

