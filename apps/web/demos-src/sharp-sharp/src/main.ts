import { html, render, type TemplateResult } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { db, uid, type Expense, type Group, type Member, type Settlement, type SplitMode } from './db/schema.ts';
import { computeBalances, suggestSettlements, shareOfExpense, expenseSplitDescription } from './lib/settle.ts';
import { fmtMoney, fmtRelative } from './lib/format.ts';
import './styles.css';
import { registerSW } from 'virtual:pwa-register';

// ----------------------------------------------------------------------------
// Reactive store
// ----------------------------------------------------------------------------
type View =
  | { kind: 'groups' }
  | { kind: 'group'; groupId: string; tab: 'overview' | 'expenses' | 'settle' | 'members' }
  | { kind: 'add-expense'; groupId: string; expenseId?: string }
  | { kind: 'add-settlement'; groupId: string };

interface State {
  groups: Group[];
  members: Member[];           // all members for currently-loaded group(s)
  expenses: Expense[];
  settlements: Settlement[];
  view: View;
  loaded: boolean;
}

const state: State = {
  groups: [],
  members: [],
  expenses: [],
  settlements: [],
  view: { kind: 'groups' },
  loaded: false,
};

const root = document.getElementById('app')!;

async function refresh() {
  state.groups = await db.groups.orderBy('createdAt').reverse().toArray();
  if (state.view.kind !== 'groups') {
    const gid = state.view.groupId;
    state.members = await db.members.where('groupId').equals(gid).toArray();
    state.expenses = await db.expenses.where('groupId').equals(gid).reverse().sortBy('createdAt');
    state.settlements = await db.settlements.where('groupId').equals(gid).reverse().sortBy('createdAt');
  }
  state.loaded = true;
  draw();
}

function draw() { render(template(), root); }

function go(v: View) { state.view = v; refresh(); }

