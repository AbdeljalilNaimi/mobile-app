import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Siren, Droplets,
  CalendarDays, ChevronRight, Bot, Pill, Activity,
  BookOpen, Megaphone, Users, Clock, Heart,
  Bell, SlidersHorizontal, Stethoscope, Star,
  MessageSquare, TrendingUp, LayoutGrid,
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
  { icon: MapPin, label: 'Carte', path: '/map/providers' },
  { icon: Siren, label: 'Urgences', path: '/map/emergency' },
  { icon: CalendarDays, label: 'RDV', path: '/citizen/appointments' },
];

const healthServices = [
  { title: 'Pharmacies de garde', subtitle: 'Ouvertes maintenant', icon: Pill, path: '/search' },
  { title: 'Cardiologie', subtitle: '12 spécialistes', icon: Activity, path: '/search' },
  { title: 'Pédiatrie', subtitle: '8 médecins', icon: Stethoscope, path: '/search' },
  { title: 'Ophtalmologie', subtitle: '6 médecins', icon: Star, path: '/search' },
];

const ads = [
  { title: 'Consultation gratuite', provider: 'Dr. Benali', tag: 'Promo', tagStyle: 'bg-[#1D4ED8]/10 text-[#1D4ED8]' },
  { title: 'Journée dépistage diabète', provider: 'Clinique El-Afia', tag: 'Événement', tagStyle: 'bg-[#9CA3AF]/15 text-[#6B7280]' },
  { title: 'Nouveau scanner IRM', provider: 'Centre Imagerie', tag: 'Nouveau', tagStyle: 'bg-[#1D4ED8]/10 text-[#1D4ED8]' },
  { title: 'Bilan de santé complet', provider: 'Polyclinique Saada', tag: 'Promo', tagStyle: 'bg-[#1D4ED8]/10 text-[#1D4ED8]' },
];

const articles = [
  { title: 'Impact du diabète de type 2 en Algérie', author: 'Dr. Merah', reads: 142 },
  { title: 'Nouvelles approches en cardiologie préventive', author: 'Pr. Khelif', reads: 89 },
];

const communityPosts = [
  { title: 'Conseils post-opératoires', category: 'Expérience', comments: 12, outline: 'border-[#1D4ED8] text-[#1D4ED8]' },
  { title: 'Meilleur pédiatre à SBA ?', category: 'Question', comments: 24, outline: 'border-[#9CA3AF] text-[#6B7280]' },
  { title: 'Nouveau centre IRM ouvert', category: 'Info', comments: 8, outline: 'border-[#9CA3AF] text-[#6B7280]' },
  { title: 'Expérience chirurgie laser', category: 'Expérience', comments: 15, outline: 'border-[#1D4ED8] text-[#1D4ED8]' },
];

