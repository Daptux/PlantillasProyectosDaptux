import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ============================================================
 *  ENUMS
 * ============================================================ */

export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "contador",
  "auxiliar",
  "revisor",
]);

export const statusEnum = pgEnum("status", ["active", "inactive", "suspended"]);

export const personTypeEnum = pgEnum("person_type", ["natural", "juridica"]);

export const periodicityEnum = pgEnum("periodicity", [
  "mensual",
  "bimestral",
  "trimestral",
  "cuatrimestral",
  "anual",
  "personalizada",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "pendiente",
  "aprobado",
  "rechazado",
  "falta_soporte",
  "falta_informacion",
  "procesado",
  "archivado",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "borrador",
  "enviada",
  "vista",
  "respondida",
  "parcial",
  "vencida",
  "cerrada",
  "cancelada",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "baja",
  "media",
  "alta",
  "urgente",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pendiente",
  "en_proceso",
  "completada",
  "vencida",
  "cancelada",
]);

export const checklistItemStatusEnum = pgEnum("checklist_item_status", [
  "pendiente",
  "en_proceso",
  "completado",
  "no_aplica",
]);

export const checklistStatusEnum = pgEnum("checklist_status", [
  "abierto",
  "en_proceso",
  "cerrado",
]);

export const riskLevelEnum = pgEnum("risk_level", ["verde", "amarillo", "rojo"]);

export const deadlineStatusEnum = pgEnum("deadline_status", [
  "pendiente",
  "cumplido",
  "vencido",
  "cancelado",
]);

export const deadlineTypeEnum = pgEnum("deadline_type", [
  "obligacion",
  "tarea",
  "solicitud",
  "cierre_mensual",
  "reporte",
  "otro",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "generando",
  "listo",
  "error",
  "compartido",
]);

export const genericStatusEnum = pgEnum("generic_status", ["active", "inactive"]);

/* ============================================================
 *  FIRMAS CONTABLES (multiempresa)
 * ============================================================ */

export const accountingFirms = pgTable("accounting_firms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  nit: varchar("nit", { length: 40 }),
  email: varchar("email", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  plan: varchar("plan", { length: 40 }).default("free").notNull(),
  status: statusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
 *  USUARIOS
 * ============================================================ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id").references(() => accountingFirms.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").default("auxiliar").notNull(),
    phone: varchar("phone", { length: 40 }),
    status: statusEnum("status").default("active").notNull(),
    resetToken: varchar("reset_token", { length: 120 }),
    resetTokenExpiresAt: timestamp("reset_token_expires_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    firmIdx: index("users_firm_idx").on(t.firmId),
  })
);

/* ============================================================
 *  CLIENTES CONTABLES
 * ============================================================ */

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id")
      .references(() => accountingFirms.id, { onDelete: "cascade" })
      .notNull(),
    assignedUserId: uuid("assigned_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 200 }).notNull(),
    businessName: varchar("business_name", { length: 200 }),
    documentType: varchar("document_type", { length: 20 })
      .default("NIT")
      .notNull(),
    documentNumber: varchar("document_number", { length: 40 }).notNull(),
    personType: personTypeEnum("person_type").default("juridica").notNull(),
    taxRegime: varchar("tax_regime", { length: 80 }),
    isVatResponsible: boolean("is_vat_responsible").default(false).notNull(),
    economicActivity: varchar("economic_activity", { length: 120 }),
    address: text("address"),
    city: varchar("city", { length: 80 }),
    department: varchar("department", { length: 80 }),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 160 }),
    legalRepresentative: varchar("legal_representative", { length: 160 }),
    riskLevel: riskLevelEnum("risk_level").default("verde").notNull(),
    status: statusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    firmIdx: index("clients_firm_idx").on(t.firmId),
    assignedIdx: index("clients_assigned_idx").on(t.assignedUserId),
  })
);

