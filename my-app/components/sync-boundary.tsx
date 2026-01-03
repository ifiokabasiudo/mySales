"use client"

import { useEffect } from "react";
import { runSync } from "@/hooks/useSync";

export default function SyncBoundary() {
  useEffect(() => {
    // App open
    runSync();

    // Network regain
    const onOnline = () => runSync();
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}