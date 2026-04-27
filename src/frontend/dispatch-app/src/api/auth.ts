import { api } from './client';
import type { LoginRequest, LoginResponse } from '../types/api';

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/login', req);
  return res.data;
}
