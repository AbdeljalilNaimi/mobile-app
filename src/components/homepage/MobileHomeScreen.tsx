import { useState } from 'react';
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
  Building2, ArrowRight,
  Brain, Frown, Thermometer, Moon, Wind, HeartPulse, Menu,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/useNotifications';
import { useHomepageAds, useHomepageArticles, useHomepageCommunity, useHomepageProviderCounts } from '@/hooks/useHomepageData';
import { getProviders } from '@/data/providers';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Categories ── */
const categories = [
  { label: 'Doctors', icon: Stethoscope, type: 'doctor' },
  { label: 'Pharmacy', icon: Pill, type: 'pharmacy' },
  { label: 'Hospitals', icon: Building2, type: 'hospital' },
  { label: 'Labs', icon: FlaskConical, type: 'lab' },
  { label: 'Clinics', icon: Activity, type: 'clinic' },
];

/* ── Symptoms (with icons) ── */
const symptoms = [
  { icon: Brain, label: 'Headache' },
  { icon: Frown, label: 'Nausea' },
  { icon: Thermometer, label: 'Fever' },
  { icon: Moon, label: 'Fatigue' },
  { icon: Pill, label: 'Allergy' },
  { icon: Wind, label: 'Breathing' },
  { icon: HeartPulse, label: 'Chest pain' },
];

