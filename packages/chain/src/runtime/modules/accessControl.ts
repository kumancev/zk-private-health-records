import {
    RuntimeModule,
    runtimeMethod,
    state,
    runtimeModule,
  } from "@proto-kit/module";
  import { StateMap, assert } from "@proto-kit/protocol";
  import { PublicKey, Bool, Field, Poseidon } from "o1js";
  
  @runtimeModule()
  export class AccessControl extends RuntimeModule<unknown> {
    @state() public accessRights = StateMap.from<Field, Bool>(Field, Bool);
  
    private getAccessKey(owner: PublicKey, accessor: PublicKey): Field {
      return Field.from(Poseidon.hash([...owner.toFields(), ...accessor.toFields()]));
    }
  
    @runtimeMethod()
    public async grantAccess(owner: PublicKey, accessor: PublicKey) {
      assert(this.transaction.sender.value.equals(owner), "Only the owner can grant access");

      const accessKey = this.getAccessKey(owner, accessor);
      await this.accessRights.set(accessKey, Bool(true));
    }
  
    @runtimeMethod()
    public async revokeAccess(owner: PublicKey, accessor: PublicKey) {
      assert(this.transaction.sender.value.equals(owner), "Only the owner can revoke access");

      const accessKey = this.getAccessKey(owner, accessor);
      const currentAccess = await this.accessRights.get(accessKey);
      
      assert(currentAccess.isSome, "Access was not previously granted");

      await this.accessRights.set(accessKey, Bool(false));
    }
  
    @runtimeMethod()
    public async checkAccess(owner: PublicKey, accessor: PublicKey): Promise<Bool> {
      const accessKey = this.getAccessKey(owner, accessor);
      const hasAccess = await this.accessRights.get(accessKey);
      return hasAccess.isSome ? hasAccess.value : Bool(false);
    }
  }