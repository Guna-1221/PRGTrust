import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-community.jpg";
import food1 from "@/assets/food-donation-1.jpg";
import food2 from "@/assets/food-donation-2.jpg";
import food3 from "@/assets/food-donation-3.jpg";
import { GraduationCap, HeartPulse, Sprout, Users, ArrowRight, Quote, Utensils, HandHeart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PRG Social Welfare Trust — Together for Change" },
      { name: "description", content: "Empowering underprivileged communities in Anantapur through education, healthcare, women empowerment, and environmental sustainability." },
      { property: "og:title", content: "PRG Social Welfare Trust — Together for Change" },
      { property: "og:description", content: "Join us in building an inclusive, empowered, and sustainable society." },
    ],
  }),
  component: HomePage,
});

const programs = [
  { icon: GraduationCap, title: "Education & Child Welfare", desc: "Scholarships, school supplies and learning support for underprivileged children.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: HeartPulse, title: "Health & Medical Relief", desc: "Free medical camps, health awareness and access to essential care.", color: "text-brand-orange-deep", bg: "bg-brand-orange/15" },
  { icon: Users, title: "Women Empowerment", desc: "Skill training, livelihood programs and self-reliance initiatives.", color: "text-brand-blue-deep", bg: "bg-brand-blue/10" },
  { icon: HandHeart, title: "Social Welfare & Community Support", desc: "Food relief, senior citizen care, disaster response and inclusion.", color: "text-brand-orange-deep", bg: "bg-brand-orange/15" },
  { icon: Sprout, title: "Environmental Sustainability", desc: "Tree plantation drives and community-led sustainability projects.", color: "text-brand-green-deep", bg: "bg-brand-green/15" },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div
          className="absolute inset-0 -z-10 opacity-25 mix-blend-overlay"
          style={{ background: `url(${hero}) center/cover no-repeat` }}
          aria-hidden
        />
        <div className="container-x relative grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-7 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" /> Registered Public Charitable Trust · Reg 25/2026
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
              Together for a kinder,
              <span className="block text-brand-orange">stronger tomorrow.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
              PRG Social Welfare Trust serves communities across Anantapur with compassion —
              uplifting children, women, and the environment through sustainable, transparent action.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/get-involved" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold btn-primary">
                Get Involved <ArrowRight size={16} />
              </Link>
              <Link to="/programs" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold btn-outline-light">
                Our Programs
              </Link>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-4 rounded-3xl bg-brand-orange/30 blur-2xl" aria-hidden />
              <img
                src={hero}
                alt="Women and children from rural Anantapur smiling with saplings"
                width={1600}
                height={1024}
                className="relative w-full rounded-3xl shadow-2xl object-cover aspect-[4/5]"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MISSION STRIP */}
      <section className="section-pad">
        <div className="container-x grid gap-10 md:grid-cols-12 items-center">
          <div className="md:col-span-5">
            <div className="accent-bar" />
            <h2 className="mt-4 text-3xl md:text-4xl">Our Mission</h2>
          </div>
          <p className="md:col-span-7 text-lg leading-relaxed text-foreground/80">
            To promote education, healthcare, women empowerment, environmental sustainability and
            community welfare — supporting underprivileged groups, creating livelihood opportunities,
            and implementing sustainable development through collaboration and transparency.
          </p>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="section-pad bg-secondary/60">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="accent-bar" />
              <h2 className="mt-4 text-3xl md:text-4xl">What we do</h2>
              <p className="mt-2 text-foreground/70 max-w-xl">Five focus areas, one shared goal — dignity and opportunity for all.</p>
            </div>
            <Link to="/programs" className="text-sm font-semibold text-brand-blue inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all programs <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p) => (
              <article key={p.title} className="card-soft p-6">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${p.bg} ${p.color}`}>
                  <p.icon size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT FOOD DONATION */}
      <section className="section-pad">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="accent-bar" />
              <h2 className="mt-4 text-3xl md:text-4xl flex items-center gap-3">
                <Utensils className="text-brand-orange-deep" size={28} />
                Our Recent Food Donation
              </h2>
              <p className="mt-2 text-foreground/70 max-w-2xl">
                Volunteers from PRG Trust distributing food packets to elderly and homeless
                individuals on the streets of Anantapur — small acts, big dignity.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: food1, alt: "PRG volunteer handing food packet to an elderly man on the street" },
              { src: food2, alt: "PRG volunteer offering food to an elderly visually impaired man" },
              { src: food3, alt: "PRG volunteer handing food packet to an elderly woman in a red saree" },
            ].map((img) => (
              <figure key={img.src} className="card-soft overflow-hidden group">
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CHAIRMAN'S MESSAGE */}
      <section className="section-pad">

        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl bg-brand-blue-deep text-white p-8 md:p-14">
            <Quote className="absolute -top-4 -right-4 text-white/5" size={220} />
            <div className="relative max-w-3xl">
              <div className="accent-bar" />
              <h2 className="mt-4 text-3xl md:text-4xl">A message from our Chairman</h2>
              <p className="mt-6 text-white/85 leading-relaxed">
                “We believe true development is achieved when every individual is given equal
                opportunity to grow and live with dignity. Through education, healthcare, women
                empowerment, environment and community welfare, we strive to create meaningful and
                lasting impact. I invite individuals, donors and organisations to join hands with
                us in this journey of service.”
              </p>
              <div className="mt-6">
                <div className="font-display text-lg font-semibold text-brand-orange">Mr. Y. Ramanjaneyulu</div>
                <div className="text-xs uppercase tracking-widest text-white/70">Founder & Chairman</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad">
        <div className="container-x">
          <div className="rounded-3xl border border-border bg-card p-8 md:p-12 text-center md:text-left md:flex md:items-center md:justify-between gap-8 shadow-soft">
            <div>
              <h2 className="text-2xl md:text-3xl">Be part of the change.</h2>
              <p className="mt-2 text-foreground/70 max-w-xl">Volunteer your time or partner with us to scale impact in rural Andhra Pradesh.</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap justify-center gap-3">
              <Link to="/get-involved" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold btn-primary">Get Involved</Link>
              <Link to="/contact" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-colors">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
