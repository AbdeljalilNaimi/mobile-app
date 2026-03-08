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
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqDataFr: FAQItem[] = [
  { id: "c1", question: "Comment créer un compte citoyen ?", answer: "Pour créer un compte citoyen, cliquez sur 'Connexion Citoyen' dans le menu puis sur 'Créer un compte'. Remplissez le formulaire avec votre email, un mot de passe sécurisé et vos informations personnelles. Vous recevrez un email de confirmation pour activer votre compte.", category: "citizens" },
  { id: "c2", question: "Comment rechercher un médecin ou spécialiste ?", answer: "Utilisez la barre de recherche sur la page d'accueil ou accédez à la carte interactive. Vous pouvez filtrer par spécialité, par localisation, par disponibilité ou par avis des patients.", category: "citizens" },
  { id: "c3", question: "Comment utiliser la carte interactive ?", answer: "La carte interactive affiche tous les professionnels de santé vérifiés. Cliquez sur un marqueur pour voir les détails du praticien. Vous pouvez zoomer, filtrer par type d'établissement et activer la géolocalisation.", category: "citizens" },
  { id: "c4", question: "Comment prendre rendez-vous en ligne ?", answer: "Trouvez le praticien souhaité, consultez ses disponibilités et cliquez sur 'Prendre RDV'. Sélectionnez un créneau horaire, confirmez vos coordonnées et vous recevrez une confirmation.", category: "citizens" },
  { id: "c5", question: "L'utilisation de CityHealth est-elle gratuite ?", answer: "Oui, CityHealth est entièrement gratuit pour les citoyens. La recherche, la consultation des fiches, l'ajout aux favoris et la prise de rendez-vous sont des fonctionnalités gratuites.", category: "citizens" },
  { id: "p1", question: "Comment s'inscrire en tant que professionnel de santé ?", answer: "Cliquez sur 'Espace Pro' puis 'S'inscrire'. Remplissez le formulaire avec vos informations professionnelles, téléchargez vos documents justificatifs. Notre équipe vérifiera votre dossier sous 48h.", category: "providers" },
  { id: "p2", question: "Quel est le processus de vérification ?", answer: "Après soumission, notre équipe vérifie vos documents, votre inscription à l'Ordre professionnel et vos qualifications. Ce processus prend 24 à 48 heures ouvrables.", category: "providers" },
  { id: "p3", question: "L'inscription est-elle payante pour les professionnels ?", answer: "L'inscription de base est gratuite et inclut : fiche praticien, géolocalisation sur la carte, gestion des disponibilités.", category: "providers" },
  { id: "t1", question: "Quels navigateurs sont compatibles ?", answer: "CityHealth est compatible avec Chrome, Firefox, Safari et Edge. Pour une expérience optimale, utilisez la dernière version de votre navigateur.", category: "technical" },
  { id: "t2", question: "Existe-t-il une application mobile ?", answer: "CityHealth est une application web progressive (PWA). Sur mobile, vous pouvez l'ajouter à votre écran d'accueil via le menu de votre navigateur.", category: "technical" },
  { id: "t3", question: "Comment réinitialiser mon mot de passe ?", answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre adresse email et vous recevrez un lien de réinitialisation valable 24 heures.", category: "technical" },
  { id: "e1", question: "Quels sont les numéros d'urgence ?", answer: "SAMU : 15 | Protection Civile : 14 | Police : 17 | Gendarmerie : 1055. Ces numéros sont disponibles 24h/24.", category: "emergency" },
  { id: "e2", question: "Comment trouver une pharmacie de garde ?", answer: "Utilisez notre section 'Urgences' ou la carte interactive. Filtrez par 'Pharmacies de garde' pour voir celles ouvertes actuellement.", category: "emergency" },
  { id: "e3", question: "CityHealth peut-il remplacer un avis médical ?", answer: "Non. CityHealth est un outil d'information et de mise en relation. Il ne remplace en aucun cas une consultation médicale.", category: "emergency" },
  { id: "s1", question: "Comment mes données sont-elles protégées ?", answer: "Vos données sont chiffrées en transit (HTTPS) et au repos. Nous utilisons des protocoles de sécurité avancés et un hébergement sécurisé.", category: "security" },
  { id: "s2", question: "Puis-je supprimer mon compte ?", answer: "Oui, vous pouvez demander la suppression de votre compte à tout moment depuis les paramètres ou en nous contactant. Vos données seront supprimées sous 30 jours.", category: "security" },
  { id: "s3", question: "Mes données de santé sont-elles partagées ?", answer: "Non. Nous ne partageons jamais vos données de santé avec des tiers sans votre consentement explicite.", category: "security" },
];

const faqDataAr: FAQItem[] = [
  { id: "c1", question: "كيف أنشئ حساب مواطن؟", answer: "لإنشاء حساب مواطن، انقر على 'تسجيل دخول المواطن' في القائمة ثم على 'إنشاء حساب'. املأ النموذج ببريدك الإلكتروني وكلمة مرور آمنة ومعلوماتك الشخصية. ستتلقى بريد تأكيد لتفعيل حسابك.", category: "citizens" },
  { id: "c2", question: "كيف أبحث عن طبيب أو أخصائي؟", answer: "استخدم شريط البحث في الصفحة الرئيسية أو الخريطة التفاعلية. يمكنك التصفية حسب التخصص والموقع والتوفر وآراء المرضى.", category: "citizens" },
  { id: "c3", question: "كيف أستخدم الخريطة التفاعلية؟", answer: "تعرض الخريطة التفاعلية جميع المتخصصين الصحيين الموثقين. انقر على علامة لمعرفة تفاصيل الطبيب. يمكنك التكبير والتصفية وتفعيل تحديد الموقع.", category: "citizens" },
  { id: "c4", question: "كيف أحجز موعداً عبر الإنترنت؟", answer: "ابحث عن الطبيب المطلوب، اطلع على مواعيده المتاحة وانقر على 'حجز موعد'. اختر الوقت المناسب وأكد بياناتك وستتلقى تأكيداً.", category: "citizens" },
  { id: "c5", question: "هل استخدام CityHealth مجاني؟", answer: "نعم، CityHealth مجاني تماماً للمواطنين. البحث والاطلاع على الملفات والإضافة للمفضلة وحجز المواعيد كلها مجانية.", category: "citizens" },
  { id: "p1", question: "كيف أسجل كمتخصص صحي؟", answer: "انقر على 'المساحة المهنية' ثم 'التسجيل'. املأ النموذج بمعلوماتك المهنية وحمّل وثائقك. سيتحقق فريقنا من ملفك خلال 48 ساعة.", category: "providers" },
  { id: "p2", question: "ما هي عملية التحقق؟", answer: "بعد التقديم، يتحقق فريقنا من وثائقك وتسجيلك في النقابة المهنية ومؤهلاتك. تستغرق العملية 24 إلى 48 ساعة عمل.", category: "providers" },
  { id: "p3", question: "هل التسجيل مدفوع للمهنيين؟", answer: "التسجيل الأساسي مجاني ويشمل: ملف الممارس، تحديد الموقع على الخريطة، إدارة المواعيد.", category: "providers" },
  { id: "t1", question: "ما المتصفحات المتوافقة؟", answer: "CityHealth متوافق مع Chrome وFirefox وSafari وEdge. للحصول على أفضل تجربة، استخدم أحدث إصدار.", category: "technical" },
  { id: "t2", question: "هل يوجد تطبيق جوال؟", answer: "CityHealth تطبيق ويب تقدمي (PWA). على الهاتف، يمكنك إضافته لشاشتك الرئيسية عبر قائمة المتصفح.", category: "technical" },
  { id: "t3", question: "كيف أعيد تعيين كلمة المرور؟", answer: "في صفحة تسجيل الدخول، انقر على 'نسيت كلمة المرور'. أدخل بريدك الإلكتروني وستتلقى رابط إعادة تعيين صالح لـ 24 ساعة.", category: "technical" },
  { id: "e1", question: "ما أرقام الطوارئ؟", answer: "الإسعاف: 15 | الحماية المدنية: 14 | الشرطة: 17 | الدرك: 1055. هذه الأرقام متاحة 24/7.", category: "emergency" },
  { id: "e2", question: "كيف أجد صيدلية مناوبة؟", answer: "استخدم قسم 'الطوارئ' أو الخريطة التفاعلية. صفّ حسب 'صيدليات المناوبة' لمعرفة المفتوحة حالياً.", category: "emergency" },
  { id: "e3", question: "هل يمكن لـ CityHealth أن يحل محل الاستشارة الطبية؟", answer: "لا. CityHealth أداة معلومات وربط. لا يحل بأي حال محل الاستشارة الطبية.", category: "emergency" },
  { id: "s1", question: "كيف تتم حماية بياناتي؟", answer: "بياناتك مشفرة أثناء النقل (HTTPS) وفي حالة السكون. نستخدم بروتوكولات أمان متقدمة واستضافة آمنة.", category: "security" },
  { id: "s2", question: "هل يمكنني حذف حسابي؟", answer: "نعم، يمكنك طلب حذف حسابك في أي وقت من الإعدادات أو بالاتصال بنا. سيتم حذف بياناتك خلال 30 يوماً.", category: "security" },
  { id: "s3", question: "هل تتم مشاركة بياناتي الصحية؟", answer: "لا. لا نشارك أبداً بياناتك الصحية مع أطراف ثالثة بدون موافقتك الصريحة.", category: "security" },
];

const faqDataEn: FAQItem[] = [
  { id: "c1", question: "How do I create a citizen account?", answer: "To create a citizen account, click 'Citizen Login' in the menu then 'Create account'. Fill the form with your email, a secure password and your personal information. You'll receive a confirmation email to activate your account.", category: "citizens" },
  { id: "c2", question: "How do I search for a doctor or specialist?", answer: "Use the search bar on the homepage or the interactive map. You can filter by specialty, location, availability or patient reviews.", category: "citizens" },
  { id: "c3", question: "How do I use the interactive map?", answer: "The interactive map shows all verified health professionals. Click a marker to see practitioner details. You can zoom, filter by facility type and enable geolocation.", category: "citizens" },
  { id: "c4", question: "How do I book an appointment online?", answer: "Find the desired practitioner, check their availability and click 'Book appointment'. Select a time slot, confirm your details and you'll receive a confirmation.", category: "citizens" },
  { id: "c5", question: "Is CityHealth free to use?", answer: "Yes, CityHealth is completely free for citizens. Searching, viewing profiles, adding to favorites and booking appointments are all free features.", category: "citizens" },
  { id: "p1", question: "How do I register as a healthcare professional?", answer: "Click 'Provider Space' then 'Register'. Fill the form with your professional information and upload your supporting documents. Our team will verify within 48h.", category: "providers" },
  { id: "p2", question: "What is the verification process?", answer: "After submission, our team verifies your documents, professional registration and qualifications. This takes 24 to 48 business hours.", category: "providers" },
  { id: "p3", question: "Is registration paid for professionals?", answer: "Basic registration is free and includes: practitioner profile, map geolocation, availability management.", category: "providers" },
  { id: "t1", question: "Which browsers are compatible?", answer: "CityHealth is compatible with Chrome, Firefox, Safari and Edge. For optimal experience, use the latest version of your browser.", category: "technical" },
  { id: "t2", question: "Is there a mobile app?", answer: "CityHealth is a progressive web app (PWA). On mobile, you can add it to your home screen via your browser menu.", category: "technical" },
  { id: "t3", question: "How do I reset my password?", answer: "On the login page, click 'Forgot password'. Enter your email and you'll receive a reset link valid for 24 hours.", category: "technical" },
  { id: "e1", question: "What are the emergency numbers?", answer: "SAMU: 15 | Civil Protection: 14 | Police: 17 | Gendarmerie: 1055. These numbers are available 24/7.", category: "emergency" },
  { id: "e2", question: "How do I find an on-duty pharmacy?", answer: "Use our 'Emergency' section or the interactive map. Filter by 'On-duty pharmacies' to see currently open ones.", category: "emergency" },
  { id: "e3", question: "Can CityHealth replace medical advice?", answer: "No. CityHealth is an information and connection tool. It can never replace a medical consultation.", category: "emergency" },
  { id: "s1", question: "How is my data protected?", answer: "Your data is encrypted in transit (HTTPS) and at rest. We use advanced security protocols and secure hosting.", category: "security" },
  { id: "s2", question: "Can I delete my account?", answer: "Yes, you can request account deletion at any time from settings or by contacting us. Your data will be deleted within 30 days.", category: "security" },
  { id: "s3", question: "Is my health data shared?", answer: "No. We never share your health data with third parties without your explicit consent.", category: "security" },
];

const FAQPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const faqData = language === 'ar' ? faqDataAr : language === 'en' ? faqDataEn : faqDataFr;

  const faqCategories = [
    { id: "all", label: t('faqPage', 'all'), icon: Sparkles },
    { id: "citizens", label: t('faqPage', 'citizens'), icon: Users },
    { id: "providers", label: t('faqPage', 'providers'), icon: Stethoscope },
    { id: "technical", label: t('faqPage', 'technical'), icon: Settings },
    { id: "emergency", label: t('faqPage', 'emergency'), icon: Siren },
    { id: "security", label: t('faqPage', 'security'), icon: Shield },
  ];

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
  }, [activeCategory, debouncedSearch, faqData]);

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
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-foreground/10 blur-2xl" />

        <div className="relative px-5 pt-14 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('faqPage', 'back')}
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
                {faqData.length}+ {t('faqPage', 'questions')}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground leading-tight">
              {t('faqPage', 'title')}
            </h1>
            <p className="text-sm text-primary-foreground/70 mt-2 max-w-xs">
              {t('faqPage', 'subtitle')}
            </p>
          </motion.div>
        </div>

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
            placeholder={t('faqPage', 'searchPlaceholder')}
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
            {filteredFAQs.length} {t('faqPage', 'resultsFor')} « {debouncedSearch} »
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
              <h3 className="text-base font-semibold text-foreground mb-1">{t('faqPage', 'noResults')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('faqPage', 'noResultsHint')}
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="text-sm font-medium text-primary"
              >
                {t('faqPage', 'reset')}
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
              <h3 className="text-sm font-bold text-foreground">{t('faqPage', 'notFound')}</h3>
              <p className="text-xs text-muted-foreground">{t('faqPage', 'notFoundHint')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="sm" className="rounded-xl h-10 text-xs font-semibold">
              <Link to="/contact">
                {t('faqPage', 'contactUs')}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl h-10 text-xs font-semibold">
              <Link to="/docs">
                {t('faqPage', 'docs')}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="mx-5 mt-5 grid grid-cols-3 gap-2">
        {[
          { to: "/privacy", icon: Shield, label: t('faqPage', 'privacy'), color: "text-primary" },
          { to: "/terms", icon: HelpCircle, label: t('faqPage', 'terms'), color: "text-primary" },
          { to: "/emergency", icon: Siren, label: t('faqPage', 'emergencies'), color: "text-destructive" },
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