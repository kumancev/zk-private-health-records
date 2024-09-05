import {
  RuntimeModule,
  runtimeMethod,
  state,
  runtimeModule,
} from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { Field, PublicKey, Struct, CircuitString } from "o1js";

export class EncryptedHealthRecord extends Struct({
  encryptedData: CircuitString,
  ownerPublicKey: PublicKey,
}) {}

@runtimeModule()
export class HealthRecords extends RuntimeModule<unknown> {
  @state() public records = StateMap.from<PublicKey, CircuitString>(
    PublicKey,
    CircuitString
  );

  @runtimeMethod()
  public async storeRecord(record: EncryptedHealthRecord) {
    await this.records.set(record.ownerPublicKey, record.encryptedData);
  }

  @runtimeMethod()
  public async getRecord(ownerPublicKey: PublicKey): Promise<CircuitString> {
    const record = await this.records.get(ownerPublicKey);
    assert(record.isSome, "Record not found");
    return record.value;
  }
}
