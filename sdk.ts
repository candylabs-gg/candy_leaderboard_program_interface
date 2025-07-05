import { AnchorProvider, BN, Program, Wallet, web3 } from "@coral-xyz/anchor";
import {
  Commitment,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import type { InstructionAccounts, InstructionArgs } from "./anchor-types";
import type { CandyLeaderboard } from "./candy_leaderboard";
import IDL from "./candy_leaderboard.json";
import { Mnemonic } from "./types";
import { ProgramStatic } from "./util";

const SYSTEM_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");
const ACHIEVEMENT_SET: Mnemonic[] = [
  "before_ftx",
  "bridged_degod",
  "burn_nft",
  "deploy_pump",
  "follow_canydlabs_x",
  "fumbled_bag",
  "hold_nft_0",
  "hold_nft_5",
  "hold_nft_10",
  "hold_nft_25",
  "hold_nft_50",
  "i_minted",
  "joined_telegram",
  "jupiter_swap",
  "own_sns_domain",
  "pengu_airdrop",
  "retardio_casino",
  "share_achievement",
  "wallet_backpack",
  "wallet_waitlist",
];
const ACHIEVEMENTS_ONCHAIN_ARRAY_LENGTH = 2;

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

  getEncodedAchievements(dbAchievements: Mnemonic[]) {
    // Initialize fixed length array filled with 0n
    const encoded: bigint[] = new Array(ACHIEVEMENTS_ONCHAIN_ARRAY_LENGTH).fill(
      0n,
    );

    for (const achievement of dbAchievements) {
      const index = ACHIEVEMENT_SET.indexOf(achievement);
      if (index === -1) {
        throw new Error(`Unknown achievement mnemonic: ${achievement}`);
      }

      const u128Index = Math.floor(index / 128);
      const bitIndex = index % 128;

      if (u128Index >= ACHIEVEMENTS_ONCHAIN_ARRAY_LENGTH) {
        // If your dbAchievements somehow includes achievements beyond 256 bits,
        // handle this case explicitly or throw an error
        throw new Error(
          `Achievement index out of fixed length bounds: ${achievement}`,
        );
      }

      if (encoded[u128Index])
        encoded[u128Index] = encoded[u128Index] | (1n << BigInt(bitIndex));
      else throw new Error("Unexpected error while encoding achievements!");
    }
    const encodedBNs = encoded.map((val) => new BN(val.toString()));

    return encodedBNs;
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
      systemProgram: SYSTEM_PROGRAM_ID,
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
      systemProgram: SYSTEM_PROGRAM_ID,
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
      systemProgram: SYSTEM_PROGRAM_ID,
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
