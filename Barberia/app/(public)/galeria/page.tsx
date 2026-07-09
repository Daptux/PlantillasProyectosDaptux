import { SectionHeading } from "@/components/public/SectionHeading";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { getGaleria } from "@/lib/queries";

export const metadata = { title: "Galería" };

export default async function GaleriaPage() {
  const galeria = await getGaleria();

  return (
    <div className="py-16 sm:py-20">
      <div className="container">
        <SectionHeading eyebrow="Galería" title="Nuestros trabajos"
          subtitle="Explora cortes, barbas y transformaciones reales." />
        <div className="mt-12">
          <GalleryGrid items={galeria} />
        </div>
        {galeria.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">Aún no hay imágenes en la galería.</p>
        )}
      </div>
    </div>
  );
}
