import { ModulePermissionConfig } from "@/types";

export const MODULES: ModulePermissionConfig[] = [
  { name: "CHEF", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "CATALOG", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "SLOT", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "ORDER", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "CART", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "DELIVERY", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "PAYMENT", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "FINANCE", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "REVIEW", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "WALLET", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "SEAL", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
  { name: "USER_ACCESS", hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: true },
];

export const DEFAULT_ROLES = [
  "Super Admin",
  "Operations Admin",
  "Finance Admin",
  "Content Moderator",
  "Support Executive",
];

export const getRoleDisplayName = (name: string) => {
  if (!name) return "";
  const norm = name.toUpperCase().replace(/[-_]/g, " ");
  if (norm === "SUPER ADMIN") return "Super Admin";
  if (norm === "OPERATION HEAD ADMIN" || norm === "OPERATIONS ADMIN" || norm === "OPERATIONS") return "Operations Admin";
  if (norm === "FINANCE ADMIN" || norm === "FINANCE") return "Finance Admin";
  if (norm === "CONTENT MODERATOR" || norm === "MODERATION ADMIN") return "Content Moderator";
  if (norm === "SUPPORT EXECUTIVE" || norm === "SUPPORT") return "Support Executive";
  
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
