import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Code2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import ToastContainer from '@/components/ToastContainer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';

const ContactPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headerRef = useScrollReveal();
  const formRef = useScrollReveal();
  const infoRef = useScrollReveal();
  
  const { toasts, addToast } = useToastNotifications();

  const contactTypes = [
    t('contact', 'technicalSupport'),
    t('contact', 'generalQuestion'),
    t('contact', 'partnership'),
    t('contact', 'providerRegistration'),
    t('contact', 'report'),
    t('contact', 'other'),
  ];

  const contactInfo = [
    { icon: Phone, title: t('contact', 'phone'), details: t('contact', 'phoneNumber'), description: t('contact', 'phoneHours') },
    { icon: Mail, title: t('contact', 'emailLabel'), details: t('contact', 'emailAddress'), description: t('contact', 'emailResponse') },
    { icon: MapPin, title: t('contact', 'address'), details: t('contact', 'addressDetails'), description: t('contact', 'addressCity') },
    { icon: Clock, title: t('contact', 'hours'), details: t('contact', 'workingHours'), description: t('contact', 'saturdayHours') },
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      addToast({
        type: 'warning',
        title: t('contact', 'requiredFields'),
        message: t('contact', 'requiredFieldsDesc')
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      addToast({
        type: 'success',
        title: t('contact', 'messageSent'),
        message: t('contact', 'messageSentDesc')
      });
      
      setFormData({ name: '', email: '', subject: '', message: '', type: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ToastContainer toasts={toasts} />
      
      <section ref={headerRef} className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-float">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-glow-pulse">
              <MessageSquare className="text-primary" size={24} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('contact', 'title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact', 'subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card ref={formRef} className="glass-card animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="text-primary" size={24} />
                  {t('contact', 'sendMessage')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('contact', 'fullName')} *</label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} placeholder={t('contact', 'fullName')} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('contact', 'email')} *</label>
                      <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="votre@email.com" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('contact', 'requestType')}</label>
                      <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('contact', 'choosePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {contactTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('contact', 'subject')}</label>
                      <Input name="subject" value={formData.subject} onChange={handleInputChange} placeholder={t('contact', 'subjectPlaceholder')} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('contact', 'message')} *</label>
                    <Textarea name="message" value={formData.message} onChange={handleInputChange} placeholder={t('contact', 'messagePlaceholder')} rows={6} required />
                  </div>

                  <Button type="submit" className="w-full ripple-effect" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="mr-2" size={18} />
                        {t('contact', 'send')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card ref={infoRef} className="glass-card animate-scale-in">
              <CardHeader>
                <CardTitle>{t('contact', 'contactInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <info.icon className="text-primary" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">{info.title}</h4>
                      <p className="text-sm text-foreground">{info.details}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>{t('contact', 'faq')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-sm">{item.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.answer}</p>
                    {index < faqItems.length - 1 && <hr className="border-border/50" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card animate-scale-in border-destructive/20" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-4 text-center">
                <Phone className="mx-auto mb-2 text-destructive animate-pulse-slow" size={24} />
                <h4 className="font-medium text-destructive mb-1">{t('contact', 'emergencyTitle')}</h4>
                <p className="text-sm text-muted-foreground mb-3">{t('contact', 'emergencyDesc')}</p>
                <Button variant="destructive" className="w-full animate-glow-pulse">
                  <Phone className="mr-2" size={16} />
                  {t('contact', 'callEmergency')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">{t('contact', 'teamTitle')}</h2>
            <p className="text-muted-foreground">{t('contact', 'teamSubtitle')}</p>
            <div className="mt-3 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Naimi Abdeldjalil', role: t('contact', 'coFounderDev'), desc: t('contact', 'descNaimi'), icon: Code2 },
              { name: 'Belyagoubi Abdelilah', role: t('contact', 'coFounderCTO'), desc: t('contact', 'descAbdelilah'), icon: Shield },
            ].map((member, index) => (
              <Card key={index} className="glass-card hover-lift rounded-2xl animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/5 ring-2 ring-primary/20 flex items-center justify-center mx-auto">
                    <member.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-lg font-bold mt-4">{member.name}</h3>
                  <span className="inline-flex mt-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    {member.role}
                  </span>
                  <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">{member.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
