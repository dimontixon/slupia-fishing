import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
