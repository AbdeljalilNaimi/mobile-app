import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GuestProfilePage from '@/components/guest/GuestProfilePage';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProfileScore } from '@/hooks/useProfileScore';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Mail, Phone, MapPin, Calendar, Bell, Lock, 
  Heart, Clock, CheckCircle2, XCircle, Edit2, 
  Star, Navigation, ExternalLink, Droplet, ShieldCheck,
  ChevronRight, Info, ArrowRight, LogOut,
  History as HistoryIcon
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DonationHistoryTimeline } from '@/components/blood-emergency/DonationHistoryTimeline';
import { BLOOD_TYPES } from '@/services/bloodEmergencyService';
import { useNotifications } from '@/hooks/useNotifications';
import { CityHealthProvider, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { getProviderById } from '@/services/firestoreProviderService';
import { useFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { usePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getEmergencyCard, upsertEmergencyCard, EmergencyHealthCard } from '@/services/emergencyCardService';
import { EmergencyCardForm } from '@/components/emergency-card/EmergencyCardForm';
import { EmergencyCardDisplay } from '@/components/emergency-card/EmergencyCardDisplay';
import { ConsultationHistory } from '@/components/emergency-card/ConsultationHistory';
import { useOfflineEmergencyCard } from '@/hooks/useOfflineEmergencyCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

const TABS = [
  { value: 'profile', icon: User, label: 'Profil' },
  { value: 'emergency-card', icon: ShieldCheck, label: 'Santé' },
  { value: 'appointments', icon: Calendar, label: 'RDV' },
  { value: 'favorites', icon: Heart, label: 'Favoris' },
  { value: 'donations', icon: Droplet, label: 'Sang' },
  { value: 'notifications', icon: Bell, label: 'Alertes' },
] as const;

export default function CitizenProfilePage() {
  const { user, profile, updateProfile, logout, isAuthenticated, hasRole } = useAuth();

  // Guest state — show dedicated guest profile page
  if (!isAuthenticated || !user) {
    const GuestProfilePage = require('@/components/guest/GuestProfilePage').default;
    return <GuestProfilePage />;
  }
  const { preferences, updatePreferences } = useNotifications();
  const navigate = useNavigate();
  
  const { data: favoriteIds = [], isLoading: favoritesLoading } = useFavorites();
  const { mutate: removeFavorite, isPending: isRemovingFavorite } = useRemoveFavorite();
  const { data: allProviders = [] } = useVerifiedProviders();
  const favorites = allProviders.filter(p => favoriteIds.includes(p.id));
  
  const { data: appointments = [], isLoading: appointmentsLoading } = usePatientAppointments();
  const { mutate: cancelAppointmentMutation, isPending: isCancellingAppointment } = useCancelAppointment();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    weight: '' as string,
    height: '' as string,
    last_donation_date: '' as string
  });

  // Track if form has changes for sticky save button
  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return (
      formData.full_name !== (profile.full_name || '') ||
      formData.phone !== (profile.phone || '') ||
      formData.address !== (profile.address || '') ||
      formData.dateOfBirth !== (profile.date_of_birth || '') ||
      formData.weight !== (profile.weight ? String(profile.weight) : '') ||
      formData.height !== (profile.height ? String(profile.height) : '') ||
      formData.last_donation_date !== (profile.last_donation_date || '')
    );
  }, [formData, profile]);

  const formatAlgerianPhone = (value: string): string => {
    let digits = value.replace(/[^\d]/g, '');
    if (digits.startsWith('213')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0, 9);
    if (digits.length === 0) return '';
    let formatted = digits[0];
    if (digits.length > 1) formatted += ' ' + digits.slice(1, 3);
    if (digits.length > 3) formatted += ' ' + digits.slice(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
    return '+213 ' + formatted;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.full_name.trim()) {
      errors.full_name = 'Le nom est obligatoire';
    } else if (formData.full_name.trim().length < 3) {
      errors.full_name = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.full_name.trim().length > 100) {
      errors.full_name = 'Le nom ne doit pas dépasser 100 caractères';
    }
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/[^\d]/g, '');
      if (phoneDigits.length !== 12 || !phoneDigits.startsWith('213')) {
        errors.phone = 'Numéro invalide. Format : +213 X XX XX XX XX';
      }
    }
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const minDate = new Date('1900-01-01');
      const age = (today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (dob > today) errors.dateOfBirth = 'La date ne peut pas être dans le futur';
      else if (dob < minDate) errors.dateOfBirth = 'Date de naissance invalide';
      else if (age < 13) errors.dateOfBirth = 'Vous devez avoir au moins 13 ans';
    }
    if (formData.weight) {
      const w = Number(formData.weight);
      if (isNaN(w) || w < 20 || w > 350) errors.weight = 'Poids invalide (20-350 kg)';
    }
    if (formData.height) {
      const h = Number(formData.height);
      if (isNaN(h) || h < 50 || h > 260) errors.height = 'Taille invalide (50-260 cm)';
    }
    if (formData.last_donation_date) {
      const donDate = new Date(formData.last_donation_date);
      if (donDate > new Date()) errors.last_donation_date = 'La date ne peut pas être dans le futur';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [providerCache, setProviderCache] = useState<Record<string, CityHealthProvider | null>>({});
  const [emergencyCard, setEmergencyCard] = useState<EmergencyHealthCard | null>(null);

  useEffect(() => {
    if (user?.uid) {
      getEmergencyCard(user.uid).then(setEmergencyCard).catch(console.error);
    }
  }, [user?.uid]);

  useOfflineEmergencyCard(emergencyCard);
  const scoreData = useProfileScore(profile, emergencyCard);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.date_of_birth || '',
        weight: profile.weight ? String(profile.weight) : '',
        height: profile.height ? String(profile.height) : '',
        last_donation_date: profile.last_donation_date || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadProviders = async () => {
      const providerIds = [...new Set(appointments.map(a => a.providerId))];
      const cache: Record<string, CityHealthProvider | null> = {};
      for (const id of providerIds) {
        if (!providerCache[id]) {
          cache[id] = await getProviderById(id);
        }
      }
      if (Object.keys(cache).length > 0) {
        setProviderCache(prev => ({ ...prev, ...cache }));
      }
    };
    if (appointments.length > 0) loadProviders();
  }, [appointments]);

  if (!profile) return null;

  const initials = profile.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }
    await updateProfile({ 
      full_name: formData.full_name.trim(),
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      date_of_birth: formData.dateOfBirth || undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      last_donation_date: formData.last_donation_date || undefined,
    });
    toast.success('Profil mis à jour');
    setIsEditing(false);
    setFormErrors({});
  };

  const handleRemoveFavorite = (providerId: string) => {
    removeFavorite(providerId, {
      onSuccess: () => toast.success('Retiré des favoris'),
      onError: () => toast.error('Erreur lors de la suppression')
    });
  };

  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointmentMutation(appointmentId, {
      onSuccess: () => toast.success('Rendez-vous annulé'),
      onError: () => toast.error('Erreur lors de l\'annulation')
    });
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(a => 
    new Date(a.dateTime) > now && a.status !== 'cancelled' && a.status !== 'completed'
  );
  const pastAppointments = appointments.filter(a => 
    new Date(a.dateTime) <= now || a.status === 'cancelled' || a.status === 'completed'
  );

  // Check which fields are incomplete for orange dot indicators
  const isFieldEmpty = (key: string): boolean => {
    switch (key) {
      case 'full_name': return !formData.full_name.trim();
      case 'email': return false; // always filled
      case 'phone': return !formData.phone;
      case 'dateOfBirth': return !formData.dateOfBirth;
      case 'weight': return !formData.weight;
      case 'height': return !formData.height;
      case 'last_donation_date': return !formData.last_donation_date;
      case 'address': return !formData.address;
      default: return false;
    }
  };

  // Avatar completion ring SVG
  const avatarSize = 48;
  const ringStroke = 3;
  const ringRadius = (avatarSize + ringStroke * 2) / 2;
  const ringCircumference = ringRadius * 2 * Math.PI;
  const ringOffset = ringCircumference - (scoreData.totalScore / 100) * ringCircumference;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="px-4 pt-16 pb-20 max-w-5xl mx-auto space-y-4">

        {/* 1. Compact Header Row */}
        <div className="flex items-center gap-3">
          {/* Avatar with completion ring */}
          <div className="relative shrink-0" style={{ width: avatarSize + ringStroke * 4, height: avatarSize + ringStroke * 4 }}>
            <svg
              className="absolute inset-0"
              width={avatarSize + ringStroke * 4}
              height={avatarSize + ringStroke * 4}
            >
              <circle
                cx={(avatarSize + ringStroke * 4) / 2}
                cy={(avatarSize + ringStroke * 4) / 2}
                r={ringRadius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={ringStroke}
              />
              <circle
                cx={(avatarSize + ringStroke * 4) / 2}
                cy={(avatarSize + ringStroke * 4) / 2}
                r={ringRadius}
                fill="none"
                stroke="#1D4ED8"
                strokeWidth={ringStroke}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className="transition-all duration-500 -rotate-90 origin-center"
              />
            </svg>
            <Avatar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: avatarSize, height: avatarSize }}>
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-sm bg-[#1D4ED8]/10 text-[#1D4ED8] font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </div>

          {/* Name + Email */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#111827] truncate">{profile.full_name || 'Mon Profil'}</h1>
            <p className="text-xs text-[#9CA3AF] truncate">{profile.email}</p>
          </div>

          {/* Edit icon */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#6B7280]"
            onClick={() => { setActiveTab('profile'); setIsEditing(true); }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar + tip */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">Profil complété à {scoreData.totalScore}%</span>
            <span className="text-xs font-medium text-[#1D4ED8]">{scoreData.totalScore}%</span>
          </div>
          <Progress value={scoreData.totalScore} className="h-1" />
          {scoreData.nextAction && (
            <div className="flex items-center gap-1 mt-1">
              <Info className="h-3 w-3 text-[#9CA3AF] shrink-0" />
              <button
                className="text-[11px] text-[#9CA3AF] hover:text-[#1D4ED8] transition-colors"
                onClick={() => setActiveTab(scoreData.nextAction!.tab)}
              >
                {scoreData.nextAction.label}
              </button>
            </div>
          )}
        </div>

        {/* 2. Tab Bar */}
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-1 min-w-max h-11">
            {TABS.map(tab => {
              const isActive = activeTab === tab.value;
              const Icon = tab.icon;
              const count = tab.value === 'appointments' ? upcomingAppointments.length
                : tab.value === 'favorites' ? favorites.length : 0;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors relative min-w-[52px]",
                    isActive
                      ? "text-[#1D4ED8]"
                      : "text-[#9CA3AF] hover:text-[#6B7280]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#1D4ED8] text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold">
                      {count}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#1D4ED8] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >

            {/* ============ PROFILE TAB ============ */}
            {activeTab === 'profile' && (
              <>
                {/* Personal Info */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold text-[#111827]">Informations personnelles</h3>
                    {!isEditing && (
                      <button
                        className="text-xs text-[#1D4ED8] font-medium"
                        onClick={() => setIsEditing(true)}
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                  <div className="px-4 pb-4 grid grid-cols-2 gap-x-4 gap-y-2">
                    {/* Nom complet */}
                    <FormField
                      label="Nom complet"
                      isEmpty={isFieldEmpty('full_name')}
                      error={formErrors.full_name}
                    >
                      <Input
                        value={formData.full_name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, full_name: e.target.value }));
                          if (formErrors.full_name) setFormErrors(prev => ({ ...prev, full_name: '' }));
                        }}
                        disabled={!isEditing}
                        className="border-0 border-b border-[#E5E7EB] rounded-none h-10 px-0 text-sm focus-visible:ring-0 focus-visible:border-[#1D4ED8]"
                        placeholder="Votre nom"
                        maxLength={100}
                      />
                    </FormField>

                    {/* Email */}
                    <FormField label="Email" isEmpty={false}>
                      <Input
                        type="email"
                        value={profile.email}
                        disabled
                        className="border-0 border-b border-[#E5E7EB] rounded-none h-10 px-0 text-sm bg-transparent focus-visible:ring-0 text-[#9CA3AF]"
                      />
                    </FormField>

                    {/* Phone */}
                    <FormField label="Téléphone" isEmpty={isFieldEmpty('phone')} error={formErrors.phone}>
                      <Input
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatAlgerianPhone(e.target.value);
                          setFormData(prev => ({ ...prev, phone: formatted }));
                          if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                        }}
                        disabled={!isEditing}
                        className="border-0 border-b border-[#E5E7EB] rounded-none h-10 px-0 text-sm focus-visible:ring-0 focus-visible:border-[#1D4ED8]"
                        placeholder="+213 X XX XX XX XX"
                      />
                    </FormField>

                    {/* Date of birth */}
                    <FormField label="Date de naissance" isEmpty={isFieldEmpty('dateOfBirth')} error={formErrors.dateOfBirth}>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }));
                          if (formErrors.dateOfBirth) setFormErrors(prev => ({ ...prev, dateOfBirth: '' }));
                        }}
                        disabled={!isEditing}
                        className="border-0 border-b border-[#E5E7EB] rounded-none h-10 px-0 text-sm focus-visible:ring-0 focus-visible:border-[#1D4ED8]"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormField>

                    {/* Weight */}
                    <FormField label="Poids (kg)" isEmpty={isFieldEmpty('weight')} error={formErrors.weight}>
                      <Input
                        type="number"
                        min="20"
                        max="350"
                        value={formData.weight}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, weight: e.target.value }));
                          if (formErrors.weight) setFormErrors(prev => ({ ...prev, weight: '' }));
                        }}
                        disabled={!isEditing}
                        className="border-0 border-b border-[#E5E7EB] rounded-none h-10 px-0 text-sm focus-visible:ring-0 focus-visible:border-[#1D4ED8]"
                        placeholder="kg"
                      />
                    </FormField>

                    {/* Height */}
                    <FormField label="Taille (cm)" isEmpty={isFieldEmpty('height')} error={formErrors.height}>
                      <Input
                        type="number"
                        min="50"
                        max="260"
                        value={formData.height}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, height: e.target.value }));
                          if (formErrors.height) setFormErrors(prev => ({ ...prev, height: '' }));
                        }}
                        disabled={!isEditing}
                        className="border-0 border-b border-[#E5E7EB] rounded-none h-10 px-0 text-sm focus-visible:ring-0 focus-visible:border-[#1D4ED8]"
                        placeholder="cm"
                      />
                    </FormField>

                    {/* Last donation */}
                    <FormField label="Date dernier don" isEmpty={isFieldEmpty('last_donation_date')} error={formErrors.last_donation_date}>
                      <Input
                        type="date"
                        value={formData.last_donation_date}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, last_donation_date: e.target.value }));
                          if (formErrors.last_donation_date) setFormErrors(prev => ({ ...prev, last_donation_date: '' }));
                        }}
                        disabled={!isEditing}
                        className="border-0 border-b border-[#E5E7EB] rounded-none h-10 px-0 text-sm focus-visible:ring-0 focus-visible:border-[#1D4ED8]"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormField>

                    {/* Address - full width */}
                    <div className="col-span-2">
                      <FormField label="Adresse" isEmpty={isFieldEmpty('address')}>
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          disabled={!isEditing}
                          className="border-0 border-b border-[#E5E7EB] rounded-none h-10 px-0 text-sm focus-visible:ring-0 focus-visible:border-[#1D4ED8]"
                          placeholder="Votre adresse"
                        />
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* Blood Profile - compact */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-[#111827]">Profil Sanguin</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select
                        value={profile.blood_group || ''}
                        onValueChange={async (value) => {
                          updateProfile({ blood_group: value });
                          if (user?.uid) {
                            const updated = await upsertEmergencyCard(user.uid, { blood_group: value });
                            if (updated) setEmergencyCard(updated);
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm border-[#E5E7EB]">
                          <SelectValue placeholder="Groupe sanguin" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#6B7280]">Alertes</span>
                      <Switch
                        checked={profile.emergency_opt_in || false}
                        onCheckedChange={(checked) => updateProfile({ emergency_opt_in: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Score - compact horizontal */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-3">
                  <h3 className="text-sm font-semibold text-[#111827] mb-2">Score de Profil</h3>
                  <div className="space-y-1.5">
                    {scoreData.categories.map((cat) => {
                      const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
                      return (
                        <div key={cat.name} className="flex items-center gap-2 h-7">
                          <span className="text-xs text-[#6B7280] w-28 shrink-0">{cat.label}</span>
                          <div className="flex-1">
                            <Progress value={pct} className="h-1.5" />
                          </div>
                          <span className="text-xs text-[#9CA3AF] w-12 text-right font-medium">
                            {Math.round(cat.score)}/{cat.maxScore}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {scoreData.nextAction && (
                    <Button
                      size="sm"
                      className="mt-3 w-full bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white text-xs h-8 gap-1"
                      onClick={() => setActiveTab(scoreData.nextAction!.tab)}
                    >
                      {scoreData.nextAction.label}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Security - inline list */}
                <div className="space-y-0">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl shadow-sm hover:bg-[#F8F9FA] transition-colors"
                    onClick={() => {/* TODO: open change password dialog */}}
                  >
                    <Lock className="h-4 w-4 text-[#6B7280]" />
                    <span className="flex-1 text-left text-sm text-[#111827]">Changer le mot de passe</span>
                    <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                  </button>
                  <button
                    className="w-full py-3 text-center text-xs text-red-500 hover:text-red-600 transition-colors mt-3"
                    onClick={logout}
                  >
                    <LogOut className="h-3 w-3 inline mr-1" />
                    Se déconnecter
                  </button>
                </div>
              </>
            )}

            {/* ============ EMERGENCY CARD TAB ============ */}
            {activeTab === 'emergency-card' && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                  <EmergencyCardForm
                    userId={user?.uid || ''}
                    card={emergencyCard}
                    onSaved={setEmergencyCard}
                    onBloodGroupChange={(bg) => updateProfile({ blood_group: bg })}
                  />
                </div>
                {emergencyCard && emergencyCard.blood_group && (
                  <EmergencyCardDisplay card={emergencyCard} patientName={profile.full_name || undefined} />
                )}
                {user?.uid && <ConsultationHistory userId={user.uid} />}
              </div>
            )}

            {/* ============ APPOINTMENTS TAB ============ */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
                  <div className="px-4 py-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#1D4ED8]" />
                    <h3 className="text-sm font-semibold text-[#111827]">À venir</h3>
                  </div>
                  <div className="px-4 pb-4">
                    {upcomingAppointments.length === 0 ? (
                      <div className="text-center py-6 text-[#9CA3AF]">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun rendez-vous à venir</p>
                        <button className="text-xs text-[#1D4ED8] mt-1" onClick={() => navigate('/search')}>
                          Trouver un prestataire
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingAppointments.map((apt) => {
                          const provider = providerCache[apt.providerId];
                          return (
                            <div key={apt.id} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                              <div>
                                <p className="text-sm font-medium text-[#111827]">{apt.providerName || provider?.name || 'Prestataire'}</p>
                                <p className="text-xs text-[#9CA3AF]">
                                  {new Date(apt.dateTime).toLocaleDateString('fr-FR', {
                                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-xs text-red-500 h-7" onClick={() => handleCancelAppointment(apt.id)}>
                                Annuler
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#6B7280]" />
                      <h3 className="text-sm font-semibold text-[#111827]">Historique</h3>
                    </div>
                    <button className="text-xs text-[#1D4ED8]" onClick={() => navigate('/citizen/appointments/history')}>
                      Voir tout →
                    </button>
                  </div>
                  <div className="px-4 pb-4">
                    {pastAppointments.length === 0 ? (
                      <p className="text-center py-4 text-sm text-[#9CA3AF]">Aucun historique</p>
                    ) : (
                      <div className="space-y-0">
                        {pastAppointments.slice(0, 5).map((apt) => {
                          const provider = providerCache[apt.providerId];
                          return (
                            <div key={apt.id} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                              <div>
                                <p className="text-sm font-medium text-[#111827]">{apt.providerName || provider?.name || 'Prestataire'}</p>
                                <p className="text-xs text-[#9CA3AF]">{new Date(apt.dateTime).toLocaleDateString('fr-FR')}</p>
                              </div>
                              <Badge variant={apt.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-[10px]">
                                {apt.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============ FAVORITES TAB ============ */}
            {activeTab === 'favorites' && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
                <div className="px-4 py-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-[#111827]">Mes favoris</h3>
                </div>
                <div className="px-4 pb-4">
                  {favorites.length === 0 ? (
                    <div className="text-center py-6 text-[#9CA3AF]">
                      <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucun favori</p>
                      <button className="text-xs text-[#1D4ED8] mt-1" onClick={() => navigate('/providers-map')}>
                        Découvrir les prestataires
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {favorites.map((provider) => (
                        <div key={provider.id} className="border border-[#E5E7EB] rounded-xl p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-[#111827]">{provider.name}</p>
                              <Badge variant="outline" className="text-[10px] mt-0.5">
                                {PROVIDER_TYPE_LABELS[provider.type]?.icon} {PROVIDER_TYPE_LABELS[provider.type]?.fr}
                              </Badge>
                            </div>
                            <button
                              className="text-red-500 hover:text-red-600 p-1"
                              onClick={() => handleRemoveFavorite(provider.id)}
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </button>
                          </div>
                          <div className="space-y-0.5 text-xs text-[#9CA3AF] mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span>{provider.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{provider.address}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => navigate(`/provider/${provider.id}`)}>
                              <ExternalLink className="h-3 w-3 mr-1" />Voir
                            </Button>
                            <Button size="sm" className="flex-1 h-7 text-xs bg-[#1D4ED8] hover:bg-[#1D4ED8]/90" onClick={() => {
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`, '_blank');
                            }}>
                              <Navigation className="h-3 w-3 mr-1" />Y aller
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============ DONATIONS TAB ============ */}
            {activeTab === 'donations' && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                {user && <DonationHistoryTimeline citizenId={user.uid} />}
              </div>
            )}

            {/* ============ NOTIFICATIONS TAB ============ */}
            {activeTab === 'notifications' && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
                <div className="px-4 py-3">
                  <h3 className="text-sm font-semibold text-[#111827]">Préférences de notification</h3>
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <NotifRow
                    label="Notifications push"
                    desc="Notifications dans le navigateur"
                    checked={preferences.pushNotifications}
                    onChange={(checked) => {
                      updatePreferences({ pushNotifications: checked });
                      toast.success(checked ? 'Activées' : 'Désactivées');
                    }}
                  />
                  <NotifRow
                    label="Notifications email"
                    desc="Emails de notification"
                    checked={preferences.emailNotifications}
                    onChange={(checked) => {
                      updatePreferences({ emailNotifications: checked });
                      toast.success(checked ? 'Activées' : 'Désactivées');
                    }}
                  />
                  <Separator />
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Types</p>
                  <NotifRow
                    label="Rappels de rendez-vous"
                    checked={preferences.appointments}
                    onChange={(checked) => updatePreferences({ appointments: checked })}
                  />
                  <NotifRow
                    label="Messages"
                    checked={preferences.messages}
                    onChange={(checked) => updatePreferences({ messages: checked })}
                  />
                  <NotifRow
                    label="Rappels de santé"
                    checked={preferences.profileUpdates}
                    onChange={(checked) => updatePreferences({ profileUpdates: checked })}
                  />
                  <NotifRow
                    label="Alertes don de sang"
                    desc="Urgences à proximité"
                    checked={preferences.bloodEmergencies}
                    onChange={(checked) => updatePreferences({ bloodEmergencies: checked })}
                  />
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Sticky floating save button */}
        <AnimatePresence>
          {isEditing && hasChanges && activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex gap-2"
            >
              <Button
                onClick={handleSave}
                className="bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white rounded-full px-6 h-10 shadow-lg"
              >
                Enregistrer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  if (profile) {
                    setFormData({
                      full_name: profile.full_name || '',
                      phone: profile.phone || '',
                      address: profile.address || '',
                      dateOfBirth: profile.date_of_birth || '',
                      weight: profile.weight ? String(profile.weight) : '',
                      height: profile.height ? String(profile.height) : '',
                      last_donation_date: profile.last_donation_date || ''
                    });
                  }
                  setFormErrors({});
                }}
                className="rounded-full px-4 h-10 shadow-lg bg-white"
              >
                Annuler
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function FormField({ label, isEmpty, error, children }: {
  label: string;
  isEmpty: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1">
        {isEmpty && <div className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />}
        <label className="text-[11px] uppercase tracking-wide text-[#9CA3AF] font-medium">{label}</label>
      </div>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function NotifRow({ label, desc, checked, onChange }: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm text-[#111827]">{label}</p>
        {desc && <p className="text-[11px] text-[#9CA3AF]">{desc}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
