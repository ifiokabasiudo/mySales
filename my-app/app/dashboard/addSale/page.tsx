import Navbar from "@/components/navbar";
import NewSale from "./components/newSale";
import { Inter } from "next/font/google";
import { Suspense } from "react";

const inter = Inter({
  weight: "400",
  subsets: ["latin"],
});

export default function AddSale() {
  return (
    <>
      {/* <MainSync /> */}
      <div
        className={`flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider ${inter.className}`}
      >
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}><NewSale /></Suspense>
      </div>
    </>
  );
}
