import { auth } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ensureClerkUserInDb } from "@/lib/ensure-clerk-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication for everything under the "(app)" route group.
  const { isAuthenticated, redirectToSignIn } = await auth();
  if (!isAuthenticated) {
    // Redirect unauthenticated users to the Clerk sign-in page.
    return redirectToSignIn();
  }
  // Lazy-sync the Clerk user into Prisma.
  await ensureClerkUserInDb();

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="p-4">{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}