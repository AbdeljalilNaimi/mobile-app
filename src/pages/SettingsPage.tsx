import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  User, Bell, Lock, LogOut, Globe, Moon, HelpCircle, MessageSquare,
  Bug, Info, FileText, ChevronRight, Droplet, Calendar, ShieldCheck,
  ExternalLink, BookOpen, Lightbulb, Code, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsItem {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  badge?: string;
  external?: boolean;
  iconColor?: string;
}

interface SettingsGroup {
  title: string;
  items: SettingsItem[];
}

export default function SettingsPage() {
  const { profile, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { prefs, updatePref } = useNotificationPreferences();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const languageLabel: Record<string, string> = { fr: 'Français', ar: 'العربية', en: 'English' };

  const cycleLanguage = () => {
    const langs = ['fr', 'ar', 'en'] as const;
    const idx = langs.indexOf(language as any);
    const next = langs[(idx + 1) % langs.length];
    setLanguage(next);
    toast.success(`Langue : ${languageLabel[next]}`);
  };

  const groups: SettingsGroup[] = [
    ...(isAuthenticated ? [{
      title: 'Compte',
      items: [
        { icon: User, label: 'Mon Profil', onClick: () => navigate('/profile'), iconColor: 'text-blue-500 bg-blue-500/10' },
        { icon: Lock, label: 'Changer le mot de passe', onClick: () => setPasswordDialogOpen(true), iconColor: 'text-slate-500 bg-slate-500/10' },
        { icon: LogOut, label: 'Se déconnecter', onClick: handleLogout, destructive: true },
      ],
    }] : []),
    {
      title: 'Notifications',
      items: [
        { icon: Calendar, label: 'Rendez-vous', description: 'Rappels et confirmations', rightElement: <Switch checked={prefs.appointments} onCheckedChange={(v) => updatePref('appointments', v)} />, iconColor: 'text-indigo-500 bg-indigo-500/10' },
        { icon: Droplet, label: 'Urgences sang', description: 'Alertes don de sang', rightElement: <Switch checked={prefs.blood_emergencies} onCheckedChange={(v) => updatePref('blood_emergencies', v)} />, iconColor: 'text-red-500 bg-red-500/10' },
        { icon: MessageSquare, label: 'Messages', description: 'Notifications de messages', rightElement: <Switch checked={prefs.messages} onCheckedChange={(v) => updatePref('messages', v)} />, iconColor: 'text-green-500 bg-green-500/10' },
      ],
    },
    {
      title: 'Services de santé',
      items: [
        { icon: ShieldCheck, label: 'Carte d\'urgence', onClick: () => navigate('/profile'), iconColor: 'text-teal-500 bg-teal-500/10' },
        { icon: Droplet, label: 'Don de sang', onClick: () => navigate('/blood-donation'), iconColor: 'text-rose-500 bg-rose-500/10' },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: Globe, label: 'Langue', description: languageLabel[language] || 'Français', onClick: cycleLanguage, iconColor: 'text-amber-500 bg-amber-500/10' },
        { icon: Moon, label: 'Mode sombre', rightElement: <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />, iconColor: 'text-violet-500 bg-violet-500/10' },
      ],
    },
    {
      title: 'Ressources',
      items: [
        { icon: Lightbulb, label: 'Comment ça marche', onClick: () => navigate('/docs/getting-started/how-it-works'), external: true, iconColor: 'text-yellow-500 bg-yellow-500/10' },
        { icon: Heart, label: 'Pourquoi CityHealth', onClick: () => navigate('/docs/getting-started/why-cityhealth'), external: true, iconColor: 'text-pink-500 bg-pink-500/10' },
        { icon: HelpCircle, label: 'FAQ', onClick: () => navigate('/faq'), external: true, iconColor: 'text-sky-500 bg-sky-500/10' },
        { icon: BookOpen, label: 'Documentation', onClick: () => navigate('/docs'), external: true, iconColor: 'text-emerald-500 bg-emerald-500/10' },
        { icon: Code, label: 'Espace développeurs', onClick: () => navigate('/developers'), external: true, iconColor: 'text-orange-500 bg-orange-500/10' },
      ],
    },
    {
      title: 'Légal',
      items: [
        { icon: FileText, label: 'Conditions d\'utilisation', onClick: () => navigate('/terms'), external: true, iconColor: 'text-slate-500 bg-slate-500/10' },
        { icon: FileText, label: 'Politique de confidentialité', onClick: () => navigate('/privacy'), external: true, iconColor: 'text-slate-500 bg-slate-500/10' },
      ],
    },
    {
      title: 'À propos',
      items: [
        { icon: Info, label: 'Version de l\'app', description: 'v2.4.0', iconColor: 'text-gray-400 bg-gray-400/10' },
        { icon: HelpCircle, label: 'Centre d\'aide', onClick: () => navigate('/faq'), iconColor: 'text-sky-500 bg-sky-500/10' },
        { icon: MessageSquare, label: 'Contacter le support', onClick: () => navigate('/contact'), iconColor: 'text-blue-500 bg-blue-500/10' },
        { icon: Bug, label: 'Signaler un bug', onClick: () => toast.info('Merci ! Envoyez un email à support@cityhealth.dz'), iconColor: 'text-orange-500 bg-orange-500/10' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-5 py-4">
          <h1 className="text-lg font-semibold text-foreground">Paramètres</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Profile Card */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm active:scale-[0.98] transition-transform text-left"
        >
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {profile?.full_name || 'Mon Profil'}
            </p>
            <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
            {profile?.verification_status === 'verified' && (
              <Badge variant="secondary" className="mt-1 text-xs bg-emerald-500/10 text-emerald-600 border-0">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Vérifié
              </Badge>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </motion.button>

        {/* Settings Groups */}
        {groups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (gi + 1) }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              {group.title}
            </p>
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              {group.items.map((item, ii) => {
                const Icon = item.icon;
                const isLast = ii === group.items.length - 1;
                const hasAction = !!item.onClick;

                const content = (
                  <div className={cn(
                    'flex items-center gap-3 px-4 py-3.5',
                    !isLast && 'border-b border-border/30',
                    hasAction && 'active:bg-muted/50 transition-colors',
                    item.destructive && 'text-destructive'
                  )}>
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      item.destructive
                        ? 'bg-destructive/10'
                        : item.iconColor || 'bg-primary/10'
                    )}>
                      <Icon className={cn(
                        'h-4 w-4',
                        item.destructive ? 'text-destructive' : item.iconColor?.split(' ')[0] || 'text-primary'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        item.destructive ? 'text-destructive' : 'text-foreground'
                      )}>
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                    )}
                    {item.rightElement ? (
                      <div onClick={e => e.stopPropagation()}>{item.rightElement}</div>
                    ) : item.external ? (
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : hasAction ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : null}
                  </div>
                );

                return hasAction ? (
                  <button key={ii} className="w-full text-left" onClick={item.onClick}>
                    {content}
                  </button>
                ) : (
                  <div key={ii}>{content}</div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </div>
  );
}
