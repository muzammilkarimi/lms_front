"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type AppShellProps = {
  children: React.ReactNode;
};

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/student-login") || pathname.startsWith("/student-register");
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const authRoute = isAuthRoute(pathname);
  const adminRoute = isAdminRoute(pathname);
  const hideChrome = authRoute || adminRoute;

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
