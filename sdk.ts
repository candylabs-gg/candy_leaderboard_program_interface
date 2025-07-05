import type { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, web3 } from "@coral-xyz/anchor";
import { Transaction } from "@solana/web3.js";

import type { InstructionAccounts, InstructionArgs } from "./anchor-types";
import type { CandyLeaderboard } from "./candy_leaderboard";
import IDL from "./candy_leaderboard.json";
import { ProgramStatic } from "./util";

export class CandyLeaderboardSDK {
  public program: Program<CandyLeaderboard>;
  public utils = ProgramStatic();
  public placeholderPubkey = this.utils.getConstantValue("placeholderPubkey");
  public signer: PublicKey;
  public connection: Connection;
  private commitment: Commitment;
  private showErrors: boolean;
  private wallet: Wallet | AnchorProvider;

  constructor(
    connection: Connection,
    wallet: Wallet | AnchorProvider,
    optionalArgs?: {
      commitment?: Commitment;
      showErrors?: boolean;
    },
  ) {
    if (wallet instanceof AnchorProvider) {
      this.program = new Program<CandyLeaderboard>(
        IDL as CandyLeaderboard,
        wallet,
      );
    } else
      this.program = new Program<CandyLeaderboard>(
        IDL as CandyLeaderboard,
        new AnchorProvider(connection, wallet),
      );
    this.wallet = wallet;
    this.connection = connection;
    this.showErrors = optionalArgs?.showErrors ?? false;
    this.commitment = optionalArgs?.commitment ?? "confirmed";
    this.signer = wallet.publicKey;
  }

  findUserAccount({ owner }: { owner: PublicKey }) {
    return web3.PublicKey.findProgramAddressSync(
      [
        this.utils.getConstantValue("userSeed"),
        owner.toBuffer(),
        this.utils.getConstantValue("currentSeasonSeed"),
      ],
      this.utils.program.programId,
    )[0];
  }

  getDeserializedTx(serializedTx: string) {
    return Transaction.from(Buffer.from(serializedTx, "base64"));
  }

  async sendSignedTx(deserializedTx: Transaction, label?: string) {
    try {
      return await this.connection.sendRawTransaction(
        deserializedTx.serialize(),
      );
    } catch (error) {
      this.handleError(label ?? "", error);
    }
  }

  async getInitUserSerializedTx(
    args: InstructionArgs<"initUser">,
    partialAccounts: Pick<
      InstructionAccounts<"initUser">,
      "payer" | "referrer"
    >,
  ) {
    const user = this.findUserAccount({
      owner: partialAccounts.payer,
    });
    const accounts: InstructionAccounts<"initUser"> = {
      ...partialAccounts,
      cosigner: this.program.programId,
      payer: partialAccounts.payer,
      user,
    };
    try {
      if (this.wallet instanceof AnchorProvider && this.wallet.wallet.payer) {
        const transaction = await this.program.methods
          .initUser(args)
          .accounts(accounts)
          .transaction();
        transaction.feePayer = partialAccounts.payer;
        transaction.recentBlockhash = await this.connection
          .getLatestBlockhash()
          .then((res) => res.blockhash);
        transaction.partialSign(this.wallet.wallet.payer);
        return transaction
          .serialize({
            verifySignatures: false,
            requireAllSignatures: false,
          })
          .toString("base64");
      } else throw new Error("Wallet must be an instance of AnchorProvider");
    } catch (error) {
      this.handleError("initUser", error);
    }
  }

  async getUpdateUserSerializedTx(
    args: InstructionArgs<"updateUser">,
    partialAccounts: Pick<InstructionAccounts<"updateUser">, "payer">,
  ) {
    const user = this.findUserAccount({
      owner: partialAccounts.payer,
    });
    const accounts: InstructionAccounts<"updateUser"> = {
      payer: partialAccounts.payer,
      cosigner: this.program.programId,
      user,
    };
    try {
      if (this.wallet instanceof AnchorProvider && this.wallet.wallet.payer) {
        const transaction = await this.program.methods
          .updateUser(args)
          .accounts(accounts)
          .transaction();
        transaction.feePayer = partialAccounts.payer;
        transaction.recentBlockhash = await this.connection
          .getLatestBlockhash()
          .then((res) => res.blockhash);
        transaction.partialSign(this.wallet.wallet.payer);
        return transaction
          .serialize({
            verifySignatures: false,
            requireAllSignatures: false,
          })
          .toString("base64");
      } else throw new Error("Wallet must be an instance of AnchorProvider");
    } catch (error) {
      this.handleError("updateUser", error);
    }
  }

  async deleteUser(
    partialAccounts: Pick<InstructionAccounts<"deleteUser">, "payer">,
  ) {
    const user = this.findUserAccount({
      owner: partialAccounts.payer,
    });
    const accounts: InstructionAccounts<"deleteUser"> = {
      payer: partialAccounts.payer,
      user,
    };
    try {
      if (this.wallet instanceof Wallet) {
        await this.program.methods
          .deleteUser()
          .accounts(accounts)
          .rpc({ commitment: this.commitment });
      } else throw new Error("Wallet must be an instance of Wallet");
    } catch (error) {
      return this.handleError("deleteUser", error);
    }
  }

  private handleError(instructionName: string, error: unknown) {
    if (this.showErrors) {
      console.error(`Error for instruction ${instructionName}:`);
      console.error(error);
    }
    return error;
  }
}
