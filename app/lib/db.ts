/**
 * Database scope manager.
 * Tracks the current user ID so the storage layer knows
 * which user's data to access via the /api/data endpoint.
 */

let currentScope: string = "guest";

export function setDbScope(userId: string) {
  currentScope = userId || "guest";
}

export function getDbScope(): string {
  return currentScope;
}
