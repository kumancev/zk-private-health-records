import * as crypto from "node:crypto";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useClientStore } from "./client";
import { PublicKey, CircuitString, Field } from "o1js";
import { encrypt, decrypt } from "../utils";

export interface HealthRecordsState {
  loading: boolean;
  records: { [key: string]: { data: string; isDeleted: boolean } };
  loadRecord: (ownerPublicKey: PublicKey) => Promise<void>;
  storeOrUpdateRecord: (
    ownerPublicKey: PublicKey,
    data: string,
  ) => Promise<void>;
  deleteRecord: (ownerPublicKey: PublicKey) => Promise<void>;
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
          const decryptedData = decrypt(
            record.encryptedData.toString(),
            encryptionKey,
          );
          state.records[ownerPublicKey.toBase58()] = {
            data: decryptedData,
            isDeleted: record.isDeleted.equals(Field(1)).toBoolean(),
          };
        } else {
          state.records[ownerPublicKey.toBase58()] = {
            data: "Record not found",
            isDeleted: false,
          };
        }
      });
    },
    async storeOrUpdateRecord(ownerPublicKey, data) {
      const client = useClientStore.getState().client;
      if (!client) return;

      set((state) => {
        state.loading = true;
      });

      const encryptedData = encrypt(data, encryptionKey);

      const tx = await client.transaction(ownerPublicKey, async () => {
        const healthRecords = client.runtime.resolve("HealthRecords");
        await healthRecords.storeOrUpdateRecord(
          ownerPublicKey,
          CircuitString.fromString(encryptedData),
        );
      });

      await tx.sign();
      await tx.send();

      set((state) => {
        state.loading = false;
        state.records[ownerPublicKey.toBase58()] = { data, isDeleted: false };
      });
    },
    async deleteRecord(ownerPublicKey) {
      const client = useClientStore.getState().client;
      if (!client) return;

      set((state) => {
        state.loading = true;
      });

      const tx = await client.transaction(ownerPublicKey, async () => {
        const healthRecords = client.runtime.resolve("HealthRecords");
        await healthRecords.deleteRecord(ownerPublicKey);
      });

      await tx.sign();
      await tx.send();

      set((state) => {
        state.loading = false;
        state.records[ownerPublicKey.toBase58()].isDeleted = true;
      });
    },
  })),
);
