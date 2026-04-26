import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, HeartPulse, Users, Sprout, HandHeart } from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — PRG Social Welfare Trust" },
      { name: "description", content: "Our programs: education, healthcare, women empowerment, environmental sustainability and community welfare in Anantapur." },
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
    points: ["School supplies & uniforms", "Scholarships for bright students", "After-school learning support", "Digital literacy"],
    color: "from-brand-blue to-brand-blue-deep",
  },
  {
    icon: HeartPulse,
    title: "Healthcare Access",
    summary: "Care that reaches the last village.",
    points: ["Free medical camps", "Health awareness drives", "Maternal & child health", "Eye-care & screenings"],
    color: "from-brand-orange to-brand-orange-deep",
  },
  {
    icon: Users,
    title: "Women Empowerment",
    summary: "Skills, confidence and livelihoods.",
    points: ["Tailoring & craft training", "Self-help group support", "Financial literacy", "Entrepreneurship mentoring"],
    color: "from-brand-blue-deep to-brand-green-deep",
  },
  {
    icon: Sprout,
    title: "Environmental Sustainability",
    summary: "A greener, healthier future.",
    points: ["Tree plantation drives", "Awareness in schools", "Clean water initiatives", "Waste reduction"],
    color: "from-brand-green to-brand-green-deep",
  },
  {
    icon: HandHeart,
    title: "Community Welfare",
    summary: "Standing with the most vulnerable.",
    points: ["Food & relief distribution", "Senior citizen support", "Disaster response", "Disability inclusion"],
    color: "from-brand-orange-deep to-brand-blue",
  },
];

function ProgramsPage() {
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
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-md`}>
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
    </>
  );
}
