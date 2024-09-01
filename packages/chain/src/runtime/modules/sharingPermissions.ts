import {
  RuntimeModule,
  runtimeMethod,
  state,
  runtimeModule,
} from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { PublicKey, Field, Struct, Poseidon, Bool } from "o1js";
import { UInt64 } from "@proto-kit/library";

export class SharingPermission extends Struct({
  owner: PublicKey,
  accessor: PublicKey,
  expirationTime: UInt64,
}) {
  public toFields(): Field[] {
    return [
      ...this.owner.toFields(),
      ...this.accessor.toFields(),
      this.expirationTime.value,
    ];
  }
}

@runtimeModule()
export class SharingPermissions extends RuntimeModule<unknown> {
  @state() public permissions = StateMap.from<Field, Bool>(Field, Bool);

  @runtimeMethod()
  public async createPermission(permission: SharingPermission) {
    const permissionHash = Poseidon.hash(permission.toFields());
    await this.permissions.set(permissionHash, Bool(true));
  }

  @runtimeMethod()
  public async verifyPermission(permission: SharingPermission): Promise<Bool> {
    const permissionHash = Poseidon.hash(permission.toFields());
    const isValid = await this.permissions.get(permissionHash);

    assert(isValid.isSome, "Access right or permission does not exist");
    assert(
      isValid.value.equals(Bool(true)),
      "Permission is not valid or has been revoked"
    );

    return isValid.isSome.and(isValid.value);
  }

  @runtimeMethod()
  public async revokePermission(permission: SharingPermission) {
    const permissionHash = Poseidon.hash(permission.toFields());
    await this.permissions.set(permissionHash, Bool(false));
  }
}
