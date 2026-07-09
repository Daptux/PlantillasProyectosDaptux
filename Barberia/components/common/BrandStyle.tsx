import { hexToHsl } from "@/lib/utils";
import type { ConfiguracionBarberia } from "@/types/database";

/**
 * Inyecta los colores de marca de la barberia como variables CSS,
 * sobreescribiendo los defaults del design system. Server Component:
 * se renderiza una etiqueta <style> con las variables calculadas.
 */
export function BrandStyle({ config }: { config: ConfiguracionBarberia | null }) {
  if (!config) return null;

  const brand = config.color_primario ? hexToHsl(config.color_primario) : null;
  const accent = config.color_acento ? hexToHsl(config.color_acento) : null;

  if (!brand && !accent) return null;

  const rules = [
    brand && `--brand: ${brand};`,
    brand && `--ring: ${brand};`,
    brand && `--primary: ${brand};`,
    accent && `--brand-muted: ${accent};`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root, .dark { ${rules} }`,
      }}
    />
  );
}
