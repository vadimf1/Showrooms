export function fmtMoney(n: number | string): string {
  return '$' + Number(n).toLocaleString('en-US');
}
