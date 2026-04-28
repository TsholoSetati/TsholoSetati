import type { Expense, Member, Settlement, SplitMode } from '../db/schema.ts';

/**
 * Compute per-member share of a single expense based on its split mode.
 * Returns { memberId: shareAmount } summing to expense.amount within ±1 cent.
 */
export function shareOfExpense(exp: Expense): Record<string, number> {
  const out: Record<string, number> = {};
  if (!exp.participants.length) return out;

  if (exp.splitMode === 'exact' && exp.exactSplit) {
    let total = 0;
    for (const p of exp.participants) {
      const v = +exp.exactSplit[p] || 0;
      out[p] = v;
      total += v;
    }
    // Normalise small rounding
    if (Math.abs(total - exp.amount) > 0.005 && total > 0) {
      const scale = exp.amount / total;
      for (const p of exp.participants) out[p] = round2(out[p] * scale);
    }
    return out;
  }

  if (exp.splitMode === 'shares' && exp.shares) {
    let totalShares = 0;
    for (const p of exp.participants) totalShares += +exp.shares[p] || 0;
    if (totalShares <= 0) return shareEqual(exp);
    const per = exp.amount / totalShares;
    for (const p of exp.participants) out[p] = round2(per * (+exp.shares[p] || 0));
    fixRounding(out, exp);
    return out;
  }

  return shareEqual(exp);
}

function shareEqual(exp: Expense): Record<string, number> {
  const out: Record<string, number> = {};
  const per = exp.amount / exp.participants.length;
  for (const p of exp.participants) out[p] = round2(per);
  fixRounding(out, exp);
  return out;
}

function fixRounding(out: Record<string, number>, exp: Expense) {
  // Push the 1-cent rounding remainder onto the payer (or first participant).
  const sum = Object.values(out).reduce((a, b) => a + b, 0);
  const diff = round2(exp.amount - sum);
  if (Math.abs(diff) >= 0.01) {
    const target = exp.participants.includes(exp.payerId) ? exp.payerId : exp.participants[0];
    out[target] = round2(out[target] + diff);
  }
}

const round2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Net per-member balance: positive = others owe them, negative = they owe.
 * Includes recorded settlements (which move balances back toward zero).
 */
export function computeBalances(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const balance: Record<string, number> = Object.fromEntries(members.map((m) => [m.id, 0]));

  for (const exp of expenses) {
    if (balance[exp.payerId] === undefined) balance[exp.payerId] = 0;
    balance[exp.payerId] = round2(balance[exp.payerId] + exp.amount);
    const shares = shareOfExpense(exp);
    for (const [pid, amt] of Object.entries(shares)) {
      if (balance[pid] === undefined) balance[pid] = 0;
      balance[pid] = round2(balance[pid] - amt);
    }
  }

  for (const s of settlements) {
    if (balance[s.fromId] !== undefined) balance[s.fromId] = round2(balance[s.fromId] + s.amount);
    if (balance[s.toId] !== undefined) balance[s.toId] = round2(balance[s.toId] - s.amount);
  }

  // Final cleanup: zero any sub-cent residue
  for (const k of Object.keys(balance)) {
    if (Math.abs(balance[k]) < 0.01) balance[k] = 0;
  }

  return balance;
}

/**
 * Greedy settlement algorithm: minimise number of transactions.
 * Always pair the largest creditor with the largest debtor.
 * O(n log n). Optimal-ish in practice for the small group sizes typical here.
 */
export interface SuggestedTransfer {
  fromId: string;
  toId: string;
  amount: number;
}
export function suggestSettlements(
  balances: Record<string, number>
): SuggestedTransfer[] {
  const creditors: Array<{ id: string; bal: number }> = [];
  const debtors: Array<{ id: string; bal: number }> = [];
  for (const [id, bal] of Object.entries(balances)) {
    if (bal > 0.005) creditors.push({ id, bal });
    else if (bal < -0.005) debtors.push({ id, bal: -bal });
  }
  creditors.sort((a, b) => b.bal - a.bal);
  debtors.sort((a, b) => b.bal - a.bal);

  const out: SuggestedTransfer[] = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const give = Math.min(creditors[i].bal, debtors[j].bal);
    const amount = round2(give);
    if (amount >= 0.01) {
      out.push({ fromId: debtors[j].id, toId: creditors[i].id, amount });
    }
    creditors[i].bal = round2(creditors[i].bal - give);
    debtors[j].bal = round2(debtors[j].bal - give);
    if (creditors[i].bal < 0.01) i++;
    if (debtors[j].bal < 0.01) j++;
  }
  return out;
}

export function expenseSplitDescription(mode: SplitMode): string {
  if (mode === 'equal') return 'Split evenly';
  if (mode === 'shares') return 'Split by shares';
  return 'Exact amounts';
}
