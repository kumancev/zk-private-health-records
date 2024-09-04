import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, Field, Poseidon, Bytes } from "o1js";
import {
  HealthRecords,
  EncryptedHealthRecord,
} from "../../../src/runtime/modules/healthRecord";
import { Balances } from "../../../src/runtime/modules/balances";
import { AccessControl } from "../../../src/runtime/modules/accessControl";
import { EncryptionKeys } from "../../../src/runtime/modules/encryptionKeys";
import { SharingPermissions } from "../../../src/runtime/modules/sharingPermissions";
import { UInt64 } from "@proto-kit/library";

describe("HealthRecords", () => {
  let appChain: any;
  let healthRecords: HealthRecords;
  const alicePrivateKey = PrivateKey.random();
  const alice = alicePrivateKey.toPublicKey();

  beforeAll(async () => {
    appChain = TestingAppChain.fromRuntime({
      Balances,
      HealthRecords,
      AccessControl,
      SharingPermissions,
      EncryptionKeys,
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {
          totalSupply: UInt64.from(10000),
        },
        HealthRecords: {},
        AccessControl: {},
        SharingPermissions: {},
        EncryptionKeys: {},
      },
    });
    await appChain.start();
    appChain.setSigner(alicePrivateKey);
    healthRecords = appChain.runtime.resolve("HealthRecords");
  });

  it("should store and retrieve a health record (number)", async () => {
    const encryptedData = Field(123456);
    const record = new EncryptedHealthRecord({
      encryptedData,
      ownerPublicKey: alice,
    });

    const tx = await appChain.transaction(alice, async () => {
      await healthRecords.storeRecord(record);
    });
    await tx.sign();
    await tx.send();

    const block = await appChain.produceBlock();

    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    const retrievedRecordHash =
      await appChain.query.runtime.HealthRecords.records.get(alice);
    const expectedHash = Poseidon.hash(encryptedData.toFields());
    expect(retrievedRecordHash?.toBigInt()).toBe(expectedHash.toBigInt());
  });

  it("should store and retrieve a health record (string)", async () => {
    class Bytes32 extends Bytes(1024) {}

    // convert string to bytes
    let preimageBytes = Bytes32.fromString("Hello there!");
    const recordHash = Poseidon.hash(preimageBytes.toFields());
    const record = new EncryptedHealthRecord({
      encryptedData: recordHash,
      ownerPublicKey: alice,
    });

    const tx = await appChain.transaction(alice, async () => {
      await healthRecords.storeRecord(record);
    });
    await tx.sign();
    await tx.send();

    const block = await appChain.produceBlock();

    expect(block?.transactions[0].status.toBoolean()).toBe(true);

    const retrievedRecordHash =
      await appChain.query.runtime.HealthRecords.records.get(alice);
    expect(retrievedRecordHash?.toBigInt()).not.toBeNull();
  });

  it("should get `undefined` to retrieve a non-existent record", async () => {
    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    await expect(
      await appChain.query.runtime.HealthRecords.records.get(bob)
    ).toEqual(undefined);
  });
});
