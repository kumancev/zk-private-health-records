import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useClientStore } from "./client";
import { PublicKey, Field } from "o1js";

export interface HealthRecordsState {
  loading: boolean;
  records: { [key: string]: string };
  loadRecord: (ownerPublicKey: PublicKey) => Promise<void>;
  storeRecord: (record: any) => Promise<void>;
}

export const useHealthRecordsStore = create<
  HealthRecordsState,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    loading: false,
    records: {},
    async loadRecord(ownerPublicKey) {
      const client = useClientStore.getState().client;
      if (!client) return;

      set((state) => {
        state.loading = true;
      });

      const record =
        await client.query.runtime.HealthRecords.records.get(ownerPublicKey);
      set((state) => {
        state.loading = false;
        state.records[ownerPublicKey.toBase58()] =
          record?.toString() ?? "Record not found";
      });
    },
    async storeRecord(record) {
      const client = useClientStore.getState().client;
      if (!client) return;

      set((state) => {
        state.loading = true;
      });

      const tx = await client.transaction(record.ownerPublicKey, async () => {
        const healthRecords = client.runtime.resolve("HealthRecords");
        await healthRecords.storeRecord(record);
      });

      await tx.sign();
      await tx.send();

      set((state) => {
        state.loading = false;
      });
    },
  })),
);
