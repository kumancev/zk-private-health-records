import * as crypto from "node:crypto";
import { TestingAppChain } from "@proto-kit/sdk";
import { UInt64 } from "@proto-kit/library";
import { PrivateKey, CircuitString, Field } from "o1js";
import {
  HealthRecords,
  EncryptedHealthRecord,
} from "../../../src/runtime/modules/healthRecord";
import { Balances } from "../../../src/runtime/modules/balances";
import { AccessControl } from "../../../src/runtime/modules/accessControl";
import { SharingPermissions } from "../../../src/runtime/modules/sharingPermissions";
import { encrypt, decrypt } from "../../../src/utils/encryption";

describe("HealthRecords", () => {
  let appChain: any;
  let healthRecords: HealthRecords;
  const alicePrivateKey = PrivateKey.random();
  const alice = alicePrivateKey.toPublicKey();
  const encryptionKey = crypto.randomBytes(32).toString("hex"); // 256-bit key

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
    healthRecords = appChain.runtime.resolve("HealthRecords");
  });

  it("should store, retrieve, update, and delete a health record", async () => {
    const originalData = "Confidential health information";
    const encryptedData = encrypt(originalData, encryptionKey);

    // Store record
    let tx = await appChain.transaction(alice, async () => {
      await healthRecords.storeOrUpdateRecord(
        alice,
        CircuitString.fromString(encryptedData)
      );
    });
    await tx.sign();
    await tx.send();
    await appChain.produceBlock();

    // Retrieve and verify record
    let retrievedRecord =
      await appChain.query.runtime.HealthRecords.records.get(alice);
    expect(retrievedRecord).toBeDefined();
    if (retrievedRecord) {
      const decryptedData = decrypt(
        retrievedRecord.encryptedData.toString(),
        encryptionKey
      );
      expect(decryptedData).toBe(originalData);
      expect(retrievedRecord.isDeleted).toEqual(Field(0));
    }

    // Update record
    const updatedData = "Updated health information";
    const updatedEncryptedData = encrypt(updatedData, encryptionKey);
    tx = await appChain.transaction(alice, async () => {
      await healthRecords.storeOrUpdateRecord(
        alice,
        CircuitString.fromString(updatedEncryptedData)
      );
    });
    await tx.sign();
    await tx.send();
    await appChain.produceBlock();

    // Retrieve and verify updated record
    retrievedRecord =
      await appChain.query.runtime.HealthRecords.records.get(alice);
    expect(retrievedRecord).toBeDefined();
    if (retrievedRecord) {
      const decryptedData = decrypt(
        retrievedRecord.encryptedData.toString(),
        encryptionKey
      );
      expect(decryptedData).toBe(updatedData);
      expect(retrievedRecord.isDeleted).toEqual(Field(0));
    }

    // Delete record
    tx = await appChain.transaction(alice, async () => {
      await healthRecords.deleteRecord(alice);
    });
    await tx.sign();
    await tx.send();
    await appChain.produceBlock();

    // Verify record is marked as deleted
    retrievedRecord =
      await appChain.query.runtime.HealthRecords.records.get(alice);
    expect(retrievedRecord).toBeDefined();
    if (retrievedRecord) {
      expect(retrievedRecord.isDeleted).toEqual(Field(1));
    }
  });

  it("should get `undefined` when trying to retrieve a non-existent record", async () => {
    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    await expect(
      await appChain.query.runtime.HealthRecords.records.get(bob)
    ).toBeUndefined();
  });
});