export const MobileHomeScreen = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.uid);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: adsData } = useHomepageAds();
  const { data: articlesData } = useHomepageArticles();
  const { data: communityData } = useHomepageCommunity();
  const { data: providerCounts } = useHomepageProviderCounts();

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || t('mobileHome', 'visitor');
  const isGuest = !user;
  const hour = new Date().getHours();
  const greeting = hour >= 18
    ? t('mobileHome', 'goodEvening')
    : hour >= 12
      ? t('mobileHome', 'goodAfternoon')
      : t('mobileHome', 'goodMorning');

  // Top doctors
  const allProviders = getProviders();
  const topDoctors = allProviders
    .filter((p) => p.type === 'doctor')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

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

  const healthServices = [
    { title: t('mobileHome', 'pharmacyOnDuty'), subtitle: t('mobileHome', 'openNow'), icon: Pill, path: '/search?type=pharmacy' },
    { title: t('mobileHome', 'cardiology'), subtitle: `${providerCounts?.cardiologie ?? 0} ${t('mobileHome', 'specialists')}`, icon: Activity, path: '/search?specialty=cardiologie' },
    { title: t('mobileHome', 'pediatrics'), subtitle: `${providerCounts?.pédiatrie ?? 0} ${t('mobileHome', 'doctors')}`, icon: Stethoscope, path: '/search?specialty=pédiatrie' },
    { title: t('mobileHome', 'ophthalmology'), subtitle: `${providerCounts?.ophtalmologie ?? 0} ${t('mobileHome', 'doctors')}`, icon: Star, path: '/search?specialty=ophtalmologie' },
  ];

  const entraideItems = [
    { icon: Handshake, title: t('mobileHome', 'medications'), subtitle: t('mobileHome', 'donationsAvailable'), path: '/citizen/provide' },
    { icon: Handshake, title: t('mobileHome', 'transport'), subtitle: t('mobileHome', 'accompaniment'), path: '/citizen/provide' },
    { icon: Handshake, title: t('mobileHome', 'medicalEquipment'), subtitle: t('mobileHome', 'loanDonation'), path: '/citizen/provide' },
    { icon: Handshake, title: t('mobileHome', 'food'), subtitle: t('mobileHome', 'foodAid'), path: '/citizen/provide' },
  ];


  // Map real data
  const ads = (adsData ?? []).map((ad) => ({
    id: ad.id, title: ad.title, provider: ad.provider_name,
    tag: ad.is_featured ? '⭐' : 'Promo', isPrimary: ad.is_featured,
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
            onClick={() => navigate('/settings')}
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
          Let's find your<br /><span className="text-primary-foreground">Docteur !</span>
        </h1>

        {/* Search bar inside header */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="relative mt-5 mb-[-24px] z-10"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('mobileHome', 'searchPlaceholder')}
            className="pl-10 pr-4 h-12 rounded-xl bg-card border-border shadow-md text-sm"
          />
        </form>
      </motion.div>

      {/* ── Categories (scrollable) ── */}
      <motion.div variants={fadeUp}>
        <SectionHeader label={t('mobileHome', 'specialties')} title="Categories" />
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
        <SectionHeader label="Health" title="Symptoms" />
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 mt-3">
          {symptoms.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => navigate(`/medical-assistant?symptom=${encodeURIComponent(s.label)}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border shadow-sm flex-shrink-0 snap-start active:scale-95 transition-transform"
            >
              <s.icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{s.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Top Doctors ── */}
      {topDoctors.length > 0 && (
        <motion.div variants={fadeUp}>
          <SectionHeader label="Recommended" title="Top Doctors" actionLabel={t('mobileHome', 'viewAll')} onAction={() => navigate('/search?type=doctor')} />
          <div className="space-y-2.5 mt-3">
            {topDoctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/provider/${doc.id}`)}
                className="w-full rounded-xl bg-card border border-border shadow-sm p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={doc.image} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {doc.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{doc.specialty || 'Médecin'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-medium text-foreground">{doc.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground">({doc.reviewsCount})</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    Appointment <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Quick actions grid ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3" role="navigation" aria-label={t('mobileHome', 'quickAccess')}>
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            aria-label={a.label}
          >
            <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center">
              <a.icon className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-medium text-foreground">{a.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── Urgent banner ── */}
      <motion.div variants={fadeUp} className="w-full rounded-xl bg-card border border-border border-l-4 border-l-destructive shadow-sm p-4 space-y-3">
        <button
          onClick={() => navigate('/blood-donation')}
          className="w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
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

      {/* ── Health services ── */}
      <SectionHeader label={t('mobileHome', 'specialties')} title={t('mobileHome', 'healthServices')} actionLabel={t('mobileHome', 'viewAll')} onAction={() => navigate('/search')} />
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {healthServices.map((s, i) => (
            <button
              key={i}
              onClick={() => navigate(s.path)}
              className="flex-shrink-0 w-[140px] snap-start active:scale-[0.97] transition-transform"
              aria-label={s.title}
            >
              <div className="rounded-xl bg-card border border-border shadow-sm p-3.5 h-full flex flex-col justify-between min-h-[120px]">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" strokeWidth={2} />
                </div>
                <div className="mt-auto space-y-0.5">
                  <p className="text-foreground font-semibold text-[11px] leading-tight">{s.title}</p>
                  <p className="text-muted-foreground text-[10px]">{s.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Medical ads ── */}
      {ads.length > 0 && (
        <>
          <SectionHeader label={t('mobileHome', 'news')} title={t('mobileHome', 'medicalAds')} actionLabel={t('mobileHome', 'viewAll')} onAction={() => navigate('/annonces')} />
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            {ads.map((ad) => (
              <button
                key={ad.id}
                onClick={() => navigate('/ads')}
                className="rounded-xl bg-card border border-border shadow-sm p-3.5 text-left active:scale-[0.97] transition-transform flex flex-col justify-between min-h-[100px]"
              >
                <span className={`self-start text-[9px] font-bold px-2 py-0.5 rounded-full ${ad.isPrimary ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {ad.tag}
                </span>
                <div className="mt-auto space-y-1">
                  <p className="text-foreground font-medium text-[13px] leading-tight line-clamp-2">{ad.title}</p>
                  <p className="text-muted-foreground text-[10px]">{ad.provider}</p>
                </div>
              </button>
            ))}
          </motion.div>
        </>
      )}

      {/* ── Research articles ── */}
      {articles.length > 0 && (
        <>
          <SectionHeader label={t('mobileHome', 'publications')} title={t('mobileHome', 'medicalResearch')} actionLabel={t('mobileHome', 'explore')} onAction={() => navigate('/research')} />
          <motion.div variants={fadeUp} className="rounded-xl bg-card border border-border shadow-sm overflow-hidden divide-y divide-border">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => navigate('/research')}
                className="w-full p-3.5 flex items-start gap-3 text-left active:bg-accent transition-colors"
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
                className="rounded-xl bg-card border border-border shadow-sm p-3.5 text-left active:scale-[0.97] transition-transform flex flex-col justify-between min-h-[100px]"
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

      {/* ── Entraide citoyenne ── */}
      <SectionHeader label={t('mobileHome', 'solidarity')} title={t('mobileHome', 'citizenAid')} actionLabel={t('mobileHome', 'viewAll')} onAction={() => navigate('/citizen/provide')} />
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {entraideItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="flex-shrink-0 w-[140px] snap-start active:scale-[0.97] transition-transform"
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

      {/* ── Quick access ── */}
      <SectionHeader label={t('mobileHome', 'navigation')} title={t('mobileHome', 'quickAccess')} />
      <motion.div variants={fadeUp} className="space-y-2.5" role="navigation" aria-label={t('mobileHome', 'quickAccess')}>
        {quickAccess.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className={`w-full rounded-xl bg-card border border-border border-l-4 ${item.isPrimary ? 'border-l-primary' : 'border-l-muted-foreground/30'} shadow-sm p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform`}
            aria-label={item.title}
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </motion.div>
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
