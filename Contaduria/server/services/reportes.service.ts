import "server-only";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  reports,
  clients,
  documents,
  tasks,
  requests,
  monthlyChecklists,
  monthlyChecklistItems,
  accountingFirms,
} from "@/database/schema";
import type { SessionPayload } from "@/lib/auth";
import { generateClientMonthlyReportPdf } from "@/lib/pdf";
import { uploadFile } from "@/lib/storage";
import { slugify, monthName } from "@/lib/utils";

export async function listReports(session: SessionPayload) {
  return db
    .select({
      id: reports.id,
      title: reports.title,
      type: reports.type,
      month: reports.month,
      year: reports.year,
      format: reports.format,
      status: reports.status,
      fileUrl: reports.fileUrl,
      clientName: clients.name,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .leftJoin(clients, eq(reports.clientId, clients.id))
    .where(eq(reports.firmId, session.firmId!))
    .orderBy(desc(reports.createdAt))
    .limit(100);
}

/** Genera el reporte mensual por cliente en PDF, lo almacena y registra. */
export async function generateClientMonthlyReport(
  session: SessionPayload,
  clientId: string,
  month: number,
  year: number
) {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.firmId, session.firmId!)))
    .limit(1);
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const [firm] = await db
    .select({ name: accountingFirms.name })
    .from(accountingFirms)
    .where(eq(accountingFirms.id, session.firmId!))
    .limit(1);

  const [docsCount] = await db
    .select({ c: count() })
    .from(documents)
    .where(and(eq(documents.clientId, clientId), eq(documents.month, month), eq(documents.year, year)));

  const [tasksDone] = await db
    .select({ c: count() })
    .from(tasks)
    .where(and(eq(tasks.clientId, clientId), eq(tasks.status, "completada")));

  const [tasksPending] = await db
    .select({ c: count() })
    .from(tasks)
    .where(and(eq(tasks.clientId, clientId), inArray(tasks.status, ["pendiente", "en_proceso"])));

  const [pendingReq] = await db
    .select({ c: count() })
    .from(requests)
    .where(and(eq(requests.clientId, clientId), inArray(requests.status, ["enviada", "vista", "parcial"])));

  // Checklist del periodo -> avance y faltantes
  const [checklist] = await db
    .select()
    .from(monthlyChecklists)
    .where(and(eq(monthlyChecklists.clientId, clientId), eq(monthlyChecklists.month, month), eq(monthlyChecklists.year, year)))
    .limit(1);

  let missing: string[] = [];
  if (checklist) {
    const items = await db
      .select({ title: monthlyChecklistItems.title, status: monthlyChecklistItems.status })
      .from(monthlyChecklistItems)
      .where(eq(monthlyChecklistItems.checklistId, checklist.id));
    missing = items
      .filter((i) => i.status === "pendiente" || i.status === "en_proceso")
      .map((i) => i.title);
  }

  const pdf = await generateClientMonthlyReportPdf({
    firmName: firm?.name ?? "Firma contable",
    clientName: client.name,
    clientDocument: `${client.documentType} ${client.documentNumber}`,
    month,
    year,
    checklistProgress: checklist?.progress ?? 0,
    riskLevel: checklist?.riskLevel ?? "rojo",
    documentsReceived: docsCount?.c ?? 0,
    documentsMissing: missing,
    pendingRequests: pendingReq?.c ?? 0,
    tasksCompleted: tasksDone?.c ?? 0,
    tasksPending: tasksPending?.c ?? 0,
    accountantName: session.name,
  });

  const fileName = `Reporte_${slugify(client.name)}_${monthName(month)}_${year}.pdf`;
  const blob = new Blob([new Uint8Array(pdf)], { type: "application/pdf" });
  const stored = await uploadFile(
    Object.assign(blob, { name: fileName }) as unknown as File,
    fileName
  );

  const [row] = await db
    .insert(reports)
    .values({
      firmId: session.firmId!,
      clientId,
      generatedBy: session.userId,
      title: `Reporte mensual · ${client.name} · ${monthName(month)} ${year}`,
      type: "reporte_mensual",
      month,
      year,
      fileUrl: stored.url,
      format: "pdf",
      status: "listo",
    })
    .returning();

  return row;
}

export async function getReport(session: SessionPayload, id: string) {
  const [row] = await db
    .select()
    .from(reports)
    .where(and(eq(reports.id, id), eq(reports.firmId, session.firmId!)))
    .limit(1);
  return row ?? null;
}
