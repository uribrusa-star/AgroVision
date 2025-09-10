import { PageHeader } from "@/components/page-header";
import { ProductionForm } from "./production-form";

export default function DataEntryPage() {
  return (
    <>
      <PageHeader
        title="Entrada de Datos de Producción"
        description="Registre nuevos datos de producción y el pago asociado al recolector en un solo lugar."
      />
      <ProductionForm />
    </>
  );
}
