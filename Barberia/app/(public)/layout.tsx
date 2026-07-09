import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { WhatsappFab } from "@/components/public/WhatsappFab";
import { BrandStyle } from "@/components/common/BrandStyle";
import { getConfiguracion } from "@/lib/queries";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfiguracion().catch(() => null);
  const nombre = config?.nombre_comercial ?? "BarberPro Studio";

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <BrandStyle config={config} />
      <PublicNavbar nombre={nombre} logoUrl={config?.logo_url} />
      <main>{children}</main>
      <PublicFooter config={config} />
      {config?.whatsapp && (
        <WhatsappFab phone={config.whatsapp} message={config.mensaje_whatsapp} />
      )}
    </div>
  );
}
