import Navbar from "@/components/navbar";
import DashboardCards from "./components/dashboard-cards";
import DashboardCardsLevel2 from "./components/dashboard-cards-level-2";
import { Inter } from "next/font/google";
import DashboardCardsLevel1 from "./components/dashboard-cards-level-1";
// import MainSync from "@/hooks/mainSync";

const inter = Inter({
	  weight: "400",
	  subsets: ["latin"],
})

export default function DashboardB() {
  return (
	<>
	{/* <MainSync /> */}
	<div className={`flex flex-col gap-5 h-fit px-5 w-full text-gray-700 bg-[#ECEFF0] pb-5 ${inter.className}`}>
		<Navbar />
		<DashboardCards />
		<DashboardCardsLevel1 />
		<DashboardCardsLevel2 />
	</div>
	</>
  );	
}