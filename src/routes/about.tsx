import { createFileRoute } from "@tanstack/react-router";
import { Eye, Target, ShieldCheck, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PRG Social Welfare Trust" },
      { name: "description", content: "Learn about PRG Social Welfare Trust, Anantapur — our vision, mission, values, and the leadership working for an inclusive society." },
      { property: "og:title", content: "About — PRG Social Welfare Trust" },
      { property: "og:description", content: "Our vision, mission and values." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: ShieldCheck, title: "Integrity", desc: "Every rupee, every act — accountable and transparent." },
  { icon: HeartHandshake, title: "Compassion", desc: "We listen, we serve, we walk alongside communities." },
  { icon: Target, title: "Impact", desc: "Measurable change in education, health and environment." },
  { icon: Eye, title: "Inclusion", desc: "No one is left behind — especially the most vulnerable." },
];

function AboutPage() {
  return (
    <>
      <section className="bg-brand-blue-deep text-white">
        <div className="container-x py-20 md:py-24">
          <div className="accent-bar" />
          <h1 className="mt-4 text-4xl md:text-5xl">About PRG Trust</h1>
          <p className="mt-4 max-w-2xl text-white/85 text-lg">
            A registered public charitable trust based in Anantapur, Andhra Pradesh, working for
            dignity, opportunity and sustainability for all.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x grid gap-10 md:grid-cols-2">
          <div className="card-soft p-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange-deep">Vision</div>
            <h2 className="mt-2 text-2xl">An inclusive, empowered, sustainable society.</h2>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              To build a society where every individual — especially the underprivileged — has access
              to quality education, healthcare, equal opportunities and a healthy environment,
              ensuring dignity, self-reliance and overall social welfare for all.
            </p>
          </div>
          <div className="card-soft p-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Mission</div>
            <h2 className="mt-2 text-2xl">Service through collaboration & transparency.</h2>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              To promote education, healthcare, women empowerment, environmental sustainability and
              community welfare by supporting underprivileged groups, creating livelihood
              opportunities and implementing sustainable development initiatives.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad bg-secondary/60">
        <div className="container-x">
          <div className="accent-bar" />
          <h2 className="mt-4 text-3xl md:text-4xl">Our values</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="card-soft p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange-deep">
                  <v.icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x grid gap-10 md:grid-cols-3 items-start">
          <div className="md:col-span-1">
            <div className="accent-bar" />
            <h2 className="mt-4 text-3xl">Leadership</h2>
            <p className="mt-3 text-foreground/70">Guided by experience, driven by purpose.</p>
          </div>
          <div className="md:col-span-2 card-soft p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white font-display text-3xl font-bold shrink-0">
                YR
              </div>
              <div>
                <h3 className="text-xl font-semibold">Mr. Y. Ramanjaneyulu</h3>
                <div className="text-xs uppercase tracking-widest text-brand-orange-deep mt-1">Founder & Chairman</div>
                <p className="mt-3 text-foreground/75 leading-relaxed">
                  A lifelong advocate for community welfare, Mr. Ramanjaneyulu founded PRG Social
                  Welfare Trust to bring sustainable change to underprivileged families across
                  Anantapur — believing collective effort builds a better society.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
