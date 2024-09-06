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
        console.log(
          "Checking access for:",
          ownerPublicKey.toBase58(),
          accessorPublicKey.toBase58(),
        );
        await accessControl.checkAccess(ownerPublicKey, accessorPublicKey);
        setError("");
      } catch (e) {
        setError("Invalid accessor public key");
      }
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Access Control Management</h2>
      {wallet ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Accessor Public Key:
            </label>
            <input
              type="text"
              value={accessor}
              onChange={(e) => setAccessor(e.target.value)}
              className="focus:green-400 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm  focus:border-green-400 focus:outline-none sm:text-sm"
            />
            <div className="mt-2 space-x-2">
              <button
                onClick={handleGrantAccess}
                className="inline-flex items-center rounded-md border border-transparent bg-green-400 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                Grant Access
              </button>
              <button
                onClick={handleRevokeAccess}
                className="inline-flex items-center rounded-md border border-transparent bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2"
              >
                Revoke Access
              </button>
              <button
                onClick={handleCheckAccess}
                className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Check Access
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Access Rights:
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {accessControl.accessRights[`${wallet}-${accessor}`]
                ? "Granted"
                : "Not Granted"}
            </p>
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
