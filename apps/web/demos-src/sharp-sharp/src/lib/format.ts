/** Format an amount with a currency code prefix (no Intl locale-specific symbol so this works for ZAR/USD/etc). */
export function fmtMoney(amount: number, currency: string = 'ZAR'): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const intl = new Intl.NumberFormat('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}${currencyPrefix(currency)}\u00A0${intl.format(abs)}`;
}

function currencyPrefix(c: string): string {
  switch (c.toUpperCase()) {
    case 'ZAR': return 'R';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return c.toUpperCase();
  }
}

export function fmtDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtRelative(ts: number): string {
  const diffSec = (Date.now() - ts) / 1000;
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return fmtDate(ts);
}
