import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sheet, SheetContent,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Home, Search, Map, Bot, FileText, UserCircle, Phone,
  Handshake, MessageSquare, Megaphone, Code2,
  ExternalLink, QrCode, LogIn, Droplets, BookOpen, CreditCard,
} from 'lucide-react';

interface SideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const appLinks = [
  { icon: Home, labelKey: 'drawerHome', path: '/' },
  { icon: Search, labelKey: 'drawerDoctors', path: '/search' },
  { icon: Map, labelKey: 'drawerMap', path: '/map' },
  { icon: Bot, labelKey: 'drawerAI', path: '/medical-assistant' },
  { icon: FileText, labelKey: 'drawerDocuments', path: '/service/documents' },
  { icon: UserCircle, labelKey: 'drawerProfile', path: '/profile' },
  { icon: Phone, labelKey: 'drawerContact', path: '/contact' },
];

const platformLinks = [
  { icon: Code2, labelKey: 'drawerAPI', path: '/service/api-developer' },
  { icon: BookOpen, labelKey: 'drawerArticles', path: '/service/articles-recherche' },
  { icon: Droplets, labelKey: 'drawerBlood', path: '/blood-donation' },
  { icon: Handshake, labelKey: 'drawerDonation', path: '/service/don-gratuit' },
  { icon: FileText, labelKey: 'drawerDocs', path: '/service/documents' },
  { icon: CreditCard, labelKey: 'drawerPricing', path: '/service/tarifs-providers' },
];

const drawerLabels: Record<string, Record<string, string>> = {
  fr: {
    services: 'Services',
    platform: 'Plateforme',
    drawerHome: 'Accueil',
    drawerDoctors: 'Doctors',
    drawerMap: 'Carte',
    drawerAI: 'AI Assistance',
    drawerDocuments: 'Documents',
    drawerProfile: 'Profile',
    drawerContact: 'Contactez-nous',
    drawerAPI: 'API Developer',
    drawerArticles: 'Articles & Recherche',
    drawerBlood: 'Don de Sang',
    drawerDonation: 'Don Gratuit',
    drawerDocs: 'Documents',
    drawerPricing: 'Tarifs Providers',
    visitPlatform: 'Visiter notre plateforme',
    guest: 'Visiteur',
    signIn: 'Se connecter',
    language: 'Langue',
  },
  en: {
    services: 'Services',
    platform: 'Platform',
    drawerHome: 'Home',
    drawerDoctors: 'Doctors',
    drawerMap: 'Map',
    drawerAI: 'AI Assistance',
    drawerDocuments: 'Documents',
    drawerProfile: 'Profile',
    drawerContact: 'Contact Us',
    drawerAPI: 'API Developer',
    drawerArticles: 'Articles & Research',
    drawerBlood: 'Blood Donation',
    drawerDonation: 'Free Donation',
    drawerDocs: 'Documents',
    drawerPricing: 'Provider Pricing',
    visitPlatform: 'Visit our platform',
    guest: 'Visitor',
    signIn: 'Sign in',
    language: 'Language',
  },
  ar: {
    services: 'الخدمات',
    platform: 'المنصة',
    drawerHome: 'الرئيسية',
    drawerDoctors: 'الأطباء',
    drawerMap: 'الخريطة',
    drawerAI: 'مساعد ذكي',
    drawerDocuments: 'الوثائق',
    drawerProfile: 'الملف الشخصي',
    drawerContact: 'اتصل بنا',
    drawerAPI: 'مطوّر API',
    drawerArticles: 'مقالات وأبحاث',
    drawerBlood: 'التبرع بالدم',
    drawerDonation: 'تبرع مجاني',
    drawerDocs: 'وثائق',
    drawerPricing: 'تعريفات المزودين',
    visitPlatform: 'زيارة منصتنا',
    guest: 'زائر',
    signIn: 'تسجيل الدخول',
    language: 'اللغة',
  },
};

export const SideDrawer = ({ open, onOpenChange }: SideDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { language, setLanguage } = useLanguage();

  const label = (key: string) => drawerLabels[language]?.[key] ?? drawerLabels.fr[key] ?? key;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const go = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || label('guest');
  const isGuest = !user;

  const langs = [
    { code: 'fr' as const, label: 'FR' },
    { code: 'en' as const, label: 'EN' },
    { code: 'ar' as const, label: 'AR' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0 bg-background border-none flex flex-col">
        {/* Profile Section */}
        <div className="px-5 pt-8 pb-5">
          {isGuest ? (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{label('guest')}</p>
                <button
                  onClick={() => go('/auth-gateway')}
                  className="flex items-center gap-1 text-sm font-semibold text-primary mt-0.5"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {label('signIn')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => go('/emergency-card')}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="QR Code"
              >
                <QrCode className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* App Services */}
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {label('services')}
            </p>
            <nav className="space-y-0.5">
              {appLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.8} />
                    {label(item.labelKey)}
                  </button>
                );
              })}
            </nav>
          </div>

          <Separator />

          {/* Platform Services */}
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {label('platform')}
            </p>
            <nav className="space-y-0.5">
              {platformLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.8} />
                    {label(item.labelKey)}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-5 pb-6 pt-3 space-y-4 border-t border-border">
          {/* Language Switcher */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {label('language')}
            </p>
            <div className="flex gap-1.5">
              {langs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    language === l.code
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visit Platform */}
          <a
            href="https://preview--cityhealth-dz.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            {label('visitPlatform')}
          </a>

          <p className="text-center text-[10px] text-muted-foreground">CityHealth v2.0</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
