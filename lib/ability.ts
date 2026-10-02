import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability";

export type Actions = "create" | "read" | "update" | "reset-password" | "toggle-status" | "manage";
export type Subjects = "Admin" | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFor(role: string): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const norm = (role || "").toLowerCase().replace(/[-_\s]/g, "");

  if (norm === "superadmin") {
    can("manage", "all");
  } else if (norm === "operationsadmin" || norm === "operations") {
    can("read", "Admin");
    can("update", "Admin");
    cannot("create", "Admin");
    cannot("reset-password", "Admin");
    cannot("toggle-status", "Admin");
  } else if (norm === "financeadmin" || norm === "finance") {
    can("read", "Admin");
    cannot("create", "Admin");
    cannot("update", "Admin");
    cannot("reset-password", "Admin");
    cannot("toggle-status", "Admin");
  } else {
    // Content Moderator or Support Executive
    can("read", "Admin");
    cannot("create", "Admin");
    cannot("update", "Admin");
    cannot("reset-password", "Admin");
    cannot("toggle-status", "Admin");
  }

  return build();
}
