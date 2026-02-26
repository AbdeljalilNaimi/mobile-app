import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Loader2, User, Mail, Phone, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAdminProfile, updateAdminProfile, uploadAdminAvatar, changeAdminPassword, createAdminProfile, type AdminProfile } from '@/services/adminProfileService';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  moderator: 'Modérateur',
  support: 'Support',
};

export default function AdminProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', bio: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data = await getAdminProfile(user.uid);
      if (!data) {
        data = await createAdminProfile(user.uid, user.email || '', 'moderator');
      }
      setProfile(data);
      setFormData({ fullName: data.fullName || '', phone: data.phone || '', bio: data.bio || '' });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      await updateAdminProfile(user.uid, formData);
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été sauvegardées' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadAdminAvatar(user.uid, file);
      setProfile(prev => prev ? { ...prev, avatarUrl: url } : null);
      toast({ title: 'Photo mise à jour' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de télécharger la photo', variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    try {
      await changeAdminPassword(passwordData.current, passwordData.new);
      setPasswordData({ current: '', new: '', confirm: '' });
      toast({ title: 'Mot de passe modifié' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Vérifiez votre mot de passe actuel', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-6 max-w-4xl mx-auto">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Mon Profil Admin</h1>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatarUrl} />
                  <AvatarFallback className="text-2xl"><User /></AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
                <p className="text-muted-foreground">{profile?.email}</p>
                <Badge className="mt-2">{ROLE_LABELS[profile?.role || 'moderator']}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} rows={3} />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Sauvegarder
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Sécurité</CardTitle>
            <CardDescription>Modifier votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Mot de passe actuel</Label>
                <Input type="password" value={passwordData.current} onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input type="password" value={passwordData.new} onChange={e => setPasswordData(p => ({ ...p, new: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Confirmer</Label>
                <Input type="password" value={passwordData.confirm} onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))} />
              </div>
            </div>
            <Button variant="outline" onClick={handleChangePassword} disabled={!passwordData.current || !passwordData.new}>
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
