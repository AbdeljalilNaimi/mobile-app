import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Mail,
  Phone,
  Globe,
  Shield,
  Bell,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getSettings,
  updateSettings,
  resetToDefaults,
  type PlatformSettings,
} from '@/services/platformSettingsService';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon, children }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

interface ToggleSettingProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleSetting({ label, description, checked, onCheckedChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function SettingsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings || !user) return;
    
    setSaving(true);
    try {
      await updateSettings(settings, user.uid, user.email || '');
      setHasChanges(false);
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Les modifications ont été enregistrées',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    
    try {
      await resetToDefaults(user.uid, user.email || '');
      await loadSettings();
      setHasChanges(false);
      toast({
        title: 'Paramètres réinitialisés',
        description: 'Les valeurs par défaut ont été restaurées',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de réinitialiser les paramètres',
        variant: 'destructive',
      });
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Bar */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Vous avez des modifications non sauvegardées</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSettings}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>
      )}

      {/* General Settings */}
      <SettingsSection
        title="Paramètres Généraux"
        description="Informations de base de la plateforme"
        icon={<Globe className="h-5 w-5 text-primary" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="platformName">Nom de la plateforme</Label>
            <Input
              id="platformName"
              value={settings.platformName}
              onChange={(e) => handleUpdateSetting('platformName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Email de support</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="supportEmail"
                type="email"
                className="pl-10"
                value={settings.supportEmail}
                onChange={(e) => handleUpdateSetting('supportEmail', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyNumber">Numéro d'urgence</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="emergencyNumber"
                className="pl-10"
                value={settings.emergencyNumber}
                onChange={(e) => handleUpdateSetting('emergencyNumber', e.target.value)}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Registration Settings */}
      <SettingsSection
        title="Inscription & Vérification"
        description="Paramètres pour l'inscription des prestataires"
        icon={<Shield className="h-5 w-5 text-primary" />}
      >
        <ToggleSetting
          label="Vérification documentaire obligatoire"
          description="Les prestataires doivent soumettre des documents pour vérification"
          checked={settings.requireDocumentVerification}
          onCheckedChange={(v) => handleUpdateSetting('requireDocumentVerification', v)}
        />
        <Separator />
        <ToggleSetting
          label="Approbation automatique"
          description="Approuver automatiquement les nouveaux prestataires (non recommandé)"
          checked={settings.autoApproveNewProviders}
          onCheckedChange={(v) => handleUpdateSetting('autoApproveNewProviders', v)}
        />
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxDocSize">Taille max. des documents (MB)</Label>
            <Input
              id="maxDocSize"
              type="number"
              min={1}
              max={50}
              value={settings.maxDocumentSizeMb}
              onChange={(e) => handleUpdateSetting('maxDocumentSizeMb', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPhotos">Nombre max. de photos par prestataire</Label>
            <Input
              id="maxPhotos"
              type="number"
              min={1}
              max={20}
              value={settings.maxPhotosPerProvider}
              onChange={(e) => handleUpdateSetting('maxPhotosPerProvider', parseInt(e.target.value))}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Feature Toggles */}
      <SettingsSection
        title="Fonctionnalités"
        description="Activer ou désactiver les modules de la plateforme"
        icon={<Sparkles className="h-5 w-5 text-primary" />}
      >
        <ToggleSetting
          label="Assistant IA"
          description="Chatbot d'assistance santé pour les utilisateurs"
          checked={settings.enableAIChat}
          onCheckedChange={(v) => handleUpdateSetting('enableAIChat', v)}
        />
        <Separator />
        <ToggleSetting
          label="Annonces médicales"
          description="Permettre aux prestataires de publier des annonces"
          checked={settings.enableMedicalAds}
          onCheckedChange={(v) => handleUpdateSetting('enableMedicalAds', v)}
        />
        <Separator />
        <ToggleSetting
          label="Don de sang"
          description="Module de recherche de donneurs de sang"
          checked={settings.enableBloodDonation}
          onCheckedChange={(v) => handleUpdateSetting('enableBloodDonation', v)}
        />
        <Separator />
        <ToggleSetting
          label="Module Urgences"
          description="Page des numéros et services d'urgence"
          checked={settings.enableEmergencyModule}
          onCheckedChange={(v) => handleUpdateSetting('enableEmergencyModule', v)}
        />
        <Separator />
        <ToggleSetting
          label="Système d'avis"
          description="Permettre aux utilisateurs de laisser des avis"
          checked={settings.enableReviewSystem}
          onCheckedChange={(v) => handleUpdateSetting('enableReviewSystem', v)}
        />
        <Separator />
        <ToggleSetting
          label="Modération des avis"
          description="Les avis doivent être approuvés avant publication"
          checked={settings.reviewModerationEnabled}
          onCheckedChange={(v) => handleUpdateSetting('reviewModerationEnabled', v)}
        />
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection
        title="Notifications"
        description="Configuration des notifications email et alertes"
        icon={<Bell className="h-5 w-5 text-primary" />}
      >
        <ToggleSetting
          label="Email à l'inscription"
          description="Envoyer un email de confirmation aux nouveaux inscrits"
          checked={settings.sendEmailOnRegistration}
          onCheckedChange={(v) => handleUpdateSetting('sendEmailOnRegistration', v)}
        />
        <Separator />
        <ToggleSetting
          label="Email à l'approbation"
          description="Notifier les prestataires de leur approbation"
          checked={settings.sendEmailOnApproval}
          onCheckedChange={(v) => handleUpdateSetting('sendEmailOnApproval', v)}
        />
        <Separator />
        <ToggleSetting
          label="Email au rejet"
          description="Notifier les prestataires en cas de rejet"
          checked={settings.sendEmailOnRejection}
          onCheckedChange={(v) => handleUpdateSetting('sendEmailOnRejection', v)}
        />
        <Separator />
        <ToggleSetting
          label="Alerte admin - Nouvelle inscription"
          description="Notifier les admins des nouvelles inscriptions"
          checked={settings.adminNotifyOnNewRegistration}
          onCheckedChange={(v) => handleUpdateSetting('adminNotifyOnNewRegistration', v)}
        />
        <Separator />
        <ToggleSetting
          label="Alerte admin - Demande de vérification"
          description="Notifier les admins des demandes de vérification"
          checked={settings.adminNotifyOnVerificationRequest}
          onCheckedChange={(v) => handleUpdateSetting('adminNotifyOnVerificationRequest', v)}
        />
      </SettingsSection>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zone Dangereuse
          </CardTitle>
          <CardDescription>
            Actions irréversibles - procédez avec précaution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Réinitialiser les paramètres</p>
              <p className="text-sm text-muted-foreground">
                Restaurer tous les paramètres à leurs valeurs par défaut
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Réinitialiser les paramètres ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action va restaurer tous les paramètres à leurs valeurs par défaut.
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Réinitialiser
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
