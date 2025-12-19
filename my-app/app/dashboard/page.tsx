import Navbar from "@/components/navbar";
import DashboardCards from "./components/dashboard-cards";
import DashboardCardsLevel2 from "./components/dashboard-cards-level-2";
import { Inter } from "next/font/google";
// import MainSync from "@/hooks/mainSync";

const inter = Inter({
	  weight: "400",
	  subsets: ["latin"],
})

export default function DashboardB() {
  return (
	<>
	{/* <MainSync /> */}
	<div className={`flex flex-col gap-5 min-h-screen bg-[#ECEFF0] ${inter.className}`}>
		<Navbar />
		<DashboardCards />
		<DashboardCardsLevel2 />
	</div>
	</>
  );	
}