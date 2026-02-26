import { Link } from 'react-router-dom';
import { Star, ArrowRight, User, ArrowUpRight, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { isProviderVerified } from '@/utils/verificationUtils';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface DisplayProvider {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  image: string;
  nextAvailable: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

const SkeletonCard = () => (
  <div className="p-5 bg-card border border-border rounded-xl space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export const FeaturedProviders = () => {
  const { data: verifiedProviders = [], isLoading } = useVerifiedProviders();
  const { t } = useLanguage();

  const providers: DisplayProvider[] = useMemo(() => {
    return verifiedProviders
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8)
      .map(p => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty || p.type,
        rating: p.rating || 0,
        reviewCount: p.reviewsCount || 0,
        isVerified: isProviderVerified(p),
        isAvailable: p.isOpen || false,
        image: p.image || '',
        nextAvailable: p.isOpen ? t('featuredProviders', 'available') : t('featuredProviders', 'soon')
      }));
  }, [verifiedProviders, t]);

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="container mx-auto max-w-6xl relative">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-full mb-3">
              {t('featuredProviders', 'topPractitioners')}
            </span>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('featuredProviders', 'healthProfessionals')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('featuredProviders', 'bestRated')}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Link to="/search">
              {t('featuredProviders', 'viewAll')}
              <ArrowRight className="h-4 w-4 rtl-flip" />
            </Link>
          </Button>
        </motion.div>

        {/* Provider Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="py-20 text-center bg-card border border-border rounded-xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              {t('featuredProviders', 'noPractitioners')}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/provider/register">
                {t('featuredProviders', 'becomePractitioner')}
              </Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link
                  to={`/provider/${provider.id}`}
                  className="group relative block p-5 bg-card border border-border rounded-xl hover:border-foreground/20 hover:shadow-xl transition-all duration-300 h-full"
                >
                  {/* Top Badge - Rank or Verified */}
                  {index < 3 && (
                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-foreground text-background text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                      #{index + 1}
                    </span>
                  )}
                  
                  {/* Availability indicator */}
                  <div className="absolute top-4 right-4">
                    {provider.isAvailable ? (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-600 font-medium">{t('featuredProviders', 'available')}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">{t('featuredProviders', 'soon')}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {provider.image ? (
                        <img 
                          src={provider.image} 
                          alt={provider.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-muted to-muted/50 border-2 border-border flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {/* Verified checkmark */}
                      {provider.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                          <Shield className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {provider.specialty}
                      </p>
                    </div>
                  </div>
                  
                  {/* Rating & Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.floor(provider.rating) 
                                ? 'fill-foreground text-foreground' 
                                : 'fill-muted text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {provider.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({provider.reviewCount})
                      </span>
                    </div>
                    
                    {/* Arrow reveal on hover */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight className="h-4 w-4 text-foreground" />
                    </motion.div>
                  </div>
                  
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, transparent 60%, rgba(0,0,0,0.02) 100%)'
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Mobile CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="sm:hidden mt-8 text-center"
        >
          <Button asChild variant="outline" size="sm">
            <Link to="/search" className="flex items-center gap-2">
              {t('featuredProviders', 'viewAllPractitioners')}
              <ArrowRight className="h-4 w-4 rtl-flip" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
