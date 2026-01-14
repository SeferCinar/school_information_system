"use server";

import { loginUser } from "@/services/authService";

export async function loginAction(email: string, password: string) {
  const user = await loginUser(email, password);
  return user;
}
