import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  GraduationCap,
  HeartPulse,
  MapPin,
  Users,
  Sprout,
  HandHeart,
} from "lucide-react";
import { useEvents } from "@/hooks/use-events";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — PRG Social Welfare Trust" },
      {
        name: "description",
        content:
          "Our programs: education, healthcare, women empowerment, environmental sustainability and community welfare in Anantapur.",
      },
      { property: "og:title", content: "Programs — PRG Social Welfare Trust" },
      { property: "og:description", content: "Five focus areas creating lasting impact." },
    ],
  }),
  component: ProgramsPage,
});

const programs = [
  {
    icon: GraduationCap,
    title: "Children Education",
    summary: "Equipping children with the tools to dream further.",
    points: [
      "School supplies & uniforms",
      "Scholarships for bright students",
      "After-school learning support",
      "Digital literacy",
    ],
    color: "from-brand-blue to-brand-blue-deep",
  },
  {
    icon: HeartPulse,
    title: "Healthcare Access",
    summary: "Care that reaches the last village.",
    points: [
      "Free medical camps",
      "Health awareness drives",
      "Maternal & child health",
      "Eye-care & screenings",
    ],
    color: "from-brand-orange to-brand-orange-deep",
  },
  {
    icon: Users,
    title: "Women Empowerment",
    summary: "Skills, confidence and livelihoods.",
    points: [
      "Tailoring & craft training",
      "Self-help group support",
      "Financial literacy",
      "Entrepreneurship mentoring",
    ],
    color: "from-brand-blue-deep to-brand-green-deep",
  },
  {
    icon: Sprout,
    title: "Environmental Sustainability",
    summary: "A greener, healthier future.",
    points: [
      "Tree plantation drives",
      "Awareness in schools",
      "Clean water initiatives",
      "Waste reduction",
    ],
    color: "from-brand-green to-brand-green-deep",
  },
  {
    icon: HandHeart,
    title: "Community Welfare",
    summary: "Standing with the most vulnerable.",
    points: [
      "Food & relief distribution",
      "Senior citizen support",
      "Disaster response",
      "Disability inclusion",
    ],
    color: "from-brand-orange-deep to-brand-blue",
  },
];

function ProgramsPage() {
  const { items: events, isLoading, error } = useEvents();
  const completedEvents = events.filter((event) => event.status === "COMPLETED");

  return (
    <>
      <section className="bg-brand-blue-deep text-white">
        <div className="container-x py-20 md:py-24">
          <div className="accent-bar" />
          <h1 className="mt-4 text-4xl md:text-5xl">Our Programs</h1>
          <p className="mt-4 max-w-2xl text-white/85 text-lg">
            Sustainable, community-led initiatives across five focus areas — designed to create
            dignity, opportunity and resilience.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {programs.map((p) => (
            <article key={p.title} className="card-soft overflow-hidden">
              <div className={`h-2 w-full bg-gradient-to-r ${p.color}`} />
              <div className="p-7">
                <div className="flex items-center gap-4">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-md`}
                  >
                    <p.icon size={26} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{p.title}</h2>
                    <p className="text-sm text-foreground/65">{p.summary}</p>
                  </div>
                </div>
                <ul className="mt-5 grid sm:grid-cols-2 gap-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-orange shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad bg-secondary/60">
        <div className="container-x">
          <div className="accent-bar" />
          <h2 className="mt-4 text-3xl md:text-4xl">Completed Events</h2>
          <p className="mt-2 max-w-2xl text-foreground/70">
            A look back at our recent community activities and the work we have completed together.
          </p>

          {isLoading && (
            <p className="mt-8 text-foreground/60" role="status">
              Loading completed events…
            </p>
          )}
          {error && (
            <p className="mt-8 text-destructive" role="alert">
              Could not load completed events: {error}
            </p>
          )}
          {!isLoading && !error && completedEvents.length === 0 && (
            <p className="mt-8 text-foreground/60">There are no completed events to show yet.</p>
          )}

          {!isLoading && !error && completedEvents.length > 0 && (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {completedEvents.map((event) => (
                <article key={event.id} className="card-soft flex flex-col overflow-hidden bg-card">
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="aspect-[16/9] w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 p-5">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {event.eventDate}
                        {event.endDate && event.endDate !== event.eventDate
                          ? ` – ${event.endDate}`
                          : ""}
                      </span>
                      {event.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} />
                          {event.location}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/75">
                      {event.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
