"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import type { Role } from "@/lib/permissions";

export function DashboardShell({
  name,
  email,
  role,
  firmName,
  unread,
  children,
}: {
  name: string;
  email: string;
  role: Role;
  firmName: string;
  unread?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar
        role={role}
        firmName={firmName}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          name={name}
          email={email}
          role={role}
          unread={unread}
          onMenu={() => setOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
