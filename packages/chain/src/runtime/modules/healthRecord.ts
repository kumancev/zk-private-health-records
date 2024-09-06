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
  isDeleted: Field,
}) {}

@runtimeModule()
export class HealthRecords extends RuntimeModule<unknown> {
  @state() public records = StateMap.from<PublicKey, EncryptedHealthRecord>(
    PublicKey,
    EncryptedHealthRecord
  );

  @runtimeMethod()
  public async storeOrUpdateRecord(
    ownerPublicKey: PublicKey,
    encryptedData: CircuitString
  ) {
    const newRecord = new EncryptedHealthRecord({
      encryptedData,
      isDeleted: Field(0), // 0 represents false
    });
    await this.records.set(ownerPublicKey, newRecord);
  }

  @runtimeMethod()
  public async deleteRecord(ownerPublicKey: PublicKey) {
    const existingRecord = await this.records.get(ownerPublicKey);
    assert(existingRecord.isSome, "Record not found");

    const deletedRecord = new EncryptedHealthRecord({
      encryptedData: existingRecord.value.encryptedData,
      isDeleted: Field(1), // 1 represents true
    });
    await this.records.set(ownerPublicKey, deletedRecord);
  }

  @runtimeMethod()
  public async getRecord(
    ownerPublicKey: PublicKey
  ): Promise<EncryptedHealthRecord> {
    const record = await this.records.get(ownerPublicKey);
    assert(record.isSome, "Record not found");
    return record.value;
  }
}
