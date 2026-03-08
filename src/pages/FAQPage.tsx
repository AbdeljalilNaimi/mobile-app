import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  Users,
  Stethoscope,
  Settings,
  Siren,
  Shield,
  ArrowLeft,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqCategories = [
  { id: "all", label: "Tous", icon: Sparkles },
  { id: "citizens", label: "Citoyens", icon: Users },
  { id: "providers", label: "Prestataires", icon: Stethoscope },
  { id: "technical", label: "Technique", icon: Settings },
  { id: "emergency", label: "Urgences", icon: Siren },
  { id: "security", label: "Sécurité", icon: Shield },
];

const faqData: FAQItem[] = [
  // Citoyens
  { id: "c1", question: "Comment créer un compte citoyen ?", answer: "Pour créer un compte citoyen, cliquez sur 'Connexion Citoyen' dans le menu puis sur 'Créer un compte'. Remplissez le formulaire avec votre email, un mot de passe sécurisé et vos informations personnelles. Vous recevrez un email de confirmation pour activer votre compte.", category: "citizens" },
  { id: "c2", question: "Comment rechercher un médecin ou spécialiste ?", answer: "Utilisez la barre de recherche sur la page d'accueil ou accédez à la carte interactive. Vous pouvez filtrer par spécialité (médecin généraliste, cardiologue, dentiste...), par localisation dans Sidi Bel Abbès, par disponibilité ou par avis des patients.", category: "citizens" },
  { id: "c3", question: "Comment utiliser la carte interactive ?", answer: "La carte interactive affiche tous les professionnels de santé vérifiés à Sidi Bel Abbès. Cliquez sur un marqueur pour voir les détails du praticien. Vous pouvez zoomer, filtrer par type d'établissement et activer la géolocalisation pour trouver les praticiens les plus proches.", category: "citizens" },
  { id: "c4", question: "Comment prendre rendez-vous en ligne ?", answer: "Trouvez le praticien souhaité, consultez ses disponibilités affichées sur son profil et cliquez sur 'Prendre RDV'. Sélectionnez un créneau horaire disponible, confirmez vos coordonnées et vous recevrez une confirmation par email et SMS.", category: "citizens" },
  { id: "c5", question: "Comment ajouter un praticien à mes favoris ?", answer: "Connectez-vous à votre compte citoyen, puis sur la fiche d'un praticien, cliquez sur l'icône cœur. Retrouvez tous vos favoris dans la section 'Mes Favoris' accessible depuis votre tableau de bord.", category: "citizens" },
  { id: "c6", question: "Comment contacter un professionnel de santé ?", answer: "Sur la fiche du praticien, vous trouverez ses coordonnées (téléphone, email si disponible). Certains praticiens proposent également un formulaire de contact direct ou la prise de rendez-vous en ligne.", category: "citizens" },
  { id: "c7", question: "L'utilisation de CityHealth est-elle gratuite ?", answer: "Oui, CityHealth est entièrement gratuit pour les citoyens. La recherche de praticiens, la consultation des fiches, l'ajout aux favoris et la prise de rendez-vous sont des fonctionnalités gratuites.", category: "citizens" },
  { id: "c8", question: "Comment modifier mes informations personnelles ?", answer: "Connectez-vous à votre compte, accédez à 'Mon Profil' depuis le menu. Vous pouvez y modifier vos informations personnelles, votre numéro de téléphone, votre adresse email et gérer vos préférences de notification.", category: "citizens" },
  // Prestataires
  { id: "p1", question: "Comment s'inscrire en tant que professionnel de santé ?", answer: "Cliquez sur 'Espace Pro' puis 'S'inscrire'. Remplissez le formulaire d'inscription avec vos informations professionnelles, téléchargez vos documents justificatifs (diplôme, autorisation d'exercer) et soumettez votre demande. Notre équipe vérifiera votre dossier sous 48h.", category: "providers" },
  { id: "p2", question: "Quel est le processus de vérification ?", answer: "Après soumission de votre dossier, notre équipe vérifie l'authenticité de vos documents, votre inscription à l'Ordre professionnel concerné et vos qualifications. Ce processus prend généralement 24 à 48 heures ouvrables. Vous recevrez un email confirmant votre vérification.", category: "providers" },
  { id: "p3", question: "Quels documents sont nécessaires pour la vérification ?", answer: "Les documents requis incluent : copie du diplôme, autorisation d'exercer délivrée par les autorités compétentes, attestation d'inscription à l'Ordre professionnel, pièce d'identité et photo professionnelle.", category: "providers" },
  { id: "p4", question: "Comment gérer mon profil et mes disponibilités ?", answer: "Depuis votre tableau de bord professionnel, accédez à 'Mon Profil' pour modifier vos informations et à 'Planning' pour gérer vos disponibilités. Vous pouvez définir vos horaires de consultation, bloquer des créneaux et gérer vos absences.", category: "providers" },
  { id: "p5", question: "Comment recevoir des demandes de rendez-vous ?", answer: "Une fois votre profil vérifié et vos disponibilités configurées, les citoyens peuvent prendre rendez-vous directement. Vous recevrez une notification par email et dans votre tableau de bord pour chaque nouvelle demande.", category: "providers" },
  { id: "p6", question: "Comment apparaître en tête des résultats ?", answer: "Plusieurs facteurs influencent votre positionnement : complétude de votre profil, avis positifs des patients, temps de réponse aux demandes et fréquence de mise à jour de vos disponibilités.", category: "providers" },
  { id: "p7", question: "L'inscription est-elle payante pour les professionnels ?", answer: "L'inscription de base est gratuite et inclut : fiche praticien, géolocalisation sur la carte, gestion des disponibilités. Des options premium peuvent être proposées pour une meilleure visibilité.", category: "providers" },
  // Technique
  { id: "t1", question: "Quels navigateurs sont compatibles ?", answer: "CityHealth est compatible avec les versions récentes de Chrome, Firefox, Safari et Edge. Pour une expérience optimale, nous recommandons d'utiliser la dernière version de votre navigateur et d'activer JavaScript.", category: "technical" },
  { id: "t2", question: "Existe-t-il une application mobile ?", answer: "CityHealth est une application web progressive (PWA) qui fonctionne comme une application native. Sur mobile, vous pouvez l'ajouter à votre écran d'accueil via le menu de votre navigateur pour un accès rapide.", category: "technical" },
  { id: "t3", question: "Je n'arrive pas à me connecter, que faire ?", answer: "Vérifiez que votre email est correct, que les majuscules de votre mot de passe sont respectées. Si le problème persiste, cliquez sur 'Mot de passe oublié' pour réinitialiser. Contactez notre support si besoin.", category: "technical" },
  { id: "t4", question: "Comment réinitialiser mon mot de passe ?", answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre adresse email et vous recevrez un lien de réinitialisation valable 24 heures.", category: "technical" },
  { id: "t5", question: "La carte ne s'affiche pas, que faire ?", answer: "Vérifiez votre connexion internet et rafraîchissez la page. Si le problème persiste, essayez de vider le cache de votre navigateur ou d'utiliser un autre navigateur.", category: "technical" },
  { id: "t6", question: "Comment activer les notifications ?", answer: "Dans votre profil, accédez à 'Paramètres' puis 'Notifications'. Vous pouvez activer les notifications par email, SMS ou push (navigateur).", category: "technical" },
  // Urgences
  { id: "e1", question: "Quels sont les numéros d'urgence ?", answer: "SAMU : 15 | Protection Civile : 14 | Police : 17 | Gendarmerie : 1055. Ces numéros sont disponibles 24h/24. En cas d'urgence vitale, appelez immédiatement le 15.", category: "emergency" },
  { id: "e2", question: "Comment trouver une pharmacie de garde ?", answer: "Utilisez notre section 'Urgences' accessible depuis le menu principal ou la carte interactive. Filtrez par 'Pharmacies de garde' pour voir celles ouvertes actuellement.", category: "emergency" },
  { id: "e3", question: "Comment accéder aux urgences les plus proches ?", answer: "Activez votre géolocalisation sur la carte interactive et sélectionnez le filtre 'Urgences'. La carte vous montrera les services d'urgences les plus proches avec l'itinéraire.", category: "emergency" },
  { id: "e4", question: "CityHealth peut-il remplacer un avis médical ?", answer: "Non. CityHealth est un outil d'information et de mise en relation. Il ne remplace en aucun cas une consultation médicale. En cas de symptômes inquiétants, consultez un médecin ou appelez les urgences.", category: "emergency" },
  // Données & Sécurité
  { id: "s1", question: "Comment mes données sont-elles protégées ?", answer: "Vos données sont chiffrées en transit (HTTPS) et au repos. Nous utilisons des protocoles de sécurité avancés, des sauvegardes régulières et un hébergement sécurisé conforme aux normes internationales.", category: "security" },
  { id: "s2", question: "Quelles données collectez-vous ?", answer: "Nous collectons les données nécessaires au fonctionnement du service : informations de compte, données de recherche, et pour les prestataires, leurs informations professionnelles. Consultez notre Politique de Confidentialité.", category: "security" },
  { id: "s3", question: "Puis-je supprimer mon compte ?", answer: "Oui, vous pouvez demander la suppression de votre compte à tout moment depuis les paramètres de votre profil ou en nous contactant. Vos données seront supprimées sous 30 jours.", category: "security" },
  { id: "s4", question: "Mes données de santé sont-elles partagées ?", answer: "Non. Nous ne partageons jamais vos données de santé avec des tiers sans votre consentement explicite. Les informations de rendez-vous sont uniquement accessibles par vous et le praticien concerné.", category: "security" },
  { id: "s5", question: "Comment exercer mes droits sur mes données ?", answer: "Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité. Rendez-vous dans 'Paramètres > Données personnelles' ou contactez notre support.", category: "security" },
];

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const filteredFAQs = useMemo(() => {
    let items = faqData;
    if (activeCategory !== "all") {
      items = items.filter((item) => item.category === activeCategory);
    }
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }
    return items;
  }, [activeCategory, debouncedSearch]);

  const getCategoryCount = (categoryId: string) => {
    let items = categoryId === "all" ? faqData : faqData.filter((item) => item.category === categoryId);
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }
    return items.length;
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Immersive Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-foreground/10 blur-2xl" />

        <div className="relative px-5 pt-14 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <Badge className="bg-primary-foreground/15 text-primary-foreground border-0 backdrop-blur-sm text-xs">
                {faqData.length}+ questions
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground leading-tight">
              Foire aux Questions
            </h1>
            <p className="text-sm text-primary-foreground/70 mt-2 max-w-xs">
              Recherchez ou parcourez les catégories pour trouver votre réponse.
            </p>
          </motion.div>
        </div>

        {/* Wave separator */}
        <svg viewBox="0 0 1440 40" className="w-full block" preserveAspectRatio="none">
          <path
            d="M0,20 C240,40 480,0 720,20 C960,40 1200,0 1440,20 L1440,40 L0,40 Z"
            className="fill-background"
          />
        </svg>
      </div>

      {/* Search */}
      <div className="px-5 -mt-3 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une question…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-10 rounded-xl bg-card border border-border shadow-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </motion.div>
        {debouncedSearch && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            {filteredFAQs.length} résultat{filteredFAQs.length > 1 ? "s" : ""} pour « {debouncedSearch} »
          </p>
        )}
      </div>

      {/* Category Pills */}
      <div className="mt-4 px-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-5 px-5">
          {faqCategories.map((cat) => {
            const Icon = cat.icon;
            const count = getCategoryCount(cat.id);
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 snap-start flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="px-5 mt-5 space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filteredFAQs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Aucun résultat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Essayez d'autres termes ou parcourez les catégories.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="text-sm font-medium text-primary"
              >
                Réinitialiser
              </button>
            </motion.div>
          ) : (
            filteredFAQs.map((faq, index) => {
              const isOpen = openItem === faq.id;
              const catInfo = faqCategories.find(c => c.id === faq.category);
              const CatIcon = catInfo?.icon || HelpCircle;
              return (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <button
                    onClick={() => setOpenItem(isOpen ? null : faq.id)}
                    className="w-full text-left rounded-xl bg-card border border-border shadow-sm overflow-hidden transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-3 p-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isOpen ? "bg-primary/15" : "bg-muted/60"
                      } transition-colors`}>
                        <CatIcon className={`h-4 w-4 ${isOpen ? "text-primary" : "text-muted-foreground"} transition-colors`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold leading-snug ${isOpen ? "text-primary" : "text-foreground"} transition-colors`}>
                          {highlightText(faq.question, debouncedSearch)}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pl-[60px]">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {highlightText(faq.answer, debouncedSearch)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-5 mt-8"
      >
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Pas trouvé votre réponse ?</h3>
              <p className="text-xs text-muted-foreground">Notre équipe est là pour vous aider</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="sm" className="rounded-xl h-10 text-xs font-semibold">
              <Link to="/contact">
                Nous contacter
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl h-10 text-xs font-semibold">
              <Link to="/docs">
                Documentation
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="mx-5 mt-5 grid grid-cols-3 gap-2">
        {[
          { to: "/privacy", icon: Shield, label: "Confidentialité", color: "text-primary" },
          { to: "/terms", icon: HelpCircle, label: "CGU", color: "text-primary" },
          { to: "/emergency", icon: Siren, label: "Urgences", color: "text-destructive" },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border shadow-sm active:scale-95 transition-transform"
          >
            <link.icon className={`h-4 w-4 ${link.color}`} />
            <span className="text-[10px] font-medium text-foreground">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
