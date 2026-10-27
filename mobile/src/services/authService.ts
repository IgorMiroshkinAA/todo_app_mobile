import { api } from './api';
import type { User, AuthResponse, RegisterDto, LoginDto } from '../types/user';

export const authService = {
    register: async (dto: RegisterDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', dto);
        return response.data;
    },

    login: async (dto: LoginDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', dto);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    getUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },
};