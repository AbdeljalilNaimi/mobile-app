import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const languageOptions = [
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
  { code: 'ar' as const, label: 'العربية', flag: '🇩🇿' },
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
];

export default function SettingsPage() {
  
  const { profile, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
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
      toast.success(t('settingsPage', 'logoutSuccess'));
    } catch {
      toast.error(t('settingsPage', 'logoutError'));
    }
  };

  const currentLangOption = languageOptions.find(l => l.code === language) || languageOptions[0];

  const languagePicker = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50">
          <span>{currentLangOption.flag}</span>
          <span>{currentLangOption.label}</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languageOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.code}
            onClick={() => {
              setLanguage(opt.code);
              toast.success(`${t('settingsPage', 'language')} : ${opt.label}`);
            }}
            className={cn(
              'flex items-center gap-2.5 cursor-pointer',
              language === opt.code && 'bg-primary/10 text-primary font-medium'
            )}
          >
            <span className="text-base">{opt.flag}</span>
            <span>{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const groups: SettingsGroup[] = [
    ...(isAuthenticated ? [{
      title: t('settingsPage', 'account'),
      items: [
        { icon: User, label: t('settingsPage', 'myProfile'), onClick: () => navigate('/profile'), iconColor: 'text-blue-500 bg-blue-500/10' },
        { icon: Lock, label: t('settingsPage', 'changePassword'), onClick: () => setPasswordDialogOpen(true), iconColor: 'text-slate-500 bg-slate-500/10' },
        { icon: LogOut, label: t('settingsPage', 'logout'), onClick: handleLogout, destructive: true },
      ],
    }] : []),
    ...(isAuthenticated ? [{
      title: t('settingsPage', 'notifications'),
      items: [
        { icon: Calendar, label: t('settingsPage', 'appointmentsNotif'), description: t('settingsPage', 'appointmentsNotifDesc'), rightElement: <Switch checked={prefs.appointments} onCheckedChange={(v) => updatePref('appointments', v)} />, iconColor: 'text-indigo-500 bg-indigo-500/10' },
        { icon: Droplet, label: t('settingsPage', 'bloodEmergencies'), description: t('settingsPage', 'bloodEmergenciesDesc'), rightElement: <Switch checked={prefs.blood_emergencies} onCheckedChange={(v) => updatePref('blood_emergencies', v)} />, iconColor: 'text-red-500 bg-red-500/10' },
        { icon: MessageSquare, label: t('settingsPage', 'messages'), description: t('settingsPage', 'messagesDesc'), rightElement: <Switch checked={prefs.messages} onCheckedChange={(v) => updatePref('messages', v)} />, iconColor: 'text-green-500 bg-green-500/10' },
      ],
    },
    {
      title: t('settingsPage', 'healthServices'),
      items: [
        { icon: ShieldCheck, label: t('settingsPage', 'emergencyCard'), onClick: () => navigate('/profile'), iconColor: 'text-teal-500 bg-teal-500/10' },
        { icon: Droplet, label: t('settingsPage', 'bloodDonation'), onClick: () => navigate('/blood-donation'), iconColor: 'text-rose-500 bg-rose-500/10' },
      ],
    }] : []),
    {
      title: t('settingsPage', 'preferences'),
      items: [
        { icon: Globe, label: t('settingsPage', 'language'), rightElement: languagePicker, iconColor: 'text-amber-500 bg-amber-500/10' },
        { icon: Moon, label: t('settingsPage', 'darkMode'), rightElement: <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />, iconColor: 'text-violet-500 bg-violet-500/10' },
      ],
    },
    {
      title: t('settingsPage', 'resources'),
      items: [
        { icon: Lightbulb, label: t('settingsPage', 'howItWorks'), onClick: () => window.open('https://cityhealth-dz.lovable.app/docs', '_blank'), external: true, iconColor: 'text-yellow-500 bg-yellow-500/10' },
        { icon: Heart, label: t('settingsPage', 'whyCityHealth'), onClick: () => window.open('https://cityhealth-dz.lovable.app/research', '_blank'), external: true, iconColor: 'text-pink-500 bg-pink-500/10' },
        { icon: HelpCircle, label: t('settingsPage', 'faq'), onClick: () => window.open('https://cityhealth-dz.lovable.app/faq', '_blank'), external: true, iconColor: 'text-sky-500 bg-sky-500/10' },
        { icon: BookOpen, label: t('settingsPage', 'documentation'), onClick: () => window.open('https://cityhealth-dz.lovable.app/docs', '_blank'), external: true, iconColor: 'text-emerald-500 bg-emerald-500/10' },
        { icon: Code, label: t('settingsPage', 'developerSpace'), onClick: () => window.open('https://cityhealth-dz.lovable.app/developers', '_blank'), external: true, iconColor: 'text-orange-500 bg-orange-500/10' },
      ],
    },
    {
      title: t('settingsPage', 'legal'),
      items: [
        { icon: FileText, label: t('settingsPage', 'termsOfUse'), onClick: () => window.open('https://cityhealth-dz.lovable.app/terms', '_blank'), external: true, iconColor: 'text-slate-500 bg-slate-500/10' },
        { icon: FileText, label: t('settingsPage', 'privacyPolicy'), onClick: () => window.open('https://cityhealth-dz.lovable.app/privacy', '_blank'), external: true, iconColor: 'text-slate-500 bg-slate-500/10' },
      ],
    },
    {
      title: t('settingsPage', 'about'),
      items: [
        { icon: ExternalLink, label: t('settingsPage', 'visitWebsite'), description: 'cityhealth-dz.lovable.app', onClick: () => window.open('https://cityhealth-dz.lovable.app/', '_blank'), external: true, iconColor: 'text-primary bg-primary/10' },
        { icon: Info, label: t('settingsPage', 'appVersion'), description: 'v2.4.0', iconColor: 'text-gray-400 bg-gray-400/10' },
        { icon: HelpCircle, label: t('settingsPage', 'helpCenter'), onClick: () => window.open('https://cityhealth-dz.lovable.app/faq', '_blank'), external: true, iconColor: 'text-sky-500 bg-sky-500/10' },
        { icon: MessageSquare, label: t('settingsPage', 'contactSupport'), onClick: () => navigate('/contact'), iconColor: 'text-blue-500 bg-blue-500/10' },
        { icon: Bug, label: t('settingsPage', 'reportBug'), onClick: () => toast.info(t('settingsPage', 'reportBugMsg')), iconColor: 'text-orange-500 bg-orange-500/10' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-5 py-4">
          <h1 className="text-lg font-semibold text-foreground">{t('settingsPage', 'title')}</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Profile Card */}
        {isAuthenticated ? (
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
                {profile?.full_name || t('settingsPage', 'myProfile')}
              </p>
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
              {profile?.verification_status === 'verified' && (
                <Badge variant="secondary" className="mt-1 text-xs bg-emerald-500/10 text-emerald-600 border-0">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {t('settingsPage', 'verified')}
                </Badge>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm"
          >
            <Avatar className="h-14 w-14 border-2 border-muted">
              <AvatarFallback className="text-lg font-semibold bg-muted text-muted-foreground">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{t('settingsPage', 'visitor')}</p>
              <p className="text-sm text-muted-foreground">{t('settingsPage', 'notConnected')}</p>
            </div>
            <button
              onClick={() => navigate('/citizen/login')}
              className="text-sm font-medium text-primary hover:underline shrink-0"
            >
              {t('settingsPage', 'signIn')}
            </button>
          </motion.div>
        )}

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