"use client"

import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainSync from "@/hooks/mainSync";

export default function Navbar() {
  const router = useRouter();

  //   const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  /* ✅ LOAD SESSION ONCE */
  useEffect(() => {
    async function loadSession() {
      const data = await getSession();

      if (!data?.profile?.first_name) {
        alert("Not authenticated. Please log in");
        router.push("/auth/login");
        return;
      }

      setProfile(data.profile);
    }

    loadSession();
  }, []);

  return (
    <>
      <MainSync />
      <nav className="w-full sticky z-50 bg-[#ECEFF0] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <a href="#" className="p-3 md:p-5 cursor-pointer">
            <svg
        xmlns="http://www.w3.org/2000/svg"
        width="19"
        height="14"
        viewBox="0 0 19 14"
        fill="none"
      >
        <line
          x1="1"
          y1="1"
          x2="18"
          y2="1"
          stroke="#1C8220"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="1"
          y1="7"
          x2="18"
          y2="7"
          stroke="#1C8220"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="1"
          y1="13"
          x2="18"
          y2="13"
          stroke="#1C8220"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
        </a>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="54"
        height="53"
        viewBox="0 0 54 53"
        fill="none"
      >
        <g filter="url(#filter0_d_85_2)">
          <ellipse cx="25.8" cy="25.3" rx="17" ry="16.5" fill="#F5FAFD" />
        </g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.3 19.8C21.3 18.6065 21.7741 17.4619 22.618 16.618C23.462 15.7741 24.6065 15.3 25.8 15.3C26.9935 15.3 28.1381 15.7741 28.982 16.618C29.8259 17.4619 30.3 18.6065 30.3 19.8C30.3 20.9935 29.8259 22.1381 28.982 22.982C28.1381 23.8259 26.9935 24.3 25.8 24.3C24.6065 24.3 23.462 23.8259 22.618 22.982C21.7741 22.1381 21.3 20.9935 21.3 19.8ZM17.551 33.905C17.5847 31.7395 18.4687 29.6741 20.012 28.1546C21.5553 26.6351 23.6342 25.7834 25.8 25.7834C27.9658 25.7834 30.0447 26.6351 31.5881 28.1546C33.1314 29.6741 34.0153 31.7395 34.049 33.905C34.0516 34.0508 34.0117 34.1942 33.9341 34.3176C33.8564 34.441 33.7445 34.5392 33.612 34.6C31.1612 35.7237 28.4962 36.3036 25.8 36.3C23.014 36.3 20.367 35.692 17.988 34.6C17.8555 34.5392 17.7436 34.441 17.666 34.3176C17.5884 34.1942 17.5484 34.0508 17.551 33.905Z"
          fill="#1C8220"
        />
        <defs>
          <filter
            id="filter0_d_85_2"
            x="4.86374e-05"
            y="-9.53674e-07"
            width="53.6"
            height="52.6"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="1" dy="1" />
            <feGaussianBlur stdDeviation="4.9" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_85_2"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_85_2"
              result="shape"
            />
          </filter>
        </defs>
      </svg>

      <div className="flex flex-col self-end tracking-wider">
        <h1>Hi, {profile?.first_name?.toUpperCase()}</h1>
        <p className="text-sm text-[#8D8989]">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
      </div>
      </div>

      <a href="#" className="p-3 md:p-5 cursor-pointer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="54"
        height="53"
        viewBox="0 0 54 53"
        fill="none"
      >
        <g filter="url(#filter0_d_85_4)">
          <ellipse cx="25.8" cy="25.3" rx="17" ry="16.5" fill="#F5FAFD" />
        </g>
        <path
          d="M20.675 18.7167C20.7793 18.5923 20.8312 18.4323 20.8197 18.2704C20.8081 18.1086 20.734 17.9575 20.6131 17.8493C20.4922 17.741 20.3339 17.684 20.1718 17.6904C20.0096 17.6968 19.8563 17.7659 19.7442 17.8833C18.7204 19.0252 18.0419 20.4343 17.7875 21.9467C17.764 22.1084 17.8047 22.2729 17.901 22.4049C17.9973 22.5369 18.1415 22.626 18.3027 22.653C18.4638 22.6801 18.6292 22.6429 18.7632 22.5495C18.8973 22.4561 18.9895 22.3139 19.02 22.1533C19.2351 20.8742 19.8091 19.6824 20.675 18.7167ZM31.8559 17.8833C31.8013 17.8216 31.7351 17.7713 31.661 17.7353C31.5869 17.6992 31.5064 17.6782 31.4242 17.6734C31.3419 17.6685 31.2596 17.68 31.1818 17.7072C31.104 17.7343 31.0323 17.7765 30.9709 17.8314C30.9095 17.8864 30.8596 17.9529 30.824 18.0272C30.7884 18.1015 30.7678 18.1821 30.7635 18.2643C30.7591 18.3466 30.7711 18.4289 30.7987 18.5065C30.8263 18.5842 30.8689 18.6556 30.9242 18.7167C31.7904 19.6823 32.3646 20.8741 32.58 22.1533C32.6074 22.3169 32.6987 22.4628 32.8337 22.5591C32.9006 22.6068 32.9762 22.6408 33.0562 22.6593C33.1362 22.6777 33.219 22.6802 33.3 22.6667C33.381 22.6531 33.4585 22.6237 33.5281 22.5802C33.5978 22.5367 33.6581 22.4798 33.7058 22.413C33.7535 22.3461 33.7875 22.2705 33.806 22.1905C33.8244 22.1105 33.8269 22.0276 33.8134 21.9467C33.5585 20.4341 32.8802 19.025 31.8559 17.8833Z"
          fill="#1C8220"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.8001 17.675C24.3083 17.675 22.8776 18.2676 21.8227 19.3225C20.7678 20.3774 20.1751 21.8082 20.1751 23.3V23.925C20.1777 25.6243 19.5483 27.2639 18.4093 28.525C18.3409 28.6009 18.2921 28.6924 18.2673 28.7915C18.2425 28.8906 18.2423 28.9942 18.2668 29.0934C18.2913 29.1926 18.3397 29.2842 18.4079 29.3603C18.476 29.4365 18.5618 29.4947 18.6576 29.53C19.9443 30.005 21.291 30.355 22.6835 30.5658C22.6521 30.9943 22.7094 31.4246 22.8519 31.8299C22.9943 32.2352 23.2187 32.6068 23.5112 32.9214C23.8037 33.2361 24.1579 33.4871 24.5517 33.6587C24.9456 33.8303 25.3705 33.9189 25.8001 33.9189C26.2297 33.9189 26.6547 33.8303 27.0485 33.6587C27.4424 33.4871 27.7966 33.2361 28.0891 32.9214C28.3815 32.6068 28.606 32.2352 28.7484 31.8299C28.8908 31.4246 28.9482 30.9943 28.9168 30.5658C30.2902 30.3576 31.6388 30.0103 32.9418 29.5292C33.0375 29.4938 33.1231 29.4356 33.1912 29.3595C33.2592 29.2835 33.3076 29.1919 33.3321 29.0929C33.3566 28.9938 33.3564 28.8903 33.3317 28.7913C33.307 28.6923 33.2584 28.6009 33.1901 28.525C32.0514 27.2638 31.4223 25.6242 31.4251 23.925V23.3C31.4251 21.8082 30.8325 20.3774 29.7776 19.3225C28.7227 18.2676 27.292 17.675 25.8001 17.675ZM23.9251 30.8C23.9251 30.7717 23.9251 30.7442 23.9268 30.7167C25.1732 30.829 26.4271 30.829 27.6735 30.7167L27.6751 30.8C27.6751 31.2973 27.4776 31.7742 27.126 32.1258C26.7743 32.4775 26.2974 32.675 25.8001 32.675C25.3029 32.675 24.8259 32.4775 24.4743 32.1258C24.1227 31.7742 23.9251 31.2973 23.9251 30.8Z"
          fill="#1C8220"
        />
        <defs>
          <filter
            id="filter0_d_85_4"
            x="4.86374e-05"
            y="-9.53674e-07"
            width="53.6"
            height="52.6"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="1" dy="1" />
            <feGaussianBlur stdDeviation="4.9" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_85_4"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_85_4"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
      </a>
    </nav>
    </>
  );
}
