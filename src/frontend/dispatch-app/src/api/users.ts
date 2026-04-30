import { api } from './client';
import type { CreateUserRequest, TaskResponse, UserResponse } from '../types/api';

export async function listUsers(): Promise<UserResponse[]> {
  const res = await api.get<UserResponse[]>('/api/users');
  return res.data;
}

export async function getUser(id: number): Promise<UserResponse> {
  const res = await api.get<UserResponse>(`/api/users/${id}`);
  return res.data;
}

export async function getUserTasks(id: number): Promise<TaskResponse[]> {
  const res = await api.get<TaskResponse[]>(`/api/users/${id}/tasks`);
  return res.data;
}

export async function createUser(req: CreateUserRequest): Promise<UserResponse> {
  const res = await api.post<UserResponse>('/api/users', req);
  return res.data;
}
