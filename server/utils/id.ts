import { randomUUID } from 'node:crypto'

/** Generates a unique id for a new entity. Auto-imported across server routes. */
export function newId(): string {
  return randomUUID()
}
