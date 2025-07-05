import {
  AnchorProvider,
  BN,
  BorshInstructionCoder,
  Program,
  Wallet,
  web3,
} from "@coral-xyz/anchor";
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
const TRANSACTION_INSTRUCTION_COUNT = 1;
const TRANSACTION_INSTRUCTION_INDEX = 0;

export class CandyLeaderboardSDK {
  public program: Program<CandyLeaderboard>;
  public utils = ProgramStatic();
  public placeholderPubkey = this.utils.getConstantValue("placeholderPubkey");
  public signer: PublicKey;
  public connection: Connection;
  private commitment: Commitment;
  private showErrors: boolean;

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

      if (encoded[u128Index] !== undefined)
        encoded[u128Index] = encoded[u128Index] | (1n << BigInt(bitIndex));
      else throw new Error("Unexpected error while encoding achievements!");
    }
    const encodedBNs = encoded.map((val) => new BN(val.toString()));

    return encodedBNs;
  }

  private deserializeAndValidateInitUpdateTx(
    serializedTx: string,
    expectedIxName: "initUser" | "updateUser",
  ) {
    const transaction = this.getDeserializedTx(serializedTx);
    if (!transaction) throw new Error("Nothing to deserialize!");
    if (transaction.instructions.length !== TRANSACTION_INSTRUCTION_COUNT) {
      throw new Error("Unexpected instructions length");
    }

    const instruction = transaction.instructions[TRANSACTION_INSTRUCTION_INDEX];
    if (!instruction) throw new Error(`Missing ${expectedIxName} instruction!`);
    if (
      instruction.programId.toBase58() !== this.program.programId.toBase58()
    ) {
      throw new Error("Unexpected program address");
    }

    const coder = new BorshInstructionCoder(this.program.idl);
    const decoded = coder.decode(instruction.data) as {
      name: "initUser" | "updateUser";
      data: { instructionArgs: InstructionArgs<"initUser" | "updateUser"> };
    } | null;

    if (!decoded || decoded.name !== expectedIxName) {
      throw new Error("Unexpected or missing instruction data!");
    }

    return { transaction, instruction, decoded };
  }

  getDeserializedTx(serializedTx: string) {
    return Transaction.from(Buffer.from(serializedTx, "base64"));
  }

  private validateInitUpdateInstructionArgs(
    decodedArgs: InstructionArgs<"initUser" | "updateUser">,
    userData: { xp: number; aura: number; achievements: Mnemonic[] },
  ) {
    const { achievements, aura, xp } = decodedArgs;
    if (Number(aura) > userData.aura || Number(xp) > userData.xp) {
      throw new Error("Unexpected xp/aura values!");
    }

    const encoded = this.getEncodedAchievements(userData.achievements);
    if (
      achievements.length !== encoded.length ||
      !achievements.every((a, i) => a.eq(encoded[i] || new BN(0)))
    ) {
      throw new Error(
        `Mismatch between onchain and expected encoded achievements! Expected: ${encoded[0]?.toString(10)} ${encoded[1]?.toString(10)}, Received: ${achievements[0]?.toString(10)} ${achievements[1]?.toString(10)}, expected length: ${encoded.length}, received length: ${achievements.length}`,
      );
    }
  }

  validateAndDeserializeInitUpdateTransaction({
    serializedTransaction,
    walletAddress,
    userData,
    ixName,
  }: {
    serializedTransaction: string;
    walletAddress: string;
    userData: { xp: number; aura: number; achievements: Mnemonic[] };
    ixName: "initUser" | "updateUser";
  }) {
    const { transaction, instruction, decoded } =
      this.deserializeAndValidateInitUpdateTx(serializedTransaction, ixName);
    const ixDef = this.program.idl.instructions.find((i) => i.name === ixName);
    const instructionAccounts: Partial<
      InstructionAccounts<"initUser" | "updateUser">
    > = {};
    try {
      ixDef?.accounts.forEach((acc, i) => {
        if (!instruction.keys[i])
          throw new Error("Unexpected out of bounds instruction key");
        const pubkey = instruction.keys[i].pubkey;
        instructionAccounts[acc.name] = pubkey;
      });
    } catch {
      throw new Error("Missing account keys!");
    }
    if (Object.keys(instructionAccounts).length !== instruction.keys.length)
      throw new Error("Account length mismatch!");
    if (instructionAccounts.payer?.toBase58() !== walletAddress)
      throw new Error("Wallet address mismatch!");
    if (transaction.feePayer?.toBase58() !== walletAddress)
      throw new Error("Fee payer mismatch!");
    this.validateInitUpdateInstructionArgs(
      decoded.data.instructionArgs,
      userData,
    );
    return transaction;
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

  serializeTx(transaction: Transaction) {
    return transaction
      .serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      })
      .toString("base64");
  }

  async getInitUserDeserializedTx({
    args,
    partialAccounts,
  }: {
    args: InstructionArgs<"initUser">;
    partialAccounts: Pick<
      InstructionAccounts<"initUser">,
      "payer" | "referrer"
    >;
  }) {
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
      const deserializedTransaction = await this.program.methods
        .initUser(args)
        .accounts(accounts)
        .transaction();
      deserializedTransaction.feePayer = partialAccounts.payer;
      deserializedTransaction.recentBlockhash = await this.connection
        .getLatestBlockhash()
        .then((res) => res.blockhash);
      return deserializedTransaction;
    } catch (error) {
      this.handleError("initUser", error);
    }
  }

  async getUpdateUserDeserializedTx({
    args,
    partialAccounts,
  }: {
    args: InstructionArgs<"updateUser">;
    partialAccounts: Pick<InstructionAccounts<"updateUser">, "payer">;
  }) {
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
      const deserializedTransaction = await this.program.methods
        .updateUser(args)
        .accounts(accounts)
        .transaction();
      deserializedTransaction.feePayer = partialAccounts.payer;
      deserializedTransaction.recentBlockhash = await this.connection
        .getLatestBlockhash()
        .then((res) => res.blockhash);
      return deserializedTransaction;
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
      await this.program.methods
        .deleteUser()
        .accounts(accounts)
        .rpc({ commitment: this.commitment });
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
