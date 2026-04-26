import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Building2, Mail, Phone, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/get-involved")({
  head: () => ({
    meta: [
      { title: "Get Involved — PRG Social Welfare Trust" },
      { name: "description", content: "Volunteer or partner with PRG Social Welfare Trust to support communities in Anantapur." },
      { property: "og:title", content: "Get Involved — PRG Social Welfare Trust" },
      { property: "og:description", content: "Volunteer or partner with us." },
    ],
  }),
  component: GetInvolvedPage,
});

const ways = [
  { icon: Users, title: "Volunteer", desc: "Lend your time and skills — teach, organise camps, or join plantation drives.", cta: "Join us", to: "/contact" as const },
  { icon: Building2, title: "Partner", desc: "Corporates and NGOs — collaborate on CSR programs with measurable impact.", cta: "Start a partnership", to: "/contact" as const },
  { icon: HeartHandshake, title: "Spread the word", desc: "Share our mission with your network and help us reach more communities.", cta: "Get in touch", to: "/contact" as const },
];

function GetInvolvedPage() {
  return (
    <>
      <section className="relative bg-brand-blue-deep text-white overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" aria-hidden />
        <div className="container-x py-20 md:py-24 relative">
          <div className="accent-bar" />
          <h1 className="mt-4 text-4xl md:text-5xl">Be part of the change</h1>
          <p className="mt-4 max-w-2xl text-white/85 text-lg">
            Every act of kindness creates a ripple. Choose how you'd like to support PRG Trust.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {ways.map((w) => (
            <article key={w.title} className="card-soft p-7 flex flex-col">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange-deep">
                <w.icon size={26} />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{w.title}</h3>
              <p className="mt-2 text-foreground/70 text-sm flex-1">{w.desc}</p>
              <Link to={w.to} className="mt-5 inline-flex items-center text-sm font-semibold text-brand-blue hover:underline">
                {w.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad bg-secondary/60">
        <div className="container-x grid gap-10 md:grid-cols-2 items-start">
          <div>
            <div className="accent-bar" />
            <h2 className="mt-4 text-3xl md:text-4xl">Work with us</h2>
            <p className="mt-3 text-foreground/75">
              Whether you have an hour, a skill, or an idea — there's a place for you in our work.
              Reach out and our team will guide you to the best way to contribute.
            </p>
          </div>

          <div className="card-soft p-8">
            <h3 className="text-xl font-semibold">Reach out to us</h3>
            <p className="mt-2 text-sm text-foreground/70">Speak directly with our team.</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                  <Phone size={18} />
                </span>
                <a href="tel:+919951217286" className="hover:underline">+91 99512 17286</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/15 text-brand-orange-deep">
                  <Mail size={18} />
                </span>
                <a href="mailto:info@prgtrust.org" className="hover:underline">info@prgtrust.org</a>
              </li>
            </ul>
            <Link to="/contact" className="mt-6 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold btn-primary">
              Contact form
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
