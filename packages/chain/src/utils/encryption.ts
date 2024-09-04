import { PrivateKey, Field, Encoding, Poseidon, CircuitString } from "o1js";

export class EncryptionUtils {
  async encrypt(data: string): Promise<Field> {
    const circuitString = CircuitString.fromString(data);
    const recordHash = Poseidon.hash(circuitString.hash().toFields());

    return recordHash;
  }

  async decrypt(
    ownerPrivateKey: PrivateKey,
    encryptedData: Field[]
  ): Promise<any> {
    // TODO: need to implement
  }
}
