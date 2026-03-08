import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Siren, Droplets,
  CalendarDays, ChevronRight, Bot, Pill, Activity,
  BookOpen, Megaphone, Users, Clock, Heart,
  Bell, SlidersHorizontal, Stethoscope, Star,
  MessageSquare, TrendingUp, LayoutGrid,
  Phone, HelpCircle, Settings as SettingsIcon, Handshake, Map,
  CreditCard, Newspaper, FlaskConical, UserPlus, UserCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks/useNotifications';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const quickActions = [
  { icon: Search, label: 'Chercher', path: '/search' },
  { icon: MapPin, label: 'Carte', path: '/map' },
  { icon: Siren, label: 'Urgences', path: '/map?mode=emergency' },
  { icon: CalendarDays, label: 'RDV', path: '/citizen/appointments' },
  { icon: CreditCard, label: 'Carte', path: '/emergency-card' },
  { icon: Users, label: 'Communauté', path: '/community' },
  { icon: Newspaper, label: 'Annonces', path: '/annonces' },
  { icon: FlaskConical, label: 'Recherche', path: '/research' },
  { icon: UserCircle, label: 'Mon Profil', path: '/profile' },
];

const healthServices = [
  { title: 'Pharmacies de garde', subtitle: 'Ouvertes maintenant', icon: Pill, path: '/search' },
  { title: 'Cardiologie', subtitle: '12 spécialistes', icon: Activity, path: '/search' },
  { title: 'Pédiatrie', subtitle: '8 médecins', icon: Stethoscope, path: '/search' },
  { title: 'Ophtalmologie', subtitle: '6 médecins', icon: Star, path: '/search' },
];

const ads = [
  { title: 'Consultation gratuite', provider: 'Dr. Benali', tag: 'Promo', isPrimary: true },
  { title: 'Journée dépistage diabète', provider: 'Clinique El-Afia', tag: 'Événement', isPrimary: false },
  { title: 'Nouveau scanner IRM', provider: 'Centre Imagerie', tag: 'Nouveau', isPrimary: true },
  { title: 'Bilan de santé complet', provider: 'Polyclinique Saada', tag: 'Promo', isPrimary: true },
];

const articles = [
  { title: 'Impact du diabète de type 2 en Algérie', author: 'Dr. Merah', reads: 142 },
  { title: 'Nouvelles approches en cardiologie préventive', author: 'Pr. Khelif', reads: 89 },
];

const communityPosts = [
  { title: 'Conseils post-opératoires', category: 'Expérience', comments: 12, isPrimary: true },
  { title: 'Meilleur pédiatre à SBA ?', category: 'Question', comments: 24, isPrimary: false },
  { title: 'Nouveau centre IRM ouvert', category: 'Info', comments: 8, isPrimary: false },
  { title: 'Expérience chirurgie laser', category: 'Expérience', comments: 15, isPrimary: true },
];

const entraideItems = [
  { icon: Handshake, title: 'Médicaments', subtitle: 'Dons disponibles', path: '/citizen/provide' },
  { icon: Handshake, title: 'Transport', subtitle: 'Accompagnement', path: '/citizen/provide' },
  { icon: Handshake, title: 'Matériel médical', subtitle: 'Prêt & don', path: '/citizen/provide' },
  { icon: Handshake, title: 'Alimentation', subtitle: 'Aide alimentaire', path: '/citizen/provide' },
];

const quickAccess = [
  { icon: Bot, title: 'Assistant IA', subtitle: 'Posez vos questions', isPrimary: true, path: '/medical-assistant' },
  { icon: Heart, title: 'Favoris', subtitle: 'Médecins sauvegardés', isPrimary: false, path: '/favorites' },
  { icon: LayoutGrid, title: 'Tableau de bord', subtitle: 'Votre espace patient', isPrimary: false, path: '/citizen/dashboard' },
  { icon: CreditCard, title: 'Carte d\'urgence', subtitle: 'Vos infos médicales', isPrimary: true, path: '/citizen/health-card' },
  { icon: CalendarDays, title: 'Rendez-vous', subtitle: 'Gérer vos RDV', isPrimary: true, path: '/citizen/appointments' },
  { icon: Map, title: 'Carte don de sang', subtitle: 'Centres à proximité', isPrimary: false, path: '/map?mode=blood' },
  { icon: Siren, title: 'Urgences', subtitle: 'Guide & numéros utiles', isPrimary: true, path: '/emergency' },
  { icon: Phone, title: 'Contact', subtitle: 'Nous contacter', isPrimary: false, path: '/contact' },
  { icon: HelpCircle, title: 'FAQ', subtitle: 'Questions fréquentes', isPrimary: false, path: '/faq' },
  { icon: SettingsIcon, title: 'Réglages', subtitle: 'Préférences & compte', isPrimary: false, path: '/settings' },
];

