// import { clearSession } from "@/lib/session";
import { useRouter } from "next/navigation";

export default function GlobalButton({
  buttonName,
  buttonColor,
  link,
  handleClick,
  index
}: {
  buttonName: string;
  buttonColor: string;
  link: string | null;
  index: number | null
  handleClick: (index: number | null) => void | null;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        handleClick(index);
        if (link) {
          router.push(link);
        }
      }}
      className={`text-white bg-rose-600 rounded-md py-2 w-full hover:cursor-pointer ${buttonColor}`}
    >
      {buttonName}
    </button>
  );
}
