import { Balance, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

import { Balances } from "./modules/balances";
import { HealthRecords } from "./modules/healthRecord";
import { AccessControl } from "./modules/accessControl";
import { SharingPermissions } from "./modules/sharingPermissions";

export const modules = VanillaRuntimeModules.with({
  Balances,
  HealthRecords,
  AccessControl,
  SharingPermissions,
});

export const config: ModulesConfig<typeof modules> = {
  Balances: {
    totalSupply: Balance.from(10_000),
  },
  HealthRecords: {},
  AccessControl: {},
  SharingPermissions: {},
};

export default {
  modules,
  config,
};
