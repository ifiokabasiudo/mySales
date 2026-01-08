"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { TableData } from "@/app/dashboard/addSale/components/newSale";

const Modal = ({
  show,
  setShow,
  children,
  alignment,
  className,
  //   isIntercepting = false,
  showCancelBtnINSmallDevice = false,
  isOnlySmallDevice = false,
  isOnlyLargeDevice = false,
  setTable
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
  alignment: "left" | "center" | "right" | "top" | "bottom";
  className?: string;
  isIntercepting?: boolean;
  showCancelBtnINSmallDevice?: boolean;
  isOnlySmallDevice?: boolean;
  isOnlyLargeDevice?: boolean;
  setTable: Dispatch<SetStateAction<TableData | null>>
}) => {
  const [animate, setAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);
  //   const redirect = useRouter();

  let appearAnimation;
  let disappearAnimation;

  if (alignment === "left") {
    appearAnimation = "translate-x-0";
    disappearAnimation = "-translate-x-1/2";
  } else if (alignment === "center") {
    appearAnimation = "scale-100";
    disappearAnimation = "scale-0";
  } else if (alignment === "right") {
    appearAnimation = "translate-x-0";
    disappearAnimation = "translate-x-1/2";
  } else if (alignment === "top") {
    appearAnimation = "translate-y-[-227px]";
    disappearAnimation = "-translate-y-[100%]";
  } else if (alignment === "bottom") {
    appearAnimation = "translate-y-0";
    disappearAnimation = "translate-y-full";
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (show) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
  }, [show]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimate(false);
    if(alignment == "bottom") {
        setTable(null)
    }
    // if (isIntercepting) {
    //   redirect.back();
    // }
    setTimeout(() => setShow(false), 300);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed px-4 ${
        show && `z-100 inset-0`
      } bg-black/60 transition-opacity duration-300 ease-in-out flex ${
        alignment != "bottom" && "items-center"
      } 
      ${alignment === "bottom" ? "items-end" : "items-center"}
      ${animate ? "opacity-100" : "opacity-0"}
      ${alignment === "right" && "justify-end"} 
      ${alignment === "center" && "justify-center"} 
      ${isOnlySmallDevice && "md:hidden"} 
      ${isOnlyLargeDevice && "hidden md:flex"}`}
      onClick={handleClose}
    >
      <div
        className={`flex flex-col ${alignment != "bottom" ? "rounded" : "rounded-t-2xl"} relative shadow-black-50 drop-shadow-2xl bg-white p-5 duration-300 ease-in-out
         ${alignment === "bottom" && "w-full"}
            ${
              alignment !== "center" &&
              alignment !== "bottom" &&
              "h-full md:h-[calc(100%-16px)] md:m-2"
            }
           
            ${animate ? appearAnimation : disappearAnimation} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close handler */}
        <button
          className={`hover:rotate-90 transition-all duration-200 self-end text-black hover:text-[#ff4b4b] hover:cursor-pointer font-bold z-50 mb-1 ${
            showCancelBtnINSmallDevice ? "block" : "hidden"
          }`}
          onClick={handleClose}
        >
          &#10005;
        </button>
        {/* children */}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
