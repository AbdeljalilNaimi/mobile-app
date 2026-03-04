import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Siren, Droplets,
  CalendarDays, Heart, MessageSquare, Stethoscope,
  ChevronRight, Star, Clock, ArrowRight,
  Bot, Users, Pill, Activity,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [.22,1,.36,1] } },
};

/* ── Quick‑action row items ── */
const quickActions = [
  { icon: Search, label: 'Chercher', path: '/search', gradient: 'from-teal-500 to-cyan-400' },
  { icon: MapPin, label: 'Carte', path: '/map/providers', gradient: 'from-amber-500 to-orange-400' },
  { icon: Siren, label: 'Urgences', path: '/map/emergency', gradient: 'from-rose-500 to-pink-400' },
  { icon: Droplets, label: 'Don sang', path: '/blood-donation', gradient: 'from-indigo-500 to-violet-400' },
];

/* ── Horizontal scroll recommendation cards ── */
const recommendations = [
  { title: 'Pharmacies de garde', subtitle: 'Ouvertes maintenant', icon: Pill, gradient: 'from-emerald-600/80 to-teal-500/80' },
  { title: 'Cardiologie', subtitle: '12 spécialistes', icon: Activity, gradient: 'from-rose-600/80 to-amber-500/80' },
  { title: 'Pédiatrie', subtitle: '8 médecins', icon: Stethoscope, gradient: 'from-sky-600/80 to-indigo-500/80' },
  { title: 'Communauté', subtitle: 'Nouveaux posts', icon: Users, gradient: 'from-amber-600/80 to-orange-500/80' },
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
      className="px-4 pt-2 pb-4 space-y-5"
    >
      {/* ── 1. Greeting header ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs">Bienvenue sur CityHealth</p>
          <h2 className="text-xl font-bold text-foreground">
            Bonjour 👋 <span className="text-primary">{displayName}</span>
          </h2>
        </div>
        <button onClick={() => navigate('/profile')} className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
        </button>
      </motion.div>

      {/* ── 2. Featured card ── */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate('/search')}
        className="w-full rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 p-5 text-left shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Star className="h-3 w-3" /> Recommandé
            </span>
            <h3 className="text-lg font-bold text-white leading-snug">
              Trouvez un médecin<br />près de chez vous
            </h3>
            <p className="text-white/70 text-xs leading-relaxed">
              +200 professionnels vérifiés à Sidi Bel Abbès
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mt-1">
            <Search className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-white/90 text-xs font-medium">
          Rechercher maintenant <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </motion.button>

      {/* ── 3. Quick actions row ── */}
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

      {/* ── 4. Continue where you left off ── */}
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
            <p className="text-sm font-semibold text-foreground">Continuer</p>
            <p className="text-xs text-muted-foreground truncate">Votre tableau de bord patient</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.button>
      )}

      {/* ── 5. Services section title ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Explorer</h3>
        <button onClick={() => navigate('/search')} className="text-xs font-medium text-primary flex items-center gap-1">
          Tout voir <ChevronRight className="h-3 w-3" />
        </button>
      </motion.div>

      {/* ── 6. Horizontal scroll recommendation cards ── */}
      <motion.div variants={fadeUp} className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {recommendations.map((r, i) => (
            <button
              key={i}
              onClick={() => navigate('/search')}
              className="flex-shrink-0 w-36 snap-start rounded-2xl bg-gradient-to-br p-4 text-left active:scale-[0.97] transition-transform"
              style={{ background: undefined }}
            >
              <div className={`rounded-2xl bg-gradient-to-br ${r.gradient} p-4 h-full flex flex-col justify-between min-h-[140px]`}>
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <r.icon className="h-4.5 w-4.5 text-white" strokeWidth={2} />
                </div>
                <div className="mt-auto space-y-0.5">
                  <p className="text-white font-semibold text-xs leading-tight">{r.title}</p>
                  <p className="text-white/70 text-[10px]">{r.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── 7. More services grid ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <ServiceCard
          icon={Bot}
          title="Assistant IA"
          subtitle="Posez vos questions santé"
          gradient="from-indigo-600/90 to-rose-500/90"
          onClick={() => navigate('/medical-assistant')}
        />
        <ServiceCard
          icon={Heart}
          title="Favoris"
          subtitle="Vos médecins sauvegardés"
          gradient="from-rose-600/90 to-pink-500/90"
          onClick={() => navigate('/favorites')}
        />
        <ServiceCard
          icon={CalendarDays}
          title="Rendez-vous"
          subtitle="Gérez vos consultations"
          gradient="from-teal-600/90 to-emerald-500/90"
          onClick={() => navigate('/citizen/appointments')}
        />
        <ServiceCard
          icon={MessageSquare}
          title="Communauté"
          subtitle="Échangez entre patients"
          gradient="from-amber-600/90 to-yellow-500/90"
          onClick={() => navigate('/community')}
        />
      </motion.div>
    </motion.div>
  );
};

/* ── Reusable small service card ── */
function ServiceCard({ icon: Icon, title, subtitle, gradient, onClick }: {
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
