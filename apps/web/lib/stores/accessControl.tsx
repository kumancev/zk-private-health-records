import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useClientStore } from "./client";
import { useChainStore } from "./chain";
import { PublicKey, Bool } from "o1js";

export interface AccessControlState {
  loading: boolean;
  accessRights: { [key: string]: boolean };
  grantAccess: (owner: PublicKey, accessor: PublicKey) => Promise<void>;
  revokeAccess: (owner: PublicKey, accessor: PublicKey) => Promise<void>;
  checkAccess: (owner: PublicKey, accessor: PublicKey) => Promise<void>;
}

export const useAccessControlStore = create<
  AccessControlState,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    loading: false,
    accessRights: {},
    async grantAccess(owner, accessor) {
      const client = useClientStore.getState().client;
      if (!client) return;

      set((state) => {
        state.loading = true;
      });

      const tx = await client.transaction(owner, async () => {
        const accessControl = client.runtime.resolve("AccessControl");
        await accessControl.grantAccess(owner, accessor);
      });

      await tx.sign();
      await tx.send();

      set((state) => {
        state.loading = false;
      });
    },
    async revokeAccess(owner, accessor) {
      const client = useClientStore.getState().client;
      if (!client) return;

      set((state) => {
        state.loading = true;
      });

      const tx = await client.transaction(owner, async () => {
        const accessControl = client.runtime.resolve("AccessControl");
        await accessControl.revokeAccess(owner, accessor);
      });

      await tx.sign();
      await tx.send();

      set((state) => {
        state.loading = false;
      });
    },
    async checkAccess(owner, accessor) {
      const client = useClientStore.getState().client;
      if (!client) return;

      set((state) => {
        state.loading = true;
      });

      try {
        const tx = await client.transaction(owner, async () => {
          const accessControl = client.runtime.resolve("AccessControl");
          await accessControl.checkAccess(owner, accessor);
        });

        await tx.sign();
        await tx.send();

        await new Promise((resolve) => setTimeout(resolve, 2500)); //TODO: Wait when new block is created. But is not a better way

        const chain = useChainStore.getState();
        if (!chain) return;

        const txs = await chain.block?.txs;

        if (txs && txs.length > 0) {
          set((state) => {
            state.loading = false;
            state.accessRights[`${owner.toBase58()}-${accessor.toBase58()}`] =
              txs[0].status;
          });
        } else {
          console.error("No transactions found in the block");
          set((state) => {
            state.loading = false;
            state.accessRights[`${owner.toBase58()}-${accessor.toBase58()}`] =
              false;
          });
        }
      } catch (error) {
        console.error("Error checking access:", error);
        set((state) => {
          state.loading = false;
          state.accessRights[`${owner.toBase58()}-${accessor.toBase58()}`] =
            false;
        });
      }
    },
  })),
);
