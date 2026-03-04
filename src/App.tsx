import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProviderProvider } from "@/contexts/ProviderContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProviderRouteGuard } from "@/components/ProviderRouteGuard";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { CitizenGuard } from "@/components/guards/CitizenGuard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MobileAppShell } from "@/components/layout/MobileAppShell";

// Lazy-load heavy pages for better LCP
const AntigravityIndex = lazy(() => import("./pages/AntigravityIndex"));
const MapMother = lazy(() => import("./components/map/MapMother"));
const ProvidersMapChild = lazy(() => import("./components/map/children/ProvidersMapChild"));
const EmergencyMapChild = lazy(() => import("./components/map/children/EmergencyMapChild"));
const BloodMapChild = lazy(() => import("./components/map/children/BloodMapChild"));

import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded pages for code splitting
const CitizenLoginPage = lazy(() => import("./pages/CitizenLoginPage"));
const CitizenRegisterPage = lazy(() => import("./pages/CitizenRegisterPage"));
const ProviderLoginPage = lazy(() => import("./pages/ProviderLoginPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

const EmergencyPage = lazy(() => import("./pages/EmergencyPage"));
const ProviderProfilePage = lazy(() => import("./pages/ProviderProfilePage"));
const ProviderOwnProfilePage = lazy(() => import("./pages/ProviderOwnProfilePage"));
const ProviderRegister = lazy(() => import("./pages/ProviderRegister"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));

const RegistrationStatus = lazy(() => import("./pages/RegistrationStatus"));
const RegistrationThankYou = lazy(() => import("./pages/RegistrationThankYou"));
const MedicalAssistantPage = lazy(() => import("./pages/MedicalAssistantPage"));
const CitizenProfilePage = lazy(() => import("./pages/CitizenProfilePage"));
const BloodDonationPage = lazy(() => import("./pages/BloodDonationPage"));
const AdminMigratePage = lazy(() => import("./pages/AdminMigratePage"));
const AdminProfilePage = lazy(() => import("./pages/AdminProfilePage"));
const DocsPage = lazy(() => import("./pages/DocsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const EmergencyCardPublicPage = lazy(() => import("./pages/EmergencyCardPublicPage"));
const CitizenAppointmentsPage = lazy(() => import("./pages/citizen/appointments/CitizenAppointmentsPage"));
const AppointmentHistoryPage = lazy(() => import("./pages/citizen/appointments/AppointmentHistoryPage"));
const NewAppointmentPage = lazy(() => import("./pages/citizen/appointments/NewAppointmentPage"));
const ProvideListPage = lazy(() => import("./pages/citizen/provide/ProvideListPage"));
const MyOffersPage = lazy(() => import("./pages/citizen/provide/MyOffersPage"));
const CreateOfferPage = lazy(() => import("./pages/citizen/provide/CreateOfferPage"));
const EditOfferPage = lazy(() => import("./pages/citizen/provide/EditOfferPage"));
const DevToolsPage = lazy(() => import("./pages/DevToolsPage"));
const ProviderWelcomePage = lazy(() => import("./pages/ProviderWelcomePage"));
const AdsPage = lazy(() => import("./pages/AdsPage"));
const ResearchHubPage = lazy(() => import("./pages/ResearchHubPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const EmailVerifiedPage = lazy(() => import("./pages/EmailVerifiedPage"));
const DeveloperLandingPage = lazy(() => import("./pages/developers/DeveloperLandingPage"));
const DeveloperDashboardPage = lazy(() => import("./pages/developers/DeveloperDashboardPage"));
const DeveloperDocsPage = lazy(() => import("./pages/developers/DeveloperDocsPage"));
const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

// Verification redirect wrapper for providers
const VerificationGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const isPendingProvider = isAuthenticated && 
    profile?.userType === 'provider' && 
    profile?.verification_status === 'pending';
  
  const allowedPaths = ['/registration-status', '/provider/register', '/provider/login', '/citizen/login', '/admin/login', '/'];
  const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
  
  if (isPendingProvider && !isAllowedPath) {
    return <Navigate to="/registration-status" replace />;
  }
  
  return <>{children}</>;
};

// Smart redirect for legacy /carte route preserving query params
function CarteRedirect() {
  const [params] = useSearchParams();
  const mode = params.get('mode');
  const dest = mode === 'blood' ? '/map/blood'
             : mode === 'emergency' ? '/map/emergency'
             : '/map/providers';
  return <Navigate to={dest} replace />;
}

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ============================================ */}
        {/* MOBILE APP SHELL — bottom nav routes */}
        {/* ============================================ */}
        <Route element={<MobileAppShell />}>
          {/* Home */}
          <Route path="/" element={<AntigravityIndex />} />
          
          {/* Search */}
          <Route path="/search" element={
            <VerificationGuard><SearchPage /></VerificationGuard>
          } />
          
          {/* Medical Assistant (IA Chat tab) */}
          <Route path="/medical-assistant" element={<MedicalAssistantPage />} />
          
          {/* Profile & citizen pages */}
          <Route path="/profile" element={
            <CitizenGuard><CitizenProfilePage /></CitizenGuard>
          } />
          <Route path="/favorites" element={
            <CitizenGuard><FavoritesPage /></CitizenGuard>
          } />
          <Route path="/citizen/dashboard" element={
            <CitizenGuard><PatientDashboard /></CitizenGuard>
          } />
          <Route path="/citizen/appointments" element={
            <CitizenGuard><CitizenAppointmentsPage /></CitizenGuard>
          } />
          <Route path="/citizen/appointments/history" element={
            <CitizenGuard><AppointmentHistoryPage /></CitizenGuard>
          } />
          <Route path="/citizen/appointments/new" element={
            <CitizenGuard><NewAppointmentPage /></CitizenGuard>
          } />
          
          {/* Provide (community help) */}
          <Route path="/citizen/provide" element={<ProvideListPage />} />
          <Route path="/citizen/provide/mine" element={<ProviderRouteGuard><MyOffersPage /></ProviderRouteGuard>} />
          <Route path="/citizen/provide/new" element={<ProviderRouteGuard><CreateOfferPage /></ProviderRouteGuard>} />
          <Route path="/citizen/provide/edit/:offerId" element={<ProviderRouteGuard><EditOfferPage /></ProviderRouteGuard>} />
          
          {/* Public content pages */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/blood-donation" element={<BloodDonationPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/annonces" element={<AdsPage />} />
          <Route path="/research" element={<ResearchHubPage />} />
          <Route path="/research/:articleId" element={<ArticleDetailPage />} />
          <Route path="/provider/:id" element={<ProviderProfilePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Route>

        {/* ============================================ */}
        {/* MAP ROUTES (full-screen, no shell) */}
        {/* ============================================ */}
        <Route path="/map" element={<MapMother />}>
          <Route index element={<Navigate to="/map/providers" replace />} />
          <Route path="providers" element={<ProvidersMapChild />} />
          <Route path="emergency" element={<EmergencyMapChild />} />
          <Route path="blood" element={<BloodMapChild />} />
        </Route>

        {/* ============================================ */}
        {/* AUTH ROUTES (no shell) */}
        {/* ============================================ */}
        <Route path="/citizen/login" element={<CitizenLoginPage />} />
        <Route path="/citizen/register" element={<CitizenRegisterPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/provider/login" element={<ProviderLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ============================================ */}
        {/* PROVIDER ROUTES (own layouts) */}
        {/* ============================================ */}
        <Route path="/provider/register/*" element={<ProviderRegister />} />
        <Route path="/provider/dashboard" element={
          <ProviderRouteGuard><ProviderDashboard /></ProviderRouteGuard>
        } />
        <Route path="/provider/profile" element={
          <ProviderRouteGuard><ProviderOwnProfilePage /></ProviderRouteGuard>
        } />
        <Route path="/provider/welcome" element={
          <ProtectedRoute><ProviderProvider><ProviderWelcomePage /></ProviderProvider></ProtectedRoute>
        } />
        <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="/registration-status" element={<ProtectedRoute><RegistrationStatus /></ProtectedRoute>} />
        <Route path="/registration-thank-you" element={<RegistrationThankYou />} />

        {/* ============================================ */}
        {/* ADMIN ROUTES (own layouts) */}
        {/* ============================================ */}
        <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/migrate" element={<AdminGuard><AdminMigratePage /></AdminGuard>} />
        <Route path="/admin/profile" element={<AdminGuard><AdminProfilePage /></AdminGuard>} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* ============================================ */}
        {/* DOCS & DEVELOPER (own layouts) */}
        {/* ============================================ */}
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/docs/:sectionId/:pageId" element={<DocsPage />} />
        <Route path="/developers" element={<DeveloperLandingPage />} />
        <Route path="/developers/dashboard" element={<DeveloperDashboardPage />} />
        <Route path="/developers/docs" element={<DeveloperDocsPage />} />

        {/* ============================================ */}
        {/* EMERGENCY CARD PUBLIC */}
        {/* ============================================ */}
        <Route path="/emergency-card/:token" element={<EmergencyCardPublicPage />} />

        {/* ============================================ */}
        {/* LEGACY REDIRECTS */}
        {/* ============================================ */}
        <Route path="/dashboard" element={<Navigate to="/citizen/dashboard" replace />} />
        <Route path="/providers" element={<Navigate to="/provider/register" replace />} />
        <Route path="/why" element={<Navigate to="/docs/getting-started/why-cityhealth" replace />} />
        <Route path="/how" element={<Navigate to="/docs/getting-started/how-it-works" replace />} />
        <Route path="/carte" element={<CarteRedirect />} />
        <Route path="/providers-map" element={<Navigate to="/map/providers" replace />} />
        <Route path="/urgences" element={<Navigate to="/map/emergency" replace />} />
        <Route path="/ai-health-chat" element={<Navigate to="/docs" replace />} />

        {/* DEV TOOLS */}
        <Route path="/dev-tools" element={<DevToolsPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ProviderProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <div className="min-h-screen bg-background text-foreground">
                    <AppRoutes />
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </ProviderProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
