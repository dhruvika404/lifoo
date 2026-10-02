import { create } from "zustand";
import { admins as initialAdmins } from "./mock-data";
import { adminService } from "@/services";

export interface Admin {
  name: string;
  email: string;
  phone: string;
  role: string;
  lastLogin: string;
}

interface AdminState {
  admins: Admin[];
  isLoading: boolean;
  error: string | null;
  currentUserRole: string;
  setCurrentUserRole: (role: any) => void;
  fetchAdmins: () => Promise<void>;
  addAdmin: (admin: Omit<Admin, "lastLogin">) => void;
  editAdmin: (email: string, updated: Omit<Admin, "lastLogin" | "email">) => void;
  resetPassword: (email: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  admins: initialAdmins,
  isLoading: false,
  error: null,
  currentUserRole: "Super Admin", // Default testing role
  setCurrentUserRole: (role) => {
    const roleStr = role && typeof role === "object" ? (role.name || role.id || "") : String(role);
    set({ currentUserRole: roleStr });
  },
  fetchAdmins: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAdmins();
      
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

        return {
          name: u.name || "Unnamed Admin",
          email: u.email,
          phone: u.phone || "",
          role: mapRole(roleStr),
          lastLogin: u.lastLogin || "Never",
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
  addAdmin: (admin) =>
    set((state) => ({
      admins: [
        ...state.admins,
        { ...admin, lastLogin: "Never" },
      ],
    })),
  editAdmin: (email, updated) =>
    set((state) => ({
      admins: state.admins.map((a) =>
        a.email === email ? { ...a, ...updated } : a
      ),
    })),
  resetPassword: (email) => {
    // In a real app we'd call an API. Here we just log or update state if needed.
    console.log(`Password reset requested for: ${email}`);
  },
}));
