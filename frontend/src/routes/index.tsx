import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-community.jpg";
import {
  GraduationCap,
  HeartPulse,
  Sprout,
  Users,
  ArrowRight,
  HandHeart,
  CalendarDays,
  Image as ImageIcon,
  X,
  Pause,
  Play,
} from "lucide-react";
import { useDonations } from "@/hooks/use-donations";
import { useEvents } from "@/hooks/use-events";
import { useBackground } from "@/hooks/use-background";
import { useGallery } from "@/hooks/use-gallery";
import { combineImages } from "@/lib/combined-images";
import { useMembers } from "@/hooks/use-members";
import { EventCard } from "@/components/EventCard";
import { FounderCard } from "@/components/FounderCard";
import { findFounderMember } from "@/lib/member-display";
import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, CSSProperties, ElementType, MouseEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PRG Social Welfare Trust — Together for Change" },
      {
        name: "description",
        content:
          "Empowering underprivileged communities in Anantapur through education, healthcare, women empowerment, and environmental sustainability.",
      },
      { property: "og:title", content: "PRG Social Welfare Trust — Together for Change" },
      {
        property: "og:description",
        content: "Join us in building an inclusive, empowered, and sustainable society.",
      },
    ],
  }),
  component: HomePage,
});

const programs = [
  {
    icon: GraduationCap,
    title: "Education & Child Welfare",
    desc: "Scholarships, school supplies and learning support for underprivileged children.",
    color: "text-brand-blue",
  },
  {
    icon: HeartPulse,
    title: "Health & Medical Relief",
    desc: "Free medical camps, health awareness and access to essential care.",
    color: "text-brand-orange-deep",
  },
  {
    icon: Users,
    title: "Women Empowerment",
    desc: "Skill training, livelihood programs and self-reliance initiatives.",
    color: "text-brand-blue-deep",
  },
  {
    icon: HandHeart,
    title: "Social Welfare & Community Support",
    desc: "Food relief, senior citizen care, disaster response and inclusion.",
    color: "text-brand-orange-deep",
  },
  {
    icon: Sprout,
    title: "Environmental Sustainability",
    desc: "Tree plantation drives and community-led sustainability projects.",
    color: "text-brand-green-deep",
  },
];

/* ---------- Small animation helpers (no extra dependencies) ---------- */

