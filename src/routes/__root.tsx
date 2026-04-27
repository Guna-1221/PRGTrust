import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-brand-blue-deep">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold btn-primary"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "samplw" },
      { name: "description", content: "sample" },
      { name: "author", content: "PRG Social Welfare Trust" },
      { name: "theme-color", content: "#1f3b8a" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PRG Social Welfare Trust" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "samplw" },
      { name: "twitter:title", content: "samplw" },
      { property: "og:description", content: "sample" },
      { name: "twitter:description", content: "sample" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/73631dee-207f-4860-b415-6bc6fff70b88/id-preview-663a7553--cd9b59e1-f2ac-4bab-8aa4-d81d13e07b4d.lovable.app-1777200269224.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/73631dee-207f-4860-b415-6bc6fff70b88/id-preview-663a7553--cd9b59e1-f2ac-4bab-8aa4-d81d13e07b4d.lovable.app-1777200269224.png" },
    ],
    links: [
  { rel: "stylesheet", href: appCss },
  { rel: "icon", href: "/favicon.png", type: "image/png" },
],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
