import type { ReactNode } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getSiteContent } from "@/lib/data/site-content";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const content = await getSiteContent();

  return (
    <>
      <Navbar
        siteName={content.siteName}
        siteTagline={content.siteTagline}
        navLinks={content.navLinks}
      />
      <main className="flex-1">{children}</main>
      <Footer
        siteName={content.siteName}
        siteTagline={content.siteTagline}
        tagline={content.footerTagline}
        navLinks={content.navLinks}
        socialLinks={content.socialLinks}
      />
    </>
  );
}
