import { runtimeModule, runtimeMethod, state, RuntimeModule } from '@proto-kit/module';
import { assert, StateMap } from '@proto-kit/protocol';
import { PublicKey, Field } from 'o1js';

@runtimeModule()
export class HealthRecord extends RuntimeModule<unknown> {
  @state() public records = StateMap.from(PublicKey, Field);

  @runtimeMethod()
  public async addRecord(patient: PublicKey, encryptedRecord: Field): Promise<void> {
    await this.records.set(patient, encryptedRecord);
  }

  @runtimeMethod()
  public async getRecord(patient: PublicKey): Promise<void> {
    const existingRecord = await this.records.get(patient);
    assert(existingRecord.isSome, "Record does not exist")
    await this.records.get(patient);
  }
}