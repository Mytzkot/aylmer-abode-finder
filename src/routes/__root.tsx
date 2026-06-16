import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FaqChatbot } from "@/components/FaqChatbot";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Link to="/" className="mt-6 inline-flex rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  // Log full error to console for debugging; do not expose details to users.
  if (typeof window !== "undefined") console.error("Route error:", error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b2545" },
      { title: "Zorba Rentals — Furnished Guest Houses in Aylmer-Gatineau" },
      { name: "description", content: "Zorba Rentals — monthly furnished room rentals in Aylmer-Gatineau, QC. No credit check, only first month to move in. 15 min direct bus to downtown Ottawa." },
      { property: "og:site_name", content: "Zorba Rentals" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_CA" },
      { property: "og:locale:alternate", content: "fr_CA" },
      { property: "og:locale:alternate", content: "ar" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Zorba Rentals — Furnished Guest Houses in Aylmer-Gatineau" },
      { name: "twitter:title", content: "Zorba Rentals — Furnished Guest Houses in Aylmer-Gatineau" },
      { property: "og:description", content: "Zorba Rentals — monthly furnished room rentals in Aylmer-Gatineau, QC. No credit check, only first month to move in. 15 min direct bus to downtown Ottawa." },
      { name: "twitter:description", content: "Zorba Rentals — monthly furnished room rentals in Aylmer-Gatineau, QC. No credit check, only first month to move in. 15 min direct bus to downtown Ottawa." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d0f92496-3d8a-4ecd-836d-02560b87495d/id-preview-124b264d--95b9ca3c-81e7-444d-9ec3-c033ecb84878.lovable.app-1778975429916.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d0f92496-3d8a-4ecd-836d-02560b87495d/id-preview-124b264d--95b9ca3c-81e7-444d-9ec3-c033ecb84878.lovable.app-1778975429916.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght,SOFT@9..144,400..900,0..100&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: "Zorba Rentals",
          description: "Furnished monthly room rentals in Aylmer-Gatineau, Quebec.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Aylmer-Gatineau",
            addressRegion: "QC",
            addressCountry: "CA",
          },
          telephone: "+1-343-202-5460",
          areaServed: ["Gatineau", "Ottawa", "Aylmer", "Hull"],
          priceRange: "$$",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-cream">
          <Header />
          <div className="flex-1 flex flex-col"><Outlet /></div>
          <Footer />
          <FaqChatbot />
        </div>
        <Toaster position="top-center" richColors />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
