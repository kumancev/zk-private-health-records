"use client";
import { useEffect, useState } from "react";
import { useHealthRecordsStore } from "../lib/stores/healtRecords";
import { PublicKey, Field } from "o1js";
// import { EncryptedHealthRecord } from "chain/src/runtime/modules/healthRecord";

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

  const handleStoreRecord = async () => {
    if (wallet) {
      const ownerPublicKey = PublicKey.fromBase58(wallet);
      const encryptedData = Field(recordData);
      const record = {
        encryptedData,
        ownerPublicKey,
      };
      await healthRecords.storeRecord(record);
    }
  };

  return (
    <div>
      <h2>Health Records Management</h2>
      {wallet ? (
        <>
          <div>
            <label>Record Data:</label>
            <input
              type="text"
              value={recordData}
              onChange={(e) => setRecordData(e.target.value)}
            />
            <button onClick={handleStoreRecord}>Store Record</button>
          </div>
          <div>
            <h3>Stored Records:</h3>
            <p>{healthRecords.records[wallet]}</p>
          </div>
        </>
      ) : (
        <button onClick={onConnectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
