import type { Wallet } from "@coral-xyz/anchor";
import type {
  Commitment,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { Secp256k1Program } from "@solana/web3.js";
import { ethers } from "ethers";

import type { InstructionAccounts, InstructionArgs } from "./anchor-types";
import type { CandyLeaderboard } from "./candy_leaderboard";
import IDL from "./candy_leaderboard.json";
import { ProgramStatic } from "./program-static";

export class CandyMarketplaceProgram {
  public program: Program<CandyLeaderboard>;
  public payer: PublicKey;
  public utils = ProgramStatic();
  public sysvarInstructions = this.utils.getConstantValue(
    "sysvarInstructionsPubkey",
  );
  public placeholderPubkey = this.utils.getConstantValue("placeholderPubkey");
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
    this.payer = wallet.publicKey;
    this.showErrors = optionalArgs?.showErrors ?? false;
    this.commitment = optionalArgs?.commitment ?? "confirmed";
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

  async initUser(
    args: InstructionArgs<"initUser">,
    partialAccounts: Pick<InstructionAccounts<"initUser">, "referrer">,
    transactionInstructions: TransactionInstruction[],
  ) {
    const user = this.findUserAccount({
      owner: this.payer,
    });
    const accounts: InstructionAccounts<"initUser"> = {
      ...partialAccounts,
      payer: this.payer,
      instructions: this.sysvarInstructions,
      user,
    };
    try {
      await this.program.methods
        .initUser(args)
        .accounts(accounts)
        .preInstructions(transactionInstructions)
        .rpc({ commitment: this.commitment });
    } catch (error) {
      return this.handleError("initUser", error);
    }
  }

  async updateUser(
    args: InstructionArgs<"updateUser">,
    transactionInstructions: TransactionInstruction[],
  ) {
    const user = this.findUserAccount({
      owner: this.payer,
    });
    const accounts: InstructionAccounts<"updateUser"> = {
      payer: this.payer,
      instructions: this.sysvarInstructions,
      user,
    };
    try {
      await this.program.methods
        .updateUser(args)
        .accounts(accounts)
        .preInstructions(transactionInstructions)
        .rpc({ commitment: this.commitment });
    } catch (error) {
      return this.handleError("updateUser", error);
    }
  }

  async deleteUser() {
    const user = this.findUserAccount({
      owner: this.payer,
    });
    const accounts: InstructionAccounts<"deleteUser"> = {
      payer: this.payer,
      user,
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

  getSignature(message: string, wallet?: ethers.Wallet) {
    const ethWallet =
      wallet ?? new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
    return ethWallet.signingKey.sign(messageHash);
  }

  getSecp256k1Instruction(
    message: string,
    signature: ethers.Signature,
    address?: string,
  ) {
    const ethAddress = address ?? new ethers.Wallet(process.env.PRIVATE_KEY ?? "").address

    const messageBytes = Buffer.from(message);

    const rBuf = Buffer.from(signature.r.slice(2), "hex");
    const sBuf = Buffer.from(signature.s.slice(2), "hex");
    const recoveryId = signature.v >= 27 ? signature.v - 27 : signature.v;

    if (rBuf.length !== 32 || sBuf.length !== 32) {
      throw new Error("Signature r or s is not 32 bytes");
    }

    return Secp256k1Program.createInstructionWithEthAddress({
      ethAddress: ethAddress.slice(2),
      message: messageBytes,
      signature: Buffer.concat([rBuf, sBuf]), // 64 bytes
      recoveryId,
    });
  }

  private handleError(instructionName: string, error: unknown) {
    if (this.showErrors) {
      console.error(`Error for instruction ${instructionName}:`);
      console.error(error);
    }
    return error;
  }
}
