import { createFileRoute, Link } from "@tanstack/react-router";
import { useEvents, type TrustEvent } from "@/hooks/use-events";
import { EventCard } from "@/components/EventCard";

export const Route = createFileRoute("/events")({
  component: EventsPage,
});

const groups: Array<{ title: string; status: TrustEvent["status"] }> = [
  { title: "Upcoming Events", status: "UPCOMING" },
  { title: "Today's Events", status: "TODAY" },
  { title: "Past Events", status: "COMPLETED" },
];

function EventsPage() {
  const { items, isLoading, error } = useEvents();

  return (
    <div className="container-x section-pad">
      <header className="mx-auto mb-12 max-w-3xl text-center">
        <div className="accent-bar mx-auto" />
        <h1 className="mt-4 text-4xl font-display font-bold text-brand-blue-deep md:text-5xl">
          Events
        </h1>
        <p className="mt-4 text-foreground/70">
          Follow the latest activities and community events from PRG Trust.
        </p>
      </header>

      {isLoading && <p className="text-center text-foreground/60">Loading events…</p>}
      {error && (
        <p className="text-center text-destructive" role="alert">
          {error}
        </p>
      )}

      {!isLoading &&
        !error &&
        groups.map((group) => {
          const events = items.filter((event) => event.status === group.status);
          if (!events.length) return null;

          return (
            <section key={group.status} className="mb-12">
              <h2 className="mb-5 text-2xl font-semibold">{group.title}</h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          );
        })}

      {!isLoading && !error && items.length === 0 && (
        <div className="card-soft mx-auto max-w-xl p-8 text-center">
          <p className="text-foreground/70">There are no events to show right now.</p>
          <Link to="/" className="btn-primary mt-5 inline-flex rounded-full px-5 py-2.5 text-sm">
            Return home
          </Link>
        </div>
      )}
    </div>
  );
}
