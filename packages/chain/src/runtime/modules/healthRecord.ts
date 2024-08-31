import {
  RuntimeModule,
  runtimeMethod,
  state,
  runtimeModule,
} from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { Field, PublicKey, Struct, Poseidon } from "o1js";

class EncryptedHealthRecord extends Struct({
  encryptedData: Field,
  ownerPublicKey: PublicKey,
}) {}

@runtimeModule()
export class HealthRecords extends RuntimeModule<unknown> {
  @state() public records = StateMap.from<PublicKey, Field>(PublicKey, Field);

  @runtimeMethod()
  public async storeRecord(record: EncryptedHealthRecord) {
    const recordHash = Poseidon.hash(record.encryptedData.toFields());
    await this.records.set(record.ownerPublicKey, recordHash);
  }

  @runtimeMethod()
  public async getRecord(ownerPublicKey: PublicKey): Promise<Field> {
    const record = await this.records.get(ownerPublicKey);
    assert(record.isSome, "Record not found");
    return record.value;
  }
}