export function getQSaleNumber(id: string, date: string) {
  const shortId = id.replace(/-/g, "").slice(-6).toUpperCase();
  const d = new Date(date);
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `Q-SALE-${ymd}-${shortId}`;
}

export function getInvSaleNumber(id: string, date: string) {
  const shortId = id.replace(/-/g, "").slice(-6).toUpperCase();
  const d = new Date(date);
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-SALE-${ymd}-${shortId}`;
}

export function getItemNumber(id: string, date: string) {
  const shortId = id.replace(/-/g, "").slice(-6).toUpperCase();
  const d = new Date(date);
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `ITEM-${ymd}-${shortId}`;
}

export function getExpense(id: string, date: string) {
  const shortId = id.replace(/-/g, "").slice(-6).toUpperCase();
  const d = new Date(date);
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `EXPENSE-${ymd}-${shortId}`;
}