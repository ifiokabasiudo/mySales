import { db } from "../db";

export async function safeDB<T>(fn: () => Promise<T>) {
  if (!db.isOpen()) await db.open();
  return fn();
}