"use client";
import { Faucet } from "@/components/faucet";
import { HealthRecordsManage } from "@/components/healthRecordsManage";
import { AccessControlManage } from "@/components/accessControlManage";
import { useWalletStore } from "@/lib/stores/wallet";

export default function Home() {
  const wallet = useWalletStore();

  return (
    <div className="mx-auto -mt-32 h-full pt-16">
      <div className="flex h-full w-full flex-col items-center justify-center gap-8 pt-16">
        <div className="flex flex-row items-center justify-center gap-8">
          <HealthRecordsManage
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            loading={false}
          />
          <AccessControlManage
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            loading={false}
          />
        </div>
      </div>
    </div>
  );
}
