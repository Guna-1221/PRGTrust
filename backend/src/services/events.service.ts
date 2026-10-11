import { getAllEvents, getEventById } from "../models/db";
import { createEvent, updateEvent } from "../models/db";
import type { TrustEvent } from "../models/db/types";

export type EventStatus = "UPCOMING" | "TODAY" | "COMPLETED";

function assertEventSchedule(
  event: Pick<TrustEvent, "eventDate" | "endDate" | "startTime" | "endTime">,
): void {
  const isDate = (value?: string) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    );
  };
  const isTime = (value?: string) =>
    !value || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

  if (!isDate(event.eventDate) || (event.endDate && !isDate(event.endDate))) {
    throw Object.assign(
      new Error("Event dates must use the YYYY-MM-DD format."),
      {
        statusCode: 400,
      },
    );
  }
  if (!isTime(event.startTime) || !isTime(event.endTime)) {
    throw Object.assign(new Error("Event times must use the HH:mm format."), {
      statusCode: 400,
    });
  }
  if (event.endDate && event.endDate < event.eventDate) {
    throw Object.assign(
      new Error("The event end date cannot be before its start date."),
      {
        statusCode: 400,
      },
    );
  }
  if (
    event.endDate === event.eventDate &&
    event.startTime &&
    event.endTime &&
    event.endTime < event.startTime
  ) {
    throw Object.assign(
      new Error("The event end time cannot be before its start time."),
      {
        statusCode: 400,
      },
    );
  }
}

export async function createManagedEvent(
  event: Parameters<typeof createEvent>[0],
): Promise<TrustEvent> {
  assertEventSchedule(event);
  return createEvent(event);
}

export async function updateManagedEvent(
  id: string,
  patch: Partial<Omit<TrustEvent, "id" | "createdAt">>,
): Promise<TrustEvent | null> {
  const current = await getEventById(id);
  if (!current) return null;
  assertEventSchedule({ ...current, ...patch });
  return updateEvent(id, patch);
}

function eventEnd(event: {
  eventDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}): Date {
  const date = event.endDate || event.eventDate;
  const time = event.endTime || event.startTime || "23:59:59";
  return new Date(`${date}T${time}`);
}

export function getEventStatus(
  event: {
    eventDate: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
  },
  now = new Date(),
): EventStatus {
  const start = new Date(`${event.eventDate}T${event.startTime || "00:00:00"}`);
  const end = eventEnd(event);
  if (end < now) return "COMPLETED";
  if (
    start.toDateString() === now.toDateString() ||
    eventEnd(event).toDateString() === now.toDateString()
  ) {
    return "TODAY";
  }
  return "UPCOMING";
}

export async function listEventsWithStatus(): Promise<
  Array<TrustEvent & { status: EventStatus }>
> {
  const events = await getAllEvents();
  return events.map((event) => ({ ...event, status: getEventStatus(event) }));
}

export async function getEventWithStatus(
  id: string,
): Promise<(TrustEvent & { status: EventStatus }) | null> {
  const event = await getEventById(id);
  return event ? { ...event, status: getEventStatus(event) } : null;
}
