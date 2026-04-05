import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Siren, Droplets,
  CalendarDays, ChevronRight, Bot, Pill, Activity,
  BookOpen, Megaphone, Users, Heart,
  Bell, Stethoscope, Star,
  MessageSquare, TrendingUp, LayoutGrid,
  Phone, HelpCircle, Settings as SettingsIcon, Handshake, Map,
  CreditCard, Newspaper, FlaskConical, UserCircle,
  Building2, ArrowRight, Shield,
  Brain, Frown, Thermometer, Moon, Wind, HeartPulse, Menu,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/useNotifications';
import { useHomepageAds, useHomepageArticles, useHomepageCommunity } from '@/hooks/useHomepageData';
import { usePremiumProviders } from '@/hooks/useProviders';
import { SideDrawer } from '@/components/layout/SideDrawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Categories (moved inside component for translations) ── */

/* ── Symptoms icons ── */
const symptomIcons = [Brain, Frown, Thermometer, Moon, Pill, Wind, HeartPulse];
const symptomKeys = ['headache', 'nausea', 'fever', 'fatigue', 'allergy', 'breathing', 'chestPain'] as const;

export const MobileHomeScreen = () => {
  const { user, profile } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.uid);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    window.history.pushState({ homePage: true }, '');
    const handlePopState = (e: PopStateEvent) => {
      if (!e.state?.homePage) {
        window.history.pushState({ homePage: true }, '');
        setShowExitDialog(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const { data: adsData } = useHomepageAds();
  const { data: articlesData } = useHomepageArticles();
  const { data: communityData } = useHomepageCommunity();
  

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || t('mobileHome', 'visitor');
  const isGuest = !user;

  const categories = [
    { label: t('mobileHome', 'catDoctors'), icon: Stethoscope, type: 'doctor' },
    { label: t('mobileHome', 'catPharmacy'), icon: Pill, type: 'pharmacy' },
    { label: t('mobileHome', 'catHospitals'), icon: Building2, type: 'hospital' },
    { label: t('mobileHome', 'catLabs'), icon: FlaskConical, type: 'lab' },
    { label: t('mobileHome', 'catClinics'), icon: Activity, type: 'clinic' },
  ];

  const symptoms = symptomKeys.map((key, i) => ({
    icon: symptomIcons[i],
    label: t('mobileHome', key),
  }));
  const hour = new Date().getHours();
  const greeting = hour >= 18
    ? t('mobileHome', 'goodEvening')
    : hour >= 12
      ? t('mobileHome', 'goodAfternoon')
      : t('mobileHome', 'goodMorning');

  // Top providers — real data from Firestore via usePremiumProviders (premium only)
  const { data: topProviders = [], isLoading: loadingProviders, hasPremium } = usePremiumProviders();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const quickActions = [
    { icon: MapPin, label: t('mobileHome', 'map'), path: '/map' },
    { icon: Siren, label: t('mobileHome', 'emergencies'), path: '/map?mode=emergency' },
    { icon: CalendarDays, label: t('mobileHome', 'appointment'), path: '/citizen/appointments' },
    { icon: CreditCard, label: t('mobileHome', 'healthCard'), path: '/emergency-card' },
    { icon: Users, label: t('mobileHome', 'community'), path: '/community' },
    { icon: Newspaper, label: t('mobileHome', 'announcements'), path: '/annonces' },
    { icon: FlaskConical, label: t('mobileHome', 'research'), path: '/research' },
    { icon: UserCircle, label: t('mobileHome', 'myProfile'), path: '/profile' },
  ];


  const serviceItems = [
    { icon: FlaskConical, title: 'API Developer', subtitle: 'Intégrez nos données', path: '/service/api-developer' },
    { icon: BookOpen, title: 'Articles & Recherche', subtitle: 'Publications médicales', path: '/service/articles-recherche' },
    { icon: Droplets, title: 'Don de Sang', subtitle: 'Sauvez des vies', path: '/blood-donation' },
    { icon: Handshake, title: 'Don Gratuit', subtitle: 'Entraide communautaire', path: '/service/don-gratuit' },
    { icon: Newspaper, title: 'Documents', subtitle: 'Guides & ressources', path: '/service/documents' },
    { icon: CreditCard, title: 'Tarifs Providers', subtitle: 'Plans professionnels', path: '/service/tarifs-providers' },
  ];


  // Map real data
  const ads = (adsData ?? []).map((ad) => ({
    id: ad.id, title: ad.title, provider: ad.provider_name,
    shortDescription: ad.short_description,
    tag: ad.is_featured ? '⭐' : t('mobileHome', 'promoTag'), isPrimary: ad.is_featured,
    isVerified: ad.is_verified_provider,
    imageUrl: ad.image_url,
    providerAvatar: ad.provider_avatar,
    providerId: ad.provider_id,
  }));

  const articles = (articlesData ?? []).map((a) => ({
    id: a.id, title: a.title, author: a.provider_name, reads: a.views_count,
  }));

  const communityPosts = (communityData ?? []).map((p) => ({
    id: p.id, title: p.title, category: p.category,
    comments: p.comments_count, isPrimary: p.category === 'experience',
  }));

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="bg-background min-h-screen px-4 pb-20 space-y-5"
    >
      {/* ── Header with background shape ── */}
      <motion.div variants={fadeUp} className="-mx-4 -mt-0 bg-primary rounded-b-[32px] px-5 pt-5 pb-14 relative">
        {/* Top row: settings + avatar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
            aria-label={t('mobileHome', 'settings')}
          >
            <Menu className="h-5 w-5 text-primary-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              aria-label={t('mobileHome', 'announcements')}
            >
              <Bell className="h-5 w-5 text-primary-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isGuest ? (
              <button
                onClick={() => navigate('/auth-gateway')}
                className="bg-primary-foreground text-primary rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 transition-transform"
              >
                {t('mobileHome', 'signIn')}
              </button>
            ) : (
              <button onClick={() => navigate('/profile')} className="relative" aria-label={t('mobileHome', 'myProfile')}>
                <Avatar className="h-11 w-11 ring-2 ring-primary-foreground/30 ring-offset-1 ring-offset-primary">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-primary" />
              </button>
            )}
          </div>
        </div>

        {/* Greeting + hero text */}
        <p className="text-primary-foreground/70 text-sm mb-1">👋 {greeting}, {displayName}</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight">
          {t('mobileHome', 'heroLine1')}<br /><span className="text-primary-foreground">{t('mobileHome', 'heroLine2')}</span>
        </h1>

        {/* Search bar inside header */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="relative mt-5 mb-[-24px] z-10"
        >
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('mobileHome', 'searchPlaceholder')}
            className="ps-10 pe-4 h-12 rounded-xl bg-card border-border shadow-md text-sm"
          />
        </form>
      </motion.div>

      {/* ── Categories (scrollable) ── */}
      <motion.div variants={fadeUp}>
        <SectionHeader label={t('mobileHome', 'specialties')} title={t('mobileHome', 'categoriesLabel')} />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 mt-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.type}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              onClick={() => navigate(`/search?type=${cat.type}`)}
              className="flex flex-col items-center gap-2 flex-shrink-0 snap-start active:scale-95 transition-transform min-w-[72px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                <cat.icon className="h-6 w-6 text-primary" strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-medium text-foreground whitespace-nowrap">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Symptoms (scrollable → AI assistant) ── */}
      <motion.div variants={fadeUp}>
        <SectionHeader label={t('mobileHome', 'healthLabel')} title={t('mobileHome', 'symptomsLabel')} />
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 mt-3">
          {symptoms.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => navigate(`/medical-assistant?symptom=${symptomKeys[i]}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border shadow-sm flex-shrink-0 snap-start active:scale-95 transition-transform"
            >
              <s.icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{s.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Top Providers (premium only) ── */}
      {(loadingProviders || hasPremium) && (
      <motion.div variants={fadeUp}>
        <SectionHeader label={t('mobileHome', 'premiumLabel')} title={t('mobileHome', 'topProviders')} actionLabel={t('mobileHome', 'viewAll')} onAction={() => navigate('/search')} />
        <div className="space-y-3 mt-3" data-testid="top-providers-list">
          {loadingProviders ? (
            [1, 2, 3].map(i => (
              <div key={i} className="w-full rounded-2xl bg-card border border-border shadow-sm p-4 flex items-center gap-4 animate-pulse">
                <div className="h-14 w-14 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))
          ) : topProviders.map((doc) => (
            <button
              key={doc.id}
              data-testid={`card-provider-${doc.id}`}
              onClick={() => navigate(`/provider/${doc.id}`)}
              className="w-full rounded-2xl bg-card border border-border shadow-sm p-4 flex items-center gap-4 text-start active:scale-[0.98] transition-transform"
            >
              <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-primary/10">
                <AvatarImage src={doc.image} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(doc.name || '?').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-provider-name-${doc.id}`}>{doc.name}</p>
                  {doc.isPremium && (
                    <span data-testid={`badge-premium-${doc.id}`} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold flex-shrink-0">
                      <Shield className="h-2.5 w-2.5" /> {t('mobileHome', 'premiumBadge')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{doc.specialty || t('mobileHome', 'defaultSpecialty')}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium text-foreground">{(doc.rating || 0).toFixed(1)}</span>
                  <span className="text-[10px] text-muted-foreground">({doc.reviewsCount || 0} {t('mobileHome', 'reviews')})</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold shadow-sm">
                  {t('mobileHome', 'bookAppointment')} <ArrowRight className="h-3 w-3" />
                </span>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>
      )}

      {/* ── Auto-scrolling Ads Carousel ── */}
      {ads.length > 0 && (
        <motion.div variants={fadeUp}>
          <SectionHeader label={t('mobileHome', 'news')} title={t('mobileHome', 'medicalAds')} actionLabel={t('mobileHome', 'viewAll')} onAction={() => navigate('/annonces')} />
          <div className="mt-3 overflow-hidden">
            <div className="flex gap-3 animate-scroll-left hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
              {[...ads, ...ads].map((ad, idx) => (
                <button
                  key={`${ad.id}-${idx}`}
                  data-testid={`carousel-ad-${ad.id}-${idx}`}
                  onClick={() => ad.providerId ? navigate(`/provider/${ad.providerId}`) : navigate('/annonces')}
                  className="w-[260px] shrink-0 rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-start active:scale-[0.97] transition-all duration-200 hover:shadow-md"
                >
                  {ad.imageUrl && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
                        ad.isPrimary ? 'bg-amber-500/90 text-white' : 'bg-card/80 text-foreground'
                      }`}>
                        {ad.tag}
                      </span>
                    </div>
                  )}
                  <div className="p-3 space-y-1.5">
                    <p className="text-foreground font-semibold text-[13px] leading-tight line-clamp-2">{ad.title}</p>
                    {ad.shortDescription && (
                      <p className="text-muted-foreground text-[11px] leading-snug line-clamp-1">{ad.shortDescription}</p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-primary">{ad.provider.charAt(0)}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate">{ad.provider}</span>
                      {ad.isVerified && <Shield className="h-3 w-3 text-primary flex-shrink-0" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Urgent banner ── */}
      <SectionHeader label={t('mobileHome', 'healthLabel')} title={t('mobileHome', 'bloodDonation')} actionLabel={t('mobileHome', 'viewAll')} onAction={() => navigate('/blood-donation')} />
      <motion.div variants={fadeUp} className="w-full rounded-xl bg-card border border-border border-s-4 border-s-destructive shadow-sm p-4 space-y-3">
        <button
          onClick={() => navigate('/blood-donation')}
          className="w-full flex items-center gap-3 text-start active:scale-[0.98] transition-transform"
          aria-label={t('mobileHome', 'bloodDonation')}
        >
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Droplets className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{t('mobileHome', 'bloodDonation')}</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                {t('mobileHome', 'urgent')}
              </span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{t('mobileHome', 'bloodDonationDesc')}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </button>
        <button
          onClick={() => navigate('/map?mode=blood')}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-destructive/5 py-2 text-xs font-medium text-destructive active:scale-[0.97] transition-transform"
        >
          <Map className="h-3.5 w-3.5" />
          {t('mobileHome', 'viewBloodMap')}
        </button>
      </motion.div>

      {/* ── Emergency section ── */}
      <SectionHeader label={t('mobileHome', 'specialties')} title={t('mobileHome', 'emergencyTitle')} actionLabel={t('mobileHome', 'viewAll')} onAction={() => navigate('/emergency')} />
      <motion.div variants={fadeUp} className="w-full rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Siren className="h-4 w-4 text-destructive" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{t('mobileHome', 'emergencyTitle')}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{t('mobileHome', 'emergencyDesc')}</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:15"
              className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2.5 text-xs font-semibold text-destructive active:scale-[0.97] transition-transform"
              aria-label={t('mobileHome', 'call15')}
            >
              <Phone className="h-3.5 w-3.5" />
              {t('mobileHome', 'call15')}
            </a>
            <button
              onClick={() => navigate('/map?mode=emergency')}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2.5 text-xs font-semibold text-primary active:scale-[0.97] transition-transform"
            >
              <Map className="h-3.5 w-3.5" />
              {t('mobileHome', 'emergencyMap')}
            </button>
          </div>
          <button
            onClick={() => navigate('/emergency')}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            <HelpCircle className="h-3 w-3" />
            {t('mobileHome', 'emergencyGuide')}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </motion.div>

      {/* ── Research articles ── */}
      {articles.length > 0 && (
        <>
          <SectionHeader label={t('mobileHome', 'publications')} title={t('mobileHome', 'medicalResearch')} actionLabel={t('mobileHome', 'explore')} onAction={() => navigate('/research')} />
          <motion.div variants={fadeUp} className="rounded-xl bg-card border border-border shadow-sm overflow-hidden divide-y divide-border">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => navigate('/research')}
                className="w-full p-3.5 flex items-start gap-3 text-start active:bg-accent transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground leading-snug line-clamp-2">{article.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{article.author}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <TrendingUp className="h-2.5 w-2.5" /> {article.reads} {t('mobileHome', 'reads')}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              </button>
            ))}
          </motion.div>
        </>
      )}

      {/* ── Community ── */}
      {communityPosts.length > 0 && (
        <>
          <SectionHeader label={t('mobileHome', 'discussions')} title={t('mobileHome', 'communityLabel')} actionLabel={t('mobileHome', 'join')} onAction={() => navigate('/community')} />
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            {communityPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => navigate('/community')}
                className="rounded-xl bg-card border border-border shadow-sm p-3.5 text-start active:scale-[0.97] transition-transform flex flex-col justify-between min-h-[100px]"
              >
                <span className={`self-start text-[9px] font-semibold border px-2 py-0.5 rounded-full ${post.isPrimary ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                  {post.category}
                </span>
                <div className="mt-auto space-y-1.5">
                  <p className="text-foreground font-medium text-[13px] leading-tight line-clamp-2">{post.title}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-[10px]">{post.comments}</span>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        </>
      )}

      {/* ── Services ── */}
      <SectionHeader label="PLATEFORME" title="Services" />
      <motion.div variants={fadeUp} className="-mx-4 px-4 overflow-hidden">
        <div className="flex gap-3 animate-marquee w-max">
          {[...serviceItems, ...serviceItems, ...serviceItems].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="flex-shrink-0 w-[140px] active:scale-[0.97] transition-transform"
              aria-label={item.title}
            >
              <div className="rounded-xl bg-card border border-border shadow-sm p-3.5 h-full flex flex-col justify-between min-h-[120px]">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" strokeWidth={2} />
                </div>
                <div className="mt-auto space-y-0.5">
                  <p className="text-foreground font-semibold text-[11px] leading-tight">{item.title}</p>
                  <p className="text-muted-foreground text-[10px]">{item.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent data-testid="dialog-exit-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter l'application ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment quitter l'application ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-testid="button-exit-cancel"
              onClick={() => {
                window.history.pushState({ homePage: true }, '');
                setShowExitDialog(false);
              }}
            >
              Non
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-exit-confirm"
              onClick={() => {
                setShowExitDialog(false);
                window.history.go(-2);
              }}
            >
              Oui, quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

/* ── Section header ── */
function SectionHeader({ label, title, actionLabel, onAction }: {
  label: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div variants={fadeUp} className="flex items-end justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{label}</p>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-xs font-medium text-primary flex items-center gap-0.5 pb-0.5">
          {actionLabel} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}
