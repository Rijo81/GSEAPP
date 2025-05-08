export function getIdFromMaybeObject(value: any): string | null {
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return value.id;
  }
  return value ?? null;
}
