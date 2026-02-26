import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import {
  Users,
  Building2,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  ArrowRight,
  Zap,
  ShieldX,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { getPlatformStats, type PlatformStats } from '@/services/platformAnalyticsService';
import { getRecentAuditLogs, type AuditLogEntry, type AuditAction } from '@/services/auditLogService';
import { isPermissionError } from '@/utils/errorHandling';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuickStatProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
}

function QuickStat({ title, value, icon, trend, color = 'primary' }: QuickStatProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center mt-1">
                <TrendingUp className={`h-4 w-4 mr-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
              </div>
            )}
          </div>
          <div className={`h-14 w-14 rounded-2xl bg-${color}/10 flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdminOverviewProps {
  onTabChange: (tab: string) => void;
}

export function AdminOverview({ onTabChange }: AdminOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const { t, language } = useLanguage();

  const locale = language === 'ar' ? ar : language === 'en' ? enUS : fr;

  const ACTION_LABELS: Record<AuditAction, string> = {
    provider_approved: t('admin', 'providerApproved'),
    provider_rejected: t('admin', 'providerRejected'),
    provider_edited: t('admin', 'providerEdited'),
    provider_deleted: t('admin', 'providerDeleted'),
    ad_approved: t('admin', 'adApproved'),
    ad_rejected: t('admin', 'adRejected'),
    user_role_changed: t('admin', 'roleChanged'),
    settings_changed: t('admin', 'settingsChanged'),
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionError(false);
    try {
      const [platformStats, logs] = await Promise.all([
        getPlatformStats(),
        getRecentAuditLogs(5),
      ]);
      setStats(platformStats);
      setRecentLogs(logs);
    } catch (error) {
      console.error('Failed to load overview data:', error);
      if (isPermissionError(error)) {
        setPermissionError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShieldX className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('admin', 'accessDenied')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t('admin', 'accessDeniedDesc')}
          </p>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin', 'retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const verificationRate = stats?.totalProviders
    ? Math.round((stats.verifiedProviders / stats.totalProviders) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat
          title={t('admin', 'totalProviders')}
          value={stats?.totalProviders || 0}
          icon={<Building2 className="h-7 w-7 text-primary" />}
          trend={8}
        />
        <QuickStat
          title={t('admin', 'pendingLabel')}
          value={stats?.pendingProviders || 0}
          icon={<Clock className="h-7 w-7 text-amber-500" />}
        />
        <QuickStat
          title={t('admin', 'verified')}
          value={stats?.verifiedProviders || 0}
          icon={<Shield className="h-7 w-7 text-green-500" />}
          trend={12}
        />
        <QuickStat
          title={t('admin', 'users')}
          value={stats?.totalCitizens || 0}
          icon={<Users className="h-7 w-7 text-blue-500" />}
          trend={15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              {t('admin', 'quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => onTabChange('verifications')}
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('admin', 'pendingVerifications')}
              </span>
              <Badge variant="secondary">{stats?.pendingProviders || 0}</Badge>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => onTabChange('inscriptions')}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('admin', 'newRegistrations')}
              </span>
              <ArrowRight className="h-4 w-4 rtl-flip" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => onTabChange('ads')}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('admin', 'adsToModerate')}
              </span>
              <ArrowRight className="h-4 w-4 rtl-flip" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => onTabChange('analytics')}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('admin', 'viewAnalytics')}
              </span>
              <ArrowRight className="h-4 w-4 rtl-flip" />
            </Button>
          </CardContent>
        </Card>

        {/* Verification Progress */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              {t('admin', 'verificationRate')}
            </CardTitle>
            <CardDescription>
              {t('admin', 'verificationProgress')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{verificationRate}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.verifiedProviders} {t('admin', 'outOf')} {stats?.totalProviders} {t('admin', 'providers')}
              </p>
            </div>
            <Progress value={verificationRate} className="h-3" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats?.verifiedProviders || 0}</p>
                <p className="text-xs text-muted-foreground">{t('admin', 'verified')}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats?.pendingProviders || 0}</p>
                <p className="text-xs text-muted-foreground">{t('admin', 'pendingLabel')}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{stats?.rejectedProviders || 0}</p>
                <p className="text-xs text-muted-foreground">{t('admin', 'rejected')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                {t('admin', 'recentActivity')}
              </CardTitle>
              <CardDescription>{t('admin', 'lastAdminActions')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onTabChange('audit')}>
              {t('admin', 'viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t('admin', 'noRecentActivity')}
              </p>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {log.action.includes('approved') ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : log.action.includes('rejected') ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {ACTION_LABELS[log.action]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.adminEmail.split('@')[0]} •{' '}
                        {log.timestamp?.toDate
                          ? format(log.timestamp.toDate(), 'dd MMM HH:mm', { locale })
                          : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin', 'platformHealth')}</CardTitle>
          <CardDescription>{t('admin', 'keyMetrics')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.totalAppointments || 0}</p>
              <p className="text-xs text-muted-foreground">{t('admin', 'totalAppointments')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.appointmentsToday || 0}</p>
              <p className="text-xs text-muted-foreground">{t('admin', 'appointmentsToday')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
              <p className="text-xs text-muted-foreground">{t('admin', 'reviewsLabel')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-muted-foreground">{t('admin', 'averageRating')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.newUsersToday || 0}</p>
              <p className="text-xs text-muted-foreground">{t('admin', 'newToday')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.totalAdmins || 0}</p>
              <p className="text-xs text-muted-foreground">{t('admin', 'admins')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
