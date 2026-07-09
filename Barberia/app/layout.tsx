import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { getConfiguracion } from "@/lib/queries";
import { SITE_URL } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfiguracion().catch(() => null);
  const nombre = config?.nombre_comercial ?? "BarberPro Studio";
  const descripcion =
    config?.descripcion ?? "Barbería premium — reserva tu cita en segundos.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${nombre} — Barbería premium`,
      template: `%s · ${nombre}`,
    },
    description: descripcion,
    icons: config?.favicon_url ? { icon: config.favicon_url } : undefined,
    openGraph: {
      title: nombre,
      description: descripcion,
      type: "website",
      images: config?.hero_imagen_url ? [config.hero_imagen_url] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
