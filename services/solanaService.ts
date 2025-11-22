import { HELIUS_API_URL, HELIUS_RPC_URL, PROGRAM_ID, HELIUS_API_KEY } from '../constants';

// Basic interface for Helius Transaction parsing
export interface ParsedTransaction {
  signature: string;
  timestamp: number;
  type: string;
  source: string;
  description: string;
}

/**
 * Fetches recent transactions for the WaveWarz Program using Helius API
 */
export const fetchProgramTransactions = async (limit: number = 20): Promise<ParsedTransaction[]> => {
  try {
    // Helius Enhanced Transactions API
    const response = await fetch(`${HELIUS_API_URL}/addresses/${PROGRAM_ID}/transactions?api-key=${HELIUS_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Helius API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.slice(0, limit).map((tx: any) => ({
      signature: tx.signature,
      timestamp: tx.timestamp,
      type: tx.type,
      source: tx.source,
      description: tx.description || 'Unknown Transaction'
    }));
  } catch (error) {
    console.error("Failed to fetch transactions from Helius:", error);
    return [];
  }
};

/**
 * Fetches Account Info using RPC (Helius)
 * Useful for getting live state of a Battle PDA
 */
export const getAccountInfo = async (pubkey: string) => {
  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'wavewarz-app',
        method: 'getAccountInfo',
        params: [
          pubkey,
          {
            encoding: 'base64'
          }
        ]
      })
    });
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("RPC Error:", error);
    return null;
  }
};