export type UserRole = 'ADMIN' | 'VENDOR' | 'USER';

export interface UserDto {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface CreateUserDto {
    name: string;
    email: string;
    role: UserRole;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
}

// DTOs as classes for NestJS decorators
export class RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    nic?: string;
}

export class LoginDto {
    email: string;
    password: string;
}

export interface AuthResponseDto {
    access_token: string;
    user: UserDto;
}
