export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  isActive: boolean;
  createdAt?: string;
  roles: string[];
  fullName: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roles?: string[];
}

export interface ChangePasswordRequest {
  newPassword: string;
}
