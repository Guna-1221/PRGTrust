import { Mail, Quote } from "lucide-react";
import type { Member } from "@/hooks/use-members";

type FounderCardProps = {
  member?: Member;
};

const fallbackBiography =
  "A lifelong advocate for community welfare, Mr. Ramanjaneyulu founded PRG Social Welfare Trust to bring sustainable change to underprivileged families across Anantapur — believing collective effort builds a better society.";

export function FounderCard({ member }: FounderCardProps) {
  const name = member?.name || "Mr. Y. Ramanjaneyulu";
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
      <h2>{name}</h2>
      <p className="founder-profile-role">{member?.position || "Founder & Chairman"}</p>
      {member?.qualification && (
        <p className="founder-profile-qualification">{member.qualification}</p>
      )}
      <div className="founder-profile-biography">
        <Quote size={18} aria-hidden="true" />
        <p>{member?.biography || fallbackBiography}</p>
        <Quote size={18} aria-hidden="true" />
      </div>
      {member?.email && (
        <a className="founder-profile-email" href={`mailto:${member.email}`}>
          <Mail size={16} />
          {member.email}
        </a>
      )}
    </article>
  );
}
