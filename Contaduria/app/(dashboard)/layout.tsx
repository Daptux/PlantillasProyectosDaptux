import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/session-user";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getDashboardContext();
  if (!ctx) redirect("/login");

  const { session, firmName, unread } = ctx;

  return (
    <DashboardShell
      name={session.name}
      email={session.email}
      role={session.role}
      firmName={firmName}
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
