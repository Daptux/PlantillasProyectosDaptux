import "server-only";
import PDFDocument from "pdfkit";
import { monthName, formatDate } from "./utils";

export type ClientMonthlyReportData = {
  firmName: string;
  clientName: string;
  clientDocument: string;
  month: number;
  year: number;
  checklistProgress: number;
  riskLevel: string;
  documentsReceived: number;
  documentsMissing: string[];
  pendingRequests: number;
  tasksCompleted: number;
  tasksPending: number;
  observations?: string;
  recommendations?: string;
  accountantName: string;
};

/** Genera un PDF de reporte mensual por cliente y devuelve un Buffer. */
export function generateClientMonthlyReportPdf(
  data: ClientMonthlyReportData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const primary = "#1e3a8a";
      const gray = "#475569";

      // Encabezado
      doc.fillColor(primary).fontSize(20).text("ContaHub", { continued: false });
      doc.fillColor(gray).fontSize(10).text(data.firmName);
      doc.moveDown(0.5);
      doc
        .fillColor("#0f172a")
        .fontSize(16)
        .text(`Reporte mensual · ${monthName(data.month)} ${data.year}`);
      doc.moveDown(0.5);
      doc
        .strokeColor("#e2e8f0")
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
      doc.moveDown();

      // Datos del cliente
      doc.fillColor(primary).fontSize(12).text("Cliente");
      doc.fillColor("#0f172a").fontSize(11);
      doc.text(`Nombre: ${data.clientName}`);
      doc.text(`Documento: ${data.clientDocument}`);
      doc.text(`Periodo: ${monthName(data.month)} de ${data.year}`);
      doc.text(`Semaforo: ${data.riskLevel.toUpperCase()}`);
      doc.text(`Avance del checklist: ${data.checklistProgress}%`);
      doc.moveDown();

      // Resumen
      doc.fillColor(primary).fontSize(12).text("Resumen del periodo");
      doc.fillColor("#0f172a").fontSize(11);
      doc.text(`Documentos recibidos: ${data.documentsReceived}`);
      doc.text(`Solicitudes pendientes: ${data.pendingRequests}`);
      doc.text(`Tareas completadas: ${data.tasksCompleted}`);
      doc.text(`Tareas pendientes: ${data.tasksPending}`);
      doc.moveDown();

      // Documentos faltantes
      doc.fillColor(primary).fontSize(12).text("Documentos faltantes");
      doc.fillColor("#0f172a").fontSize(11);
      if (data.documentsMissing.length === 0) {
        doc.text("Ninguno. El cliente esta al dia.");
      } else {
        data.documentsMissing.forEach((d) => doc.text(`• ${d}`));
      }
      doc.moveDown();

      if (data.observations) {
        doc.fillColor(primary).fontSize(12).text("Observaciones");
        doc.fillColor("#0f172a").fontSize(11).text(data.observations);
        doc.moveDown();
      }
      if (data.recommendations) {
        doc.fillColor(primary).fontSize(12).text("Recomendaciones");
        doc.fillColor("#0f172a").fontSize(11).text(data.recommendations);
        doc.moveDown();
      }

      // Pie
      doc.moveDown(2);
      doc.fillColor(gray).fontSize(10);
      doc.text(`Generado el ${formatDate(new Date())}`);
      doc.text(`Contador responsable: ${data.accountantName}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