export const clientContacts = pgTable("client_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 80 }),
  email: varchar("email", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ============================================================
 *  OBLIGACIONES TRIBUTARIAS
 * ============================================================ */

export const obligations = pgTable("obligations", {
  id: uuid("id").primaryKey().defaultRandom(),
  firmId: uuid("firm_id").references(() => accountingFirms.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  defaultPeriodicity: periodicityEnum("default_periodicity")
    .default("mensual")
    .notNull(),
  status: genericStatusEnum("status").default("active").notNull(),
});

export const clientObligations = pgTable("client_obligations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  obligationId: uuid("obligation_id")
    .references(() => obligations.id, { onDelete: "cascade" })
    .notNull(),
  periodicity: periodicityEnum("periodicity").default("mensual").notNull(),
  dueDay: integer("due_day"),
  responsibleUserId: uuid("responsible_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  active: boolean("active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ============================================================
 *  TIPOS DE DOCUMENTO
 * ============================================================ */

export const documentTypes = pgTable("document_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  firmId: uuid("firm_id").references(() => accountingFirms.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  requiredByDefault: boolean("required_by_default").default(false).notNull(),
  status: genericStatusEnum("status").default("active").notNull(),
});

/* ============================================================
 *  SOLICITUDES AL CLIENTE
 * ============================================================ */

export const requests = pgTable(
  "requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id")
      .references(() => accountingFirms.id, { onDelete: "cascade" })
      .notNull(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    assignedUserId: uuid("assigned_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    documentTypeId: uuid("document_type_id").references(() => documentTypes.id, {
      onDelete: "set null",
    }),
    month: integer("month"),
    year: integer("year"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    token: varchar("token", { length: 80 }).notNull(),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    tokenActive: boolean("token_active").default(true).notNull(),
    status: requestStatusEnum("status").default("borrador").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("requests_token_idx").on(t.token),
    clientIdx: index("requests_client_idx").on(t.clientId),
    firmIdx: index("requests_firm_idx").on(t.firmId),
  })
);

/* ============================================================
 *  DOCUMENTOS
 * ============================================================ */

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id")
      .references(() => accountingFirms.id, { onDelete: "cascade" })
      .notNull(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),
    documentTypeId: uuid("document_type_id").references(() => documentTypes.id, {
      onDelete: "set null",
    }),
    requestId: uuid("request_id").references(() => requests.id, {
      onDelete: "set null",
    }),
    uploadedBy: uuid("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    month: integer("month"),
    year: integer("year"),
    originalName: varchar("original_name", { length: 260 }),
    internalName: varchar("internal_name", { length: 260 }),
    fileUrl: text("file_url"),
    fileSize: integer("file_size"),
    fileExtension: varchar("file_extension", { length: 20 }),
    status: documentStatusEnum("status").default("pendiente").notNull(),
    notes: text("notes"),
    uploadedByExternal: boolean("uploaded_by_external").default(false).notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    clientIdx: index("documents_client_idx").on(t.clientId),
    firmIdx: index("documents_firm_idx").on(t.firmId),
    periodIdx: index("documents_period_idx").on(t.year, t.month),
  })
);

export const documentComments = pgTable("document_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .references(() => documents.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const requestFiles = pgTable("request_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .references(() => requests.id, { onDelete: "cascade" })
    .notNull(),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ============================================================
 *  CHECKLIST MENSUAL
 * ============================================================ */

export const monthlyChecklists = pgTable(
  "monthly_checklists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id")
      .references(() => accountingFirms.id, { onDelete: "cascade" })
      .notNull(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    status: checklistStatusEnum("status").default("abierto").notNull(),
    progress: integer("progress").default(0).notNull(),
    riskLevel: riskLevelEnum("risk_level").default("rojo").notNull(),
    closedBy: uuid("closed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniquePeriod: uniqueIndex("checklist_client_period_idx").on(
      t.clientId,
      t.year,
      t.month
    ),
  })
);

export const monthlyChecklistItems = pgTable("monthly_checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  checklistId: uuid("checklist_id")
    .references(() => monthlyChecklists.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: checklistItemStatusEnum("status").default("pendiente").notNull(),
  isCritical: boolean("is_critical").default(false).notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  relatedDocumentTypeId: uuid("related_document_type_id").references(
    () => documentTypes.id,
    { onDelete: "set null" }
  ),
  relatedTaskId: uuid("related_task_id"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ============================================================
 *  TAREAS INTERNAS
 * ============================================================ */

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id")
      .references(() => accountingFirms.id, { onDelete: "cascade" })
      .notNull(),
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "cascade",
    }),
    assignedTo: uuid("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    priority: taskPriorityEnum("priority").default("media").notNull(),
    status: taskStatusEnum("status").default("pendiente").notNull(),
    taskType: varchar("task_type", { length: 60 }).default("otra").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    relatedDocumentId: uuid("related_document_id").references(
      () => documents.id,
      { onDelete: "set null" }
    ),
    relatedRequestId: uuid("related_request_id").references(() => requests.id, {
      onDelete: "set null",
    }),
    relatedChecklistItemId: uuid("related_checklist_item_id").references(
      () => monthlyChecklistItems.id,
      { onDelete: "set null" }
    ),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    firmIdx: index("tasks_firm_idx").on(t.firmId),
    assignedIdx: index("tasks_assigned_idx").on(t.assignedTo),
    clientIdx: index("tasks_client_idx").on(t.clientId),
  })
);

export const taskComments = pgTable("task_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ============================================================
 *  VENCIMIENTOS / CALENDARIO
 * ============================================================ */

export const deadlines = pgTable(
  "deadlines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id")
      .references(() => accountingFirms.id, { onDelete: "cascade" })
      .notNull(),
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    type: deadlineTypeEnum("type").default("otro").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    status: deadlineStatusEnum("status").default("pendiente").notNull(),
    priority: taskPriorityEnum("priority").default("media").notNull(),
    assignedTo: uuid("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    firmIdx: index("deadlines_firm_idx").on(t.firmId),
    dueIdx: index("deadlines_due_idx").on(t.dueDate),
  })
);

