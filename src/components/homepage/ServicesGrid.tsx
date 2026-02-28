import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import donGratuitImg from '@/assets/services/don-gratuit.png';
import donDeSangImg from '@/assets/services/don-de-sang.png';
import rechercheImg from '@/assets/services/recherche.png';
import carteInteractiveImg from '@/assets/services/carte-interactive.png';
import urgencesImg from '@/assets/services/urgences.png';
import assistanteIaImg from '@/assets/services/assistante-ia.png';
import annoncesImg from '@/assets/services/annonces.png';
import avisIdeesImg from '@/assets/services/avis-idees.png';
import documentsImg from '@/assets/services/documents.png';
import contactImg from '@/assets/services/contact.png';

/* ─── Service card data ─── */
interface ServiceCard {
  title: { fr: string; ar: string; en: string };
  description: { fr: string; ar: string; en: string };
  route: string;
  image: string;
}

const row1Services: ServiceCard[] = [
  { title: { fr: 'Don Gratuit', ar: 'تبرع مجاني', en: 'Free Donation' }, description: { fr: 'Offrez ou trouvez de l\'aide communautaire gratuite', ar: 'قدّم أو اعثر على مساعدة مجتمعية مجانية', en: 'Offer or find free community help' }, route: '/citizen/provide', image: donGratuitImg },
  { title: { fr: 'Don de Sang', ar: 'التبرع بالدم', en: 'Blood Donation' }, description: { fr: 'Sauvez des vies en donnant votre sang', ar: 'أنقذ حياة بالتبرع بدمك', en: 'Save lives by donating blood' }, route: '/blood-donation', image: donDeSangImg },
  { title: { fr: 'Recherche', ar: 'بحث', en: 'Search' }, description: { fr: 'Trouvez le bon médecin ou spécialiste', ar: 'اعثر على الطبيب أو الأخصائي المناسب', en: 'Find the right doctor or specialist' }, route: '/search', image: rechercheImg },
  { title: { fr: 'Carte Interactive', ar: 'خريطة تفاعلية', en: 'Interactive Map' }, description: { fr: 'Explorez les établissements autour de vous', ar: 'استكشف المرافق الصحية حولك', en: 'Explore nearby healthcare facilities' }, route: '/map/providers', image: carteInteractiveImg },
  { title: { fr: 'Urgences', ar: 'طوارئ', en: 'Emergency' }, description: { fr: 'Accès rapide aux services d\'urgence 24/7', ar: 'وصول سريع لخدمات الطوارئ على مدار الساعة', en: 'Quick access to 24/7 emergency services' }, route: '/emergency', image: urgencesImg },
  { title: { fr: 'Assistante IA', ar: 'مساعدة ذكية', en: 'AI Assistant' }, description: { fr: 'Évaluez vos symptômes avec l\'IA', ar: 'قيّم أعراضك بالذكاء الاصطناعي', en: 'Evaluate your symptoms with AI' }, route: '/medical-assistant', image: assistanteIaImg },
];

const row2Services: ServiceCard[] = [
  { title: { fr: 'Annonces', ar: 'إعلانات', en: 'Announcements' }, description: { fr: 'Découvrez les offres des professionnels', ar: 'اكتشف عروض المتخصصين', en: 'Discover professional offers' }, route: '/annonces', image: annoncesImg },
  { title: { fr: 'Avis & Idées', ar: 'آراء وأفكار', en: 'Reviews & Ideas' }, description: { fr: 'Partagez vos retours et suggestions', ar: 'شارك ملاحظاتك واقتراحاتك', en: 'Share your feedback and suggestions' }, route: '/community', image: avisIdeesImg },
  { title: { fr: 'Documents', ar: 'وثائق', en: 'Documents' }, description: { fr: 'Guides et documentation complète', ar: 'أدلة ووثائق شاملة', en: 'Guides and complete documentation' }, route: '/docs', image: documentsImg },
  { title: { fr: 'Contact', ar: 'اتصل بنا', en: 'Contact' }, description: { fr: 'Besoin d\'aide ? Contactez-nous', ar: 'تحتاج مساعدة؟ تواصل معنا', en: 'Need help? Contact us' }, route: '/contact', image: contactImg },
];

const sectionContent = {
  fr: { title: 'Nos Services', subtitle: 'Tous les outils santé dont vous avez besoin — recherche, urgences, don, IA et plus — réunis en un seul endroit.' },
  ar: { title: 'خدماتنا', subtitle: 'جميع الأدوات الصحية التي تحتاجها — بحث، طوارئ، تبرع، ذكاء اصطناعي والمزيد — في مكان واحد.' },
  en: { title: 'Our Services', subtitle: 'All the health tools you need — search, emergency, donation, AI and more — all in one place.' },
};

/* ─── Single card component ─── */
const ServiceCardItem = ({ service, language }: { service: ServiceCard; language: 'fr' | 'ar' | 'en' }) => {
  const navigate = useNavigate();
  const title = service.title[language];

  const handleClick = () => navigate(service.route);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group flex-shrink-0 w-[200px] rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-2 hover:shadow-xl hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer active:scale-[0.97] mx-2.5"
      tabIndex={0}
      aria-label={title}
    >
      {/* Image preview area */}
      <div className="h-[140px] bg-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
        <img
          src={service.image}
          alt={title}
          className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      {/* Label */}
      <div className="px-3 py-2.5 border-t border-border/30 flex items-center gap-2 bg-card">
        <span className="font-semibold text-sm text-foreground leading-tight truncate">{title}</span>
      </div>
    </button>
  );
};

/* ─── Marquee row ─── */
const MarqueeRow = ({ services, reverse = false, language }: { services: ServiceCard[]; reverse?: boolean; language: 'fr' | 'ar' | 'en' }) => {
  const items = [...services, ...services, ...services, ...services];

  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover/marquee:[animation-play-state:paused]`}
      >
        {items.map((service, i) => (
          <ServiceCardItem key={`${service.route}-${i}`} service={service} language={language} />
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
  const { language } = useLanguage();
  const content = sectionContent[language];

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
            {content.title}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Row 1 */}
        <div className="mb-6">
          <MarqueeRow services={row1Services} language={language} />
        </div>

        {/* Row 2 — reverse */}
        <div>
          <MarqueeRow services={row2Services} reverse language={language} />
        </div>
      </div>
    </section>
  );
};
