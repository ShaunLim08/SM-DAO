import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Buffer } from "buffer";

// Program ID - replace with your deployed program ID
const PROGRAM_ID = new PublicKey(
  "EnQqRpk1hTBoLYNeQ565ayWrCWTADL9JmcuMHgGX64Xp"
);
const connection = new Connection(clusterApiUrl("testnet"), "processed");

// Instruction enum index mapping
const INITIALIZE_CREATOR = 0;
const CREATE_PROPOSAL = 1;
const VOTE = 2;
const STAKE = 3;
const UNSTAKE = 4;
const CLAIM_REWARDS = 5;

/**
 * Get the PDA for various account types
 */
export const getPDA = async (seeds) => {
  const [pda] = await PublicKey.findProgramAddress(seeds, PROGRAM_ID);
  return pda;
};

/**
 * Initialize a creator profile
 */
export const initializeCreator = async (
  publicKey,
  wallet,
  name,
  platformLinks
) => {
  const creatorPDA = await getPDA([Buffer.from("creator"), wallet.toBuffer()]);

  const instructionData = Buffer.from([
    INITIALIZE_CREATOR,
    ...serializeString(name),
    ...serializeStringArray(platformLinks),
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: creatorPDA, isSigner: false, isWritable: true },
      { pubkey: publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });

  return await sendTransaction(publicKey, wallet, [instruction]);
};

/**
 * Create a new proposal
 */
export const createProposal = async (
  wallet,
  publicKey,
  title,
  description,
  options,
  proposalType,
  endTime
) => {
  const creatorPDA = await getPDA([
    Buffer.from("creator"),
    publicKey.toBuffer(),
  ]);

  const programStatePDA = await getPDA([Buffer.from("program-state")]);
  const proposalPDA = await getPDA([
    Buffer.from("proposal"),
    Buffer.from(Date.now().toString()),
  ]);

  const instructionData = Buffer.from([
    CREATE_PROPOSAL,
    ...serializeString(title),
    ...serializeString(description),
    ...serializeStringArray(options),
    proposalType === "Idea" ? 0 : 1,
    ...new Uint8Array(new BigUint64Array([BigInt(endTime)]).buffer),
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: proposalPDA, isSigner: false, isWritable: true },
      { pubkey: creatorPDA, isSigner: false, isWritable: true },
      { pubkey: publicKey, isSigner: true, isWritable: true },
      { pubkey: programStatePDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });

  const transaction = new Transaction();
  [instruction].forEach((ix) => transaction.add(ix));

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  return transaction;
};

/**
 * Vote on a proposal
 */
export const voteOnProposal = async (
  publicKey,
  wallet,
  proposalId,
  optionIndex,
  voteWeight
) => {
  const userPDA = await getPDA([Buffer.from("user"), publicKey.toBuffer()]);

  const proposalPDA = await getPDA([
    Buffer.from("proposal"),
    Buffer.from(proposalId.toString()),
  ]);

  const instructionData = Buffer.from([
    VOTE,
    ...new Uint8Array(new BigUint64Array([BigInt(proposalId)]).buffer),
    optionIndex,
    ...new Uint8Array(new BigUint64Array([BigInt(voteWeight)]).buffer),
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userPDA, isSigner: false, isWritable: true },
      { pubkey: proposalPDA, isSigner: false, isWritable: true },
      { pubkey: publicKey, isSigner: true, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });

  const transaction = new Transaction();
  [instruction].forEach((ix) => transaction.add(ix));

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  return transaction;
};

/**
 * Helper function to serialize strings for instruction data
 */
function serializeString(str) {
  const strBytes = Buffer.from(str);
  const lenBytes = Buffer.alloc(4);
  lenBytes.writeUInt32LE(strBytes.length);
  return Buffer.concat([lenBytes, strBytes]);
}

/**
 * Helper function to serialize string arrays
 */
function serializeStringArray(arr) {
  const lenBytes = Buffer.alloc(4);
  lenBytes.writeUInt32LE(arr.length);

  const serializedStrings = arr.map((str) => serializeString(str));
  return Buffer.concat([lenBytes, ...serializedStrings]);
}

/**
 * Stake tokens
 */
export const stakeTokens = async (wallet, amount) => {
  const userPDA = await getPDA([
    Buffer.from("user"),
    wallet.publicKey.toBuffer(),
  ]);

  const instructionData = Buffer.from([
    STAKE,
    ...new BigUint64Array([BigInt(amount)]).buffer,
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // user token account
      {
        pubkey: new PublicKey("STAKE_ACCOUNT"),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });

  const transaction = new Transaction();
  [instruction].forEach((ix) => transaction.add(ix));

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  return transaction;
};

/**
 * Unstake tokens
 */
export const unstakeTokens = async (wallet, amount) => {
  const userPDA = await getPDA([
    Buffer.from("user"),
    wallet.publicKey.toBuffer(),
  ]);

  const stakeAccountPDA = await getPDA([
    Buffer.from("stake"),
    wallet.publicKey.toBuffer(),
  ]);

  const instructionData = Buffer.from([
    UNSTAKE,
    ...new BigUint64Array([BigInt(amount)]).buffer,
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: false, isWritable: true }, // user token account
      { pubkey: stakeAccountPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });

  const transaction = new Transaction();
  [instruction].forEach((ix) => transaction.add(ix));

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  return transaction;
};

/**
 * Claim rewards
 */
export const claimRewards = async (wallet) => {
  const userPDA = await getPDA([
    Buffer.from("user"),
    wallet.publicKey.toBuffer(),
  ]);

  const rewardsAccountPDA = await getPDA([
    Buffer.from("rewards"),
    wallet.publicKey.toBuffer(),
  ]);

  const instructionData = Buffer.from([CLAIM_REWARDS]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: false, isWritable: true }, // user token account
      { pubkey: rewardsAccountPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });
  const transaction = new Transaction();
  [instruction].forEach((ix) => transaction.add(ix));

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  return transaction;
};
