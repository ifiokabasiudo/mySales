"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();

      if (session) {
        router.replace("/dashboard"); // user already logged in
      }
    }

    checkSession();
  }, []);

  return <>{children}</>;
}
