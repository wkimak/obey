import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ArchivesPage() {
  return (
    <div>
        <SidebarTrigger className="-ml-2" />
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Archives</h1>
            <p className="text-sm text-muted-foreground">
                Here you can find all your archived reports.
            </p>
        </div>
    </div>
  );
}