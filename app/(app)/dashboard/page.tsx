import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
    return (
        <div>
            <SidebarTrigger className="-ml-2" />
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <p className="text-sm text-muted-foreground">
                Here you can find all your dashboard data.
            </p>
        </div>
    );
}