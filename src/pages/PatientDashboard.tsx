import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Star, MessageSquare, CheckCircle, XCircle, AlertCircle, Download, FileText, Loader2, Bell, BellOff, Trash2, ExternalLink } from 'lucide-react';
import { AppointmentDetailDialog } from '@/components/appointments/AppointmentDetailDialog';
import { useProfileScore } from '@/hooks/useProfileScore';
import { ProfileCompletionWidget } from '@/components/patient/ProfileCompletionWidget';
import { getEmergencyCard, EmergencyHealthCard } from '@/services/emergencyCardService';
import { useRealtimePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import { usePatientReviews } from '@/hooks/useReviews';
import { PostAppointmentReviewWidget } from '@/components/appointments/PostAppointmentReviewWidget';
import { Appointment } from '@/types/appointments';
import { toast } from 'sonner';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';
import { format } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import jsPDF from 'jspdf';

const PatientDashboard = () => {
  const { profile, isAuthenticated, user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [emergencyCard, setEmergencyCard] = useState<EmergencyHealthCard | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  useEffect(() => {
    if (user?.uid) {
      getEmergencyCard(user.uid).then(setEmergencyCard).catch(console.error);
    }
  }, [user?.uid]);

  const scoreData = useProfileScore(profile, emergencyCard);

  // Firestore appointments via TanStack Query
  const { appointments, loading: appointmentsLoading } = useRealtimePatientAppointments();
  const { mutate: cancelAppointmentMutation, isPending: isCancelling } = useCancelAppointment();
  
  // Firestore reviews via TanStack Query (using user.uid for query)
  const { data: reviews = [], isLoading: reviewsLoading } = usePatientReviews(user?.uid);

  // Notification history for appointment status changes
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useAppointmentNotifications(appointments);

  const locales = { fr, ar, en: enUS };

  const handleCancelAppointment = (id: string) => {
    cancelAppointmentMutation(id, {
      onSuccess: () => {
        toast.success(t('appointments', 'cancelSuccess'));
      },
      onError: () => {
        toast.error(t('appointments', 'cancelError'));
      }
    });
  };

  // Export appointments to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const locale = language === 'ar' ? ar : language === 'en' ? enUS : fr;
    
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text(`${t('appointments', 'myDashboard')} - CityHealth`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t('appointments', 'exportPDF')} ${format(new Date(), 'PPP', { locale })}`, pageWidth / 2, 28, { align: 'center' });
    
    let yPosition = 45;
    
    if (upcomingAppointments.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(t('appointments', 'upcoming'), 14, yPosition);
      yPosition += 10;
      
      upcomingAppointments.forEach((apt) => {
        if (yPosition > 270) { doc.addPage(); yPosition = 20; }
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`• ${apt.providerName}`, 14, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`  ${t('appointments', 'date')}: ${format(new Date(apt.dateTime), 'PPP p', { locale })}`, 14, yPosition);
        yPosition += 5;
        if (apt.notes) { doc.text(`  Notes: ${apt.notes}`, 14, yPosition); yPosition += 5; }
        yPosition += 5;
      });
    }
    
    if (pastAppointments.length > 0) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(t('appointments', 'history'), 14, yPosition);
      yPosition += 10;
      
      pastAppointments.slice(0, 10).forEach((apt) => {
        if (yPosition > 270) { doc.addPage(); yPosition = 20; }
        doc.setFontSize(12);
        doc.setTextColor(apt.status === 'cancelled' ? 150 : 0);
        doc.text(`• ${apt.providerName} (${apt.status === 'completed' ? t('appointments', 'completed') : t('appointments', 'cancelled')})`, 14, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`  ${t('appointments', 'date')}: ${format(new Date(apt.dateTime), 'PPP', { locale })}`, 14, yPosition);
        yPosition += 8;
      });
    }
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('CityHealth - Sidi Bel Abbès', pageWidth / 2, 290, { align: 'center' });
    
    doc.save(`rendez-vous-cityhealth-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success(t('appointments', 'exportPDF'));
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'confirmed' || apt.status === 'pending'
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastAppointments = appointments.filter(
    apt => apt.status === 'completed' || apt.status === 'cancelled'
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const filteredPastAppointments = historyFilter === 'all'
    ? pastAppointments
    : pastAppointments.filter(apt => apt.status === historyFilter);

  const getStatusBadge = (status: Appointment['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: AlertCircle, label: t('appointments', 'pending') },
      confirmed: { variant: 'default' as const, icon: CheckCircle, label: t('appointments', 'confirmed') },
      cancelled: { variant: 'destructive' as const, icon: XCircle, label: t('appointments', 'cancelled') },
      completed: { variant: 'outline' as const, icon: CheckCircle, label: t('appointments', 'completed') },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Note: Authentication check removed - CitizenGuard handles this in App.tsx

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {t('appointments', 'myDashboard')}
              </h1>
              <p className="text-muted-foreground">
                {t('appointments', 'welcome')}, {profile?.full_name}
              </p>
            </div>
            
            {appointments.length > 0 && (
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                <FileText className="h-4 w-4" />
                {t('appointments', 'exportPDF')}
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {/* Profile Score Card */}
            <ProfileCompletionWidget
              scoreData={scoreData}
              compact
              onNavigateTab={() => navigate('/profile')}
            />
            {/* Stat Cards */}
            {[
              {
                label: t('appointments', 'upcomingCount'),
                value: upcomingAppointments.length,
                icon: Calendar,
                iconBg: 'bg-blue-100 text-blue-600',
                accent: upcomingAppointments.length > 0 ? 'border-l-4 border-l-blue-500' : '',
              },
              {
                label: t('appointments', 'totalCount'),
                value: appointments.length,
                icon: Clock,
                iconBg: 'bg-emerald-100 text-emerald-600',
                accent: '',
              },
              {
                label: t('appointments', 'reviewsGiven'),
                value: reviews.length,
                icon: Star,
                iconBg: 'bg-amber-100 text-amber-600',
                accent: '',
              },
            ].map((stat) => (
              <Card key={stat.label} className={`hover-lift overflow-hidden ${stat.accent}`}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="w-full max-w-2xl bg-muted/50 p-1 rounded-xl grid grid-cols-4 gap-1">
              <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm gap-1.5 px-2 sm:px-3">
                <Calendar className="h-4 w-4 shrink-0 hidden sm:block" />
                {t('appointments', 'upcoming')}
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm gap-1.5 px-2 sm:px-3">
                <Clock className="h-4 w-4 shrink-0 hidden sm:block" />
                {t('appointments', 'history')}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm gap-1.5 px-2 sm:px-3 relative">
                <Bell className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm gap-1.5 px-2 sm:px-3">
                <Star className="h-4 w-4 shrink-0 hidden sm:block" />
                {t('appointments', 'myReviews')}
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Appointments */}
            <TabsContent value="upcoming" className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">{t('appointments', 'noUpcoming')}</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Vos prochains rendez-vous apparaîtront ici</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((apt) => (
                  <Card key={apt.id} className="hover:shadow-md transition-all group cursor-pointer" onClick={() => setSelectedAppointment(apt)}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="shrink-0 h-11 w-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/provider/${apt.providerId.replace(/^provider_/, '')}`}
                              className="font-semibold text-base hover:text-primary transition-colors inline-flex items-center gap-1.5 group/link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="truncate">{apt.providerName}</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(apt.dateTime), 'PPP', { locale: locales[language] })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {format(new Date(apt.dateTime), 'p', { locale: locales[language] })}
                              </span>
                            </div>
                            {apt.notes && (
                              <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2">
                                {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {getStatusBadge(apt.status)}
                          {apt.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
                              onClick={(e) => { e.stopPropagation(); handleCancelAppointment(apt.id); }}
                              disabled={isCancelling}
                            >
                              {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><XCircle className="h-3.5 w-3.5 mr-1" />{t('appointments', 'cancel')}</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Past Appointments */}
            <TabsContent value="history" className="space-y-3">
              {/* Filter chips */}
              {pastAppointments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {([
                    { value: 'all' as const, label: 'Tous', count: pastAppointments.length },
                    { value: 'completed' as const, label: 'Terminé', count: pastAppointments.filter(a => a.status === 'completed').length },
                    { value: 'cancelled' as const, label: 'Annulé', count: pastAppointments.filter(a => a.status === 'cancelled').length },
                    { value: 'confirmed' as const, label: 'Confirmé', count: pastAppointments.filter(a => a.status === 'confirmed').length },
                    { value: 'pending' as const, label: 'En attente', count: pastAppointments.filter(a => a.status === 'pending').length },
                  ]).filter(f => f.value === 'all' || f.count > 0).map((filter) => (
                    <Button
                      key={filter.value}
                      variant={historyFilter === filter.value ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs rounded-full gap-1.5"
                      onClick={() => setHistoryFilter(filter.value)}
                    >
                      {filter.label}
                      <span className={cn(
                        "text-[10px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center",
                        historyFilter === filter.value ? "bg-primary-foreground/20" : "bg-muted"
                      )}>
                        {filter.count}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              {filteredPastAppointments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      {pastAppointments.length === 0 ? t('appointments', 'noHistory') : 'Aucun rendez-vous avec ce filtre'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPastAppointments.map((apt) => (
                  <Card key={apt.id} className="hover:shadow-sm transition-all cursor-pointer" onClick={() => setSelectedAppointment(apt)}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="shrink-0 h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/provider/${apt.providerId.replace(/^provider_/, '')}`}
                              className="font-medium hover:text-primary transition-colors inline-flex items-center gap-1.5 group/link"
                            >
                              <span className="truncate">{apt.providerName}</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </Link>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(apt.dateTime), 'PPP', { locale: locales[language] })}
                            </p>
                            {apt.notes && (
                              <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{apt.notes}</p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-3">
              {notifications.length > 0 && (
                <div className="flex justify-end gap-2 mb-1">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5 h-8 text-xs">
                      <BellOff className="h-3.5 w-3.5" />
                      Tout marquer lu
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                    Effacer
                  </Button>
                </div>
              )}
              {notifications.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Aucune notification</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Vous serez notifié des changements de vos RDV</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notif) => {
                  const statusLabels: Record<string, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
                    confirmed: { label: 'Confirmé', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    cancelled: { label: 'Annulé', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
                    completed: { label: 'Terminé', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
                    pending: { label: 'En attente', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
                  };
                  const newInfo = statusLabels[notif.newStatus] || statusLabels.pending;
                  const StatusIcon = newInfo.icon;

                  return (
                    <Card
                      key={notif.id}
                      className={cn(
                        "transition-all cursor-pointer hover:shadow-md",
                        !notif.read ? 'border-primary/30 bg-primary/5' : ''
                      )}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("shrink-0 h-10 w-10 rounded-xl flex items-center justify-center", newInfo.bg, newInfo.color)}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              RDV avec <span className="font-semibold">{notif.providerName}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {statusLabels[notif.oldStatus]?.label || notif.oldStatus} → <span className={cn("font-semibold", newInfo.color)}>{newInfo.label}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {format(new Date(notif.timestamp), 'dd/MM HH:mm', { locale: locales[language] })}
                            </span>
                            {!notif.read && (
                              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="space-y-3">
              {reviews.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">{t('appointments', 'noReviews')}</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Laissez un avis après chaque consultation</p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-sm transition-all">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="shrink-0 h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Star className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{t('appointments', 'reviewFor')} {review.providerId}</p>
                            <div className="flex items-center gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn("h-3.5 w-3.5", i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30')}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-2">
                                {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: locales[language] })}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{review.comment}</p>
                            )}
                            {review.providerResponse && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                                <p className="text-xs font-medium mb-1">{t('appointments', 'providerResponse')} :</p>
                                <p className="text-xs text-muted-foreground">{review.providerResponse.text}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant={review.status === 'approved' ? 'default' : 'secondary'} className="shrink-0">
                          {review.status === 'approved' ? t('appointments', 'published') : t('appointments', 'pending')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Appointment Detail Dialog */}
      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={!!selectedAppointment}
        onOpenChange={(open) => { if (!open) setSelectedAppointment(null); }}
        currentUserId={user?.uid || ''}
        currentUserName={profile?.full_name || ''}
        currentUserRole="patient"
      />

      <PostAppointmentReviewWidget appointments={appointments} />
      <Footer />
    </>
  );
};

export default PatientDashboard;
