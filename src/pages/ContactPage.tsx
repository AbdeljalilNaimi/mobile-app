import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Code2, Shield, ExternalLink, Linkedin, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import ToastContainer from '@/components/ToastContainer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const ContactPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toasts, addToast } = useToastNotifications();

  const contactTypes = [
    t('contact', 'technicalSupport'), t('contact', 'generalQuestion'), t('contact', 'partnership'),
    t('contact', 'providerRegistration'), t('contact', 'report'), t('contact', 'other'),
  ];

  const contactInfo = [
    { icon: Phone, title: t('contact', 'phone'), details: t('contact', 'phoneNumber'), description: t('contact', 'phoneHours'), color: 'bg-emerald-500/10 text-emerald-600' },
    { icon: Mail, title: t('contact', 'emailLabel'), details: t('contact', 'emailAddress'), description: t('contact', 'emailResponse'), color: 'bg-blue-500/10 text-blue-600' },
    { icon: MapPin, title: t('contact', 'address'), details: t('contact', 'addressDetails'), description: t('contact', 'addressCity'), color: 'bg-orange-500/10 text-orange-600' },
    { icon: Clock, title: t('contact', 'hours'), details: t('contact', 'workingHours'), description: t('contact', 'saturdayHours'), color: 'bg-purple-500/10 text-purple-600' },
  ];

  const faqItems = [
    { question: t('contact', 'faq1Q'), answer: t('contact', 'faq1A') },
    { question: t('contact', 'faq2Q'), answer: t('contact', 'faq2A') },
    { question: t('contact', 'faq3Q'), answer: t('contact', 'faq3A') },
    { question: t('contact', 'faq4Q'), answer: t('contact', 'faq4A') },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast({ type: 'warning', title: t('contact', 'requiredFields'), message: t('contact', 'requiredFieldsDesc') });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({ type: 'success', title: t('contact', 'messageSent'), message: t('contact', 'messageSentDesc') });
      setFormData({ name: '', email: '', subject: '', message: '', type: '' });
    }, 2000);
  };

  const teamMembers = [
    { name: 'Naimi Abdeldjalil', role: t('contact', 'coFounderDev'), icon: Code2, linkedin: '#', github: '#' },
    { name: 'Belyagoubi Abdelilah', role: t('contact', 'coFounderCTO'), icon: Shield, linkedin: '#', github: '#' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <ToastContainer toasts={toasts} />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary px-5 pt-10 pb-8">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center mb-3 backdrop-blur-sm">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('contact', 'title')}</h1>
          <p className="text-sm text-white/75 mt-1">{t('contact', 'subtitle')}</p>
        </motion.div>
        {/* Wave separator */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" fill="none">
          <path d="M0 40V20C240 0 480 0 720 20C960 40 1200 40 1440 20V40H0Z" className="fill-background" />
        </svg>
      </div>

      {/* Contact Info - Horizontal Scroll */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="px-4 -mt-2 mb-5">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {contactInfo.map((info, i) => (
            <Card key={i} className="min-w-[160px] flex-shrink-0 border border-border rounded-2xl shadow-sm">
              <CardContent className="p-3.5">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-2 ${info.color}`}>
                  <info.icon className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-semibold text-foreground">{info.title}</h4>
                <p className="text-[11px] text-foreground/80 mt-0.5 leading-snug">{info.details}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <div className="px-4 space-y-5">
        {/* Contact Form */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                {t('contact', 'sendMessage')}
              </h2>
            </div>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('contact', 'fullName')} *</label>
                    <Input name="name" value={formData.name} onChange={handleInputChange} placeholder={t('contact', 'fullName')} required className="rounded-xl border-border focus:ring-primary/30" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('contact', 'email')} *</label>
                    <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="votre@email.com" required className="rounded-xl border-border focus:ring-primary/30" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('contact', 'requestType')}</label>
                    <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue placeholder={t('contact', 'choosePlaceholder')} /></SelectTrigger>
                      <SelectContent>{contactTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('contact', 'subject')}</label>
                    <Input name="subject" value={formData.subject} onChange={handleInputChange} placeholder={t('contact', 'subjectPlaceholder')} className="rounded-xl border-border focus:ring-primary/30" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">{t('contact', 'message')} *</label>
                  <Textarea name="message" value={formData.message} onChange={handleInputChange} placeholder={t('contact', 'messagePlaceholder')} rows={4} required className="rounded-xl border-border focus:ring-primary/30" />
                </div>
                <Button type="submit" className="w-full rounded-xl h-11 font-medium" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size="sm" /> : <><Send className="mr-2 h-4 w-4" />{t('contact', 'send')}</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{t('contact', 'faq')}</h2>
            </div>
            <CardContent className="p-5">
              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-4 data-[state=open]:bg-accent/30">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border border-destructive/30 rounded-2xl shadow-sm bg-destructive/5">
            <CardContent className="p-5 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Phone className="h-5 w-5 text-destructive" />
              </div>
              <h4 className="text-sm font-bold text-destructive mb-1">{t('contact', 'emergencyTitle')}</h4>
              <p className="text-xs text-muted-foreground mb-4">{t('contact', 'emergencyDesc')}</p>
              <Button variant="destructive" className="w-full rounded-xl" size="sm">
                <Phone className="mr-2 h-3.5 w-3.5" /> {t('contact', 'callEmergency')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <h2 className="text-base font-bold mb-3 text-center text-foreground">{t('contact', 'teamTitle')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {teamMembers.map((member, i) => (
              <motion.div key={i} custom={4.5 + i * 0.2} variants={fadeUp} initial="hidden" animate="visible">
                <Card className="border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary/60 to-primary" />
                  <CardContent className="p-4 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto mb-2.5">
                      <member.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xs font-bold text-foreground">{member.name}</h3>
                    <span className="inline-flex mt-1.5 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                      {member.role}
                    </span>
                    <div className="flex justify-center gap-2 mt-3">
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                        <Linkedin className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                      <a href={member.github} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                        <Github className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
