import { Link } from "@tanstack/react-router";
import logo from "@/assets/prg-logo.jpg";
import { Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-brand-blue-deep text-white">
      <div className="h-1 w-full" style={{ background: "var(--gradient-trust)" }} />
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} width={48} height={48} alt="" className="h-12 w-12 rounded-full ring-2 ring-white/30" />
            <div>
              <div className="font-display text-lg font-semibold">PRG Social Welfare Trust</div>
              <div className="text-xs uppercase tracking-widest text-white/70">Anantapur · Reg. No. 25/2026</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-white/80">
            A registered public charitable trust working for education, healthcare, women empowerment,
            environment, and community welfare across Andhra Pradesh.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/programs" className="hover:text-white">Our Programs</Link></li>
            <li><Link to="/get-involved" className="hover:text-white">Get Involved</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 text-brand-orange shrink-0" />3-14, Madigubba, Athmakur Mandal, Anantapur District, Andhra Pradesh</li>
            <li className="flex gap-2"><Phone size={16} className="text-brand-orange" /><a href="tel:+919951217286" className="hover:text-white">+91 99512 17286</a></li>
            <li className="flex gap-2"><Mail size={16} className="text-brand-orange" /><a href="mailto:info@prgtrust.org" className="hover:text-white">info@prgtrust.org</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-4 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} PRG Social Welfare Trust. All rights reserved.</span>
          <span>Made with care for a better tomorrow.</span>
        </div>
      </div>
    </footer>
  );
}
