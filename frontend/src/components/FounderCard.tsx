import { Mail, Quote } from "lucide-react";
import type { Member } from "@/hooks/use-members";
import { DEFAULT_FOUNDER_PROFILE } from "@/lib/member-display";

type FounderCardProps = {
  member?: Member;
};

export function FounderCard({ member }: FounderCardProps) {
  const name = member ? member.name : DEFAULT_FOUNDER_PROFILE.name;
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="founder-profile-card">
      <span className="founder-profile-badge">Founder</span>
      <div className="founder-profile-avatar">
        {member?.image ? (
          <img src={member.image} alt={name} loading="lazy" decoding="async" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      {name && <h2>{name}</h2>}
      {(member ? member.position : DEFAULT_FOUNDER_PROFILE.position) && (
        <p className="founder-profile-role">
          {member ? member.position : DEFAULT_FOUNDER_PROFILE.position}
        </p>
      )}
      {member?.qualification && (
        <p className="founder-profile-qualification">{member.qualification}</p>
      )}
      {(member ? member.biography : DEFAULT_FOUNDER_PROFILE.biography) && (
        <div className="founder-profile-biography">
          <Quote size={18} aria-hidden="true" />
          <p>{member ? member.biography : DEFAULT_FOUNDER_PROFILE.biography}</p>
          <Quote size={18} aria-hidden="true" />
        </div>
      )}
      {member?.email && (
        <a className="founder-profile-email" href={`mailto:${member.email}`}>
          <Mail size={16} />
          {member.email}
        </a>
      )}
    </article>
  );
}
