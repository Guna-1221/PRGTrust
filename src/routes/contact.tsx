import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PRG Social Welfare Trust" },
      { name: "description", content: "Get in touch with PRG Social Welfare Trust, Anantapur. Phone, email, address and contact form." },
      { property: "og:title", content: "Contact — PRG Social Welfare Trust" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="bg-brand-blue-deep text-white">
        <div className="container-x py-20 md:py-24">
          <div className="accent-bar" />
          <h1 className="mt-4 text-4xl md:text-5xl">Get in touch</h1>
          <p className="mt-4 max-w-2xl text-white/85 text-lg">
            Questions, partnerships, volunteering — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2 space-y-5">
            <div className="card-soft p-6 flex gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue shrink-0">
                <MapPin size={20} />
              </span>
              <div>
                <div className="text-xs uppercase tracking-widest text-foreground/60">Address</div>
                <p className="mt-1 text-sm text-foreground/85">
                  3-14, Madigubba,<br />
                  Athmakur Mandal,<br />
                  Anantapur District, Andhra Pradesh
                </p>
              </div>
            </div>
            <div className="card-soft p-6 flex gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange-deep shrink-0">
                <Phone size={20} />
              </span>
              <div>
                <div className="text-xs uppercase tracking-widest text-foreground/60">Phone</div>
                <a href="tel:+919951217286" className="mt-1 block text-sm text-foreground/85 hover:text-brand-blue">+91 99512 17286</a>
              </div>
            </div>
            <div className="card-soft p-6 flex gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-deep shrink-0">
                <Mail size={20} />
              </span>
              <div>
                <div className="text-xs uppercase tracking-widest text-foreground/60">Email</div>
                <a href="mailto:info@prgtrust.org" className="mt-1 block text-sm text-foreground/85 hover:text-brand-blue">info@prgtrust.org</a>
              </div>
            </div>
          </div>

          <form
            className="md:col-span-3 card-soft p-7"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {sent ? (
              <div className="text-center py-12">
                <CheckCircle2 size={56} className="mx-auto text-brand-green" />
                <h3 className="mt-4 text-2xl">Thank you!</h3>
                <p className="mt-2 text-foreground/70">Your message has been recorded. We'll be in touch soon.</p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-brand-blue border border-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                >
                  Send another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl">Send us a message</h2>
                <p className="mt-1 text-sm text-foreground/65">We typically respond within 2 working days.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <div className="mt-4">
                  <Field label="Subject" name="subject" />
                </div>
                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-widest text-foreground/70">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition"
                    placeholder="Tell us how you'd like to help, or what you'd like to know…"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold btn-primary"
                >
                  Send message <Send size={16} />
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-foreground/70">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition"
      />
    </div>
  );
}
