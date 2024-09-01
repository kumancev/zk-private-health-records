import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, PublicKey, Field } from "o1js";
import { EncryptionKeys } from "../../../src/runtime/modules/encryptionKeys";
import { Balances } from "../../../src/runtime/modules/balances";
import { HealthRecords } from "../../../src/runtime/modules/healthRecord";
import { AccessControl } from "../../../src/runtime/modules/accessControl";
import { SharingPermissions } from "../../../src/runtime/modules/sharingPermissions";
import { UInt64 } from "@proto-kit/library";

describe("EncryptionKeys", () => {
  let appChain: any;
  let encryptionKeys: EncryptionKeys;
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
    encryptionKeys = appChain.runtime.resolve("EncryptionKeys");
  });

  it("should store and retrieve a public key", async () => {
    const publicKey = Field(123456789);

    const storeTx = await appChain.transaction(alice, async () => {
      await encryptionKeys.storePublicKey(alice, publicKey);
    });
    await storeTx.sign();
    await storeTx.send();
    await appChain.produceBlock();

    const retrievedKey =
      await appChain.query.runtime.EncryptionKeys.publicKeys.get(alice);
    expect(retrievedKey?.toBigInt()).toBe(publicKey.toBigInt());
  });

  it("should get `undefined` to retrieve a non-existent public key", async () => {
    const bobPrivateKey = PrivateKey.random();
    const bob = bobPrivateKey.toPublicKey();

    await expect(
      await appChain.query.runtime.EncryptionKeys.publicKeys.get(bob)
    ).toEqual(undefined);
  });
});