export const MobileHomeScreen = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.uid);

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Visiteur';
  const isGuest = !user;
  const hour = new Date().getHours();
  const greeting = hour >= 18 ? 'Bonsoir' : hour >= 12 ? 'Bon après-midi' : 'Bonjour';

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="bg-background min-h-screen px-4 pb-20 space-y-6"
    >
      {/* 1. Header */}
      <motion.div variants={fadeUp} className="-mx-4 px-4 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
              {greeting}
            </p>
            <h2 className="text-lg font-bold text-foreground truncate">
              👋 <span className="text-primary">{displayName}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isGuest ? (
              <button
                onClick={() => navigate('/auth-gateway')}
                className="bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 transition-transform"
              >
                Se connecter
              </button>
            ) : (
              <button onClick={() => navigate('/profile')} className="relative">
                <Avatar className="h-9 w-9 ring-2 ring-primary/30 ring-offset-1 ring-offset-background">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. Search bar */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate('/search')}
        className="w-full flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 shadow-sm active:scale-[0.98] transition-transform"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground flex-1 text-left">Rechercher un médecin, spécialité, ville…</span>
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
      </motion.button>

      {/* 3. Quick actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center">
              <a.icon className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-medium text-foreground">{a.label}</span>
          </button>
        ))}
      </motion.div>

      {/* 4. Urgent banner */}
      <motion.div variants={fadeUp} className="w-full rounded-xl bg-card border border-border border-l-4 border-l-destructive shadow-sm p-4 space-y-3">
        <button
          onClick={() => navigate('/blood-donation')}
          className="w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Droplets className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Don de sang</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                URGENT
              </span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">Trouvez un centre de don près de vous</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </button>
        <button
          onClick={() => navigate('/map?mode=blood')}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-destructive/5 py-2 text-xs font-medium text-destructive active:scale-[0.97] transition-transform"
        >
          <Map className="h-3.5 w-3.5" />
          Voir la carte des centres
        </button>
      </motion.div>

      {/* 4b. Emergency section */}
      <motion.div variants={fadeUp} className="w-full rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Siren className="h-4 w-4 text-destructive" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Urgences</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            En cas d'urgence, appelez immédiatement le SAMU ou trouvez l'hôpital le plus proche.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:15"
              className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2.5 text-xs font-semibold text-destructive active:scale-[0.97] transition-transform"
            >
              <Phone className="h-3.5 w-3.5" />
              Appeler le 15
            </a>
            <button
              onClick={() => navigate('/map?mode=emergency')}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2.5 text-xs font-semibold text-primary active:scale-[0.97] transition-transform"
            >
              <Map className="h-3.5 w-3.5" />
              Carte urgences
            </button>
          </div>
          <button
            onClick={() => navigate('/emergency')}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            <HelpCircle className="h-3 w-3" />
            Guide des urgences
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </motion.div>
      <SectionHeader label="Spécialités" title="Services de santé" actionLabel="Tout voir" onAction={() => navigate('/search')} />
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {healthServices.map((s, i) => (
            <button
              key={i}
              onClick={() => navigate(s.path)}
              className="flex-shrink-0 w-[140px] snap-start active:scale-[0.97] transition-transform"
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

      {/* 6. Annonces médicales */}
      <SectionHeader label="Actualités" title="Annonces médicales" actionLabel="Voir tout" onAction={() => navigate('/annonces')} />
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        {ads.map((ad, i) => (
          <button
            key={i}
            onClick={() => navigate('/ads')}
            className="rounded-xl bg-card border border-border shadow-sm p-3.5 text-left active:scale-[0.97] transition-transform flex flex-col justify-between min-h-[100px]"
          >
            <span className={`self-start text-[9px] font-bold px-2 py-0.5 rounded-full ${
              ad.isPrimary ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {ad.tag}
            </span>
            <div className="mt-auto space-y-1">
              <p className="text-foreground font-medium text-[13px] leading-tight line-clamp-2">{ad.title}</p>
              <p className="text-muted-foreground text-[10px]">{ad.provider}</p>
            </div>
          </button>
        ))}
      </motion.div>

      {/* 7. Recherche médicale */}
      <SectionHeader label="Publications" title="Recherche médicale" actionLabel="Explorer" onAction={() => navigate('/research')} />
      <motion.div variants={fadeUp} className="rounded-xl bg-card border border-border shadow-sm overflow-hidden divide-y divide-border">
        {articles.map((article, i) => (
          <button
            key={i}
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
                  <TrendingUp className="h-2.5 w-2.5" /> {article.reads} lectures
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
          </button>
        ))}
      </motion.div>

      {/* 8. Communauté */}
      <SectionHeader label="Discussions" title="Communauté" actionLabel="Rejoindre" onAction={() => navigate('/community')} />
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        {communityPosts.map((post, i) => (
          <button
            key={i}
            onClick={() => navigate('/community')}
            className="rounded-xl bg-card border border-border shadow-sm p-3.5 text-left active:scale-[0.97] transition-transform flex flex-col justify-between min-h-[100px]"
          >
            <span className={`self-start text-[9px] font-semibold border px-2 py-0.5 rounded-full ${
              post.isPrimary ? 'border-primary text-primary' : 'border-border text-muted-foreground'
            }`}>
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

      {/* 8.5. Entraide citoyenne */}
      <SectionHeader label="Solidarité" title="Entraide citoyenne" actionLabel="Voir tout" onAction={() => navigate('/citizen/provide')} />
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {entraideItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="flex-shrink-0 w-[140px] snap-start active:scale-[0.97] transition-transform"
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

      {/* 9. Accès rapide */}
      <SectionHeader label="Navigation" title="Accès rapide" />
      <motion.div variants={fadeUp} className="space-y-2.5">
        {quickAccess.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className={`w-full rounded-xl bg-card border border-border border-l-4 ${
              item.isPrimary ? 'border-l-primary' : 'border-l-muted-foreground/30'
            } shadow-sm p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform`}
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
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-xs font-medium text-primary flex items-center gap-0.5 pb-0.5">
          {actionLabel} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}
