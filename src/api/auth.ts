import type { AuthResponse, User } from "../types";
import { apiClient, tokenStorage } from "./client";

export const login = async ({ email, password }: { email: string; password: string }): Promise<AuthResponse> => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
};

export const register = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResponse> => {
  const { data } = await apiClient.post("/auth/register", { email, password, name });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get("/auth/me");
  return data;
};

export const persistAuthSession = (authResponse: AuthResponse): User | null => {
  tokenStorage.setTokens({
    accessToken: authResponse?.accessToken,
    refreshToken: authResponse?.refreshToken,
  });
  return authResponse?.user ?? null;
};
