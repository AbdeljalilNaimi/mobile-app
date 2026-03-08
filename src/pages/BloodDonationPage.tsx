import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplet, 
  Search, 
  Hospital, 
  Clock, 
  MapPin, 
  Phone, 
  AlertTriangle,
  Heart,
  Calendar,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  Info,
  Star,
  Shield,
  Users,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { EmergencyAlertBanner } from '@/components/blood-emergency/EmergencyAlertBanner';
import { DonationConfirmationView } from '@/components/blood-emergency/DonationConfirmationView';
import { getDonationHistory, subscribeToEmergencies } from '@/services/bloodEmergencyService';
import type { BloodEmergency } from '@/services/bloodEmergencyService';

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] as const;

type BloodType = typeof BLOOD_TYPES[number];

interface BloodProfile {
  bloodType?: BloodType;
  lastDonationDate?: string;
  reminderEnabled: boolean;
}

export default function BloodDonationPage() {
  const { isRTL, language } = useLanguage();
  const { isAuthenticated, profile } = useAuth();
  
  // Emergency response state
  const [respondingEmergency, setRespondingEmergency] = useState<BloodEmergency | null>(null);
  
  // Real-time emergencies feed
  const [activeEmergencies, setActiveEmergencies] = useState<BloodEmergency[]>([]);
  
  // Eligibility checker state
  const [eligibilityAge, setEligibilityAge] = useState('');
  const [eligibilityWeight, setEligibilityWeight] = useState('');
  const [eligibilityHeight, setEligibilityHeight] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<'eligible' | 'not_yet' | null>(null);
  const [nextEligibleDate, setNextEligibleDate] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [profileAutoFilledAge, setProfileAutoFilledAge] = useState(false);
  const [profileAutoFilledWeight, setProfileAutoFilledWeight] = useState(false);
  const [profileAutoFilledHeight, setProfileAutoFilledHeight] = useState(false);
  const [bmiValue, setBmiValue] = useState<number | null>(null);
  
  // Blood profile (for authenticated users)
  const [bloodProfile, setBloodProfile] = useState<BloodProfile>({
    reminderEnabled: false
  });
  
  // Track if profile auto-fill has been applied
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  // Subscribe to real-time emergencies
  useEffect(() => {
    const unsub = subscribeToEmergencies(setActiveEmergencies);
    return unsub;
  }, []);
  
  // Auto-fill from profile and donation history
  useEffect(() => {
    if (!isAuthenticated || !profile || profileLoaded) return;
    
    const profileAny = profile as any;
    
    // Pre-fill blood type from profile
    if (profileAny.blood_group) {
      setBloodProfile(prev => ({ ...prev, bloodType: profileAny.blood_group }));
    }

    // Auto-fill age from date_of_birth
    if (profileAny.date_of_birth) {
      const dob = new Date(profileAny.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age > 0 && age < 150) {
        setEligibilityAge(String(age));
        setProfileAutoFilledAge(true);
      }
    }

    // Auto-fill weight from profile
    if (profileAny.weight && profileAny.weight > 0) {
      setEligibilityWeight(String(profileAny.weight));
      setProfileAutoFilledWeight(true);
    }

    // Auto-fill height from profile
    if (profileAny.height && profileAny.height > 0) {
      setEligibilityHeight(String(profileAny.height));
      setProfileAutoFilledHeight(true);
    }
    
    // Fetch latest donation and pre-fill dates
    // Priority: donation_history (most accurate) > profile.last_donation_date (fallback)
    if (profileAny.id || profileAny.uid) {
      const citizenId = profileAny.id || profileAny.uid;
      getDonationHistory(citizenId).then(history => {
        if (history.length > 0) {
          const latestDonation = history[0];
          const donatedDate = latestDonation.donated_at.split('T')[0];
          setLastDonation(donatedDate);
          setBloodProfile(prev => ({ ...prev, lastDonationDate: donatedDate }));
        } else if (profileAny.last_donation_date) {
          // Fallback: use the date stored in citizen profile
          setLastDonation(profileAny.last_donation_date);
          setBloodProfile(prev => ({ ...prev, lastDonationDate: profileAny.last_donation_date }));
        }
      }).catch(() => {
        // On error, still try profile fallback
        if (profileAny.last_donation_date) {
          setLastDonation(profileAny.last_donation_date);
          setBloodProfile(prev => ({ ...prev, lastDonationDate: profileAny.last_donation_date }));
        }
      });
    } else if (profileAny.last_donation_date) {
      // No citizen ID available but profile has the date
      setLastDonation(profileAny.last_donation_date);
      setBloodProfile(prev => ({ ...prev, lastDonationDate: profileAny.last_donation_date }));
    }
    
    setProfileLoaded(true);
  }, [isAuthenticated, profile, profileLoaded]);

  // Translations
  const texts = useMemo(() => ({
    fr: {
      title: 'Don de Sang & Recherche d\'Urgence',
      subtitle: 'Trouvez rapidement les hôpitaux et centres de don de sang à Sidi Bel Abbès',
      emergencyFinder: 'Recherche d\'Urgence',
      donateBlood: 'Donner du Sang',
      reminders: 'Rappels',
      info: 'Informations',
      selectBloodType: 'Sélectionnez votre groupe sanguin',
      disclaimer: 'La disponibilité du sang dépend du stock en temps réel des hôpitaux. Pour les urgences vitales, contactez immédiatement les services d\'urgence.',
      emergencyCall: 'Appelez le 15 pour les urgences',
      eligibilityChecker: 'Vérificateur d\'éligibilité',
      age: 'Âge',
      weight: 'Poids (kg)',
      lastDonationDate: 'Date du dernier don',
      checkEligibility: 'Vérifier mon éligibilité',
      eligible: 'Vous êtes éligible au don de sang !',
      notYetEligible: 'Vous ne pouvez pas encore donner',
      nextEligible: 'Prochaine date éligible',
      eligibilityNote: 'Ceci est une estimation. L\'approbation finale dépend du personnel médical.',
      findCenter: 'Trouver un centre près de moi',
      viewMap: 'Voir la carte interactive',
      bloodType: 'Groupe sanguin',
      saveProfile: 'Sauvegarder mon profil sanguin',
      enableReminders: 'Activer les rappels de don',
      reminderInfo: 'Recevez une notification tous les 3 mois',
      loginRequired: 'Connectez-vous pour sauvegarder vos préférences',
      whyDonate: 'Pourquoi donner son sang ?',
      fact1: 'Un don peut sauver jusqu\'à 3 vies',
      fact2: 'Seulement 10-15 minutes',
      fact3: 'Don possible tous les 56 jours',
      fact4: 'Totalement sécurisé et médicalement supervisé',
    },
    ar: {
      title: 'التبرع بالدم والبحث الطارئ',
      subtitle: 'ابحث بسرعة عن المستشفيات ومراكز التبرع بالدم في سيدي بلعباس',
      emergencyFinder: 'البحث الطارئ',
      donateBlood: 'تبرع بالدم',
      reminders: 'التذكيرات',
      info: 'معلومات',
      selectBloodType: 'اختر فصيلة دمك',
      disclaimer: 'يعتمد توفر الدم على المخزون الفعلي للمستشفيات. للحالات الطارئة، اتصل فوراً بخدمات الطوارئ.',
      emergencyCall: 'اتصل بـ 15 للطوارئ',
      eligibilityChecker: 'فحص الأهلية',
      age: 'العمر',
      weight: 'الوزن (كجم)',
      lastDonationDate: 'تاريخ آخر تبرع',
      checkEligibility: 'تحقق من أهليتي',
      eligible: 'أنت مؤهل للتبرع بالدم!',
      notYetEligible: 'لا يمكنك التبرع بعد',
      nextEligible: 'التاريخ المؤهل التالي',
      eligibilityNote: 'هذا تقدير. الموافقة النهائية تعتمد على الطاقم الطبي.',
      findCenter: 'ابحث عن مركز بالقرب مني',
      viewMap: 'عرض الخريطة التفاعلية',
      bloodType: 'فصيلة الدم',
      saveProfile: 'حفظ ملف الدم الخاص بي',
      enableReminders: 'تفعيل تذكيرات التبرع',
      reminderInfo: 'تلقي إشعار كل 3 أشهر',
      loginRequired: 'سجل الدخول لحفظ تفضيلاتك',
      whyDonate: 'لماذا التبرع بالدم؟',
      fact1: 'يمكن لتبرع واحد إنقاذ ما يصل إلى 3 أرواح',
      fact2: '10-15 دقيقة فقط',
      fact3: 'التبرع ممكن كل 56 يومًا',
      fact4: 'آمن تمامًا ومراقب طبيًا',
    },
    en: {
      title: 'Blood Donation & Emergency Finder',
      subtitle: 'Quickly find hospitals and blood donation centers in Sidi Bel Abbès',
      emergencyFinder: 'Emergency Finder',
      donateBlood: 'Donate Blood',
      reminders: 'Reminders',
      info: 'Information',
      selectBloodType: 'Select your blood type',
      disclaimer: 'Blood availability depends on real-time hospital stock. For life-threatening emergencies, contact emergency services immediately.',
      emergencyCall: 'Call 15 for emergencies',
      eligibilityChecker: 'Eligibility Checker',
      age: 'Age',
      weight: 'Weight (kg)',
      lastDonationDate: 'Last donation date',
      checkEligibility: 'Check my eligibility',
      eligible: 'You are eligible to donate blood!',
      notYetEligible: 'You cannot donate yet',
      nextEligible: 'Next eligible date',
      eligibilityNote: 'This is guidance only, not medical approval.',
      findCenter: 'Find a center near me',
      viewMap: 'View interactive map',
      bloodType: 'Blood type',
      saveProfile: 'Save my blood profile',
      enableReminders: 'Enable donation reminders',
      reminderInfo: 'Receive a notification every 3 months',
      loginRequired: 'Log in to save your preferences',
      whyDonate: 'Why donate blood?',
      fact1: 'One donation can save up to 3 lives',
      fact2: 'Only 10-15 minutes',
      fact3: 'Donation possible every 56 days',
      fact4: 'Completely safe and medically supervised',
    }
  }), []);
  
  const tx = texts[language as keyof typeof texts] || texts.fr;
  
  // Check eligibility
  const checkEligibility = () => {
    const age = parseInt(eligibilityAge);
    const weight = parseInt(eligibilityWeight);
    const height = parseInt(eligibilityHeight);
    
    setDaysRemaining(null);

    // Calculate BMI if both weight and height are available
    if (weight > 0 && height > 0) {
      const heightM = height / 100;
      setBmiValue(Math.round((weight / (heightM * heightM)) * 10) / 10);
    } else {
      setBmiValue(null);
    }
    
    if (age < 18 || weight < 50) {
      setEligibilityResult('not_yet');
      setNextEligibleDate(null);
      return;
    }
    
    if (lastDonation) {
      const lastDate = new Date(lastDonation);
      const minWait = 56;
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + minWait);
      
      if (nextDate > new Date()) {
        const remaining = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        setDaysRemaining(remaining);
        setEligibilityResult('not_yet');
        setNextEligibleDate(nextDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR'));
        return;
      }
    }
    
    setEligibilityResult('eligible');
    setNextEligibleDate(null);
  };
  
  // Save blood profile
  const saveBloodProfile = () => {
    localStorage.setItem('blood_profile', JSON.stringify(bloodProfile));
  };

  const profileBloodGroup = (profile as any)?.blood_group;
  const hasAutoFilledDonationDate = profileLoaded && !!bloodProfile.lastDonationDate;
  
  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
      
      <main className="px-4 pt-6 pb-4">
        {/* Emergency Alert Banner - visible to ALL users */}
        {!respondingEmergency && (
          <EmergencyAlertBanner onRespond={setRespondingEmergency} />
        )}

        {/* Donation Confirmation View */}
        {respondingEmergency && (
          <div className="mb-6">
            <DonationConfirmationView
              emergency={respondingEmergency}
              onClose={() => setRespondingEmergency(null)}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <Droplet className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{tx.title}</h1>
            <p className="text-xs text-muted-foreground">{tx.subtitle}</p>
          </div>
        </div>
        
        {/* Emergency Disclaimer */}
        <Alert variant="destructive" className="mb-8 border-destructive/50 bg-destructive/5">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>{tx.emergencyCall}</AlertTitle>
          <AlertDescription>{tx.disclaimer}</AlertDescription>
        </Alert>
        
        {/* CTA - View Map */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link to="/map/blood">
              <Map className="h-5 w-5" />
              {tx.viewMap}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link to="/map/emergency">
              <AlertTriangle className="h-5 w-5" />
              {tx.emergencyFinder}
            </Link>
          </Button>
        </div>

        {/* Real-Time Urgent Needs Feed */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Droplet className="h-5 w-5 text-destructive" />
            {language === 'ar' ? 'الحالات الطارئة الحالية في سيدي بلعباس' : 'Urgences Actuelles à Sidi Bel Abbès'}
          </h2>
          {activeEmergencies.length === 0 ? (
            <div className="p-6 rounded-lg border border-border bg-muted/30 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">
                {language === 'ar' ? 'لا توجد حالات طوارئ حالياً' : 'Aucune urgence en cours'}
              </p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-1 px-1">
              {activeEmergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className={cn(
                    "flex-shrink-0 w-72 p-4 rounded-lg border-2",
                    emergency.urgency_level === 'critical'
                      ? "border-destructive bg-destructive/10"
                      : "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className={cn(
                      "h-6 w-6",
                      emergency.urgency_level === 'critical' ? "text-destructive" : "text-orange-600"
                    )} />
                    <span className="text-2xl font-bold">{emergency.blood_type_needed}</span>
                    <Badge variant={emergency.urgency_level === 'critical' ? 'destructive' : 'secondary'} className="ml-auto">
                      {emergency.urgency_level === 'critical' ? 'Critique' : 'Urgent'}
                    </Badge>
                  </div>
                  {emergency.provider_name && (
                    <p className="text-sm text-muted-foreground mb-3 truncate">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {emergency.provider_name}
                    </p>
                  )}
                  {emergency.message && (
                    <p className="text-xs text-muted-foreground mb-3 italic line-clamp-2">"{emergency.message}"</p>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => setRespondingEmergency(emergency)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Je peux donner
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Main Tabs */}
        <Tabs defaultValue="donate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
            <TabsTrigger value="donate" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Heart className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.donateBlood}</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.reminders}</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Info className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{tx.info}</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Donate Blood */}
          <TabsContent value="donate" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Eligibility Checker */}
              <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {tx.eligibilityChecker}
                  </CardTitle>
                  <CardDescription>
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{tx.eligibilityNote}</AlertDescription>
                    </Alert>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">{tx.age}</Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="100"
                        value={eligibilityAge}
                        onChange={(e) => setEligibilityAge(e.target.value)}
                        placeholder="≥ 18"
                        readOnly={profileAutoFilledAge}
                        className={profileAutoFilledAge ? "opacity-70 cursor-not-allowed" : ""}
                      />
                      {profileAutoFilledAge && (
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar' ? 'تم حسابه من ملفك الشخصي' : 'Calculé depuis votre profil'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">{tx.weight}</Label>
                      <Input
                        id="weight"
                        type="number"
                        min="1"
                        max="300"
                        value={eligibilityWeight}
                        onChange={(e) => setEligibilityWeight(e.target.value)}
                        placeholder="≥ 50"
                        readOnly={profileAutoFilledWeight}
                        className={profileAutoFilledWeight ? "opacity-70 cursor-not-allowed" : ""}
                      />
                      {profileAutoFilledWeight && (
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar' ? 'تم ملؤه من ملفك الشخصي' : 'Pré-rempli depuis votre profil'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Height + BMI row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">{language === 'ar' ? 'الطول (سم)' : 'Taille (cm)'}</Label>
                      <Input
                        id="height"
                        type="number"
                        min="50"
                        max="250"
                        value={eligibilityHeight}
                        onChange={(e) => setEligibilityHeight(e.target.value)}
                        placeholder="≥ 100"
                        readOnly={profileAutoFilledHeight}
                        className={profileAutoFilledHeight ? "opacity-70 cursor-not-allowed" : ""}
                      />
                      {profileAutoFilledHeight && (
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar' ? 'تم ملؤه من ملفك الشخصي' : 'Pré-rempli depuis votre profil'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'مؤشر كتلة الجسم' : 'IMC'}</Label>
                      {bmiValue !== null ? (
                        <div className={cn(
                          "flex items-center gap-2 h-10 px-3 rounded-md border text-sm font-medium",
                          bmiValue < 18.5 ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" :
                          bmiValue <= 25 ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" :
                          bmiValue <= 30 ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" :
                          "border-destructive/50 bg-destructive/10 text-destructive"
                        )}>
                          <span>{bmiValue.toFixed(1)}</span>
                          <span className="text-xs opacity-75">
                            {bmiValue < 18.5 ? (language === 'ar' ? 'نقص الوزن' : 'Insuffisant') :
                             bmiValue <= 25 ? (language === 'ar' ? 'طبيعي' : 'Normal') :
                             bmiValue <= 30 ? (language === 'ar' ? 'زيادة الوزن' : 'Surpoids') :
                             (language === 'ar' ? 'سمنة' : 'Obésité')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center h-10 px-3 rounded-md border text-sm text-muted-foreground">
                          {language === 'ar' ? 'أدخل الوزن والطول' : 'Entrez poids & taille'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastDonation">{tx.lastDonationDate}</Label>
                    <Input
                      id="lastDonation"
                      type="date"
                      value={lastDonation}
                      onChange={(e) => setLastDonation(e.target.value)}
                      readOnly={hasAutoFilledDonationDate}
                      className={hasAutoFilledDonationDate ? "opacity-70 cursor-not-allowed" : ""}
                    />
                    {hasAutoFilledDonationDate && (
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' ? 'تم ملؤه تلقائياً من سجل التبرعات' : 'Pré-rempli depuis votre historique de dons'}
                      </p>
                    )}
                  </div>
                  
                  <Button onClick={checkEligibility} className="w-full">
                    {tx.checkEligibility}
                  </Button>
                  
                  {eligibilityResult && (
                    <div className={cn(
                      "p-4 rounded-lg border",
                      eligibilityResult === 'eligible'
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                        : "bg-amber-50 border-amber-200 dark:bg-amber-900/20"
                    )}>
                      <div className="flex items-center gap-2">
                        {eligibilityResult === 'eligible' ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-300">
                              {tx.eligible}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-amber-600" />
                            <span className="font-medium text-amber-700 dark:text-amber-300">
                              {tx.notYetEligible}
                            </span>
                          </>
                        )}
                      </div>
                      {daysRemaining !== null && (
                        <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                          {language === 'ar'
                            ? `يجب الانتظار ${daysRemaining} يومًا إضافيًا قبل التبرع التالي.`
                            : `Vous devez attendre encore ${daysRemaining} jours avant votre prochain don.`
                          }
                        </p>
                      )}
                      {nextEligibleDate && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {tx.nextEligible}: <strong>{nextEligibleDate}</strong>
                        </p>
                      )}

                      {/* BMI Alert when outside normal range */}
                      {bmiValue !== null && (bmiValue < 18.5 || bmiValue > 30) && (
                        <Alert variant="destructive" className="mt-3 border-destructive/40 bg-destructive/5">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>
                            {language === 'ar' ? 'تنبيه بشأن مؤشر كتلة الجسم' : 'Alerte IMC'}
                          </AlertTitle>
                          <AlertDescription className="text-sm">
                            {bmiValue < 18.5
                              ? (language === 'ar'
                                  ? `مؤشر كتلة الجسم الخاص بك (${bmiValue.toFixed(1)}) أقل من 18.5. قد يؤثر نقص الوزن على أهليتك للتبرع. يُنصح باستشارة طبيب.`
                                  : `Votre IMC (${bmiValue.toFixed(1)}) est inférieur à 18.5. L'insuffisance pondérale peut affecter votre éligibilité au don. Consultez un médecin.`)
                              : (language === 'ar'
                                  ? `مؤشر كتلة الجسم الخاص بك (${bmiValue.toFixed(1)}) أعلى من 30 (سمنة). قد يطلب الطاقم الطبي فحصاً إضافياً قبل التبرع.`
                                  : `Votre IMC (${bmiValue.toFixed(1)}) est supérieur à 30 (obésité). Le personnel médical pourrait demander un examen complémentaire avant le don.`)}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* BMI Info Notification */}
                  <Alert className="border-primary/30 bg-primary/5">
                    <Info className="h-4 w-4" />
                    <AlertTitle>{language === 'ar' ? 'ما هو مؤشر كتلة الجسم (IMC)؟' : "Qu'est-ce que l'IMC ?"}</AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground">
                      {language === 'ar'
                        ? 'مؤشر كتلة الجسم (IMC) هو مقياس يُحسب من الوزن والطول (الوزن ÷ الطول²). يساعد في تقييم ما إذا كان وزنك مناسباً. القيم الطبيعية بين 18.5 و 25. أقل من 18.5 يعني نقص الوزن، بين 25 و 30 يعني زيادة الوزن، وأكثر من 30 يعني السمنة.'
                        : "L'Indice de Masse Corporelle (IMC) est calculé à partir de votre poids et taille (poids ÷ taille²). Il permet d'évaluer si votre corpulence est adaptée. Les valeurs normales se situent entre 18.5 et 25. En dessous de 18.5 : insuffisance pondérale. Entre 25 et 30 : surpoids. Au-dessus de 30 : obésité."}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
              
              {/* Blood Facts */}
              <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-destructive" />
                    {tx.whyDonate}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {[
                      { icon: Users, text: tx.fact1 },
                      { icon: Clock, text: tx.fact2 },
                      { icon: Calendar, text: tx.fact3 },
                      { icon: Shield, text: tx.fact4 }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <item.icon className="h-5 w-5 text-primary" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full mt-4" asChild>
                    <Link to="/map/blood">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tx.findCenter}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab 2: Reminders */}
          <TabsContent value="reminders" className="space-y-6">
            <Card className="bg-card border border-border rounded-xl shadow-sm max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'تذكيرات التبرع' : 'Rappels de Don'}
                </CardTitle>
                <CardDescription>
                  {tx.reminderInfo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isAuthenticated ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{tx.loginRequired}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>{tx.bloodType}</Label>
                      {profileBloodGroup ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-lg py-2 px-4">
                            <Droplet className="h-4 w-4 mr-1" />
                            {profileBloodGroup}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {language === 'ar' ? 'من ملفك الشخصي' : 'Depuis votre profil'}
                          </span>
                        </div>
                      ) : (
                        <Select
                          value={bloodProfile.bloodType || ''}
                          onValueChange={(value) => setBloodProfile({ ...bloodProfile, bloodType: value as BloodType })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={tx.selectBloodType} />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{tx.lastDonationDate}</Label>
                      <Input
                        type="date"
                        value={bloodProfile.lastDonationDate || ''}
                        onChange={(e) => setBloodProfile({ ...bloodProfile, lastDonationDate: e.target.value })}
                        readOnly={hasAutoFilledDonationDate}
                        className={hasAutoFilledDonationDate ? "opacity-70 cursor-not-allowed" : ""}
                      />
                      {hasAutoFilledDonationDate && (
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar' ? 'تم ملؤه تلقائياً من سجل التبرعات' : 'Pré-rempli depuis votre historique de dons'}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {bloodProfile.reminderEnabled ? (
                          <Bell className="h-5 w-5 text-primary" />
                        ) : (
                          <BellOff className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{tx.enableReminders}</p>
                          <p className="text-sm text-muted-foreground">{tx.reminderInfo}</p>
                        </div>
                      </div>
                      <Switch
                        checked={bloodProfile.reminderEnabled}
                        onCheckedChange={(checked) => setBloodProfile({ ...bloodProfile, reminderEnabled: checked })}
                      />
                    </div>
                    
                    <Button onClick={saveBloodProfile} className="w-full">
                      {tx.saveProfile}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab 3: Info */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-destructive" />
                    {language === 'ar' ? 'فصائل الدم' : 'Groupes Sanguins'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {BLOOD_TYPES.map((type) => (
                      <Badge key={type} variant="outline" className="text-lg py-2 px-4">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'O- هو المتبرع العام، AB+ هو المتلقي العام'
                      : 'O- est le donneur universel, AB+ est le receveur universel'
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hospital className="h-5 w-5 text-primary" />
                    {language === 'ar' ? 'أين تتبرع؟' : 'Où donner ?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    {language === 'ar'
                      ? 'يمكنك التبرع في المستشفيات ومراكز التبرع بالدم المعتمدة.'
                      : 'Vous pouvez donner dans les hôpitaux et centres de don agréés.'
                    }
                  </p>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/map/blood">
                      <Map className="h-4 w-4 mr-2" />
                      {tx.viewMap}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    {language === 'ar' ? 'أرقام الطوارئ' : 'Numéros d\'urgence'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <span className="font-medium">SAMU</span>
                    <a href="tel:15" className="text-destructive font-bold text-lg">15</a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{language === 'ar' ? 'الحماية المدنية' : 'Protection Civile'}</span>
                    <a href="tel:14" className="font-bold text-lg">14</a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
