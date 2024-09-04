import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey } from "o1js";
import { AccessControl } from "../../../src/runtime/modules/accessControl";
import { Balances } from "../../../src/runtime/modules/balances";
import { HealthRecords } from "../../../src/runtime/modules/healthRecord";
import { SharingPermissions } from "../../../src/runtime/modules/sharingPermissions";
import { UInt64 } from "@proto-kit/library";

describe("AccessControl", () => {
  let appChain: any;
  let accessControl: AccessControl;
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
          totalSupply: UInt64.from(10_000),
        },
        HealthRecords: {},
        AccessControl: {},
        SharingPermissions: {},
      },
    });
    await appChain.start();
    appChain.setSigner(alicePrivateKey);
    accessControl = appChain.runtime.resolve("AccessControl");
  });

  it("should grant, check, and revoke access", async () => {
    // Grant access
    const grantTx = await appChain.transaction(alice, async () => {
      await accessControl.grantAccess(alice, bob);
    });
    await grantTx.sign();
    await grantTx.send();
    await appChain.produceBlock();

    // Check access
    const checkTx = await appChain.transaction(alice, async () => {
      await accessControl.checkAccess(alice, bob);
    });
    await checkTx.sign();
    await checkTx.send();
    const checkBlock = await appChain.produceBlock();
    expect(checkBlock?.transactions[0].status.toBoolean()).toBe(true);

    // Revoke access
    const revokeTx = await appChain.transaction(alice, async () => {
      await accessControl.revokeAccess(alice, bob);
    });
    await revokeTx.sign();
    await revokeTx.send();
    await appChain.produceBlock();

    // Check revoked access
    const checkRevokedTx = await appChain.transaction(alice, async () => {
      await accessControl.checkAccess(alice, bob);
    });
    await checkRevokedTx.sign();
    await checkRevokedTx.send();
    const checkRevokedBlock = await appChain.produceBlock();
    expect(checkRevokedBlock?.transactions[0].status.toBoolean()).toBe(false);
    expect(checkRevokedBlock?.transactions[0].statusMessage).toBe(
      "Not accessed"
    );
  });

  it("should fail when non-owner tries to grant access", async () => {
    appChain.setSigner(bobPrivateKey);
    const grantTx = await appChain.transaction(bob, async () => {
      await accessControl.grantAccess(alice, bob);
    });
    await grantTx.sign();
    await grantTx.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(false);
    expect(block?.transactions[0].statusMessage).toBe(
      "Only the owner can grant access"
    );
  });

  it("should fail when revoking non-existent access", async () => {
    appChain.setSigner(alicePrivateKey);
    const revokeTx = await appChain.transaction(alice, async () => {
      await accessControl.revokeAccess(alice, bob);
    });
    await revokeTx.sign();
    await revokeTx.send();
    const block = await appChain.produceBlock();
    expect(block?.transactions[0].status.toBoolean()).toBe(false);
    expect(block?.transactions[0].statusMessage).toBe(
      "Access was not previously granted"
    );
  });
});
