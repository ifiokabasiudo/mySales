"use client"

import { useEffect } from "react";
import { runSync } from "@/hooks/useSync";

export default function SyncBoundary() {
  useEffect(() => {
    // App open
    // runSync();

    // // Network regain
    // const onOnline = () => runSync();
     (async () => {
      try {
        await runSync();
      } catch (err) {
        console.warn("Initial sync failed:", err);
      }
    })();

    // Network regain
    const onOnline = async () => {
      try {
        await runSync();
      } catch (err) {
        console.warn("Sync on reconnect failed:", err);
      }
    };

    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}