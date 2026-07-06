import "server-only";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Envio de correos. Soporta Resend (RESEND_API_KEY) o SMTP (Nodemailer).
 * Si no hay ninguno configurado, hace log en consola (modo desarrollo).
 */
export async function sendMail(msg: MailMessage): Promise<{ ok: boolean }> {
  const from = process.env.MAIL_FROM || "ContaHub <no-reply@contahub.com>";

  // Opcion A: Resend (via API HTTP, sin dependencia extra)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
        }),
      });
      return { ok: res.ok };
    } catch (e) {
      console.error("[mail] Error enviando con Resend:", e);
      return { ok: false };
    }
  }

  // Opcion B: SMTP con Nodemailer
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transport.sendMail({
        from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
      return { ok: true };
    } catch (e) {
      console.error("[mail] Error enviando con SMTP:", e);
      return { ok: false };
    }
  }

  console.info(`[mail:dev] -> ${msg.to} | ${msg.subject}`);
  return { ok: true };
}

/** Reemplaza variables {{cliente}}, {{mes}}, etc. en una plantilla. */
export function renderTemplate(
  body: string,
  vars: Record<string, string>
): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? "");
}
