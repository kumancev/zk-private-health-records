import * as crypto from "node:crypto";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useClientStore } from "./client";
import { PublicKey, CircuitString } from "o1js";
import { encrypt, decrypt } from "../utils";

export interface HealthRecordsState {
  loading: boolean;
  records: { [key: string]: string };
  loadRecord: (ownerPublicKey: PublicKey) => Promise<void>;
  storeRecord: (record: any, data: string) => Promise<void>;
}

const encryptionKey = crypto.randomBytes(32).toString("hex");

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
        if (record) {
          const decryptedData = decrypt(record.toString(), encryptionKey);
          state.records[ownerPublicKey.toBase58()] = decryptedData;
        } else {
          state.records[ownerPublicKey.toBase58()] = "Record not found";
        }
      });
    },
    async storeRecord(record, data) {
      const client = useClientStore.getState().client;
      if (!client) return;

      set((state) => {
        state.loading = true;
      });

      const encryptedData = encrypt(data, encryptionKey);
      record.encryptedData = CircuitString.fromString(encryptedData);

      const tx = await client.transaction(record.ownerPublicKey, async () => {
        const healthRecords = client.runtime.resolve("HealthRecords");
        await healthRecords.storeRecord(record);
      });

      await tx.sign();
      await tx.send();

      set((state) => {
        state.loading = false;
        state.records[record.ownerPublicKey.toBase58()] = data;
      });
    },
  })),
);
