import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "ContaHub · Gestion contable-administrativa",
    template: "%s · ContaHub",
  },
  description:
    "Organiza todos tus clientes contables en un solo lugar. Documentos, tareas, vencimientos, solicitudes y reportes sin Excel ni WhatsApp desordenado.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
