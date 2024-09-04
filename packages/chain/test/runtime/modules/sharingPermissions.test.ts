import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey } from "o1js";
import {
  SharingPermissions,
  SharingPermission,
} from "../../../src/runtime/modules/sharingPermissions";
import { UInt64 } from "@proto-kit/library";
import { Balances } from "../../../src/runtime/modules/balances";
import { HealthRecords } from "../../../src/runtime/modules/healthRecord";
import { AccessControl } from "../../../src/runtime/modules/accessControl";

describe("SharingPermissions", () => {
  let appChain: any;
  let sharingPermissions: SharingPermissions;
  const alicePrivateKey = PrivateKey.random();
  const alice = alicePrivateKey.toPublicKey();
  const bobPrivateKey = PrivateKey.random();
  const bob = bobPrivateKey.toPublicKey();

  beforeAll(async () => {
    appChain = TestingAppChain.fromRuntime({
      Balances,
      HealthRecords,
      AccessControl,
      SharingPermissions,
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {
          totalSupply: UInt64.from(10000),
        },
        HealthRecords: {},
        AccessControl: {},
        SharingPermissions: {},
      },
    });
    await appChain.start();
    appChain.setSigner(alicePrivateKey);
    sharingPermissions = appChain.runtime.resolve("SharingPermissions");
  });

  it("should create, verify, and revoke a sharing permission", async () => {
    const expirationTime = UInt64.from(Date.now() + 3600000); // 1 hour from now
    const permission = new SharingPermission({
      owner: alice,
      accessor: bob,
      expirationTime,
    });

    // Create permission
    const createTx = await appChain.transaction(alice, async () => {
      await sharingPermissions.createPermission(permission);
    });
    await createTx.sign();
    await createTx.send();
    await appChain.produceBlock();

    // Verify permission
    const verifyTx = await appChain.transaction(alice, async () => {
      await sharingPermissions.verifyPermission(permission);
    });
    await verifyTx.sign();
    await verifyTx.send();
    const verifyBlock = await appChain.produceBlock();
    expect(verifyBlock?.transactions[0].status.toBoolean()).toBe(true);

    // Revoke permission
    const revokeTx = await appChain.transaction(alice, async () => {
      await sharingPermissions.revokePermission(permission);
    });
    await revokeTx.sign();
    await revokeTx.send();
    await appChain.produceBlock();

    // Verify revoked permission (should fail)
    const verifyRevokedTx = await appChain.transaction(alice, async () => {
      await sharingPermissions.verifyPermission(permission);
    });
    await verifyRevokedTx.sign();
    await verifyRevokedTx.send();
    const verifyRevokedBlock = await appChain.produceBlock();
    expect(verifyRevokedBlock?.transactions[0].status.toBoolean()).toBe(false);
    expect(verifyRevokedBlock?.transactions[0].statusMessage).toBe(
      "Permission is not valid or has been revoked"
    );
  });
});
