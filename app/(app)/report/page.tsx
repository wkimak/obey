import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ReportPage() {
    return (
        <div>
            <SidebarTrigger className="-ml-2" />
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Report</h1>
                <p className="text-sm text-muted-foreground">
                    Here you can submit your daily discipline report.
                </p>
            </div>
        </div>
    );
  }