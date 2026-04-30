import { api } from './client';
import type {
  AssignTaskRequest,
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from '../types/api';

export async function listTasks(): Promise<TaskResponse[]> {
  const res = await api.get<TaskResponse[]>('/api/tasks');
  return res.data;
}

export async function getTask(id: number): Promise<TaskResponse> {
  const res = await api.get<TaskResponse>(`/api/tasks/${id}`);
  return res.data;
}

export async function createTask(req: CreateTaskRequest): Promise<TaskResponse> {
  const res = await api.post<TaskResponse>('/api/tasks', req);
  return res.data;
}

export async function updateTask(id: number, req: UpdateTaskRequest): Promise<TaskResponse> {
  const res = await api.put<TaskResponse>(`/api/tasks/${id}`, req);
  return res.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/api/tasks/${id}`);
}

export async function claimTask(id: number): Promise<TaskResponse> {
  const res = await api.post<TaskResponse>(`/api/tasks/${id}/claim`);
  return res.data;
}

export async function releaseTask(id: number): Promise<TaskResponse> {
  const res = await api.post<TaskResponse>(`/api/tasks/${id}/release`);
  return res.data;
}

export async function completeTask(id: number): Promise<TaskResponse> {
  const res = await api.post<TaskResponse>(`/api/tasks/${id}/complete`);
  return res.data;
}

export async function assignTask(id: number, req: AssignTaskRequest): Promise<TaskResponse> {
  const res = await api.put<TaskResponse>(`/api/tasks/${id}/assign`, req);
  return res.data;
}
