import * as crypto from "node:crypto";
import { TestingAppChain } from "@proto-kit/sdk";
import { UInt64 } from "@proto-kit/library";
import { PrivateKey, CircuitString } from "o1js";
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

  it("should store, retrieve, and decrypt a health record", async () => {
    const originalData = "Confidential health information";
    const encryptedData = encrypt(originalData, encryptionKey);
    const record = new EncryptedHealthRecord({
      encryptedData: CircuitString.fromString(encryptedData),
      ownerPublicKey: alice,
    });

    const tx = await appChain.transaction(alice, async () => {
      await healthRecords.storeRecord(record);
    });
    await tx.sign();
    await tx.send();

    const block = await appChain.produceBlock();

    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    const retrievedEncryptedRecord =
      await appChain.query.runtime.HealthRecords.records.get(alice);

    expect(retrievedEncryptedRecord).toBeDefined();

    if (retrievedEncryptedRecord) {
      const decryptedData = decrypt(
        retrievedEncryptedRecord.toString(),
        encryptionKey
      );
      expect(decryptedData).toBe(originalData);
    }
  });

  it("should get `undefined` to retrieve a non-existent record", async () => {
    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    await expect(
      await appChain.query.runtime.HealthRecords.records.get(bob)
    ).toEqual(undefined);
  });
});
