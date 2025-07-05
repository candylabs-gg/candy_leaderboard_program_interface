import type { Wallet } from "@coral-xyz/anchor";
import type { Connection } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";

import type { CandyLeaderboard } from "./candy_leaderboard";
import type { ConstantName, ConstantValue } from "./anchor-types";
import IDL from "./candy_leaderboard.json";

export const ProgramStatic = (connection?: Connection) => {
  const provider = new AnchorProvider(
    connection as unknown as Connection,
    null as unknown as Wallet,
  );
  const program = new Program<CandyLeaderboard>(
    IDL as CandyLeaderboard,
    provider,
  );

  const getRandomId = () => {
    return Keypair.generate().publicKey;
  };

  const getSeedBuffer = (seed: string) => {
    return Buffer.from(
      String.fromCharCode(
        ...seed
          .replace(/[[\]\s]/g, "")
          .split(",")
          .map(Number),
      ),
    );
  };

  const getConstantValue = <N extends ConstantName>(
    constantName: N,
  ): ConstantValue<N> => {
    const constantStruct = program.idl.constants.find(
      (constStruct) => constStruct.name === constantName,
    );
    if (!constantStruct) {
      throw new Error(`Constant with name ${constantName} not found`);
    }
    const { value, type } = constantStruct;
    switch (type) {
      case "bytes":
        return getSeedBuffer(value) as ConstantValue<N>;
      case "pubkey":
        return new PublicKey(value) as ConstantValue<N>;
      default:
        throw new Error(`Unsupported type: ${JSON.stringify(type)}`);
    }
  };

  return {
    getConstantValue,
    getRandomId,
    program,
  };
};
