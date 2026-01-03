// // hooks/useOfflineSync.ts
// "use client"

// import { useEffect, useRef, useState } from "react";
// import { db, PendingSync } from "../lib/db";
// // import { supabase } from "../lib/supabase/client";
// import { syncPending } from "@/lib/sync/syncPending";

// const MAX_RETRIES = 5;

// export default function useOfflineSync() {
//   const [isSyncing, setIsSyncing] = useState(false);
//   const abortRef = useRef(false);

//   async function processItem(item: PendingSync) {
//     try {
      

//       // other actions: hard_delete etc. (implement if needed)
//     } catch (err: any) {
      
//     }
//   }

//   async function syncPending() {
//     if (!navigator.onLine) return;
//     setIsSyncing(true);
//     const items = await db.pending_sync.orderBy("created_at").toArray();
//     for (const item of items) {
//       if (abortRef.current) break;
//       try {
//         await processItem(item);
//       } catch (e) {
//         // exponential backoff on error
//         await new Promise((res) => setTimeout(res, 1000 * Math.min(30, (item.tries ?? 0) ** 2)));
//       }
//     }
//     setIsSyncing(false);
//   }

//   useEffect(() => {
//     const onOnline = () => void syncPending();
//     window.addEventListener("online", onOnline);
//     // try initial sync if online on mount
//     if (navigator.onLine) syncPending();
//     return () => {
//       window.removeEventListener("online", onOnline);
//       abortRef.current = true;
//     };
//   }, []);

//   return {
//     isSyncing,
//     manualSync: syncPending,
//   };
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { syncPending } from "@/lib/sync/syncPending";

export default function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const abortRef = useRef({ aborted: false });

  async function manualSync() {
    if (!navigator.onLine) return;

    setIsSyncing(true);
    abortRef.current.aborted = false;

    try {
      await syncPending({ signal: abortRef.current });
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    const onOnline = () => manualSync();

    window.addEventListener("online", onOnline);
    if (navigator.onLine) manualSync();

    return () => {
      abortRef.current.aborted = true;
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return {
    isSyncing,
    manualSync,
  };
}

