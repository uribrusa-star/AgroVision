import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { ProductionForm } from "./production-form";
import { CollectorForm } from "./collector-form";
import { HardHat, Weight } from "lucide-react";

export default function DataEntryPage() {
  return (
    <>
      <PageHeader
        title="Data Entry"
        description="Log new production data and register collector work."
      />
      <Tabs defaultValue="production">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="production">
            <Weight className="mr-2" />
            Production Upload
          </TabsTrigger>
          <TabsTrigger value="collector">
            <HardHat className="mr-2" />
            Collector Registration
          </TabsTrigger>
        </TabsList>
        <TabsContent value="production">
          <ProductionForm />
        </TabsContent>
        <TabsContent value="collector">
          <CollectorForm />
        </TabsContent>
      </Tabs>
    </>
  );
}
