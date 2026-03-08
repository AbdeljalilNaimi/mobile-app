import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Siren, Droplets,
  CalendarDays, Heart, MessageSquare, Stethoscope,
  ChevronRight, Star, ArrowRight,
  Bot, Pill, Activity, BookOpen, Megaphone,
  Users, Clock, Flame, TrendingUp, Bell,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks/useNotifications';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [.22, 1, .36, 1] } },
};

/* ── Quick-action items ── */
const quickActions = [
  { icon: Search, label: 'Chercher', path: '/search', gradient: 'from-teal-500 to-cyan-400' },
  { icon: MapPin, label: 'Carte', path: '/map/providers', gradient: 'from-amber-500 to-orange-400' },
  { icon: Siren, label: 'Urgences', path: '/map/emergency', gradient: 'from-rose-500 to-pink-400' },
  { icon: CalendarDays, label: 'RDV', path: '/citizen/appointments', gradient: 'from-indigo-500 to-violet-400' },
];

/* ── Health services horizontal scroll ── */
const healthServices = [
  { title: 'Pharmacies de garde', subtitle: 'Ouvertes maintenant', icon: Pill, gradient: 'from-emerald-600 to-teal-500', path: '/search' },
  { title: 'Cardiologie', subtitle: '12 spécialistes', icon: Activity, gradient: 'from-rose-600 to-amber-500', path: '/search' },
  { title: 'Pédiatrie', subtitle: '8 médecins', icon: Stethoscope, gradient: 'from-sky-600 to-indigo-500', path: '/search' },
  { title: 'Ophtalmologie', subtitle: '6 médecins', icon: Star, gradient: 'from-violet-600 to-purple-500', path: '/search' },
];

/* ── Community highlights ── */
const communityHighlights = [
  { title: 'Conseils post-opératoires', category: 'Expérience', comments: 12 },
  { title: 'Meilleur pédiatre à SBA ?', category: 'Question', comments: 24 },
  { title: 'Nouveau centre IRM ouvert', category: 'Info', comments: 8 },
];

