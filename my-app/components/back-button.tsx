import Link from "next/link";

export default function BackButton({backlink}: {backlink: string}) {
  return (
    <Link href={backlink} className="flex items-center gap-3 absolute top-5 left-5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="16"
        viewBox="0 0 12 16"
        fill="none"
      >
        <path
          d="M10.381 1.5001L2.38104 7.40919L10.381 14.5001"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {" "}
      Back
    </Link>
  );
}
