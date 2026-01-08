import { syncPending } from "../lib/sync/syncPending";
import { pullData } from "../lib/sync/pullData";

let syncInProgress = false;
let lastSync = 0;

export async function runSync() {
  const now = Date.now();
  if (now - lastSync < 5000) return; // throttle
  if (syncInProgress) return;

  lastSync = now;
  syncInProgress = true;

  try {
    // await syncPending();           // ✅ push ALL pending changes
    await pullData(); // ✅ pull server truth
  } finally {
    syncInProgress = false;
  }
}
