import { useState } from "react";
import { useAccessControlStore } from "@/lib/stores/accessControl";
import { PublicKey } from "o1js";

export interface AccessControlManageProps {
  wallet?: string;
  loading: boolean;
  onConnectWallet: () => void;
}

export function AccessControlManage({
  wallet,
  loading,
  onConnectWallet,
}: AccessControlManageProps) {
  const accessControl = useAccessControlStore();
  const [accessor, setAccessor] = useState("");
  const [error, setError] = useState("");

  const handleGrantAccess = async () => {
    if (wallet) {
      try {
        const ownerPublicKey = PublicKey.fromBase58(wallet);
        const accessorPublicKey = PublicKey.fromBase58(accessor);
        await accessControl.grantAccess(ownerPublicKey, accessorPublicKey);
        setError("");
      } catch (e) {
        setError("Invalid accessor public key");
      }
    }
  };

  const handleRevokeAccess = async () => {
    if (wallet) {
      try {
        const ownerPublicKey = PublicKey.fromBase58(wallet);
        const accessorPublicKey = PublicKey.fromBase58(accessor);
        await accessControl.revokeAccess(ownerPublicKey, accessorPublicKey);
        setError("");
      } catch (e) {
        setError("Invalid accessor public key");
      }
    }
  };

  const handleCheckAccess = async () => {
    if (wallet) {
      try {
        const ownerPublicKey = PublicKey.fromBase58(wallet);
        const accessorPublicKey = PublicKey.fromBase58(accessor);
        console.log("Checking access for:", ownerPublicKey.toBase58(), accessorPublicKey.toBase58());
        await accessControl.checkAccess(ownerPublicKey, accessorPublicKey);
        setError("");
      } catch (e) {
        setError("Invalid accessor public key");
      }
    }
  };

  return (
    <div>
      <h2>Access Control Management</h2>
      {wallet ? (
        <>
          <div>
            <label>Accessor Public Key:</label>
            <input
              type="text"
              value={accessor}
              onChange={(e) => setAccessor(e.target.value)}
            />
            <button onClick={handleGrantAccess}>Grant Access</button>
            <button onClick={handleRevokeAccess}>Revoke Access</button>
            <button onClick={handleCheckAccess}>Check Access</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
          <div>
            <h3>Access Rights:</h3>
            <p>
              {accessControl.accessRights[`${wallet}-${accessor}`]
                ? "Granted"
                : "Not Granted"}
            </p>
          </div>
        </>
      ) : (
        <button onClick={onConnectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
