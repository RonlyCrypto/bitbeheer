// Manual per-transaction annotations (optional exchange label, note, and a
// price override that replaces the automatic blockchain-date price in
// profit/FIFO calculations). See create-transaction-overrides-table.sql.
import { supabase } from '../lib/supabase';

export interface TransactionOverride {
  exchangeLabel?: string;
  priceOverride?: number;
  note?: string;
}

function overrideKey(txHash: string, txTime: number): string {
  return `${txHash}-${txTime}`;
}

export async function getOverridesForWallet(
  email: string,
  walletAddress: string
): Promise<Map<string, TransactionOverride>> {
  const map = new Map<string, TransactionOverride>();
  try {
    const { data, error } = await supabase
      .from('transaction_overrides')
      .select('tx_hash, tx_time, exchange_label, price_override, note')
      .eq('email', email)
      .eq('wallet_address', walletAddress);

    if (error || !data) return map;

    for (const row of data) {
      map.set(overrideKey(row.tx_hash, row.tx_time), {
        exchangeLabel: row.exchange_label || undefined,
        priceOverride: row.price_override != null ? parseFloat(row.price_override) : undefined,
        note: row.note || undefined,
      });
    }
  } catch {
    // Non-critical: transactions just render without overrides.
  }
  return map;
}

export async function saveTransactionOverride(
  email: string,
  walletAddress: string,
  txHash: string,
  txTime: number,
  override: TransactionOverride
): Promise<boolean> {
  const { error } = await supabase
    .from('transaction_overrides')
    .upsert(
      [{
        email,
        wallet_address: walletAddress,
        tx_hash: txHash,
        tx_time: txTime,
        exchange_label: override.exchangeLabel || null,
        price_override: override.priceOverride ?? null,
        note: override.note || null,
        updated_at: new Date().toISOString(),
      }],
      { onConflict: 'email,wallet_address,tx_hash,tx_time' }
    );

  return !error;
}

export async function deleteTransactionOverride(
  email: string,
  walletAddress: string,
  txHash: string,
  txTime: number
): Promise<boolean> {
  const { error } = await supabase
    .from('transaction_overrides')
    .delete()
    .eq('email', email)
    .eq('wallet_address', walletAddress)
    .eq('tx_hash', txHash)
    .eq('tx_time', txTime);

  return !error;
}
