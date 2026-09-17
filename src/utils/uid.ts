/**
 * Random id that also works outside secure contexts (plain http on a LAN),
 * where `crypto.randomUUID` is undefined.
 */
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const hex = (n: number) => Math.floor(Math.random() * 16 ** n).toString(16).padStart(n, '0')
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${hex(4)}-${hex(12)}`
}
