"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal-component";
import SignOutButton from "./sign-out-button";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />
      {/* Sidebar */}
      <aside
        ref={ref}
        className={`fixed top-0 left-0 z-50 overflow-auto h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-[#1C8220]">Dashboard</h2>
        </div>

        {/* Nav */}
        <nav className="flex flex-col py-4 text-gray-700">
          <SidebarItem
            label="Overview"
            onClick={() => router.push("/dashboard")}
          />
          <SidebarItem
            label="Quick Sales"
            onClick={() => router.push("/dashboard/addSale?sale=quick")}
          />
          <SidebarItem
            label="Inventory Sales"
            onClick={() => router.push("/dashboard/addSale?sale=inventory")}
          />
          <SidebarItem
            label="Add Expense"
            onClick={() => router.push("/expenses")}
          />
          <SidebarItem
            label="Allocate Sale"
            onClick={() => router.push("/reconciliation")}
          />

          <div className="my-4 border-t" />
            <h1 className="text-left px-6 py-3 font-bold">Tables</h1>
            <SidebarItem
            label="Quick Sales"
            onClick={() => router.push("/dashboard/addSale/quick-sale")}
          />
          <SidebarItem
            label="Inventory Sales"
            onClick={() => router.push("/dashboard/addSale/inventory-sale")}
          />
          <SidebarItem
            label="Expenses"
            onClick={() => router.push("/table/expenses")}
          />
          <SidebarItem
            label="Inventory"
            onClick={() => router.push("/inventory")}
          />

          <div className="my-4 border-t" />

          <SidebarItem
            label="Settings"
            onClick={() => router.push("/dashboard/settings")}
          />
          <SidebarItem
            label="Logout"
            danger
            onClick={() => setShowModal(true)}
          />
        </nav>
      </aside>
      <Modal
        show={showModal}
        setShow={setShowModal}
        alignment="center"
        isIntercepting={true}
        showCancelBtnINSmallDevice={true}
      >
        <div className="">
            Are you sure you want to sign out?
        </div>
        <div className="mt-4">
            <SignOutButton />
        </div>
      </Modal>
    </>
  );
}

function SidebarItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-6 py-3 transition hover:cursor-pointer ${
        danger ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}