const quickAccess = [
  { icon: Bot, title: 'Assistant IA', subtitle: 'Posez vos questions', borderColor: 'border-l-[#1D4ED8]', path: '/medical-assistant' },
  { icon: Heart, title: 'Favoris', subtitle: 'Médecins sauvegardés', borderColor: 'border-l-[#9CA3AF]', path: '/favorites' },
  { icon: LayoutGrid, title: 'Tableau de bord', subtitle: 'Votre espace patient', borderColor: 'border-l-[#9CA3AF]', path: '/citizen/dashboard' },
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
      className="bg-[#F8F9FA] min-h-screen px-4 pb-20 space-y-6"
    >
      {/* 1. Header */}
      <motion.div variants={fadeUp} className="-mx-4 px-4 pt-3 pb-4 bg-gradient-to-r from-[#F0F4FF] to-[#F0FAFA]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#9CA3AF] italic">Bienvenue sur CityHealth</p>
            <h2 className="text-2xl font-extrabold text-[#111827]">
              {greeting} 👋 <span className="text-[#1D4ED8]">{displayName}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-[#6B7280]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isGuest ? (
              <button
                onClick={() => navigate('/auth')}
                className="bg-[#1D4ED8] text-white rounded-full px-4 py-2 text-xs font-semibold active:scale-95 transition-transform"
              >
                Se connecter
              </button>
            ) : (
              <button onClick={() => navigate('/citizen/profile')} className="relative">
                <Avatar className="h-11 w-11 ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#F0F4FF] shadow-lg">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-[#1D4ED8]/10 text-[#1D4ED8] font-semibold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#F0F4FF]" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. Search bar */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate('/search')}
        className="w-full flex items-center gap-3 rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 shadow-sm active:scale-[0.98] transition-transform"
      >
        <Search className="h-4 w-4 text-[#9CA3AF]" />
        <span className="text-sm text-[#9CA3AF] flex-1 text-left">Rechercher un médecin, spécialité, ville…</span>
        <SlidersHorizontal className="h-4 w-4 text-[#9CA3AF]" />
      </motion.button>

      {/* 3. Quick actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center">
              <a.icon className="h-5 w-5 text-[#1D4ED8]" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-medium text-[#111827]">{a.label}</span>
          </button>
        ))}
      </motion.div>

      {/* 4. Urgent banner */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate('/blood-donation')}
        className="w-full rounded-xl bg-white border border-[#E5E7EB] border-l-4 border-l-red-500 shadow-sm p-4 text-left active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <Droplets className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#111827]">Don de sang</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                URGENT
              </span>
            </div>
            <p className="text-[#6B7280] text-xs mt-0.5">Trouvez un centre de don près de vous</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
        </div>
      </motion.button>

      {/* 5. Services de santé */}
      <SectionHeader label="Spécialités" title="Services de santé" actionLabel="Tout voir" onAction={() => navigate('/search')} />
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {healthServices.map((s, i) => (
            <button
              key={i}
              onClick={() => navigate(s.path)}
              className="flex-shrink-0 w-[140px] snap-start active:scale-[0.97] transition-transform"
            >
              <div className="rounded-xl bg-white border border-[#E5E7EB] shadow-sm p-3.5 h-full flex flex-col justify-between min-h-[120px]">
                <div className="w-9 h-9 rounded-lg bg-[#1D4ED8]/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-[#1D4ED8]" strokeWidth={2} />
                </div>
                <div className="mt-auto space-y-0.5">
                  <p className="text-[#111827] font-semibold text-[11px] leading-tight">{s.title}</p>
                  <p className="text-[#9CA3AF] text-[10px]">{s.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 6. Annonces médicales */}
      <SectionHeader label="Actualités" title="Annonces médicales" actionLabel="Voir tout" onAction={() => navigate('/ads')} />
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        {ads.map((ad, i) => (
          <button
            key={i}
            onClick={() => navigate('/ads')}
            className="rounded-xl bg-white border border-[#E5E7EB] shadow-sm p-3.5 text-left active:scale-[0.97] transition-transform flex flex-col justify-between min-h-[100px]"
          >
            <span className={`self-start text-[9px] font-bold px-2 py-0.5 rounded-full ${ad.tagStyle}`}>
              {ad.tag}
            </span>
            <div className="mt-auto space-y-1">
              <p className="text-[#111827] font-medium text-[13px] leading-tight line-clamp-2">{ad.title}</p>
              <p className="text-[#9CA3AF] text-[10px]">{ad.provider}</p>
            </div>
          </button>
        ))}
      </motion.div>

      {/* 7. Recherche médicale */}
      <SectionHeader label="Publications" title="Recherche médicale" actionLabel="Explorer" onAction={() => navigate('/research')} />
      <motion.div variants={fadeUp} className="rounded-xl bg-white border border-[#E5E7EB] shadow-sm overflow-hidden divide-y divide-[#E5E7EB]">
        {articles.map((article, i) => (
          <button
            key={i}
            onClick={() => navigate('/research')}
            className="w-full p-3.5 flex items-start gap-3 text-left active:bg-[#F8F9FA] transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="h-4 w-4 text-[#6B7280]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#111827] leading-snug line-clamp-2">{article.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-[#9CA3AF]">{article.author}</span>
                <span className="text-[10px] text-[#9CA3AF] flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> {article.reads} lectures
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#9CA3AF] flex-shrink-0 mt-1" />
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
            className="rounded-xl bg-white border border-[#E5E7EB] shadow-sm p-3.5 text-left active:scale-[0.97] transition-transform flex flex-col justify-between min-h-[100px]"
          >
            <span className={`self-start text-[9px] font-semibold border px-2 py-0.5 rounded-full ${post.outline}`}>
              {post.category}
            </span>
            <div className="mt-auto space-y-1.5">
              <p className="text-[#111827] font-medium text-[13px] leading-tight line-clamp-2">{post.title}</p>
              <div className="flex items-center gap-1 text-[#9CA3AF]">
                <MessageSquare className="h-3 w-3" />
                <span className="text-[10px]">{post.comments}</span>
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* 9. Accès rapide */}
      <SectionHeader label="Navigation" title="Accès rapide" />
      <motion.div variants={fadeUp} className="space-y-2.5">
        {quickAccess.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className={`w-full rounded-xl bg-white border border-[#E5E7EB] border-l-4 ${item.borderColor} shadow-sm p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
              <item.icon className="h-5 w-5 text-[#6B7280]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
              <p className="text-xs text-[#9CA3AF]">{item.subtitle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
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
        <p className="text-[11px] uppercase tracking-widest text-[#9CA3AF] font-medium">{label}</p>
        <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-xs font-medium text-[#1D4ED8] flex items-center gap-0.5 pb-0.5">
          {actionLabel} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}
