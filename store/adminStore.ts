import { create } from "zustand";
import { admins as initialAdmins } from "@/lib/mock-data";
import { adminService } from "@/services";
import type { RoleItem, RolePermission } from "@/services/admin.service";

export interface Admin {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  lastLogin: string;
  status?: string;
  permissions?: RolePermission[];
  password?: string;
}

interface AdminState {
  admins: Admin[];
  roles: RoleItem[];
  isLoading: boolean;
  isRolesLoading: boolean;
  error: string | null;
  rolesError: string | null;
  currentUserRole: string;
  setCurrentUserRole: (role: any) => void;
  fetchAdmins: (search?: string) => Promise<void>;
  fetchRoles: (search?: string) => Promise<void>;
  addAdmin: (admin: Omit<Admin, "lastLogin">) => Promise<void>;
  addRole: (role: Omit<RoleItem, "id">) => Promise<void>;
  updateRole: (roleId: string, role: Omit<RoleItem, "id">) => Promise<void>;
  editAdmin: (id: string, updated: Omit<Admin, "lastLogin">) => Promise<void>;
  resetPassword: (userId: string, newPassword: string) => Promise<void>;
  toggleAdminStatus: (id: string, currentStatus: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  admins: initialAdmins,
  roles: [],
  isLoading: false,
  isRolesLoading: false,
  error: null,
  rolesError: null,
  currentUserRole: "Super Admin", // Default testing role
  setCurrentUserRole: (role) => {
    const roleStr = role && typeof role === "object" ? (role.name || role.id || "") : String(role);
    set({ currentUserRole: roleStr });
  },
  fetchRoles: async (search?: string) => {
    set({ isRolesLoading: true, rolesError: null });
    try {
      const response = await adminService.getRoles(search);
      if (response && response.ok && response.data) {
        set({ roles: response.data.items || [], rolesError: null });
      } else {
        set({ rolesError: "Failed to load roles" });
      }
    } catch (err: any) {
      console.error("[useAdminStore] fetchRoles error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch roles";
      set({ rolesError: errMsg });
    } finally {
      set({ isRolesLoading: false });
    }
  },
  fetchAdmins: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAdmins(search);

      const rawUsers = Array.isArray(response.data)
        ? response.data
        : (response.data && typeof response.data === "object" && "users" in response.data)
          ? (response.data as { users: any[] }).users
          : (response.data && typeof response.data === "object" && "items" in response.data)
            ? (response.data as { items: any[] }).items
            : [];

      const mapped: Admin[] = rawUsers.map((u: any) => {
        const rawRole = u.roles && u.roles.length > 0 ? u.roles[0] : (u.role || "Operations Admin");
        const getRoleString = (roleInput: any): string => {
          if (!roleInput) return "";
          if (typeof roleInput === "string") return roleInput;
          if (typeof roleInput === "object") {
            return roleInput.name || roleInput.id || "";
          }
          return String(roleInput);
        };
        const roleStr = getRoleString(rawRole);
        const mapRole = (rStr: string): string => {
          const norm = String(rStr).toUpperCase().replace(/[-_]/g, " ");
          if (norm === "SUPER ADMIN") return "Super Admin";
          if (norm === "OPERATIONS ADMIN" || norm === "OPERATIONS") return "Operations Admin";
          if (norm === "FINANCE ADMIN" || norm === "FINANCE") return "Finance Admin";
          if (norm === "CONTENT MODERATOR") return "Content Moderator";
          if (norm === "SUPPORT EXECUTIVE" || norm === "SUPPORT") return "Support Executive";
          return rStr || "Operations Admin";
        };

        const permissions: RolePermission[] = [];
        if (u.permissions && typeof u.permissions === "object") {
          Object.entries(u.permissions).forEach(([moduleName, perms]: [string, any]) => {
            permissions.push({
              module: moduleName.toUpperCase(),
              create: !!perms.create,
              read: !!perms.read,
              update: !!perms.update,
              delete: !!perms.delete,
            });
          });
        }

        return {
          id: u.id || u._id || "",
          name: u.name || "Unnamed Admin",
          email: u.email,
          phone: u.phone || "",
          role: mapRole(roleStr),
          lastLogin: u.lastLogin || "Never",
          status: u.status || "active",
          permissions,
        };
      });

      set({ admins: mapped, error: null });
    } catch (err: any) {
      console.error("[useAdminStore] fetchAdmins error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch admins";
      set({ error: errMsg });
    } finally {
      set({ isLoading: false });
    }
  },
  addAdmin: async (admin) => {
    set({ isLoading: true, error: null });
    try {
      let rolesList = useAdminStore.getState().roles;
      if (rolesList.length === 0) {
        await useAdminStore.getState().fetchRoles();
        rolesList = useAdminStore.getState().roles;
      }

      const foundRole = rolesList.find(
        (r) =>
          r.id === admin.role ||
          r.name.toLowerCase() === admin.role.toLowerCase() ||
          r.name.toLowerCase().replace(/[-_\s]/g, "") === admin.role.toLowerCase().replace(/[-_\s]/g, "")
      );

      const roleId = foundRole ? foundRole.id : admin.role;

      await adminService.addAdmin({
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        roleId: roleId,
        permissions: admin.permissions,
        password: admin.password,
      });
      await useAdminStore.getState().fetchAdmins();
    } catch (err: any) {
      console.error("[useAdminStore] addAdmin error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to add admin";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  addRole: async (role) => {
    set({ isRolesLoading: true, rolesError: null });
    try {
      await adminService.addRole(role);
      await useAdminStore.getState().fetchRoles();
    } catch (err: any) {
      console.error("[useAdminStore] addRole error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to add role";
      set({ rolesError: errMsg });
      throw err;
    } finally {
      set({ isRolesLoading: false });
    }
  },
  updateRole: async (roleId, role) => {
    set({ isRolesLoading: true, rolesError: null });
    try {
      await adminService.updateRole(roleId, role);
      await useAdminStore.getState().fetchRoles();
    } catch (err: any) {
      console.error("[useAdminStore] updateRole error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update role";
      set({ rolesError: errMsg });
      throw err;
    } finally {
      set({ isRolesLoading: false });
    }
  },
  editAdmin: async (id, updated) => {
    set({ isLoading: true, error: null });
    try {
      let rolesList = useAdminStore.getState().roles;
      if (rolesList.length === 0) {
        await useAdminStore.getState().fetchRoles();
        rolesList = useAdminStore.getState().roles;
      }

      const foundRole = rolesList.find(
        (r) =>
          r.id === updated.role ||
          r.name.toLowerCase() === updated.role.toLowerCase() ||
          r.name.toLowerCase().replace(/[-_\s]/g, "") === updated.role.toLowerCase().replace(/[-_\s]/g, "")
      );

      const roleId = foundRole ? foundRole.id : updated.role;

      await adminService.updateAdmin(id, {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        roleId: roleId,
        permissions: updated.permissions,
      });
      await useAdminStore.getState().fetchAdmins();
    } catch (err: any) {
      console.error("[useAdminStore] editAdmin error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update admin";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  resetPassword: async (userId, newPassword) => {
    console.log(`Password reset requested for userId: ${userId}`);
    set({ isLoading: true, error: null });
    try {
      await adminService.resetPassword(userId, newPassword);
    } catch (err: any) {
      console.error("[useAdminStore] resetPassword error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to reset password";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  toggleAdminStatus: async (id, currentStatus) => {
    set({ isLoading: true, error: null });
    const nextStatus = currentStatus.toLowerCase() === "active" ? "disabled" : "active";
    try {
      await adminService.toggleAdminStatus(id, nextStatus);
      await useAdminStore.getState().fetchAdmins();
    } catch (err: any) {
      console.error("[useAdminStore] toggleAdminStatus error:", err);
      // Fallback local update to keep UI functional and testable immediately
      set((state) => ({
        admins: state.admins.map((admin) =>
          admin.id === id ? { ...admin, status: nextStatus } : admin
        ),
      }));
      const errMsg = err?.response?.data?.message || err?.message || "Failed to toggle status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
