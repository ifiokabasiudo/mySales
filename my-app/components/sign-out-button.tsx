import { clearSession } from "@/lib/session";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        clearSession;
        router.push("/");
      }}
      className="text-white bg-rose-600 rounded-md py-2 w-full hover:cursor-pointer"
    >
      Sign Out
    </button>
  );
}
