import { PublicKey, PrivateKey, Field, Encoding, Poseidon } from "o1js";
import { EncryptionKeys } from "../runtime/modules/encryptionKeys";
import { assert } from "@proto-kit/protocol";

export class EncryptionUtils {
  private encryptionKeys: EncryptionKeys;

  constructor(encryptionKeys: EncryptionKeys) {
    this.encryptionKeys = encryptionKeys;
  }

  async encrypt(ownerPublicKey: PublicKey, data: string): Promise<Field> {
    const publicKeyField =
      await this.encryptionKeys.getPublicKey(ownerPublicKey);
    const publicKey = PublicKey.fromFields(
      Encoding.stringToFields(publicKeyField.toString())
    );

    // Convert data to fields
    const dataFields = Encoding.stringToFields(data);

    // Encrypt each field using the public key
    const encryptedFields = dataFields.map((field) =>
      field.mul(publicKey.toFields()[0])
    );

    // Combine encrypted fields into a single field
    return Poseidon.hash(encryptedFields);
  }

  async decrypt(
    ownerPrivateKey: PrivateKey,
    encryptedData: Field
  ): Promise<string> {
    const publicKey = ownerPrivateKey.toPublicKey();
    const storedPublicKeyField =
      await this.encryptionKeys.getPublicKey(publicKey);

    assert(
      storedPublicKeyField.equals(publicKey.toFields()[0]),
      "Invalid private key for stored public key"
    );

    const decryptedField = encryptedData.div(ownerPrivateKey.toFields()[0]);

    // Convert decrypted field back to string
    return Encoding.stringFromFields([decryptedField]);
  }
}
