import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, HELIUS_RPC_URL } from '../constants';

/**
 * Blockchain data interface matching on-chain battle account structure
 */
export interface BlockchainBattleData {
  battle_id: number;
  artist_a_wallet: string;
  artist_b_wallet: string;
  artist_a_pool: number; // in Lamports
  artist_b_pool: number; // in Lamports
  artist_a_supply: number;
  artist_b_supply: number;
  winner_decided: boolean;
  winner_artist_a: boolean | null;
  start_time: number;
  end_time: number;
  is_active: boolean;
}

/**
 * Derives the PDA (Program Derived Address) for a battle account
 */
export const deriveBattlePDA = async (
  battleId: number,
  programId: string = PROGRAM_ID
): Promise<PublicKey> => {
  const battleIdBuffer = Buffer.alloc(8);
  battleIdBuffer.writeBigUInt64LE(BigInt(battleId));

  const [battlePDA] = await PublicKey.findProgramAddress(
    [Buffer.from('battle'), battleIdBuffer],
    new PublicKey(programId)
  );

  return battlePDA;
};

/**
 * Fetches battle data from Solana blockchain
 */
export const fetchBattleFromBlockchain = async (
  battleId: number
): Promise<BlockchainBattleData | null> => {
  try {
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
    const battlePDA = await deriveBattlePDA(battleId);

    // Fetch account info
    const accountInfo = await connection.getAccountInfo(battlePDA);

    if (!accountInfo) {
      console.warn(`No blockchain data found for battle_id: ${battleId}`);
      return null;
    }

    // Parse the account data based on your IDL structure
    // This is a simplified parser - adjust based on your actual IDL
    const data = accountInfo.data;

    // Basic parsing (you'll need to adjust offsets based on your actual program structure)
    const parsedData: BlockchainBattleData = {
      battle_id: battleId,
      artist_a_wallet: new PublicKey(data.slice(8, 40)).toString(),
      artist_b_wallet: new PublicKey(data.slice(40, 72)).toString(),
      artist_a_pool: Number(data.readBigUInt64LE(72)),
      artist_b_pool: Number(data.readBigUInt64LE(80)),
      artist_a_supply: Number(data.readBigUInt64LE(88)),
      artist_b_supply: Number(data.readBigUInt64LE(96)),
      winner_decided: Boolean(data[104]),
      winner_artist_a: data[104] ? Boolean(data[105]) : null,
      start_time: Number(data.readBigInt64LE(106)),
      end_time: Number(data.readBigInt64LE(114)),
      is_active: Boolean(data[122])
    };

    return parsedData;
  } catch (error) {
    console.error(`Error fetching blockchain data for battle ${battleId}:`, error);
    return null;
  }
};

/**
 * Batch fetch multiple battles from blockchain
 * More efficient than individual fetches
 */
export const fetchMultipleBattlesFromBlockchain = async (
  battleIds: number[]
): Promise<Map<number, BlockchainBattleData>> => {
  const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
  const results = new Map<number, BlockchainBattleData>();

  try {
    // Derive all PDAs
    const pdas = await Promise.all(
      battleIds.map(async (id) => ({
        id,
        pda: await deriveBattlePDA(id)
      }))
    );

    // Batch fetch account infos
    const accountInfos = await connection.getMultipleAccountsInfo(
      pdas.map(p => p.pda)
    );

    // Parse results
    accountInfos.forEach((accountInfo, index) => {
      if (accountInfo) {
        const battleId = pdas[index].id;
        const data = accountInfo.data;

        try {
          const parsedData: BlockchainBattleData = {
            battle_id: battleId,
            artist_a_wallet: new PublicKey(data.slice(8, 40)).toString(),
            artist_b_wallet: new PublicKey(data.slice(40, 72)).toString(),
            artist_a_pool: Number(data.readBigUInt64LE(72)),
            artist_b_pool: Number(data.readBigUInt64LE(80)),
            artist_a_supply: Number(data.readBigUInt64LE(88)),
            artist_b_supply: Number(data.readBigUInt64LE(96)),
            winner_decided: Boolean(data[104]),
            winner_artist_a: data[104] ? Boolean(data[105]) : null,
            start_time: Number(data.readBigInt64LE(106)),
            end_time: Number(data.readBigInt64LE(114)),
            is_active: Boolean(data[122])
          };

          results.set(battleId, parsedData);
        } catch (parseError) {
          console.error(`Error parsing battle ${battleId}:`, parseError);
        }
      }
    });
  } catch (error) {
    console.error('Error batch fetching battles:', error);
  }

  return results;
};

/**
 * Check if a battle is a test battle based on artist names
 */
export const isTestBattle = (artist1: string, artist2: string): boolean => {
  const n1 = artist1.toLowerCase();
  const n2 = artist2.toLowerCase();

  // Specific test matchups
  if (n1.includes('hurric4n3ike') && n2.includes('zaal')) return true;
  if (n1.includes('joov') || n2.includes('joov')) return true;
  if (n1.includes('test') || n2.includes('test')) return true;
  if (n1.includes('zaal wavewarz') && n2.includes('zaal wavewarz')) return true;

  return false;
};

/**
 * Get current SOL price from an API (optional - for live USD calculations)
 */
export const getSolPrice = async (): Promise<number> => {
  try {
    // Using a simple price API - you can use CoinGecko, Jupiter, or any other
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    );
    const data = await response.json();
    return data.solana?.usd || 145.0; // Fallback to 145
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return 145.0; // Default fallback
  }
};
