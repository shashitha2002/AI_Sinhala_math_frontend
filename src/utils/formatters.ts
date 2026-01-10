export function formatNumber(num: number): string {
  return new Intl.NumberFormat('si-LK').format(num);
}

export function trimExpression(expr: string): string {
  return expr.trim();
}
