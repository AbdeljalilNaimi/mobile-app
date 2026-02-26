import { Link } from 'react-router-dom';
import { 
  Stethoscope, Pill, FlaskConical, Building2, Ambulance, HeartPulse, 
  Home, UserRound, Siren, ArrowUpRight, LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface Service {
  icon: LucideIcon;
  titleKey: string;
  href: string;
  popular?: boolean;
  live?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const services: Service[] = [
  { icon: Stethoscope, titleKey: 'generalist', href: '/search?type=doctor&specialty=general', popular: true },
  { icon: UserRound, titleKey: 'specialist', href: '/search?type=doctor&specialty=specialist' },
  { icon: Pill, titleKey: 'pharmacies', href: '/search?type=pharmacy', popular: true },
  { icon: FlaskConical, titleKey: 'labs', href: '/search?type=lab' },
  { icon: Building2, titleKey: 'clinics', href: '/search?type=clinic' },
  { icon: Ambulance, titleKey: 'ambulanceTransport', href: '/search?type=ambulance' },
  { icon: HeartPulse, titleKey: 'nurse', href: '/search?type=nurse' },
  { icon: Home, titleKey: 'homeCare', href: '/search?type=home_care' },
  { icon: Siren, titleKey: 'emergencyServices', href: '/map/emergency', live: true },
];

export const ServicesGrid = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">{t('homepage', 'ourServices')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('homepage', 'accessNetwork')}</p>
          </div>
          <Link
            to="/search"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t('homepage', 'viewAll')}
            <ArrowUpRight className="h-4 w-4 rtl-flip" />
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <motion.div key={service.titleKey} variants={cardVariants}>
                <Link
                  to={service.href}
                  className="group relative flex flex-col p-4 bg-background border border-border rounded-lg hover:border-foreground/30 hover:shadow-md transition-all duration-200"
                >
                  {service.popular && (
                    <span className="absolute -top-2 start-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full">
                      {t('homepage', 'popular')}
                    </span>
                  )}
                  {service.live && (
                    <span className="absolute top-3 end-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-emerald-600 font-medium">24/7</span>
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-medium text-foreground text-sm leading-tight">
                    {t('homepage', service.titleKey as any)}
                  </h3>
                  <ArrowUpRight className="absolute bottom-3 end-3 h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rtl-flip" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="sm:hidden mt-4 text-center">
          <Link to="/search" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            {t('homepage', 'viewAllServices')}
            <ArrowUpRight className="h-4 w-4 rtl-flip" />
          </Link>
        </div>
      </div>
    </section>
  );
};
