import { createFileRoute } from "@tanstack/react-router";
import { Eye, Target, ShieldCheck, HeartHandshake, Loader2 } from "lucide-react";
import { useMembers } from "@/hooks/use-members";
import { FounderCard } from "@/components/FounderCard";
import { findFounderMember } from "@/lib/member-display";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PRG Social Welfare Trust" },
      {
        name: "description",
        content:
          "Learn about PRG Social Welfare Trust, Anantapur — our vision, mission, values, and the leadership working for an inclusive society.",
      },
      { property: "og:title", content: "About — PRG Social Welfare Trust" },
      { property: "og:description", content: "Our vision, mission and values." },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: ShieldCheck,
    title: "Integrity",
    desc: "Every rupee, every act — accountable and transparent.",
  },
  {
    icon: HeartHandshake,
    title: "Compassion",
    desc: "We listen, we serve, we walk alongside communities.",
  },
  {
    icon: Target,
    title: "Impact",
    desc: "Measurable change in education, health and environment.",
  },
  {
    icon: Eye,
    title: "Inclusion",
    desc: "No one is left behind — especially the most vulnerable.",
  },
];

function AboutPage() {
  const { items: members, isLoading: membersLoading } = useMembers(true);
  const founder = findFounderMember(members);
  const otherMembers = members.filter((member) => member.id !== founder?.id);

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

      {/* VISION DOCUMENT */}
      <section className="section-pad">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card-soft p-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange-deep">
                Vision
              </div>
              <h2 className="mt-2 text-2xl">An inclusive, empowered, sustainable society.</h2>
              <p className="mt-4 text-foreground/75 leading-relaxed">
                To build an inclusive, empowered, and sustainable society where every individual —
                especially the underprivileged — has access to quality education, healthcare, equal
                opportunities, and a healthy environment, ensuring dignity, self-reliance, and
                overall social welfare for all sections of the community.
              </p>
            </div>
            <div className="card-soft p-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
                Mission
              </div>
              <h2 className="mt-2 text-2xl">Service through collaboration & transparency.</h2>
              <p className="mt-4 text-foreground/75 leading-relaxed">
                The mission of PRG Social Welfare Trust is to promote education, healthcare, women
                empowerment, environmental sustainability, and overall community welfare by
                supporting underprivileged groups, creating livelihood opportunities, and
                implementing sustainable development initiatives through collaboration and
                transparency.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-card p-8 md:p-10 shadow-soft">
            <div className="accent-bar" />
            <h2 className="mt-4 text-2xl md:text-3xl">Our Vision Document</h2>
            <p className="mt-3 text-foreground/70 max-w-3xl">
              The complete vision, mission and chairman's message that guides every initiative at
              PRG Social Welfare Trust.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-3 text-sm">
              <div>
                <h3 className="font-display text-lg font-semibold text-brand-blue-deep">
                  Why we exist
                </h3>
                <p className="mt-2 text-foreground/75 leading-relaxed">
                  To serve society with integrity, compassion and responsibility — ensuring no one
                  is left behind.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-brand-blue-deep">
                  What we believe
                </h3>
                <p className="mt-2 text-foreground/75 leading-relaxed">
                  True development happens when every individual gets equal opportunity to grow and
                  live with dignity.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-brand-blue-deep">
                  How we work
                </h3>
                <p className="mt-2 text-foreground/75 leading-relaxed">
                  Through collaboration with donors, volunteers and partner organisations — focused
                  on sustainable, transparent action.
                </p>
              </div>
            </div>
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

      {membersLoading ? (
        <div className="flex justify-center items-center gap-2 py-12">
          <Loader2 className="animate-spin text-brand-blue" size={24} />
          <p className="text-sm text-foreground/60">Loading team...</p>
        </div>
      ) : (
        <>
          <section className="section-pad">
            <div className="container-x">
              <div className="mx-auto mb-10 max-w-xl text-center">
                <div className="accent-bar mx-auto" />
                <h2 className="mt-4 text-3xl md:text-4xl">Our Founder</h2>
                <p className="mt-3 text-foreground/70">Guided by experience, driven by purpose.</p>
              </div>
              <FounderCard member={founder} />
            </div>
          </section>

          {otherMembers.length > 0 && (
            <section className="section-pad bg-secondary/60">
              <div className="container-x">
                <div className="accent-bar" />
                <h2 className="mt-4 text-3xl md:text-4xl">Our Team</h2>
                <div className="mt-10 grid gap-5 lg:grid-cols-2">
                  {otherMembers.map((member, index) => (
                    <article
                      key={member.id}
                      className={`about-member-card about-member-card-${index % 4}`}
                    >
                      <div className="about-member-avatar">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span aria-hidden="true">
                            {member.name
                              .split(/\s+/)
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3>{member.name}</h3>
                        <p className="about-member-role">{member.position}</p>
                        {member.qualification && (
                          <p className="about-member-qualification">{member.qualification}</p>
                        )}
                        {member.biography && (
                          <p className="about-member-biography">{member.biography}</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
