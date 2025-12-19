"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

import Intro from "./home/components/intro";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function protect() {
      const session = await getSession();
      if (!session) {
        router.replace("/auth/login");
      } else {
        setLoading(false);
      }
    }

    protect();
  }, []);
  return (
    <>
      <Intro />
    </>
  );
}