const heroDelay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Cursor-following light for premium cards. Only meaningful on hover-capable devices. */
function spotlight(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  el.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

type RevealProps = ComponentPropsWithoutRef<"div"> & {
  as?: ElementType;
  delay?: number;
};

/**
 * Fade-and-rise on first scroll into view.
 * Content stays visible if JS or IntersectionObserver is unavailable.
 */
function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "visible">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setState("visible");
      return;
    }
    setState("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${state} ${className}`}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function HomePage() {
  const { items: donations } = useDonations();
  const { items: events } = useEvents();
  const { backgroundImage } = useBackground();
  const { items: galleryItems } = useGallery();
  const galleryImages = combineImages(galleryItems, donations);
  const { items: members } = useMembers(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryPaused, setGalleryPaused] = useState(false);

  const heroImage = backgroundImage || hero;
  const chairman = findFounderMember(members);

  const activeEvents = events.filter(
    (event) => event.status === "TODAY" || event.status === "UPCOMING",
  );

  useEffect(() => {
    if (!selectedImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedImage]);

  return (
    <>
      {/* HERO */}
      <section className="hero-premium grain relative">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div
          className="absolute inset-0 -z-10 opacity-25 mix-blend-overlay"
          style={{ background: `url(${heroImage}) center/cover no-repeat` }}
          aria-hidden
        />
        <span className="orb orb-orange" aria-hidden="true" />
        <span className="orb orb-green" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="container-x relative grid gap-12 py-16 md:grid-cols-12 md:items-center md:py-24 lg:py-28">
          <div className="text-white md:col-span-9">
            <span
              className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur"
              style={heroDelay(60)}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" /> Registered Public
              Charitable Trust · Reg 25/2026
            </span>

            <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
              <span className="hero-rise block" style={heroDelay(160)}>
                Together for a kinder,
              </span>
              <span className="hero-rise block text-brand-orange" style={heroDelay(280)}>
                stronger tomorrow.
              </span>
            </h1>

            <p
              className="hero-rise mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
              style={heroDelay(420)}
            >
              PRG Social Welfare Trust serves communities across Anantapur with compassion —
              uplifting children, women, and the environment through sustainable, transparent
              action.
            </p>

            <div className="hero-rise mt-9 flex flex-wrap gap-3" style={heroDelay(540)}>
              <Link
                to="/get-involved"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold btn-primary"
              >
                Get Involved
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/programs"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold btn-outline-light"
              >
                Our Programs
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-edge" aria-hidden="true" />
      </section>

      {/* EVENTS — pinned to the top */}
      {activeEvents.length > 0 && (
        <section className="home-events-section relative isolate overflow-hidden border-b border-brand-orange/20 bg-brand-orange/10">
          <div className="container-x relative z-10 py-12 md:py-16">
            <Reveal>
              <p className="eyebrow">Happening now</p>
              <div className="mt-3 flex items-center gap-3">
                <CalendarDays className="text-brand-orange-deep" size={26} />
                <h2 className="text-2xl text-brand-blue-deep md:text-4xl">
                  Today’s &amp; Upcoming Events
                </h2>
              </div>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {activeEvents.map((e, index) => (
                <Reveal key={e.id} delay={(index % 3) * 80}>
                  <EventCard event={e} onImageClick={setSelectedImage} />
                </Reveal>
              ))}
            </div>
          </div>
          <div className="container-x relative z-10 flex justify-center pb-12">
            <Link
              to="/events"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-orange-deep transition-all hover:gap-2"
            >
              View all events
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      )}

      {/* MISSION STRIP */}
      <section className="section-pad section-ambient">
        <div className="container-x grid items-center gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <div className="accent-bar" />
            <p className="eyebrow mt-5">Our purpose</p>
            <h2 className="mt-3 text-3xl text-brand-blue-deep md:text-5xl">Our Mission</h2>
          </Reveal>
          <Reveal delay={120} className="md:col-span-7">
            <p className="text-lg leading-relaxed text-foreground/80 md:border-l md:border-brand-blue/15 md:pl-10 md:text-xl md:leading-relaxed">
              To promote education, healthcare, women empowerment, environmental sustainability and
              community welfare — supporting underprivileged groups, creating livelihood
              opportunities, and implementing sustainable development through collaboration and
              transparency.
            </p>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="section-pad section-ambient section-grid bg-secondary/60">
        <div className="container-x">
          <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="accent-bar home-programs-accent" />
              <p className="eyebrow mt-5">Focus areas</p>
              <h2 className="mt-3 text-3xl text-brand-blue-deep md:text-5xl">What we do</h2>
              <p className="mt-3 max-w-xl text-foreground/75">
                Five focus areas, one shared goal — dignity and opportunity for all.
              </p>
            </div>
            <Link
              to="/programs"
              className="home-programs-link inline-flex items-center gap-1 text-sm font-semibold text-brand-blue"
            >
              View all programs <ArrowRight size={16} />
            </Link>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {programs.map((p, index) => (
              <Reveal
                as="article"
                key={p.title}
                delay={index * 70}
                onMouseMove={spotlight}
                className="program-card premium-card flex h-full flex-col p-5 sm:p-6"
              >
                <span className="program-card-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className={`program-card-icon inline-flex h-12 w-12 items-center justify-center rounded-xl border border-current/10 ${p.color}`}
                >
                  <p.icon size={24} />
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-snug text-brand-blue-deep">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/75">{p.desc}</p>
                <span className="program-card-line" aria-hidden="true" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      {galleryImages.length > 0 && (
        <section className="section-pad section-ambient">
          <div className="container-x">
            <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="accent-bar" />

                <h2 className="mt-3 flex items-center gap-3 text-3xl text-brand-blue-deep md:text-5xl">
                  <ImageIcon className="text-brand-blue" size={28} />
                  See our works
                </h2>
                <p className="mt-3 max-w-2xl text-foreground/70">
                  Moments captured from our community work and events.
                </p>
              </div>
              <Link
                to="/gallery"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-blue transition-all hover:gap-2"
              >
                View all gallery
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            </Reveal>

            <div
              className="home-gallery-marquee mt-6 md:mt-10"
              data-paused={galleryPaused}
              role="region"
              aria-label="Automatically scrolling gallery images"
              tabIndex={0}
            >
              <div className="home-gallery-track" aria-live="off">
                {[false, true].map((isDuplicate) => (
                  <div
                    className="home-gallery-track-group"
                    key={isDuplicate ? "duplicate" : "original"}
                    aria-hidden={isDuplicate || undefined}
                  >
                    {galleryImages.map((item, index) =>
                      isDuplicate ? (
                        <div className="home-gallery-card" key={`${item.key}-duplicate`}>
                          <img src={item.image} alt="" loading="lazy" decoding="async" />
                          <span className="home-gallery-card-caption" aria-hidden="true">
                            <strong>{item.title}</strong>
                            {item.description && <span>{item.description}</span>}
                          </span>
                        </div>
                      ) : (
                        <button
                          className="home-gallery-card"
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedImage(item.image)}
                          aria-label={`View gallery image: ${item.title}`}
                        >
                          <img
                            src={item.image}
                            alt=""
                            loading={index < 4 ? "eager" : "lazy"}
                            decoding="async"
                          />
                          <span className="home-gallery-card-caption">
                            <strong>{item.title}</strong>
                            {item.description && <span>{item.description}</span>}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                ))}
              </div>
              <button
                className="home-gallery-motion-toggle"
                type="button"
                aria-label={galleryPaused ? "Resume gallery scrolling" : "Pause gallery scrolling"}
                aria-pressed={galleryPaused}
                onClick={() => setGalleryPaused((paused) => !paused)}
              >
                {galleryPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FOUNDER */}
      <section className="section-pad">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto mb-10 max-w-xl text-center">
              <div className="accent-bar mx-auto" />
              <p className="eyebrow mt-5 justify-center">Leadership</p>
              <h2 className="mt-3 text-3xl text-brand-blue-deep md:text-4xl">Our Founder</h2>
            </div>
            <FounderCard member={chairman} />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad pt-0 md:pt-0">
        <div className="container-x">
          <Reveal className="cta-card grain gap-8 p-8 text-center text-white md:flex md:items-center md:justify-between md:p-14 md:text-left">
            <div className="relative">
              <p className="eyebrow eyebrow-light">Join us</p>
              <h2 className="mt-3 text-3xl md:text-4xl">Be part of the change.</h2>
              <p className="mt-3 max-w-xl text-white/75">
                Volunteer your time or partner with us to scale impact in rural Andhra Pradesh.
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3 md:mt-0">
              <Link
                to="/get-involved"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold btn-primary"
              >
                Get Involved
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full px-7 py-3.5 text-sm font-semibold btn-outline-light"
              >
                Contact us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {selectedImage && (
        <div
          className="lightbox-enter fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute right-5 top-5 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
            onClick={() => setSelectedImage(null)}
            aria-label="Close preview"
          >
            <X size={32} />
          </button>

          <img
            src={selectedImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
