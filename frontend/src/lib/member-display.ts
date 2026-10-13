import type { Member } from "@/hooks/use-members";

export const DEFAULT_FOUNDER_PROFILE = {
  name: "Mr. Y. Ramanjaneyulu",
  position: "Founder & Chairman",
  biography:
    "A lifelong advocate for community welfare, Mr. Ramanjaneyulu founded PRG Social Welfare Trust to bring sustainable change to underprivileged families across Anantapur — believing collective effort builds a better society.",
};

const founderName = DEFAULT_FOUNDER_PROFILE.name.toLocaleLowerCase();

export function findFounderMember(members: Member[]) {
  return (
    members.find((member) => member.name.trim().toLocaleLowerCase() === founderName) ??
    members.find((member) => member.isLeadership)
  );
}
