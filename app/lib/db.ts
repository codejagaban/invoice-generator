/**
 * Database scope manager.
 * Tracks whether the user is authenticated (Postgres) or guest (IndexedDB).
 */

let currentScope: string = "guest";
let isAuthenticated: boolean = false;

export function setDbScope(userId: string, authenticated: boolean = false) {
  currentScope = userId || "guest";
  isAuthenticated = authenticated;
}

export function getDbScope(): string {
  return currentScope;
}

export function isUserAuthenticated(): boolean {
  return isAuthenticated;
}
