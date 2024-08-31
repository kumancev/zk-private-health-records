import { TestingAppChain } from "@proto-kit/sdk";
import { GuestBook } from "../../../src/runtime/modules/guest-book/index";
import { UInt64 } from "@proto-kit/library";
import { PrivateKey } from "o1js";
import { Balances } from "../../../src/runtime/modules/balances";

const signer = PrivateKey.random();
const sender = signer.toPublicKey();

describe("interaction", () => {
  it("should interact with the app-chain", async () => {
    const appChain = TestingAppChain.fromRuntime({
      Balances,
      GuestBook,
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {
          totalSupply: UInt64.from(10000),
        },
        GuestBook: {},
      },
    });

    await appChain.start();

    appChain.setSigner(signer);

    const guestBook = appChain.runtime.resolve("GuestBook");

    const rating = UInt64.from(3);
    const tx = await appChain.transaction(sender, async () => {
      guestBook.checkIn(rating);
    });

    await tx.sign();
    await tx.send();
  });
});
