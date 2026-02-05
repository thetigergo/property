"use client";
import { redirect } from "next/navigation";

import SideMenu from "@/components/SideMenuBar";
import HeadBar from "@/components/TopHeader";
import { useAuth } from "@/context/AuthContext";

import "@/styles/layout.css";

export default function DepartoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { nigamit } = useAuth();

  if (!nigamit) redirect("/");

  return (
    <div className="departo-layout">
      <div>
        <div id="top" className="top">
          <HeadBar />
        </div>

        <div className="flex min-w-[1212px]">
          <div id="left">
            <aside>
              <SideMenu />
            </aside>
          </div>
          <div id="content" className="left_content">
            <section>{children}</section>
          </div>
        </div>
      </div>
    </div>
  );
}
