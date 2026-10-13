import { apiFetch } from "@/api/client";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/prg-logo.jpg";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const DEFAULT_SETTINGS = {
  orgName: "PRG Social Welfare Trust",
  footerDescription:
    "A registered public charitable trust working for education, healthcare, women empowerment, environment, and community welfare across Andhra Pradesh.",
  address: "3-14, Madigubba, Athmakur Mandal, Anantapur District, Andhra Pradesh",
  phone: "+91 99512 17286",
  email: "info@prgtrust.org",
  copyrightText: `© ${new Date().getFullYear()} PRG Social Welfare Trust. All rights reserved.`,
  socialFacebook: "",
  socialInstagram: "",
  socialTwitter: "",
  socialYoutube: "",
};

export function SiteFooter() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    apiFetch("/api/settings/")
      .then((res) => (res.ok ? (res.json() as Promise<Record<string, string>>) : null))
      .then((data) => {
        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)),
          }));
        }
      })
      .catch(() => {});

    const handler = () => {
      apiFetch("/api/settings/")
        .then((res) => (res.ok ? (res.json() as Promise<Record<string, string>>) : null))
        .then((data) => {
          if (data) {
            setSettings((prev) => ({
              ...prev,
              ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)),
            }));
          }
        })
        .catch(() => {});
    };
    window.addEventListener("prg-settings-updated", handler);
    return () => window.removeEventListener("prg-settings-updated", handler);
  }, []);

  const hasSocials =
    settings.socialFacebook ||
    settings.socialInstagram ||
    settings.socialTwitter ||
    settings.socialYoutube;

  return (
    <footer className="mt-20 bg-brand-blue-deep text-white">
      <div className="h-1 w-full" style={{ background: "var(--gradient-trust)" }} />
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              width={64}
              height={64}
              alt="PRG Social Welfare Trust logo"
              className="h-14 w-14 rounded-full bg-white object-cover ring-2 ring-white/80 shadow-md"
            />
            <div>
              <div className="font-display text-lg font-semibold">{settings.orgName}</div>
              <div className="text-xs uppercase tracking-widest text-white/70">
                Anantapur · Reg. No. 25/2026
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-white/80">{settings.footerDescription}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <Link to="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-white">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/programs" className="hover:text-white">
                Our Programs
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-white">
                Events
              </Link>
            </li>
            <li>
              <Link to="/get-involved" className="hover:text-white">
                Get Involved
              </Link>
            </li>
            <li>
              <Link to="/donate" className="hover:text-white">
                Donate
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="flex gap-2">
              <MapPin size={16} className="mt-0.5 text-brand-orange shrink-0" />
              {settings.address}
            </li>
            <li className="flex gap-2">
              <Phone size={16} className="text-brand-orange" />
              <a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
                className="hover:text-white"
              >
                {settings.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail size={16} className="text-brand-orange" />
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </li>
          </ul>
          {hasSocials ? (
            <div className="flex gap-3 mt-4">
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-white/70"
                >
                  <Facebook size={18} />
                </a>
              )}
              {settings.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-white/70"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.socialTwitter && (
                <a
                  href={settings.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-white/70"
                >
                  <Twitter size={18} />
                </a>
              )}
              {settings.socialYoutube && (
                <a
                  href={settings.socialYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-white/70"
                >
                  <Youtube size={18} />
                </a>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-4 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-2">
          <span>{settings.copyrightText}</span>
          <span>Made with care for a better tomorrow.</span>
        </div>
      </div>
    </footer>
  );
}
