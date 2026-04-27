export type Role = 'ADMIN' | 'TECHNIKER' | 'HAUSMEISTER' | 'ITSUPPORT';

export const ASSIGNABLE_ROLES: Role[] = ['TECHNIKER', 'HAUSMEISTER', 'ITSUPPORT'];

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: Role;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string | null;
  dueDate: string | null;
  createdAt: string;
  claimedAt: string | null;
  completedAt: string | null;
  requiredRole: Role;
  assignee: UserSummary | null;
  createdBy: UserSummary | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: Role;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdatePhoneRequest {
  phoneNumber: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  requiredRole: Role;
  assigneeId?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  requiredRole?: Role;
}

export interface AssignTaskRequest {
  userId: number;
}

export interface ApiError {
  error: string;
}
