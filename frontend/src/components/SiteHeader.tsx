import { useState } from "react";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/prg-logo.jpg";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/programs", label: "Programs" },
  { to: "/get-involved", label: "Get Involved" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header
      className={`site-header sticky top-0 z-50 bg-background/95 backdrop-blur-md ${
        isScrolled ? "site-header-scrolled" : ""
      }`}
    >
      <div className="container-x flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="PRG Social Welfare Trust logo"
            width={56}
            height={56}
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-brand-orange/40 sm:h-14 sm:w-14"
          />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold text-brand-blue-deep sm:text-xl">
              PRG Social Welfare Trust
            </div>
            <div className="text-xs uppercase tracking-widest text-brand-orange-deep">
              Together for Change
            </div>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="site-nav-link px-3 py-2 rounded-md text-sm font-medium text-foreground/75"
              activeProps={{
                className:
                  "site-nav-link site-nav-link-active px-3 py-2 rounded-md text-sm font-semibold",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="md:hidden p-2 rounded-md hover:bg-secondary"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="site-mobile-nav md:hidden border-t border-border bg-background"
        >
          <div className="container-x py-3 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="site-mobile-nav-link px-3 py-2 rounded-md text-sm font-medium"
                activeProps={{
                  className:
                    "site-mobile-nav-link site-mobile-nav-link-active px-3 py-2 rounded-md text-sm font-semibold",
                }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
