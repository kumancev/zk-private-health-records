import {
  RuntimeModule,
  runtimeMethod,
  state,
  runtimeModule,
} from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { PublicKey, Field } from "o1js";

@runtimeModule()
export class EncryptionKeys extends RuntimeModule<unknown> {
  @state() public publicKeys = StateMap.from<PublicKey, Field>(
    PublicKey,
    Field
  );

  @runtimeMethod()
  public async storePublicKey(owner: PublicKey, publicKey: Field) {
    await this.publicKeys.set(owner, publicKey);
  }

  @runtimeMethod()
  public async getPublicKey(owner: PublicKey): Promise<Field> {
    const publicKey = await this.publicKeys.get(owner);
    assert(publicKey.isSome, "Public key not found");
    return publicKey.value;
  }
}
