"use client";
import { useEffect, useState } from "react";
import { useHealthRecordsStore } from "../lib/stores/healtRecords";
import { PublicKey } from "o1js";

export interface HealthRecordsManageProps {
  wallet?: string;
  loading: boolean;
  onConnectWallet: () => void;
}

export function HealthRecordsManage({
  wallet,
  loading,
  onConnectWallet,
}: HealthRecordsManageProps) {
  const healthRecords = useHealthRecordsStore();
  const [recordData, setRecordData] = useState("");

  useEffect(() => {
    if (wallet) {
      const ownerPublicKey = PublicKey.fromBase58(wallet);
      healthRecords.loadRecord(ownerPublicKey);
    }
  }, [wallet]);

  const handleStoreOrUpdateRecord = async () => {
    if (wallet) {
      const ownerPublicKey = PublicKey.fromBase58(wallet);
      await healthRecords.storeOrUpdateRecord(ownerPublicKey, recordData);
      setRecordData("");
    }
  };

  const handleDeleteRecord = async () => {
    if (wallet) {
      const ownerPublicKey = PublicKey.fromBase58(wallet);
      await healthRecords.deleteRecord(ownerPublicKey);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Health Records Management</h2>
      {wallet ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Record Data:
            </label>
            <input
              type="text"
              value={recordData}
              onChange={(e) => setRecordData(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            <button
              onClick={handleStoreOrUpdateRecord}
              className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Store/Update Record
            </button>
            <button
              onClick={handleDeleteRecord}
              className="ml-2 mt-2 inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Record
            </button>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Stored Record (Decrypted):
            </h3>
            {healthRecords.records[wallet] && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Data: {healthRecords.records[wallet].data}</p>
                <p>
                  Deleted:{" "}
                  {healthRecords.records[wallet].isDeleted ? "Yes" : "No"}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <button
          onClick={onConnectWallet}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
