"use client";

import { DashboardProvider } from "@/context/DashboardContext";
import { MainPanel } from "@/components/MainPanel";
import { PasswordGate } from "@/components/PasswordGate";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <PasswordGate>
      <DashboardProvider>
        <div className="flex h-full flex-1 overflow-hidden bg-white">
          <Sidebar />
          <MainPanel />
        </div>
      </DashboardProvider>
    </PasswordGate>
  );
}