/* ============================================================
 *  REPORTES
 * ============================================================ */

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  firmId: uuid("firm_id")
    .references(() => accountingFirms.id, { onDelete: "cascade" })
    .notNull(),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "cascade",
  }),
  generatedBy: uuid("generated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  type: varchar("type", { length: 60 }).notNull(),
  month: integer("month"),
  year: integer("year"),
  fileUrl: text("file_url"),
  format: varchar("format", { length: 10 }).default("pdf").notNull(),
  status: reportStatusEnum("status").default("listo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ============================================================
 *  NOTIFICACIONES
 * ============================================================ */

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message"),
    type: varchar("type", { length: 60 }).default("info").notNull(),
    link: varchar("link", { length: 300 }),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    userIdx: index("notifications_user_idx").on(t.userId),
  })
);

/* ============================================================
 *  PLANTILLAS DE MENSAJES
 * ============================================================ */

export const messageTemplates = pgTable("message_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  firmId: uuid("firm_id")
    .references(() => accountingFirms.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  subject: varchar("subject", { length: 200 }),
  body: text("body").notNull(),
  type: varchar("type", { length: 60 }).default("general").notNull(),
  status: genericStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ============================================================
 *  AUDITORIA
 * ============================================================ */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id").references(() => accountingFirms.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    module: varchar("module", { length: 60 }).notNull(),
    entityType: varchar("entity_type", { length: 60 }),
    entityId: uuid("entity_id"),
    oldData: jsonb("old_data"),
    newData: jsonb("new_data"),
    ipAddress: varchar("ip_address", { length: 60 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    firmIdx: index("audit_firm_idx").on(t.firmId),
    entityIdx: index("audit_entity_idx").on(t.entityType, t.entityId),
  })
);

/* ============================================================
 *  CONFIGURACION (settings key/value por firma)
 * ============================================================ */

export const settings = pgTable(
  "settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firmId: uuid("firm_id")
      .references(() => accountingFirms.id, { onDelete: "cascade" })
      .notNull(),
    key: varchar("key", { length: 120 }).notNull(),
    value: jsonb("value"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    firmKeyIdx: uniqueIndex("settings_firm_key_idx").on(t.firmId, t.key),
  })
);

/* ============================================================
 *  RELACIONES
 * ============================================================ */

export const firmsRelations = relations(accountingFirms, ({ many }) => ({
  users: many(users),
  clients: many(clients),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  firm: one(accountingFirms, {
    fields: [users.firmId],
    references: [accountingFirms.id],
  }),
  assignedClients: many(clients),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  firm: one(accountingFirms, {
    fields: [clients.firmId],
    references: [accountingFirms.id],
  }),
  assignedUser: one(users, {
    fields: [clients.assignedUserId],
    references: [users.id],
  }),
  contacts: many(clientContacts),
  obligations: many(clientObligations),
  documents: many(documents),
  tasks: many(tasks),
  requests: many(requests),
  checklists: many(monthlyChecklists),
  deadlines: many(deadlines),
}));

export const clientObligationsRelations = relations(
  clientObligations,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientObligations.clientId],
      references: [clients.id],
    }),
    obligation: one(obligations, {
      fields: [clientObligations.obligationId],
      references: [obligations.id],
    }),
  })
);

export const documentsRelations = relations(documents, ({ one, many }) => ({
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
  documentType: one(documentTypes, {
    fields: [documents.documentTypeId],
    references: [documentTypes.id],
  }),
  request: one(requests, {
    fields: [documents.requestId],
    references: [requests.id],
  }),
  comments: many(documentComments),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  client: one(clients, {
    fields: [requests.clientId],
    references: [clients.id],
  }),
  documentType: one(documentTypes, {
    fields: [requests.documentTypeId],
    references: [documentTypes.id],
  }),
  files: many(requestFiles),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  client: one(clients, { fields: [tasks.clientId], references: [clients.id] }),
  assignee: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  comments: many(taskComments),
}));

export const checklistsRelations = relations(
  monthlyChecklists,
  ({ one, many }) => ({
    client: one(clients, {
      fields: [monthlyChecklists.clientId],
      references: [clients.id],
    }),
    items: many(monthlyChecklistItems),
  })
);

export const checklistItemsRelations = relations(
  monthlyChecklistItems,
  ({ one }) => ({
    checklist: one(monthlyChecklists, {
      fields: [monthlyChecklistItems.checklistId],
      references: [monthlyChecklists.id],
    }),
  })
);

/* ============================================================
 *  TIPOS INFERIDOS
 * ============================================================ */

export type AccountingFirm = typeof accountingFirms.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientContact = typeof clientContacts.$inferSelect;
export type Obligation = typeof obligations.$inferSelect;
export type ClientObligation = typeof clientObligations.$inferSelect;
export type DocumentType = typeof documentTypes.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type MonthlyChecklist = typeof monthlyChecklists.$inferSelect;
export type MonthlyChecklistItem = typeof monthlyChecklistItems.$inferSelect;
export type Deadline = typeof deadlines.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Setting = typeof settings.$inferSelect;
