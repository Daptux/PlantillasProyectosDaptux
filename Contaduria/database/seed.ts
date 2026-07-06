import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import bcrypt from "bcryptjs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as fullSchema from "./schema";
import {
  accountingFirms,
  users,
  clients,
  clientObligations,
  obligations,
  documentTypes,
  tasks,
  requests,
  documents,
  monthlyChecklists,
  monthlyChecklistItems,
  notifications,
} from "./schema";
import {
  DEFAULT_DOCUMENT_TYPES,
  DEFAULT_OBLIGATIONS,
  DEFAULT_TEMPLATES,
} from "./defaults";

function token(n = 20) {
  return [...Array(n)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema: fullSchema });

async function main() {
  console.log("Sembrando datos demo...");
  const hash = await bcrypt.hash("contahub123", 10);

  // Limpia (orden por dependencias)
  await db.delete(notifications);
  await db.delete(monthlyChecklistItems);
  await db.delete(monthlyChecklists);
  await db.delete(documents);
  await db.delete(requests);
  await db.delete(tasks);
  await db.delete(clientObligations);
  await db.delete(clients);
  await db.delete(documentTypes);
  await db.delete(obligations);
  await db.delete(users);
  await db.delete(accountingFirms);

  // Superadmin (sin firma)
  await db.insert(users).values({
    name: "Super Admin",
    email: "superadmin@contahub.com",
    passwordHash: hash,
    role: "superadmin",
  });

  // Firma demo
  const [firm] = await db
    .insert(accountingFirms)
    .values({
      name: "Oficina Contable Demo SAS",
      nit: "900123456-7",
      email: "demo@contahub.com",
      phone: "3001234567",
      plan: "pro",
    })
    .returning();

  // Usuarios de la firma
  const [contador] = await db
    .insert(users)
    .values({
      firmId: firm.id,
      name: "Carlos Contador",
      email: "contador@contahub.com",
      passwordHash: hash,
      role: "contador",
    })
    .returning();

  const [auxiliar] = await db
    .insert(users)
    .values({
      firmId: firm.id,
      name: "Ana Auxiliar",
      email: "auxiliar@contahub.com",
      passwordHash: hash,
      role: "auxiliar",
    })
    .returning();

  await db.insert(users).values({
    firmId: firm.id,
    name: "Rita Revisora",
    email: "revisor@contahub.com",
    passwordHash: hash,
    role: "revisor",
  });

  // Catalogos
  const insertedTypes = await db
    .insert(documentTypes)
    .values(DEFAULT_DOCUMENT_TYPES.map((d) => ({ ...d, firmId: firm.id })))
    .returning();
  const insertedObligations = await db
    .insert(obligations)
    .values(DEFAULT_OBLIGATIONS.map((o) => ({ ...o, firmId: firm.id })))
    .returning();
  const { messageTemplates } = await import("./schema");
  await db
    .insert(messageTemplates)
    .values(DEFAULT_TEMPLATES.map((t) => ({ ...t, firmId: firm.id })));

  // Clientes demo
  const clientSeed = [
    { name: "Hotel Pelt", businessName: "Hotel Pelt SAS", documentNumber: "901111111-1", riskLevel: "rojo" as const, isVatResponsible: true },
    { name: "Roman Club", businessName: "Roman Club Ltda", documentNumber: "901222222-2", riskLevel: "amarillo" as const, isVatResponsible: true },
    { name: "Lexa", businessName: "Lexa Servicios", documentNumber: "901333333-3", riskLevel: "verde" as const, isVatResponsible: false },
  ];

  const insertedClients = await db
    .insert(clients)
    .values(
      clientSeed.map((c) => ({
        firmId: firm.id,
        assignedUserId: auxiliar.id,
        name: c.name,
        businessName: c.businessName,
        documentType: "NIT",
        documentNumber: c.documentNumber,
        personType: "juridica" as const,
        taxRegime: "Comun",
        isVatResponsible: c.isVatResponsible,
        economicActivity: "Servicios",
        city: "Medellin",
        department: "Antioquia",
        email: `${c.name.toLowerCase().replace(/\s/g, "")}@correo.com`,
        legalRepresentative: "Representante Legal",
        riskLevel: c.riskLevel,
      }))
    )
    .returning();

  // Obligaciones por cliente (IVA, Retencion, Nomina, Seguridad social)
  const oblByName = Object.fromEntries(insertedObligations.map((o) => [o.name, o.id]));
  for (const c of insertedClients) {
    const names = ["IVA", "Retencion en la fuente", "Nomina electronica", "Seguridad social"];
    await db.insert(clientObligations).values(
      names
        .filter((n) => oblByName[n])
        .map((n) => ({
          clientId: c.id,
          obligationId: oblByName[n],
          periodicity: "mensual" as const,
          dueDay: 15,
          responsibleUserId: auxiliar.id,
          active: true,
        }))
    );
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Checklists del mes actual
  for (const c of insertedClients) {
    const [checklist] = await db
      .insert(monthlyChecklists)
      .values({
        firmId: firm.id,
        clientId: c.id,
        month,
        year,
        status: "abierto",
        progress: c.riskLevel === "verde" ? 90 : c.riskLevel === "amarillo" ? 60 : 30,
        riskLevel: c.riskLevel,
      })
      .returning();

    const items = [
      "Facturas de venta recibidas",
      "Facturas de compra recibidas",
      "Extractos bancarios recibidos",
      "Nomina revisada",
      "IVA preparado",
      "Reporte enviado",
      "Mes cerrado",
    ];
    await db.insert(monthlyChecklistItems).values(
      items.map((title, idx) => ({
        checklistId: checklist.id,
        title,
        isCritical: ["Facturas de venta recibidas", "IVA preparado", "Mes cerrado"].includes(title),
        sortOrder: idx,
        status: (idx < (c.riskLevel === "verde" ? 6 : c.riskLevel === "amarillo" ? 4 : 2)
          ? "completado"
          : "pendiente") as "completado" | "pendiente",
      }))
    );
  }

  // Tareas demo
  const typeByName = Object.fromEntries(insertedTypes.map((t) => [t.name, t.id]));
  await db.insert(tasks).values([
    {
      firmId: firm.id, clientId: insertedClients[0].id, assignedTo: auxiliar.id, createdBy: contador.id,
      title: "Solicitar extractos bancarios a Hotel Pelt", priority: "alta", status: "pendiente",
      taskType: "solicitar_documentos", dueDate: new Date(now.getTime() + 2 * 86400000),
    },
    {
      firmId: firm.id, clientId: insertedClients[1].id, assignedTo: auxiliar.id, createdBy: contador.id,
      title: "Revisar documentos de Roman Club", priority: "media", status: "en_proceso",
      taskType: "revisar_documentos", dueDate: new Date(now.getTime() + 5 * 86400000),
    },
    {
      firmId: firm.id, clientId: insertedClients[2].id, assignedTo: contador.id, createdBy: contador.id,
      title: "Preparar IVA de Lexa", priority: "urgente", status: "pendiente",
      taskType: "preparar_iva", dueDate: new Date(now.getTime() - 1 * 86400000),
    },
  ]);

  // Solicitudes demo
  await db.insert(requests).values([
    {
      firmId: firm.id, clientId: insertedClients[0].id, createdBy: contador.id, assignedUserId: auxiliar.id,
      title: "Subir extractos bancarios de Hotel Pelt", description: "Necesitamos los extractos del mes.",
      documentTypeId: typeByName["Extracto bancario"], month, year,
      dueDate: new Date(now.getTime() + 3 * 86400000), token: token(), status: "enviada", sentAt: now,
    },
    {
      firmId: firm.id, clientId: insertedClients[1].id, createdBy: contador.id,
      title: "Subir facturas de compra", documentTypeId: typeByName["Factura de compra"], month, year,
      token: token(), status: "borrador",
    },
  ]);

  // Documentos demo (sin archivos reales)
  await db.insert(documents).values([
    {
      firmId: firm.id, clientId: insertedClients[0].id, documentTypeId: typeByName["Factura de venta"],
      uploadedBy: auxiliar.id, month, year, originalName: "factura_001.pdf",
      internalName: "HotelPelt_FacturaVenta_" + year + "_001.pdf", status: "pendiente", fileSize: 102400, fileExtension: "pdf",
    },
    {
      firmId: firm.id, clientId: insertedClients[2].id, documentTypeId: typeByName["Extracto bancario"],
      uploadedBy: auxiliar.id, reviewedBy: contador.id, reviewedAt: now, month, year,
      originalName: "extracto.pdf", internalName: "Lexa_ExtractoBancario_" + year + "_001.pdf",
      status: "aprobado", fileSize: 204800, fileExtension: "pdf",
    },
  ]);

  // Notificacion demo
  await db.insert(notifications).values({
    userId: contador.id,
    title: "Bienvenido a ContaHub",
    message: "Tu firma demo esta lista. Explora clientes, documentos y checklists.",
    type: "info",
    link: "/dashboard",
  });

  console.log("\nSeed completado. Credenciales demo (contraseña: contahub123):");
  console.log("  Contador : contador@contahub.com");
  console.log("  Auxiliar : auxiliar@contahub.com");
  console.log("  Revisor  : revisor@contahub.com");
  console.log("  Superadmin: superadmin@contahub.com");

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
