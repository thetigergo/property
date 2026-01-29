"use client";

import React, { useRef } from "react";
import { useAuth } from "@/context/AuthContext"; // 👈 For state management
import { useRouter } from "next/navigation";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";

export default function SideMenuBar() {
  const toast = useRef<Toast>(null);
  const { nigamit } = useAuth();

  const router = useRouter();

  const rights = nigamit?.permiso;
  const hasA = rights?.includes("A"); // ADMINUSER
  const hasB = rights?.includes("B"); // SUPERUSER
  const hasC = rights?.includes("C"); // ENDUSER
  const has0 = rights?.includes("0"); // SPECIAL
  const assr = nigamit?.officeId === "1101"; // ASSESSOR
  const items: MenuItem[] = [
    {
      label: "I.C.S./P.A.R.",
      items: [
        {
          label: "ICS/PAR Entry",
          icon: "pi pi-file",
          command: () => router.push("/ppe/departo/receipt"),
        },
        {
          label: "Incomplete Data",
          icon: "pi pi-file",
          command: () => router.push("/ppe/departo"),
        },
        {
          label: "ICS/PAR List",
          icon: "pi pi-file",
          command: () => router.push("/ppe/departo/listing"),
        },
      ],
      visible: hasC,
    },
    {
      label: "REAL ESTATE",
      items: [
        { label: "Entry Form", icon: "pi pi-file" },
        { label: "Property List", icon: "pi pi-file" },
      ],
      visible: assr,
    },
    {
      label: "PROPERTY",
      items: [
        {
          label: "Transfer To..",
          icon: "pi pi-file-export",
          visible: hasC,
          disabled: true,
        },
        {
          label: "Waste/Return",
          icon: "pi pi-chart-scatter",
          visible: hasC,
          disabled: true,
        },
        {
          label: "Unvalidated ICS/PAR",
          icon: "pi pi-file",
          visible: hasB,
          command: () => router.push("/ppe/sysadmin"),
        },
      ],
    },
    {
      label: "REPORTS",
      items: [
        {
          label: "Physical Count",
          icon: "pi pi-twitch",
          visible: hasC, // ENDUSER
          command: () => router.push("/ppe/departo/physical"),
        },
        {
          label: "R.E.P. Inventory",
          icon: "pi pi-twitch",
          visible: hasC && assr,
        },
        {
          label: "Physical Count",
          icon: "pi pi-pulse pi-twitch",
          visible: hasB, // SUPERUSER
          command: () => router.push("/ppe/sysadmin/physical"),
        },
      ],
    },
    {
      label: "MAINTENANCE",
      items: [
        { label: "Suppliers", icon: "pi pi-truck", visible: hasB },
        {
          label: "Offices",
          icon: "pi pi-building",
          command: () => router.push("/ppe/sysadmin/officelist"),
          visible: hasB,
        },
        {
          label: "Employees",
          icon: "pi pi-users",
          command: () => router.push("/ppe/departo/emplist"),
          visible: has0,
        },
        {
          label: "Employees",
          icon: "pi pi-users",
          command: () => router.push("/ppe/sysadmin/emplist"),
          visible: hasB,
        },
        {
          separator: true,
          visible: hasA,
          template: () => <hr className="border-neutral-300" />,
        },

        {
          label: "Category",
          icon: "pi pi-bounce pi-calendar-times",
          command: () =>
            router.push("/ppe/sysadmin/category", { scroll: true }),
          visible: hasA,
        },
        { label: "Subsidiary", icon: "pi pi-chart-pie", visible: hasA },
      ],
      visible: hasA || hasB || has0,
    },
    {
      label: "SYSTEM",
      items: [
        { label: "Permission", icon: "pi pi-verified" },
        { label: "Settings", icon: "pi pi-spin pi-cog" },
      ],
      visible: hasB,
    },
  ];

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />
      <Menu model={items} />
    </div>
  );
}