export const MobileHomeScreen = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Visiteur';

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-2 pb-6 space-y-6"
    >
      {/* ── 1. Greeting ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-[11px]">Bienvenue sur CityHealth</p>
          <h2 className="text-xl font-bold text-foreground">
            Bonjour 👋 <span className="text-primary">{displayName}</span>
          </h2>
        </div>
        <button onClick={() => navigate('/settings')} className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
        </button>
      </motion.div>

      {/* ── 2. Search bar ── */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate('/search')}
        className="w-full flex items-center gap-3 rounded-2xl bg-card border border-border/60 px-4 py-3 active:scale-[0.98] transition-transform"
      >
        <Search className="h-4.5 w-4.5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Rechercher un médecin, spécialité…</span>
      </motion.button>

      {/* ── 3. Quick actions ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-md`}>
              <a.icon className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-medium text-foreground">{a.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── 4. Blood Donation CTA ── */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate('/blood-donation')}
        className="w-full rounded-2xl bg-gradient-to-br from-rose-600 to-red-500 p-4 text-left shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Droplets className="h-5.5 w-5.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Don de sang</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
                <Flame className="h-2.5 w-2.5" /> Urgent
              </span>
            </div>
            <p className="text-white/70 text-xs mt-0.5">Sauvez des vies — trouvez un centre de don près de vous</p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/60 flex-shrink-0" />
        </div>
      </motion.button>

      {/* ── 5. Health Services — Horizontal Scroll ── */}
      <SectionHeader title="Services de santé" actionLabel="Tout voir" onAction={() => navigate('/search')} />
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {healthServices.map((s, i) => (
            <button
              key={i}
              onClick={() => navigate(s.path)}
              className="flex-shrink-0 w-[140px] snap-start active:scale-[0.97] transition-transform"
            >
              <div className={`rounded-2xl bg-gradient-to-br ${s.gradient} p-3.5 h-full flex flex-col justify-between min-h-[130px]`}>
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <div className="mt-auto space-y-0.5">
                  <p className="text-white font-semibold text-[11px] leading-tight">{s.title}</p>
                  <p className="text-white/60 text-[10px]">{s.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── 6. Annonces médicales — Horizontal Scroll ── */}
      <SectionHeader title="Annonces médicales" actionLabel="Voir tout" onAction={() => navigate('/ads')} icon={Megaphone} />
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {[
            { title: 'Consultation gratuite', provider: 'Dr. Benali', tag: 'Promo', gradient: 'from-teal-600 to-cyan-500' },
            { title: 'Journée dépistage diabète', provider: 'Clinique El-Afia', tag: 'Événement', gradient: 'from-amber-600 to-orange-500' },
            { title: 'Nouveau scanner IRM', provider: 'Centre Imagerie', tag: 'Nouveau', gradient: 'from-indigo-600 to-blue-500' },
          ].map((ad, i) => (
            <button
              key={i}
              onClick={() => navigate('/ads')}
              className="flex-shrink-0 w-[200px] snap-start active:scale-[0.97] transition-transform"
            >
              <div className={`rounded-2xl bg-gradient-to-br ${ad.gradient} p-4 min-h-[110px] flex flex-col justify-between`}>
                <span className="self-start text-[9px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {ad.tag}
                </span>
                <div className="mt-auto space-y-1">
                  <p className="text-white font-semibold text-xs leading-tight">{ad.title}</p>
                  <p className="text-white/60 text-[10px]">{ad.provider}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── 7. Research Hub ── */}
      <SectionHeader title="Recherche médicale" actionLabel="Explorer" onAction={() => navigate('/research')} icon={BookOpen} />
      <motion.div variants={fadeUp} className="space-y-2.5">
        {[
          { title: 'Impact du diabète de type 2 en Algérie', author: 'Dr. Merah', reads: 142 },
          { title: 'Nouvelles approches en cardiologie préventive', author: 'Pr. Khelif', reads: 89 },
        ].map((article, i) => (
          <button
            key={i}
            onClick={() => navigate('/research')}
            className="w-full rounded-xl bg-card border border-border/60 p-3.5 flex items-start gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{article.title}</p>
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

      {/* ── 8. Community ── */}
      <SectionHeader title="Communauté" actionLabel="Rejoindre" onAction={() => navigate('/community')} icon={Users} />
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {communityHighlights.map((post, i) => (
            <button
              key={i}
              onClick={() => navigate('/community')}
              className="flex-shrink-0 w-[200px] snap-start active:scale-[0.97] transition-transform"
            >
              <div className="rounded-2xl bg-card border border-border/60 p-4 min-h-[100px] flex flex-col justify-between">
                <span className="self-start text-[9px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {post.category}
                </span>
                <div className="mt-auto space-y-1.5">
                  <p className="text-foreground font-semibold text-xs leading-tight line-clamp-2">{post.title}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-[10px]">{post.comments} commentaires</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── 9. Quick access grid ── */}
      <SectionHeader title="Accès rapide" />
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <QuickCard icon={Bot} title="Assistant IA" subtitle="Posez vos questions" gradient="from-indigo-600/90 to-rose-500/90" onClick={() => navigate('/medical-assistant')} />
        <QuickCard icon={Heart} title="Favoris" subtitle="Médecins sauvegardés" gradient="from-rose-600/90 to-pink-500/90" onClick={() => navigate('/favorites')} />
      </motion.div>

      {/* ── 10. Continue section ── */}
      {user && (
        <motion.button
          variants={fadeUp}
          onClick={() => navigate('/citizen/dashboard')}
          className="w-full rounded-xl bg-card border border-border/60 p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Tableau de bord</p>
            <p className="text-xs text-muted-foreground truncate">Continuer vers votre espace patient</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.button>
      )}
    </motion.div>
  );
};

/* ── Section header component ── */
function SectionHeader({ title, actionLabel, onAction, icon: Icon }: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}) {
  return (
    <motion.div variants={fadeUp} className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-xs font-medium text-primary flex items-center gap-0.5">
          {actionLabel} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}

/* ── Quick card component ── */
function QuickCard({ icon: Icon, title, subtitle, gradient, onClick }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl bg-gradient-to-br ${gradient} p-4 text-left active:scale-[0.97] transition-transform min-h-[100px] flex flex-col justify-between`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Icon className="h-4 w-4 text-white" strokeWidth={2} />
      </div>
      <div className="mt-auto space-y-0.5">
        <p className="text-white font-semibold text-sm leading-tight">{title}</p>
        <p className="text-white/60 text-[10px]">{subtitle}</p>
      </div>
    </button>
  );
}
