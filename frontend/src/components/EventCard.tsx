import { useState } from "react";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TrustEvent } from "@/hooks/use-events";

type EventCardProps = {
  event: TrustEvent;
  onImageClick?: (image: string) => void;
};

function formatEventDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(parsed);
}

function eventDateRange(event: TrustEvent) {
  const start = formatEventDate(event.eventDate);
  return event.endDate && event.endDate !== event.eventDate
    ? `${start} – ${formatEventDate(event.endDate)}`
    : start;
}

export function EventCard({ event, onImageClick }: EventCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const statusLabel =
    event.status === "TODAY"
      ? "Today's event"
      : event.status === "COMPLETED"
        ? "Past event"
        : "Upcoming event";
  const statusTag =
    event.status === "TODAY" ? "Today" : event.status === "COMPLETED" ? "Completed" : "Upcoming";

  return (
    <>
      <article className="event-card-8">
        <div className="event-card-8-image-panel">
          {event.image ? (
            onImageClick ? (
              <button
                type="button"
                className="event-card-8-image-button"
                onClick={() => onImageClick(event.image!)}
                aria-label={`View image for ${event.title}`}
              >
                <img src={event.image} alt="" loading="lazy" decoding="async" />
              </button>
            ) : (
              <img src={event.image} alt="" loading="lazy" decoding="async" />
            )
          ) : (
            <div className="event-card-8-image-placeholder" aria-hidden="true">
              <CalendarDays size={48} />
            </div>
          )}
          <span className="event-card-8-image-shade" aria-hidden="true" />
          <span
            className={`event-card-8-status event-card-8-status-${event.status?.toLowerCase() ?? "upcoming"}`}
          >
            {statusTag}
          </span>
        </div>

        <div className="event-card-8-content">
          <p className="event-card-8-category">{statusLabel}</p>
          <h3>{event.title}</h3>
          <p className="event-card-8-description">{event.description}</p>
          <div className="event-card-8-meta">
            <span className="event-card-8-chip">
              <CalendarDays size={14} />
              {eventDateRange(event)}
            </span>
            {event.location && (
              <span className="event-card-8-chip">
                <MapPin size={14} />
                <span>{event.location}</span>
              </span>
            )}
          </div>
          <div className="event-card-8-actions">
            <button
              type="button"
              className="event-card-8-details-button"
              onClick={() => setDetailsOpen(true)}
            >
              View details
            </button>
          </div>
        </div>
      </article>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="event-details-dialog w-[calc(100vw-1.25rem)] max-w-3xl">
          {event.image && (
            <div className="event-details-image">
              <img src={event.image} alt="" />
              <span className="event-details-image-shade" aria-hidden="true" />
              <span
                className={`event-card-8-status event-card-8-status-${event.status?.toLowerCase() ?? "upcoming"}`}
              >
                {statusTag}
              </span>
            </div>
          )}
          <div className="event-details-body">
            <DialogHeader className="event-details-header">
              <p className="event-card-8-category">{statusLabel}</p>
              <DialogTitle>{event.title}</DialogTitle>
              <DialogDescription>{event.description}</DialogDescription>
            </DialogHeader>

            <dl className="event-details-meta">
              <div>
                <dt>
                  <CalendarDays size={17} /> Date
                </dt>
                <dd>{eventDateRange(event)}</dd>
              </div>
              {event.location && (
                <div>
                  <dt>
                    <MapPin size={17} /> Venue
                  </dt>
                  <dd>{event.location}</dd>
                </div>
              )}
              {(event.startTime || event.endTime) && (
                <div>
                  <dt>
                    <Clock3 size={17} /> Time
                  </dt>
                  <dd>
                    {event.startTime || ""}
                    {event.startTime && event.endTime ? " – " : ""}
                    {event.endTime || ""}
                  </dd>
                </div>
              )}
              {event.contactInfo && (
                <div>
                  <dt>
                    <Phone size={17} /> Contact
                  </dt>
                  <dd>{event.contactInfo}</dd>
                </div>
              )}
            </dl>

            {event.registrationLink && (
              <a
                className="event-details-register"
                href={event.registrationLink}
                target="_blank"
                rel="noreferrer"
              >
                Register for this event <ArrowUpRight size={17} />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
