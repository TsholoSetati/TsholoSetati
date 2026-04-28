import Dexie, { type EntityTable } from 'dexie';

export interface Group {
  id: string;
  name: string;
  currency: string;
  createdAt: number;
}

export interface Member {
  id: string;
  groupId: string;
  name: string;
  createdAt: number;
}

/**
 * Split modes:
 *  - equal: divide total evenly among `participants`
 *  - shares: divide proportional to `shares[memberId]` (e.g. 2:1:1)
 *  - exact: explicit `exactSplit[memberId]` amounts that must sum to total
 */
export type SplitMode = 'equal' | 'shares' | 'exact';

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  payerId: string;
  participants: string[];
  splitMode: SplitMode;
  shares?: Record<string, number>;
  exactSplit?: Record<string, number>;
  createdAt: number;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromId: string;
  toId: string;
  amount: number;
  createdAt: number;
  note?: string;
}

class SharpSharpDB extends Dexie {
  groups!: EntityTable<Group, 'id'>;
  members!: EntityTable<Member, 'id'>;
  expenses!: EntityTable<Expense, 'id'>;
  settlements!: EntityTable<Settlement, 'id'>;

  constructor() {
    super('sharp-sharp-v1');
    this.version(1).stores({
      groups: 'id, name, createdAt',
      members: 'id, groupId, name',
      expenses: 'id, groupId, payerId, createdAt',
      settlements: 'id, groupId, fromId, toId, createdAt',
    });
  }
}

export const db = new SharpSharpDB();

export const uid = () =>
  (crypto.randomUUID && crypto.randomUUID()) ||
  Math.random().toString(36).slice(2) + Date.now().toString(36);
