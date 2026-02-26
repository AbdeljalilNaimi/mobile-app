import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/services/auditLogService';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminAnalyticsCharts } from '@/components/admin/AdminAnalyticsCharts';
import { UserManagement } from '@/components/admin/UserManagement';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { VerificationQueue } from '@/components/admin/VerificationQueue';
import { AdsModeration } from '@/components/admin/AdsModeration';
import { AdminNotificationsPanel } from '@/components/admin/AdminNotificationsPanel';
import { ProviderDetailDialog } from '@/components/admin/ProviderDetailDialog';
import { AdminDocUpload } from '@/components/admin/AdminDocUpload';
import { ReportsModerationPanel } from '@/components/admin/ReportsModerationPanel';
import { AdminAppointmentsOverview } from '@/components/admin/AdminAppointmentsOverview';
import { notificationService } from '@/services/notificationService';
import { getUnreadCount } from '@/services/adminNotificationService';
import { usePendingProviders, useAllProviders, useUpdateVerification } from '@/hooks/useProviders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Search, Mail } from 'lucide-react';
import { CityHealthProvider } from '@/data/providers';

interface PendingProvider extends CityHealthProvider {
  submittedAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

const TAB_TITLES: Record<string, string> = {
  overview: 'Tableau de bord',
  inscriptions: 'Inscriptions',
  verifications: 'Vérifications',
  ads: 'Annonces',
  users: 'Utilisateurs',
  analytics: 'Analytiques',
  audit: 'Journal d\'audit',
  appointments: 'Rendez-vous',
  reports: 'Signalements',
  settings: 'Configuration',
  documentation: 'Documentation IA',
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotifCount, setAdminNotifCount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<CityHealthProvider | null>(null);

  // Use TanStack Query for provider data
  const { data: pendingProvidersRaw = [], isLoading: loadingPending, isError: errorPending } = usePendingProviders();
  const { data: allProviders = [], isLoading: loadingAll, isError: errorAll } = useAllProviders();
  const updateVerification = useUpdateVerification();
  
  const loading = loadingPending || loadingAll;
  const hasDataError = errorPending || errorAll;

  // Transform pending providers
  const pendingProviders: PendingProvider[] = pendingProvidersRaw.map(p => ({
    ...p,
    status: 'pending' as const,
    submittedAt: new Date().toISOString()
  }));

  useEffect(() => {
    getUnreadCount().then(setAdminNotifCount).catch(() => setAdminNotifCount(0));
  }, []);

  const handleApprove = async (id: string) => {
    const provider = pendingProviders.find(p => p.id === id);
    
    try {
      await updateVerification.mutateAsync({ providerId: id, status: 'verified', isPublic: true });
      
      // Audit log (non-blocking)
      try {
        await logAdminAction(
          user?.uid || 'unknown',
          user?.email || 'unknown',
          'provider_approved',
          id,
          'provider',
          { providerName: provider?.name }
        );
      } catch (e) {
        console.warn('Audit log failed:', e);
      }

      if (provider) {
        notificationService.sendVerificationNotification({
          type: 'verification_approved',
          providerEmail: provider.email || provider.phone,
          providerName: provider.name
        });
      }

      toast({
        title: "Profil approuvé",
        description: "Le professionnel est maintenant visible dans les recherches.",
      });
      setSelectedProvider(null);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver ce profil.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    const provider = pendingProviders.find(p => p.id === id);
    const reason = 'Documents non conformes ou informations incomplètes';
    
    try {
      await updateVerification.mutateAsync({ providerId: id, status: 'rejected', isPublic: false });
      
      // Audit log (non-blocking)
      try {
        await logAdminAction(
          user?.uid || 'unknown',
          user?.email || 'unknown',
          'provider_rejected',
          id,
          'provider',
          { providerName: provider?.name },
          reason
        );
      } catch (e) {
        console.warn('Audit log failed:', e);
      }

      if (provider) {
        notificationService.sendVerificationNotification({
          type: 'verification_rejected',
          providerEmail: provider.email || provider.phone,
          providerName: provider.name,
          reason
        });
      }

      toast({
        title: "Profil rejeté",
        description: "Le professionnel ne sera pas visible dans les recherches.",
        variant: "destructive",
      });
      setSelectedProvider(null);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter ce profil.",
        variant: "destructive",
      });
    }
  };

  const filteredProviders = pendingProviders.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error banner if provider data failed to load (e.g. permission denied)
  const dataWarningBanner = hasDataError ? (
    <Card className="border-destructive/50 mb-6">
      <CardContent className="flex items-center gap-3 py-4">
        <Loader2 className="h-5 w-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Erreur de chargement des données</p>
          <p className="text-sm text-muted-foreground">
            Impossible de charger les prestataires depuis Firestore. Vérifiez les règles de sécurité et les permissions admin.
          </p>
        </div>
      </CardContent>
    </Card>
  ) : null;

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <AdminOverview onTabChange={setCurrentTab} />;
      
      case 'inscriptions':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Demandes d'inscription</CardTitle>
                    <CardDescription>
                      {pendingProviders.length} demandes en attente de validation
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professionnel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProviders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                          Aucune demande d'inscription en attente
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {provider.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{provider.type}</Badge>
                          </TableCell>
                          <TableCell>{provider.city}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {provider.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              En attente
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedProvider(provider)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(provider.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleReject(provider.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'verifications':
        return <VerificationQueue />;
      
      case 'ads':
        return (
          <div className="space-y-6">
            <AdsModeration />
            <AdminNotificationsPanel />
          </div>
        );
      
      case 'users':
        return <UserManagement />;
      
      case 'analytics':
        return <AdminAnalyticsCharts />;
      
      case 'audit':
        return <AuditLogViewer />;
      
      case 'appointments':
        return <AdminAppointmentsOverview />;
      
      case 'reports':
        return <ReportsModerationPanel />;
      
      case 'settings':
        return <SettingsPanel />;
      
      case 'documentation':
        return <AdminDocUpload />;
      
      default:
        return <AdminOverview onTabChange={setCurrentTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader 
          title={TAB_TITLES[currentTab] || 'Tableau de bord'} 
          notificationCount={adminNotifCount}
        />

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {dataWarningBanner}
          {renderTabContent()}
        </main>
      </div>

      <ProviderDetailDialog
        provider={selectedProvider}
        open={!!selectedProvider}
        onOpenChange={(open) => !open && setSelectedProvider(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={updateVerification.isPending}
      />
    </div>
  );
}
