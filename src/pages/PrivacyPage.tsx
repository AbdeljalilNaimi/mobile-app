import { Shield, Lock, Eye, Database, Clock, UserCheck, Cookie, Server, Mail, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const sections = [
  {
    id: 'introduction',
    icon: Shield,
    title: 'Introduction',
    content: `CityHealth SBA ("nous", "notre", "nos") s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément à la réglementation en vigueur.\n\nNotre plateforme met en relation les citoyens de Sidi Bel Abbès avec les professionnels de santé locaux. Nous traitons vos données avec le plus grand soin et transparence.`,
  },
  {
    id: 'data-collected',
    icon: Database,
    title: 'Données collectées',
    content: `Nous collectons les catégories de données suivantes :\n\n• Nom, prénom, adresse email, numéro de téléphone\n• Photo de profil (optionnelle)\n• Spécialité médicale, numéro d'agrément (prestataires)\n• Adresse et coordonnées géographiques\n• Historique de recherche, rendez-vous et avis`,
  },
  {
    id: 'purposes',
    icon: Eye,
    title: 'Finalités du traitement',
    content: `Vos données sont utilisées pour :\n\n• Mise en relation patients-praticiens\n• Gestion des rendez-vous et affichage cartographique\n• Analyse statistique anonymisée\n• Vérification des identités professionnelles\n• Notifications de rendez-vous et mises à jour du service`,
  },
  {
    id: 'legal-basis',
    icon: UserCheck,
    title: 'Base légale',
    content: `Le traitement repose sur :\n\n• Consentement — création de compte, géolocalisation, communications marketing\n• Exécution du contrat — fourniture du service et gestion des rendez-vous\n• Obligation légale — conservation des données de santé, vérification des qualifications\n• Intérêt légitime — sécurité de la plateforme et amélioration du service`,
  },
  {
    id: 'retention',
    icon: Clock,
    title: 'Durée de conservation',
    content: `• Compte actif — durée de l'utilisation\n• Compte inactif — 3 ans après dernière connexion\n• Données de santé — 10 ans (obligation légale)\n• Logs de connexion — 1 an\n• Données de facturation — 10 ans\n\nAprès ces délais, vos données sont supprimées ou anonymisées de manière irréversible.`,
  },
  {
    id: 'rights',
    icon: UserCheck,
    title: 'Vos droits',
    content: `Vous disposez des droits suivants :\n\n• Accès — obtenir une copie de vos données\n• Rectification — corriger des données inexactes\n• Effacement — demander la suppression (sous conditions)\n• Portabilité — recevoir vos données dans un format structuré\n• Opposition — vous opposer au traitement\n• Limitation — restreindre le traitement\n\nContact : privacy@cityhealth-sba.dz`,
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: 'Cookies',
    content: `Notre site utilise des cookies :\n\n• Essentiels — authentification, sécurité, session\n• Analytiques — statistiques d'utilisation anonymisées\n• Fonctionnels — mémorisation des préférences\n\nVous pouvez gérer vos préférences dans les paramètres de votre navigateur.`,
  },
  {
    id: 'security',
    icon: Server,
    title: 'Sécurité',
    content: `Mesures de protection :\n\n• Chiffrement SSL/TLS pour toutes les communications\n• Chiffrement des données sensibles au repos\n• Authentification sécurisée avec hachage des mots de passe\n• Accès limité aux données (moindre privilège)\n• Audits de sécurité réguliers\n• Procédures de notification en cas de violation`,
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact',
    content: `CityHealth SBA\nSidi Bel Abbès, Algérie\n\nDélégué à la Protection des Données :\ndpo@cityhealth-sba.dz\n\nAdresse postale :\nCityHealth SBA - DPO\nBP 123, Sidi Bel Abbès 22000, Algérie\n\nNous répondons sous 30 jours.`,
  },
];

const PrivacyPage = () => {
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
          <h1 className="text-lg font-bold text-foreground">Politique de confidentialité</h1>
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
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-[15px] mb-1">En résumé</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Vos données sont protégées par des mesures de sécurité avancées et ne sont jamais vendues à des tiers.
                Vous pouvez exercer vos droits à tout moment.
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
            Cette politique fait partie de nos{' '}
            <Link to="/terms" className="text-primary font-medium hover:underline">
              Conditions Générales
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

export default PrivacyPage;
