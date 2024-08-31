import { runtimeModule, state, runtimeMethod, RuntimeModule } from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { PublicKey, Field, Struct } from "o1js";

class HealthRecordData extends Struct({
  patientId: Field,
  dataHash: Field,
  lastUpdated: Field,
}) {}

@runtimeModule()
export class HealthRecord extends RuntimeModule<Record<string, never>> {
  @state() public records = StateMap.from(PublicKey, HealthRecordData);

  @runtimeMethod()
  public async addRecord(
    patientKey: PublicKey,
    recordData: HealthRecordData
  ): Promise<void> {
    await this.records.set(patientKey, recordData);
  }

  @runtimeMethod()
  public async getRecord(patientKey: PublicKey) {
    return await this.records.get(patientKey);
  }

  @runtimeMethod()
  public async updateRecord(
    patientKey: PublicKey,
    newRecordData: HealthRecordData
  ): Promise<void> {
    const existingRecord = await this.records.get(patientKey);
    assert(existingRecord.isSome, "Record does not exist");
    await this.records.set(patientKey, newRecordData);
  }
}