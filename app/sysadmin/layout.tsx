"use client";

import SideMenu from "@/components/SideMenuBar";
import HeadBar from "@/components/TopHeader";
import { useAuth } from "@/context/AuthContext";

import ".././layout.css";

export default function DepartoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) return null;

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
