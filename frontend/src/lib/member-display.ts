import type { Member } from "@/hooks/use-members";

const founderName = "mr. y. ramanjaneyulu";

export function findFounderMember(members: Member[]) {
  return (
    members.find((member) => member.name.trim().toLocaleLowerCase() === founderName) ??
    members.find((member) => member.isLeadership)
  );
}
