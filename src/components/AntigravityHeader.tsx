import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Shield, Heart, LayoutDashboard, Users, Globe, Check, Stethoscope, Search, Map, Siren, Bot, Droplets, UserPlus, BookOpen, Mail, LogOut, MessageSquare, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const AntigravityHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, profile, isProvider, isAdmin, isCitizen } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change — use location.pathname instead of navigate
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const servicesLinks: { label: string; href: string; icon: LucideIcon }[] = [
    { label: t('footer', 'searchDoctors'), href: '/search', icon: Search },
    { label: t('footer', 'interactiveMap'), href: '/map/providers', icon: Map },
    { label: t('footer', 'emergency247'), href: '/map/emergency', icon: Siren },
    { label: t('footer', 'aiAssistant'), href: '/medical-assistant', icon: Bot },
    { label: t('footer', 'bloodDonation'), href: '/blood-donation', icon: Droplets },
    { label: t('offers', 'freeDonations'), href: '/citizen/provide', icon: Heart },
  ];

  const resourcesLinks: { label: string; href: string; icon: LucideIcon }[] = [
    { label: t('community', 'headerLink'), href: '/community', icon: MessageSquare },
    { label: t('footer', 'documentation'), href: '/docs', icon: BookOpen },
    { label: t('footer', 'contact'), href: '/contact', icon: Mail },
  ];

  const providerLinks: { label: string; href: string; icon: LucideIcon }[] = [
    { label: t('footer', 'becomePartner'), href: '/provider/register', icon: UserPlus },
    { label: t('footer', 'providerDashboard'), href: '/provider/dashboard', icon: LayoutDashboard },
  ];

  const languages = [
    { code: 'fr', name: 'FR', fullName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'AR', fullName: 'العربية', flag: '🇩🇿' },
    { code: 'en', name: 'EN', fullName: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-lg shadow-md border-b border-border/50' 
          : 'bg-background/50 backdrop-blur-sm'
      }`}
      role="banner"
    >
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" showText={true} showOnlineIndicator={true} />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation">
            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {t('footer', 'services')}
                  <ChevronDown className="h-4 w-4 rtl-flip" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-popover/95 backdrop-blur-lg">
                {servicesLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="cursor-pointer flex items-center gap-2">
                      <link.icon className="h-4 w-4 text-muted-foreground" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Providers Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {t('footer', 'professionals')}
                  <ChevronDown className="h-4 w-4 rtl-flip" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-popover/95 backdrop-blur-lg">
                {providerLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="cursor-pointer flex items-center gap-2">
                      <link.icon className="h-4 w-4 text-muted-foreground" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {t('footer', 'resources')}
                  <ChevronDown className="h-4 w-4 rtl-flip" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-popover/95 backdrop-blur-lg">
                {resourcesLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="cursor-pointer flex items-center gap-2">
                      <link.icon className="h-4 w-4 text-muted-foreground" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Emergency */}
            <Link 
              to="/map/emergency"
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              {t('nav', 'emergency')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Selector - hidden on mobile, shown in sheet */}
            <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-primary/5 border border-border/50 hover:border-primary/30 transition-all duration-300 group/lang focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Globe className="h-4 w-4 text-muted-foreground group-hover/lang:text-primary transition-colors" />
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">{currentLang.flag}</span>
                    <span className="hidden sm:inline text-foreground/80 group-hover/lang:text-foreground transition-colors">{currentLang.name}</span>
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover/lang:text-primary transition-all duration-300 group-hover/lang:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-lg border-border/50 min-w-[160px]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`cursor-pointer flex items-center gap-3 py-2.5 ${language === lang.code ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.fullName}</span>
                    {language === lang.code && <Check className="h-4 w-4 ml-auto text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            {/* Auth Section - hidden on mobile */}
            <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{user.email?.[0]?.toUpperCase()}</span>
                    </div>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-popover/95 backdrop-blur-lg">
                  <div className="px-3 py-2.5 border-b border-border/50 mb-1">
                    <p className="text-sm font-medium truncate">{profile?.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                          <Shield className="h-3 w-3" />{t('roles', 'administrator')}
                        </span>
                      )}
                      {isProvider && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                          <Stethoscope className="h-3 w-3" />{t('roles', 'practitioner')}
                        </span>
                      )}
                      {isCitizen && !isAdmin && !isProvider && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent/10 text-accent-foreground px-2 py-1 rounded-full">
                          <Users className="h-3 w-3" />{t('roles', 'citizen')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenuItem asChild>
                    <Link to={isAdmin ? '/admin/profile' : isProvider ? '/provider/profile' : '/profile'} className="cursor-pointer">
                      {t('header', 'profile')}
                    </Link>
                  </DropdownMenuItem>
                  
                  {isProvider && (
                    <DropdownMenuItem asChild>
                      <Link to="/provider/dashboard" className="cursor-pointer flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />{t('footer', 'providerDashboard')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer flex items-center gap-2">
                        <Shield className="h-4 w-4" />{t('footer', 'administration')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {isCitizen && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/favorites" className="cursor-pointer flex items-center gap-2">
                          <Heart className="h-4 w-4" />{t('footer', 'myFavorites')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/citizen/dashboard" className="cursor-pointer flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />{t('footer', 'dashboard')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    {t('header', 'logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/citizen/login')}>
                {t('header', 'signin')}
              </Button>
            )}
            </div>

            {/* CTA Button - hidden on mobile */}
            <Button
              onClick={() => navigate('/search')}
              className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              {t('footer', 'findDoctor')}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t('footer', 'openMenu')}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Sheet Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="right" className="w-80 p-0">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
              <SheetTitle className="flex items-center gap-3">
                <Logo size="sm" showText={true} />
              </SheetTitle>
            </SheetHeader>
            
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="py-4">
                {/* Services */}
                <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('footer', 'services')}
                </div>
                {servicesLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 px-6 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}

                <Separator className="my-3" />

                {/* Professionals */}
                <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('footer', 'professionals')}
                </div>
                {providerLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 px-6 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}

                <Separator className="my-3" />

                {/* Resources */}
                <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('footer', 'resources')}
                </div>
                {resourcesLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 px-6 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}

                <Separator className="my-3" />

                {/* Emergency */}
                <Link
                  to="/map/emergency"
                  className="flex items-center gap-3 px-6 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Siren className="h-4 w-4" />
                  🚨 {t('nav', 'emergency')} 24/7
                </Link>

                <Separator className="my-3" />

                {/* Language selector */}
                <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  Langue / Language
                </div>
                <div className="px-4 flex gap-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                        language === lang.code
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted/50 text-foreground/70'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>

                <Separator className="my-3" />

                {/* Auth section */}
                {user ? (
                  <div className="px-6 space-y-1">
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{user.email?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{profile?.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      to={isAdmin ? '/admin/profile' : isProvider ? '/provider/profile' : '/profile'}
                      className="flex items-center gap-3 px-2 py-2.5 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {t('header', 'profile')}
                    </Link>

                    {isProvider && (
                      <Link
                        to="/provider/dashboard"
                        className="flex items-center gap-3 px-2 py-2.5 text-sm text-primary font-medium hover:bg-muted/50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Stethoscope className="h-4 w-4" />
                        {t('footer', 'providerDashboard')}
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-2 py-2.5 text-sm text-destructive font-medium hover:bg-muted/50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        {t('footer', 'administration')}
                      </Link>
                    )}

                    {isCitizen && (
                      <>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-3 px-2 py-2.5 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          {t('footer', 'myFavorites')}
                        </Link>
                        <Link
                          to="/citizen/dashboard"
                          className="flex items-center gap-3 px-2 py-2.5 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                          {t('footer', 'dashboard')}
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-2 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('header', 'logout')}
                    </button>
                  </div>
                ) : (
                  <div className="px-6 space-y-2">
                    <Button
                      onClick={() => { navigate('/citizen/login'); setIsMobileMenuOpen(false); }}
                      className="w-full"
                    >
                      {t('header', 'signin')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/search'); setIsMobileMenuOpen(false); }}
                      className="w-full"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {t('footer', 'findDoctor')}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
