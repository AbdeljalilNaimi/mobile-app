import {
  Search, MapPin, HeartPulse, Bot, Star, BookOpen, Megaphone, TvMinimal,
  Stethoscope, ArrowRight, Activity, Clock, FileText, MessageCircle,
  Navigation, User, Gift, Droplets, Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─── Scroll to anchor with sticky header offset ─── */
const scrollToAnchor = (anchorId: string) => {
  const el = document.getElementById(anchorId);
  if (el) {
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

/* ─── Service card data ─── */
interface ServiceCard {
  title: string;
  anchorId: string;
  icon: LucideIcon;
}

const row1Services: ServiceCard[] = [
  { title: 'Don Gratuit', anchorId: 'don-gratuit', icon: Gift },
  { title: 'Don de Sang', anchorId: 'don-de-sang', icon: Droplets },
  { title: 'Recherche', anchorId: 'recherche-medecins', icon: Search },
  { title: 'Carte Interactive', anchorId: 'carte-interactive', icon: MapPin },
  { title: 'Urgences', anchorId: 'urgences', icon: HeartPulse },
  { title: 'Assistante IA', anchorId: 'assistant-ia', icon: Bot },
];

const row2Services: ServiceCard[] = [
  { title: 'Annonces Publicitaires', anchorId: 'annonces', icon: Megaphone },
  { title: 'Avis & Idées', anchorId: 'avis-idees', icon: Star },
  { title: 'Documents', anchorId: 'documents', icon: FileText },
  { title: 'Contact', anchorId: 'contact', icon: Phone },
];

/* ─── Single card component ─── */
const ServiceCardItem = ({ service }: { service: ServiceCard }) => {
  const IconComp = service.icon;
  return (
    <button
      type="button"
      onClick={() => scrollToAnchor(service.anchorId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollToAnchor(service.anchorId);
        }
      }}
      className="group flex-shrink-0 w-[180px] h-[120px] rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer active:scale-95 mx-2"
      tabIndex={0}
      aria-label={`Aller à ${service.title}`}
    >
      {/* Icon area */}
      <div className="h-[72px] bg-muted/20 flex items-center justify-center">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <IconComp className="h-5 w-5 text-primary" strokeWidth={1.8} />
        </div>
      </div>
      {/* Label */}
      <div className="h-[48px] px-3 flex items-center justify-center border-t border-border/50">
        <span className="font-semibold text-xs text-foreground text-center leading-tight">{service.title}</span>
      </div>
    </button>
  );
};

/* ─── Marquee row ─── */
const MarqueeRow = ({ services, reverse = false }: { services: ServiceCard[]; reverse?: boolean }) => {
  // Duplicate content for seamless loop
  const items = [...services, ...services, ...services, ...services];

  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover/marquee:[animation-play-state:paused]`}
      >
        {items.map((service, i) => (
          <ServiceCardItem key={`${service.anchorId}-${i}`} service={service} />
        ))}
      </div>
    </div>
  );
};

/* ─── Heading variants ─── */
const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ─── Component ─── */
export const ServicesGrid = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Heading */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Nos Services
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Accédez à un réseau complet de professionnels de santé, d'établissements et de services médicaux.
          </p>
        </motion.div>

        {/* Row 1 — Left to right auto-scroll */}
        <div className="mb-6">
          <MarqueeRow services={row1Services} />
        </div>

        {/* Row 2 — Right to left (reverse) auto-scroll */}
        <div>
          <MarqueeRow services={row2Services} reverse />
        </div>
      </div>
    </section>
  );
};
