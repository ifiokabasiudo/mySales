import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";
import { clearSession } from "@/lib/session";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        // await Preferences.remove({ key: "session" });
        await clearSession()
        router.push("/");
      }}
      className="text-white bg-rose-600 rounded-md py-2 w-full hover:cursor-pointer"
    >
      Sign Out
    </button>
  );
}
