  import { apiClient } from "./api";
  import type { User } from "@/store/authStore";

  export interface GetAdminsResponse {
    ok: boolean;
    data: User[] | { users: User[] } | { items: User[]; nextCursor?: any };
  }

  export interface RolePermission {
    module: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }

  export interface RoleItem {
    id: string;
    name: string;
    description: string;
    permissions: RolePermission[];
  }

  export interface GetRolesResponse {
    ok: boolean;
    data: {
      items: RoleItem[];
      nextCursor?: string | null;
    };
  }

  export interface AddAdminResponse {
    ok: boolean;
    data: User;
  }

  export const adminService = {
    getAdmins: async (search?: string): Promise<GetAdminsResponse> => {
      const url = search
        ? `/admin/v1/users?search=${encodeURIComponent(search)}`
        : "/admin/v1/users";
      const { data } = await apiClient.get<GetAdminsResponse>(url);
      return data;
    },
    getRoles: async (search?: string): Promise<GetRolesResponse> => {
      const url = search
        ? `/admin/v1/roles?search=${encodeURIComponent(search)}`
        : "/admin/v1/roles";
      const { data } = await apiClient.get<GetRolesResponse>(url);
      return data;
    },
    addAdmin: async (adminData: {
      name: string;
      email: string;
      phone: string;
      roleId: string;
      permissions?: RolePermission[];
      password?: string;
    }): Promise<AddAdminResponse> => {
      const { data } = await apiClient.post<AddAdminResponse>("/admin/v1/users", adminData);
      return data;
    },
    addRole: async (roleData: {
      name: string;
      description: string;
      permissions: RolePermission[];
    }): Promise<{ ok: boolean; data: RoleItem }> => {
      const { data } = await apiClient.post<{ ok: boolean; data: RoleItem }>("/admin/v1/roles", roleData);
      return data;
    },
    updateRole: async (
      roleId: string,
      roleData: {
        name: string;
        description: string;
        permissions: RolePermission[];
      }
    ): Promise<{ ok: boolean; data: RoleItem }> => {
      const { data } = await apiClient.put<{ ok: boolean; data: RoleItem }>(`/admin/v1/roles/${roleId}`, roleData);
      return data;
    },
    updateAdmin: async (
      userId: string,
      adminData: {
        name: string;
        email: string;
        phone: string;
        roleId: string;
        permissions?: RolePermission[];
      }
    ): Promise<{ ok: boolean; data: User }> => {
      const { data } = await apiClient.put<{ ok: boolean; data: User }>(`/admin/v1/users/${userId}/access`, adminData);
      return data;
    },
    resetPassword: async (userId: string, newPassword: string): Promise<any> => {
      const { data } = await apiClient.put(`/admin/v1/users/${userId}/reset-password`, {
        password: newPassword,
      });
      return data;
    },
    toggleAdminStatus: async (
      userId: string,
      status: string
    ): Promise<{ ok: boolean; data: User }> => {
      const action = status.toLowerCase() === "active" ? "enable" : "disable";
      const { data } = await apiClient.put<{ ok: boolean; data: User }>(`/admin/v1/users/${userId}/${action}`);
      return data;
    },
  };
