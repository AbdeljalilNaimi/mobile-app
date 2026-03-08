import { FileText, Users, Stethoscope, Scale, AlertTriangle, Ban, RefreshCw, Gavel, Clock, Mail, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const sections = [
  {
    id: 'object',
    icon: FileText,
    title: 'Objet',
    content: `Les présentes CGU régissent l'accès et l'utilisation de CityHealth SBA, plateforme numérique de mise en relation entre :\n\n• Les citoyens recherchant des soins de santé\n• Les professionnels de santé (médecins, pharmacies, cliniques, laboratoires)\n\nLe service permet la recherche de praticiens, la consultation de profils, la prise de rendez-vous et l'accès à une carte interactive.`,
  },
  {
    id: 'acceptance',
    icon: Users,
    title: 'Acceptation & Accès',
    content: `L'utilisation implique l'acceptation pleine des présentes CGU.\n\n• Être âgé d'au moins 18 ans ou avoir l'autorisation d'un représentant légal\n• Fournir des informations exactes et à jour\n• Ne pas utiliser le service à des fins illicites\n\nCityHealth SBA peut modifier ces CGU avec un préavis de 30 jours par email et notification.`,
  },
  {
    id: 'registration',
    icon: Users,
    title: 'Inscription',
    content: `Compte Citoyen (gratuit) :\n• Adresse email valide, mot de passe sécurisé\n• Informations d'identification (nom, prénom)\n\nCompte Prestataire :\n• Informations de l'établissement\n• Documents justificatifs (agrément, diplômes)\n• Validation par notre équipe (jusqu'à 5 jours ouvrés)\n\nUn prestataire non vérifié n'apparaît pas dans les recherches.`,
  },
  {
    id: 'user-obligations',
    icon: Users,
    title: 'Obligations des utilisateurs',
    content: `Tout utilisateur s'engage à :\n\n• Fournir des informations véridiques et les mettre à jour\n• Ne pas usurper l'identité d'un tiers\n• Respecter les autres utilisateurs et prestataires\n• Ne pas publier de contenu diffamatoire ou illégal\n• Maintenir la confidentialité de ses identifiants\n• Signaler tout accès non autorisé`,
  },
  {
    id: 'provider-obligations',
    icon: Stethoscope,
    title: 'Obligations des prestataires',
    content: `Les professionnels de santé s'engagent à :\n\n• Détenir toutes les autorisations légales d'exercice\n• Maintenir à jour qualifications et agréments\n• Fournir des informations exactes sur services et tarifs\n• Respecter les rendez-vous pris via la plateforme\n• Maintenir à jour leur calendrier de disponibilités\n• Prévenir en cas d'absence ou fermeture exceptionnelle`,
  },
  {
    id: 'intellectual-property',
    icon: Scale,
    title: 'Propriété intellectuelle',
    content: `La marque CityHealth SBA, le logo, le design et l'ensemble des contenus sont protégés par le droit de la propriété intellectuelle.\n\nLes utilisateurs conservent leurs droits sur le contenu publié (avis, photos) mais accordent une licence non exclusive à CityHealth SBA pour l'affichage sur la plateforme.`,
  },
  {
    id: 'liability',
    icon: AlertTriangle,
    title: 'Responsabilités',
    content: `CityHealth SBA agit en tant qu'intermédiaire technique.\n\nExclusions :\n• Qualité des soins dispensés par les prestataires\n• Exactitude des informations fournies par les utilisateurs\n• Interruptions temporaires pour maintenance\n\nEngagements :\n• Maintenir la disponibilité du service\n• Protéger les données personnelles\n• Vérifier les qualifications des prestataires`,
  },
  {
    id: 'termination',
    icon: Ban,
    title: 'Résiliation',
    content: `Par l'utilisateur : suppression à tout moment depuis les paramètres.\n\nPar CityHealth SBA en cas de :\n• Violation des CGU\n• Informations fausses ou trompeuses\n• Comportement nuisible\n• Inactivité prolongée (+ de 3 ans)\n\nConséquences : suppression des données (sauf obligation légale), perte d'accès, conservation anonymisée des avis.`,
  },
  {
    id: 'modifications',
    icon: RefreshCw,
    title: 'Modifications du service',
    content: `CityHealth SBA peut :\n\n• Ajouter, modifier ou supprimer des fonctionnalités\n• Modifier la structure tarifaire (préavis de 30 jours)\n• Interrompre temporairement le service pour maintenance\n\nEn cas de cessation définitive, les utilisateurs seront informés au moins 90 jours à l'avance et pourront récupérer leurs données.`,
  },
  {
    id: 'applicable-law',
    icon: Gavel,
    title: 'Droit applicable',
    content: `Les présentes CGU sont régies par le droit algérien.\n\nEn cas de litige :\n• Recherche d'une solution amiable (30 jours)\n• À défaut, tribunaux compétents de Sidi Bel Abbès\n• Possibilité de recours gratuit à un médiateur\n\nSi une clause est déclarée nulle, les autres restent en vigueur.`,
  },
];

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] max-w-[430px] mx-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-muted/60 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Conditions d'utilisation</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary/[0.06] border border-primary/10 p-5"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-[15px] mb-1">En résumé</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                CityHealth SBA met en relation patients et professionnels de santé.
                En utilisant nos services, vous acceptez de fournir des informations exactes et de respecter la législation algérienne.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-medium">
          <Clock className="h-3 w-3" />
          Dernière mise à jour : 8 mars 2026
        </div>

        {/* Sections */}
        <Accordion type="single" collapsible className="space-y-2.5">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <AccordionItem
                value={section.id}
                className="border border-border rounded-xl bg-card overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline px-4 py-3.5 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/8">
                      <section.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground text-left text-[14px]">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="pl-[42px] text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        {/* Footer */}
        <div className="text-center pt-2 pb-6 space-y-3">
          <p className="text-[12px] text-muted-foreground/50">
            Ces CGU sont complétées par notre{' '}
            <Link to="/privacy" className="text-primary font-medium hover:underline">
              Politique de Confidentialité
            </Link>
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
