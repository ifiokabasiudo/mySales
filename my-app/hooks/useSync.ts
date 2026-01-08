import { syncPending } from "../lib/sync/syncPending";
import { pullData } from "../lib/sync/pullData";
import { clearLocalData } from "../lib/local/clearLocalData";
import { getSession } from "@/lib/session";

let syncInProgress = false;
let lastSync = 0;

export async function runSync() {
  const now = Date.now();
  if (now - lastSync < 5000) return; // throttle
  if (syncInProgress) return;

  lastSync = now;
  syncInProgress = true;

  const userData = await getSession()

  try {
    if (userData?.profile?.phone) {
      // ✅ clear everything local for the new user
      await clearLocalData(userData?.profile?.phone);
    }

    await syncPending();           // ✅ push ALL pending changes
    await pullData(); // ✅ pull server truth
  } finally {
    syncInProgress = false;
  }
}