// ----------------------------------------------------------------------------
// Toast
// ----------------------------------------------------------------------------
let toastTimer: ReturnType<typeof setTimeout> | undefined;
function toast(msg: string) {
  const el = document.querySelector<HTMLDivElement>('.toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ----------------------------------------------------------------------------
// Sample-data seed
// ----------------------------------------------------------------------------
async function seedSample() {
  const gId = uid();
  const now = Date.now();
  const m = ['Tsholo', 'Sipho', 'Lerato', 'Naledi'].map((name) => ({
    id: uid(), groupId: gId, name, createdAt: now,
  }));
  await db.groups.add({ id: gId, name: 'Cape Town weekend', currency: 'ZAR', createdAt: now });
  await db.members.bulkAdd(m);
  await db.expenses.bulkAdd([
    {
      id: uid(), groupId: gId, description: 'Airbnb (3 nights)', amount: 4800, payerId: m[0].id,
      participants: m.map((x) => x.id), splitMode: 'equal', createdAt: now - 4 * 86400000,
    },
    {
      id: uid(), groupId: gId, description: 'Groceries, Pick n Pay', amount: 1240, payerId: m[1].id,
      participants: m.map((x) => x.id), splitMode: 'equal', createdAt: now - 3 * 86400000,
    },
    {
      id: uid(), groupId: gId, description: 'Wine farm tour', amount: 2200, payerId: m[2].id,
      participants: [m[0].id, m[1].id, m[2].id], splitMode: 'equal', createdAt: now - 2 * 86400000,
    },
    {
      id: uid(), groupId: gId, description: 'Dinner at The Pot Luck Club', amount: 3600, payerId: m[3].id,
      participants: m.map((x) => x.id), splitMode: 'shares',
      shares: { [m[0].id]: 1, [m[1].id]: 2, [m[2].id]: 1, [m[3].id]: 2 },
      createdAt: now - 86400000,
    },
    {
      id: uid(), groupId: gId, description: 'Uber to airport', amount: 480, payerId: m[0].id,
      participants: m.map((x) => x.id), splitMode: 'equal', createdAt: now - 3600000,
    },
  ]);
  await refresh();
  toast('Sample group loaded');
}

// ----------------------------------------------------------------------------
// Templates
// ----------------------------------------------------------------------------
function template(): TemplateResult {
  return html`
    <div class="min-h-screen flex flex-col">
      ${header()}
      <main class="flex-1 max-w-3xl w-full mx-auto px-4 py-6">${body()}</main>
      ${footer()}
    </div>
    <div class="toast" role="status" aria-live="polite"></div>
    <div class="update-banner" id="update-banner">
      <span>A new version is available.</span>
      <button class="btn btn-primary" id="update-reload">Reload</button>
    </div>
  `;
}

function header(): TemplateResult {
  const inGroup = state.view.kind !== 'groups' ? state.groups.find((g) => g.id === (state.view as any).groupId) : undefined;
  return html`
    <header class="border-b" style="border-color: var(--color-border); background: var(--color-surface-base);">
      <div class="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <button class="btn btn-ghost" @click=${() => go({ kind: 'groups' })} aria-label="Home">
          <span style="color: var(--color-accent); font-weight: 700;">Sharp-Sharp</span>
        </button>
        ${inGroup
          ? html`<span style="color: var(--color-ink-tertiary);">/</span>
                 <span style="font-weight: 500;">${inGroup.name}</span>`
          : ''}
        <span class="ml-auto"></span>
        <button class="btn btn-ghost" @click=${toggleTheme} title="Toggle theme" aria-label="Toggle theme">
          ${currentTheme() === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  `;
}

function footer(): TemplateResult {
  return html`
    <footer class="text-center py-4" style="color: var(--color-ink-tertiary); font-size: 0.75rem;">
      Offline-first · IndexedDB · No account required
    </footer>
  `;
}

function body(): TemplateResult {
  if (!state.loaded) return html`<p class="empty">Loading…</p>`;
  switch (state.view.kind) {
    case 'groups': return groupsView();
    case 'group': return groupView();
    case 'add-expense': return expenseFormView();
    case 'add-settlement': return settlementFormView();
  }
}

// === Groups list ===
function groupsView(): TemplateResult {
  return html`
    <section>
      <header class="mb-5">
        <p class="eyebrow">Your groups</p>
        <h1 class="text-3xl mt-1">Sharp-Sharp</h1>
        <p class="mt-2 max-w-prose" style="color: var(--color-ink-secondary);">
          Track shared expenses, split however you like, and see exactly who pays whom to settle up
          with the fewest possible payments. Everything stays on your device.
        </p>
      </header>

      ${state.groups.length === 0
        ? html`
            <div class="empty">
              <div class="empty-icon">⊕</div>
              <p class="mb-3">No groups yet. Create one or load the sample to see how it works.</p>
              <div class="flex justify-center gap-2">
                <button class="btn btn-primary" @click=${createGroupPrompt}>Create group</button>
                <button class="btn" @click=${seedSample}>Load sample</button>
              </div>
            </div>
          `
        : html`
            <div class="flex gap-2 mb-4">
              <button class="btn btn-primary" @click=${createGroupPrompt}>+ New group</button>
              <button class="btn btn-ghost" @click=${seedSample}>Load sample</button>
            </div>
            <div class="grid gap-3">
              ${repeat(state.groups, (g) => g.id, (g) => groupCard(g))}
            </div>
          `}
    </section>
  `;
}

function groupCard(g: Group): TemplateResult {
  return html`
    <button
      class="card text-left w-full hover:border-[var(--color-accent)] transition-colors"
      style="cursor: pointer;"
      @click=${() => go({ kind: 'group', groupId: g.id, tab: 'overview' })}
    >
      <div class="flex items-center gap-3">
        <div>
          <h3 class="text-lg">${g.name}</h3>
          <p class="text-xs mt-1" style="color: var(--color-ink-tertiary);">
            <span class="chip">${g.currency}</span>
            <span class="ml-2">Created ${fmtRelative(g.createdAt)}</span>
          </p>
        </div>
        <span class="ml-auto" style="color: var(--color-accent);">→</span>
      </div>
    </button>
  `;
}

async function createGroupPrompt() {
  const name = prompt('Group name', 'New group');
  if (!name) return;
  const currency = prompt('Currency code (ZAR / USD / EUR / GBP)', 'ZAR') || 'ZAR';
  const id = uid();
  await db.groups.add({ id, name, currency: currency.toUpperCase(), createdAt: Date.now() });
  go({ kind: 'group', groupId: id, tab: 'members' });
}

// === Group detail ===
function groupView(): TemplateResult {
  const v = state.view as Extract<View, { kind: 'group' }>;
  const g = state.groups.find((x) => x.id === v.groupId);
  if (!g) return html`<p class="empty">Group not found.</p>`;

  return html`
    <section>
      <div class="mb-4">
        <button class="btn btn-ghost text-sm" @click=${() => go({ kind: 'groups' })}>← All groups</button>
      </div>

      <div class="flex items-start gap-3 mb-4">
        <div>
          <p class="eyebrow">Group</p>
          <h1 class="text-2xl mt-1">${g.name}</h1>
          <p class="text-xs mt-1" style="color: var(--color-ink-tertiary);">
            <span class="chip">${g.currency}</span>
            <span class="ml-2">${state.members.length} ${state.members.length === 1 ? 'member' : 'members'}</span>
            <span class="ml-2">${state.expenses.length} ${state.expenses.length === 1 ? 'expense' : 'expenses'}</span>
          </p>
        </div>
        <button class="btn btn-danger ml-auto text-xs" @click=${() => deleteGroup(g.id)}>Delete group</button>
      </div>

      <nav class="flex gap-1 border-b mb-4" style="border-color: var(--color-border);" role="tablist">
        ${tabBtn('overview', 'Overview', v)}
        ${tabBtn('expenses', 'Expenses', v)}
        ${tabBtn('settle', 'Settle up', v)}
        ${tabBtn('members', 'Members', v)}
      </nav>

      ${v.tab === 'overview' ? overviewTab(g) : ''}
      ${v.tab === 'expenses' ? expensesTab(g) : ''}
      ${v.tab === 'settle' ? settleTab(g) : ''}
      ${v.tab === 'members' ? membersTab(g) : ''}
    </section>
  `;
}

function tabBtn(tab: 'overview' | 'expenses' | 'settle' | 'members', label: string, v: Extract<View, { kind: 'group' }>) {
  return html`
    <button
      class="tab-btn"
      role="tab"
      aria-selected=${v.tab === tab}
      @click=${() => go({ kind: 'group', groupId: v.groupId, tab })}
    >${label}</button>
  `;
}

// === Overview tab ===
function overviewTab(g: Group): TemplateResult {
  const total = state.expenses.reduce((s, e) => s + e.amount, 0);
  const balances = computeBalances(state.members, state.expenses, state.settlements);
  const transfers = suggestSettlements(balances);

  if (state.members.length === 0) {
    return html`
      <div class="empty">
        <div class="empty-icon">◯</div>
        <p>Add at least one member to start tracking expenses.</p>
        <button class="btn btn-primary mt-3" @click=${() => go({ kind: 'group', groupId: g.id, tab: 'members' })}>
          Add members
        </button>
      </div>
    `;
  }

  return html`
    <div class="grid gap-3 md:grid-cols-3">
      <div class="tile"><div class="tile-label">Total spent</div><div class="tile-value">${fmtMoney(total, g.currency)}</div></div>
      <div class="tile"><div class="tile-label">Per head</div><div class="tile-value">${fmtMoney(total / Math.max(state.members.length, 1), g.currency)}</div></div>
      <div class="tile"><div class="tile-label">Open transfers</div><div class="tile-value">${transfers.length}</div></div>
    </div>

    <div class="card mt-4">
      <h3 class="mb-3">Net balances</h3>
      ${state.members.length === 0
        ? html`<p style="color: var(--color-ink-tertiary);">No members yet.</p>`
        : html`
            <ul class="divide-y" style="border-color: var(--color-border);">
              ${repeat(state.members, (m) => m.id, (m) => {
                const bal = balances[m.id] || 0;
                const cls = bal > 0.005 ? 'balance-pos' : bal < -0.005 ? 'balance-neg' : 'balance-zero';
                const label = bal > 0.005 ? 'is owed' : bal < -0.005 ? 'owes' : 'settled';
                return html`
                  <li class="flex items-center gap-3 py-2">
                    <div class="font-medium">${m.name}</div>
                    <div class="ml-auto text-sm" style="color: var(--color-ink-tertiary);">${label}</div>
                    <div class="${cls} font-mono text-sm" style="min-width: 7rem; text-align: right;">
                      ${fmtMoney(Math.abs(bal), g.currency)}
                    </div>
                  </li>
                `;
              })}
            </ul>
          `}
    </div>

    ${transfers.length > 0
      ? html`
          <div class="card mt-3">
            <h3 class="mb-3">Settle up, minimum payments</h3>
            <p class="text-sm mb-3" style="color: var(--color-ink-secondary);">
              ${transfers.length} ${transfers.length === 1 ? 'transfer' : 'transfers'} clears every balance.
            </p>
            <ul class="space-y-2">
              ${repeat(transfers, (_, i) => i, (t) => transferRow(t, g))}
            </ul>
            <div class="mt-4">
              <button class="btn" @click=${() => go({ kind: 'group', groupId: g.id, tab: 'settle' })}>Open Settle up →</button>
            </div>
          </div>
        `
      : ''}
  `;
}

function transferRow(t: { fromId: string; toId: string; amount: number }, g: Group): TemplateResult {
  const from = state.members.find((m) => m.id === t.fromId)?.name ?? '-';
  const to = state.members.find((m) => m.id === t.toId)?.name ?? '-';
  return html`
    <li class="flex items-center gap-2 text-sm">
      <span class="font-medium">${from}</span>
      <span style="color: var(--color-ink-tertiary);">→</span>
      <span class="font-medium">${to}</span>
      <span class="ml-auto font-mono" style="color: var(--color-accent);">${fmtMoney(t.amount, g.currency)}</span>
    </li>
  `;
}

// === Expenses tab ===
function expensesTab(g: Group): TemplateResult {
  return html`
    <div class="flex items-center mb-3">
      <p class="text-sm" style="color: var(--color-ink-secondary);">
        ${state.expenses.length} ${state.expenses.length === 1 ? 'expense' : 'expenses'}
      </p>
      <button class="btn btn-primary ml-auto"
              ?disabled=${state.members.length === 0}
              @click=${() => go({ kind: 'add-expense', groupId: g.id })}>+ Add expense</button>
    </div>
    ${state.expenses.length === 0
      ? html`<div class="empty">No expenses yet.</div>`
      : html`
          <div class="grid gap-2">
            ${repeat(state.expenses, (e) => e.id, (e) => expenseCard(e, g))}
          </div>
        `}
  `;
}

function expenseCard(e: Expense, g: Group): TemplateResult {
  const payer = state.members.find((m) => m.id === e.payerId)?.name ?? '?';
  return html`
    <div class="card">
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h4 class="text-base">${e.description}</h4>
            <span class="chip">${expenseSplitDescription(e.splitMode)}</span>
          </div>
          <p class="text-xs mt-1" style="color: var(--color-ink-tertiary);">
            Paid by <strong style="color: var(--color-ink-primary);">${payer}</strong> · ${fmtRelative(e.createdAt)}
            · ${e.participants.length} ${e.participants.length === 1 ? 'person' : 'people'}
          </p>
        </div>
        <div class="text-right">
          <div class="font-mono" style="color: var(--color-accent); font-size: 1.05rem;">${fmtMoney(e.amount, g.currency)}</div>
          <div class="flex gap-1 mt-1 justify-end">
            <button class="btn btn-ghost text-xs" @click=${() => go({ kind: 'add-expense', groupId: g.id, expenseId: e.id })}>Edit</button>
            <button class="btn btn-danger text-xs" @click=${() => deleteExpense(e.id)}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function deleteExpense(id: string) {
  if (!confirm('Delete this expense?')) return;
  await db.expenses.delete(id);
  await refresh();
  toast('Expense deleted');
}

// === Settle tab ===
function settleTab(g: Group): TemplateResult {
  const balances = computeBalances(state.members, state.expenses, state.settlements);
  const transfers = suggestSettlements(balances);
  return html`
    <div class="flex items-center mb-3">
      <p class="text-sm" style="color: var(--color-ink-secondary);">Suggested transfers, minimum number of payments to clear all balances.</p>
      <button class="btn btn-primary ml-auto" @click=${() => go({ kind: 'add-settlement', groupId: g.id })}>+ Record payment</button>
    </div>

    ${transfers.length === 0
      ? html`<div class="empty">All settled up. ${state.expenses.length > 0 ? 'Nothing owed.' : 'Add some expenses first.'}</div>`
      : html`
          <div class="card">
            <ul class="divide-y" style="border-color: var(--color-border);">
              ${repeat(transfers, (_, i) => i, (t) => html`
                <li class="flex items-center gap-3 py-3">
                  <div>
                    <div class="font-medium">
                      ${state.members.find((m) => m.id === t.fromId)?.name ?? '-'}
                      <span style="color: var(--color-ink-tertiary);"> pays </span>
                      ${state.members.find((m) => m.id === t.toId)?.name ?? '-'}
                    </div>
                    <div class="text-xs mt-1" style="color: var(--color-ink-tertiary);">Tap "Record" once paid.</div>
                  </div>
                  <div class="ml-auto font-mono" style="color: var(--color-accent);">${fmtMoney(t.amount, g.currency)}</div>
                  <button class="btn" @click=${() => recordTransfer(g.id, t.fromId, t.toId, t.amount)}>Record</button>
                </li>
              `)}
            </ul>
          </div>
        `}

    ${state.settlements.length > 0
      ? html`
          <div class="card mt-3">
            <h3 class="mb-3">Recorded payments</h3>
            <ul class="divide-y" style="border-color: var(--color-border);">
              ${repeat(state.settlements, (s) => s.id, (s) => html`
                <li class="flex items-center gap-3 py-2 text-sm">
                  <span>${state.members.find((m) => m.id === s.fromId)?.name ?? '-'}</span>
                  <span style="color: var(--color-ink-tertiary);">→</span>
                  <span>${state.members.find((m) => m.id === s.toId)?.name ?? '-'}</span>
                  <span class="ml-auto font-mono" style="color: var(--color-success);">${fmtMoney(s.amount, g.currency)}</span>
                  <span class="text-xs" style="color: var(--color-ink-tertiary);">${fmtRelative(s.createdAt)}</span>
                  <button class="btn btn-danger text-xs" @click=${() => deleteSettlement(s.id)}>Undo</button>
                </li>
              `)}
            </ul>
          </div>
        `
      : ''}
  `;
}

async function recordTransfer(groupId: string, fromId: string, toId: string, amount: number) {
  await db.settlements.add({ id: uid(), groupId, fromId, toId, amount, createdAt: Date.now() });
  await refresh();
  toast('Payment recorded');
}
async function deleteSettlement(id: string) {
  await db.settlements.delete(id);
  await refresh();
  toast('Payment removed');
}

// === Members tab ===
function membersTab(g: Group): TemplateResult {
  return html`
    <div class="card">
      <form @submit=${(e: Event) => addMemberSubmit(e, g.id)} class="flex gap-2">
        <input class="input flex-1" type="text" name="name" placeholder="Add a member by name…" required minlength="1" maxlength="40" />
        <button class="btn btn-primary" type="submit">Add</button>
      </form>
      ${state.members.length === 0
        ? html`<p class="hint mt-3">No members yet. Add at least two to track shared expenses.</p>`
        : html`
            <ul class="divide-y mt-4" style="border-color: var(--color-border);">
              ${repeat(state.members, (m) => m.id, (m) => html`
                <li class="flex items-center gap-3 py-2">
                  <div>${m.name}</div>
                  <button class="btn btn-danger text-xs ml-auto" @click=${() => removeMember(m.id)}>Remove</button>
                </li>
              `)}
            </ul>
          `}
    </div>
  `;
}

async function addMemberSubmit(e: Event, groupId: string) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const data = new FormData(form);
  const name = (data.get('name') as string).trim();
  if (!name) return;
  await db.members.add({ id: uid(), groupId, name, createdAt: Date.now() });
  form.reset();
  await refresh();
}
async function removeMember(id: string) {
  const refs = await db.expenses
    .filter((e) => e.payerId === id || e.participants.includes(id))
    .count();
  if (refs > 0) {
    alert(`This member is used in ${refs} expense(s). Remove or edit those first.`);
    return;
  }
  await db.members.delete(id);
  await refresh();
}

async function deleteGroup(id: string) {
  if (!confirm('Delete this group and all its expenses, members, and settlements?')) return;
  await db.transaction('rw', [db.groups, db.members, db.expenses, db.settlements], async () => {
    await db.expenses.where('groupId').equals(id).delete();
    await db.members.where('groupId').equals(id).delete();
    await db.settlements.where('groupId').equals(id).delete();
    await db.groups.delete(id);
  });
  go({ kind: 'groups' });
}

// === Expense form ===
function expenseFormView(): TemplateResult {
  const v = state.view as Extract<View, { kind: 'add-expense' }>;
  const g = state.groups.find((x) => x.id === v.groupId);
  if (!g) return html`<p class="empty">Group not found.</p>`;
  const editing = v.expenseId ? state.expenses.find((e) => e.id === v.expenseId) : undefined;

  // Pull form values out of an internal mutable object so we can re-render on changes
  const form = (window as any).__expForm ?? (() => {
    const init = editing ?? {
      description: '',
      amount: 0,
      payerId: state.members[0]?.id ?? '',
      participants: state.members.map((m) => m.id),
      splitMode: 'equal' as SplitMode,
      shares: {} as Record<string, number>,
      exactSplit: {} as Record<string, number>,
    };
    return { ...init };
  })();
  (window as any).__expForm = form;

  return html`
    <div class="mb-3">
      <button class="btn btn-ghost text-sm" @click=${cancelExpense}>← Back to expenses</button>
    </div>
    <div class="card">
      <h2 class="mb-4">${editing ? 'Edit expense' : 'Add expense'}</h2>
      <div class="grid gap-3">
        <div>
          <label class="label" for="exp-desc">Description</label>
          <input class="input" id="exp-desc" type="text" .value=${form.description}
                 @input=${(e: any) => { form.description = e.target.value; }} placeholder="e.g. Dinner at Reuben's" />
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <div>
            <label class="label" for="exp-amt">Amount (${g.currency})</label>
            <input class="input" id="exp-amt" type="number" min="0" step="0.01" .value=${String(form.amount || '')}
                   @input=${(e: any) => { form.amount = +e.target.value || 0; }} />
          </div>
          <div>
            <label class="label" for="exp-payer">Paid by</label>
            <select class="select" id="exp-payer" @change=${(e: any) => { form.payerId = e.target.value; }}>
              ${state.members.map((m) => html`<option value=${m.id} ?selected=${m.id === form.payerId}>${m.name}</option>`)}
            </select>
          </div>
        </div>
        <div>
          <label class="label">Split mode</label>
          <div class="flex flex-wrap gap-1">
            ${(['equal', 'shares', 'exact'] as SplitMode[]).map(
              (m) => html`
                <button type="button" class=${classMap({ btn: true, 'btn-primary': form.splitMode === m })}
                        @click=${() => { form.splitMode = m; draw(); }}>${expenseSplitDescription(m)}</button>
              `
            )}
          </div>
        </div>
        <div>
          <label class="label">Participants &amp; ${form.splitMode === 'equal' ? 'inclusion' : form.splitMode === 'shares' ? 'shares' : 'amounts'}</label>
          <ul class="divide-y" style="border-color: var(--color-border);">
            ${state.members.map((m) => {
              const included = form.participants.includes(m.id);
              return html`
                <li class="py-2 flex items-center gap-3">
                  <label class="flex items-center gap-2 flex-1">
                    <input type="checkbox" .checked=${included}
                           @change=${(e: any) => {
                             if (e.target.checked) form.participants.push(m.id);
                             else form.participants = form.participants.filter((x: string) => x !== m.id);
                             draw();
                           }} />
                    <span>${m.name}</span>
                  </label>
                  ${form.splitMode === 'shares' && included
                    ? html`<input class="input" style="width: 5rem;" type="number" min="0" step="1"
                                  .value=${String(form.shares[m.id] ?? 1)}
                                  @input=${(e: any) => { form.shares[m.id] = +e.target.value || 0; }} />`
                    : ''}
                  ${form.splitMode === 'exact' && included
                    ? html`<input class="input" style="width: 7rem;" type="number" min="0" step="0.01"
                                  .value=${String(form.exactSplit[m.id] ?? 0)}
                                  @input=${(e: any) => { form.exactSplit[m.id] = +e.target.value || 0; }} />`
                    : ''}
                </li>
              `;
            })}
          </ul>
          <p class="hint">
            ${form.splitMode === 'shares' ? 'Each participant\'s share is amount × (their share ÷ total shares).' : ''}
            ${form.splitMode === 'exact' ? 'Amounts must sum to the expense total. Small rounding is normalised.' : ''}
            ${form.splitMode === 'equal' ? 'Total is divided evenly across selected participants.' : ''}
          </p>
        </div>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-primary" @click=${() => saveExpense(g, form, editing)}>${editing ? 'Save changes' : 'Add expense'}</button>
          <button class="btn btn-ghost" @click=${cancelExpense}>Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function cancelExpense() {
  delete (window as any).__expForm;
  const v = state.view as Extract<View, { kind: 'add-expense' }>;
  go({ kind: 'group', groupId: v.groupId, tab: 'expenses' });
}

async function saveExpense(g: Group, form: any, editing?: Expense) {
  if (!form.description.trim()) { toast('Add a description'); return; }
  if (!(form.amount > 0)) { toast('Amount must be > 0'); return; }
  if (form.participants.length === 0) { toast('Pick at least one participant'); return; }
  if (!form.payerId) { toast('Select who paid'); return; }
  const record: Expense = {
    id: editing?.id ?? uid(),
    groupId: g.id,
    description: form.description.trim(),
    amount: Math.round(form.amount * 100) / 100,
    payerId: form.payerId,
    participants: form.participants,
    splitMode: form.splitMode,
    shares: form.splitMode === 'shares' ? form.shares : undefined,
    exactSplit: form.splitMode === 'exact' ? form.exactSplit : undefined,
    createdAt: editing?.createdAt ?? Date.now(),
  };
  await db.expenses.put(record);
  delete (window as any).__expForm;
  toast(editing ? 'Saved' : 'Expense added');
  go({ kind: 'group', groupId: g.id, tab: 'expenses' });
}

// === Settlement form ===
function settlementFormView(): TemplateResult {
  const v = state.view as Extract<View, { kind: 'add-settlement' }>;
  const g = state.groups.find((x) => x.id === v.groupId);
  if (!g) return html`<p class="empty">Group not found.</p>`;
  let fromId = state.members[0]?.id ?? '';
  let toId = state.members[1]?.id ?? state.members[0]?.id ?? '';
  let amount = 0;

  return html`
    <div class="mb-3">
      <button class="btn btn-ghost text-sm" @click=${() => go({ kind: 'group', groupId: g.id, tab: 'settle' })}>← Back to Settle up</button>
    </div>
    <div class="card">
      <h2 class="mb-4">Record a payment</h2>
      <div class="grid gap-3">
        <div class="grid gap-3 md:grid-cols-2">
          <div>
            <label class="label" for="s-from">From</label>
            <select class="select" id="s-from" @change=${(e: any) => { fromId = e.target.value; }}>
              ${state.members.map((m) => html`<option value=${m.id}>${m.name}</option>`)}
            </select>
          </div>
          <div>
            <label class="label" for="s-to">To</label>
            <select class="select" id="s-to" @change=${(e: any) => { toId = e.target.value; }}>
              ${state.members.map((m, i) => html`<option value=${m.id} ?selected=${i === 1}>${m.name}</option>`)}
            </select>
          </div>
        </div>
        <div>
          <label class="label" for="s-amt">Amount (${g.currency})</label>
          <input class="input" id="s-amt" type="number" min="0" step="0.01"
                 @input=${(e: any) => { amount = +e.target.value || 0; }} />
        </div>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-primary" @click=${async () => {
            if (!(amount > 0)) { toast('Amount must be > 0'); return; }
            if (fromId === toId) { toast('From and To must differ'); return; }
            await db.settlements.add({ id: uid(), groupId: g.id, fromId, toId, amount: Math.round(amount * 100) / 100, createdAt: Date.now() });
            toast('Payment recorded');
            go({ kind: 'group', groupId: g.id, tab: 'settle' });
          }}>Record</button>
          <button class="btn btn-ghost" @click=${() => go({ kind: 'group', groupId: g.id, tab: 'settle' })}>Cancel</button>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// Theme toggle
// ----------------------------------------------------------------------------
function currentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}
function toggleTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme() === 'dark' ? 'light' : 'dark');
  draw();
}

// ----------------------------------------------------------------------------
// Bootstrap + service worker
// ----------------------------------------------------------------------------
refresh();

const updateSW = registerSW({
  onNeedRefresh() {
    const banner = document.getElementById('update-banner');
    const reload = document.getElementById('update-reload');
    if (!banner || !reload) return;
    banner.setAttribute('data-show', 'true');
    reload.addEventListener('click', () => updateSW(true), { once: true });
  },
});

// Track parent theme changes (when embedded as iframe with ?theme=)
window.addEventListener('storage', () => draw());
