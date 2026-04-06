import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Heart, Bookmark, Share2, Flag, Eye,
  MapPin, Calendar, Clock, ExternalLink, Megaphone, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  getAdById, toggleLike, toggleSave, reportAd, incrementViews,
  getUserLikes, getUserSaves, Ad
} from '@/services/adsService';
import { useAuth } from '@/contexts/AuthContext';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: ad, isLoading, isError } = useQuery<Ad>({
    queryKey: ['/api/ads', id],
    queryFn: () => getAdById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  const { data: userLikes = [] } = useQuery<string[]>({
    queryKey: ['/api/ads/user', user?.uid, 'likes'],
    queryFn: () => getUserLikes(user!.uid),
    enabled: !!user?.uid,
    staleTime: 60 * 1000,
  });

  const { data: userSaves = [] } = useQuery<string[]>({
    queryKey: ['/api/ads/user', user?.uid, 'saves'],
    queryFn: () => getUserSaves(user!.uid),
    enabled: !!user?.uid,
    staleTime: 60 * 1000,
  });

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [animateLike, setAnimateLike] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);
  const [viewsIncremented, setViewsIncremented] = useState(false);

  useEffect(() => {
    if (ad) {
      setLiked(userLikes.includes(ad.id));
      setSaved(userSaves.includes(ad.id));
      setLikesCount(ad.likes_count);
      if (!viewsIncremented) {
        incrementViews(ad.id).catch(() => {});
        setViewsIncremented(true);
      }
    }
  }, [ad, userLikes, userSaves]);

  const handleLike = async () => {
    if (!user) { toast.info('Connectez-vous pour aimer cette annonce'); return; }
    if (!ad) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    if (newLiked) { setAnimateLike(true); setTimeout(() => setAnimateLike(false), 600); }
    try {
      await toggleLike(ad.id, user.uid);
    } catch { setLiked(!newLiked); setLikesCount(ad.likes_count); }
  };

  const handleSave = async () => {
    if (!user) { toast.info('Connectez-vous pour sauvegarder'); return; }
    if (!ad) return;
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      await toggleSave(ad.id, user.uid);
      toast.success(newSaved ? 'Annonce sauvegardée' : 'Retirée des sauvegardes');
    } catch { setSaved(!newSaved); }
  };

  const handleShare = () => {
    if (!ad) return;
    navigator.clipboard.writeText(`${window.location.origin}/annonces/${ad.id}`);
    toast.success('Lien copié !');
  };

  const handleReport = async () => {
    if (!user) { toast.info('Connectez-vous pour signaler'); return; }
    if (!ad) return;
    if (!reportReason) { toast.error('Veuillez sélectionner une raison'); return; }
    setReporting(true);
    try {
      await reportAd(ad.id, user.uid, reportReason, reportDetails);
      toast.success('Signalement envoyé, merci.');
      setShowReportForm(false);
      setReportReason('');
      setReportDetails('');
    } catch {
      toast.error('Erreur lors du signalement');
    } finally {
      setReporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !ad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Megaphone className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground text-center">
          Cette annonce est introuvable ou n'est plus disponible.
        </p>
        <Button onClick={() => navigate('/annonces')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux annonces
        </Button>
      </div>
    );
  }

  const isNew = new Date().getTime() - new Date(ad.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <>
      <Helmet>
        <title>{ad.title} - Annonces Pro | CityHealth</title>
        <meta name="description" content={ad.short_description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Cover image */}
        <div className="relative aspect-video bg-muted">
          {!imgError && ad.image_url ? (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Megaphone className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

          {/* Back button */}
          <button
            data-testid="button-back"
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 h-9 w-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-wrap gap-1.5 justify-end max-w-[60%]">
            {ad.is_featured && (
              <Badge className="bg-amber-500/90 text-white border-0 text-[10px] px-2 backdrop-blur-sm">
                ⭐ Sponsorisé
              </Badge>
            )}
            {ad.is_verified_provider && (
              <Badge className="bg-primary/90 text-primary-foreground border-0 text-[10px] px-2 backdrop-blur-sm">
                ✓ Vérifié
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] px-2 backdrop-blur-sm">
                Nouveau
              </Badge>
            )}
          </div>

          {/* Views */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/80 text-xs bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Eye className="h-3 w-3" />
            {ad.views_count} vues
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5 space-y-5">
          {/* Provider row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={ad.provider_avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {ad.provider_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">{ad.provider_name}</span>
                  {ad.is_verified_provider && (
                    <VerifiedBadge type="verified" size="sm" showTooltip={false} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {ad.provider_type && <span>{ad.provider_type}</span>}
                  {ad.provider_type && ad.provider_city && <span>·</span>}
                  {ad.provider_city && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {ad.provider_city}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link to={`/provider/${ad.provider_id}`}>
              <Button
                data-testid="button-view-provider"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
              >
                Profil <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Title + Description */}
          <div>
            <h1 className="text-xl font-bold mb-2 leading-snug">{ad.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ad.short_description}
            </p>
          </div>

          {/* Full description */}
          {ad.full_description && ad.full_description !== ad.short_description && (
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{ad.full_description}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Publié le {format(new Date(ad.created_at), 'dd MMMM yyyy', { locale: fr })}
            </span>
            {ad.expires_at && (
              <span className="flex items-center gap-1.5 text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                Expire le {format(new Date(ad.expires_at), 'dd MMM yyyy', { locale: fr })}
              </span>
            )}
          </div>

          {/* Engagement bar */}
          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
            <Button
              data-testid="button-like-ad"
              variant={liked ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 relative"
              onClick={handleLike}
            >
              <AnimatePresence>
                {animateLike && (
                  <motion.div
                    className="absolute"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
              <span>{likesCount}</span>
            </Button>

            <Button
              data-testid="button-save-ad"
              variant={saved ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
            >
              <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
              {saved ? 'Sauvegardé' : 'Sauvegarder'}
            </Button>

            <Button
              data-testid="button-share-ad"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Partager
            </Button>

            <Button
              data-testid="button-report-ad"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive ml-auto"
              onClick={() => setShowReportForm((v) => !v)}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>

          {/* Report form */}
          <AnimatePresence>
            {showReportForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger data-testid="select-report-reason">
                      <SelectValue placeholder="Raison du signalement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam / Publicité abusive</SelectItem>
                      <SelectItem value="inappropriate">Contenu inapproprié</SelectItem>
                      <SelectItem value="misleading">Information trompeuse</SelectItem>
                      <SelectItem value="non_medical">Non médical</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    data-testid="textarea-report-details"
                    placeholder="Détails supplémentaires (optionnel)"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      data-testid="button-submit-report"
                      size="sm"
                      variant="destructive"
                      onClick={handleReport}
                      disabled={reporting}
                    >
                      {reporting ? 'Envoi...' : 'Envoyer le signalement'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowReportForm(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </div>
    </>
  );
}
