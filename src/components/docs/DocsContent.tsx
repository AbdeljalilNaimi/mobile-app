import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ThumbsUp, 
  ThumbsDown, 
  Home,
  Clock,
  BookOpen,
  Users,
  Stethoscope,
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableOfContents } from './TableOfContents';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { docsStructure, findDocPage, getAllDocPages } from '@/data/docsStructure';
import { cn } from '@/lib/utils';

// Sanitize HTML to prevent XSS
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'code', 'em', 'b', 'i', 'span'],
    ALLOWED_ATTR: ['class']
  });
};

// Simple markdown-like renderer for our doc content
const renderContent = (content: string) => {
  const lines = content.trim().split('\n');
  const elements: JSX.Element[] = [];
  
  const processLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className="text-4xl font-bold mb-6 text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {line.slice(2)}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      const title = line.slice(3);
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h2 
          key={index} 
          className="text-2xl font-semibold mt-10 mb-4 text-foreground flex items-center gap-2 group scroll-mt-24" 
          id={id}
        >
          <span className="w-1 h-6 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          {title}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      const title = line.slice(4);
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h3 key={index} className="text-xl font-medium mt-8 mb-3 text-foreground scroll-mt-24" id={id}>
          {title}
        </h3>
      );
    }
    
    // Lists
    if (line.startsWith('- ')) {
      const content = line.slice(2);
      const parsed = content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
      return (
        <li 
          key={index} 
          className="ml-6 mb-2 text-muted-foreground list-disc marker:text-primary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed) }}
        />
      );
    }
    
    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      const content = numberedMatch[2];
      const parsed = content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
      return (
        <li 
          key={index} 
          className="ml-6 mb-2 text-muted-foreground list-decimal marker:text-primary marker:font-semibold"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed) }}
        />
      );
    }
    
    // Warning/Info blocks
    if (line.startsWith('⚠️') || line.startsWith('⚡') || line.startsWith('✅') || line.startsWith('🎯') || line.startsWith('🤝') || line.startsWith('📍') || line.startsWith('🔍') || line.startsWith('👨‍⚕️') || line.startsWith('📱') || line.startsWith('🆘') || line.startsWith('🤖')) {
      return (
        <div key={index} className="my-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-foreground font-medium">{line}</p>
        </div>
      );
    }
    
    // Empty lines
    if (line.trim() === '') {
      return <br key={index} />;
    }
    
    // Regular paragraph
    const parsed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">$1</code>');
    
    return (
      <p 
        key={index} 
        className="mb-4 text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed) }}
      />
    );
  };
  
  // Process tables separately
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      
      const rows = tableLines.filter(l => !l.includes('---'));
      if (rows.length > 0) {
        const headers = rows[0].split('|').filter(c => c.trim());
        const dataRows = rows.slice(1).map(r => r.split('|').filter(c => c.trim()));
        
        elements.push(
          <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {headers.map((h, hi) => (
                    <th key={hi} className="text-left p-4 font-semibold text-foreground">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-4 text-muted-foreground">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }
    
    elements.push(processLine(line, i));
    i++;
  }
  
  return elements;
};

// Estimate reading time
const estimateReadingTime = (content: string): number => {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const DocsContent = () => {
  const { sectionId, pageId } = useParams();
  
  const allPages = getAllDocPages();
  const currentPage = sectionId && pageId ? findDocPage(sectionId, pageId) : null;
  const currentSection = docsStructure.find(s => s.id === sectionId);
  
  // Find prev/next pages
  const currentIndex = allPages.findIndex(p => p.sectionId === sectionId && p.id === pageId);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  // Welcome page when no section/page selected
  if (!currentPage) {
    const totalArticles = allPages.length;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/60 mb-8 shadow-xl shadow-primary/30"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BookOpen className="h-12 w-12 text-primary-foreground" />
                </motion.div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
              >
                Documentation CityHealth
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Tout ce que vous devez savoir pour utiliser CityHealth efficacement
              </motion.p>
            </div>

            {/* Stats Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16 p-6 rounded-2xl bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border border-border/50"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-primary" />
                  <p className="text-3xl font-bold text-primary">{totalArticles}</p>
                </div>
                <p className="text-sm text-muted-foreground">Articles</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <p className="text-3xl font-bold text-primary">{docsStructure.length}</p>
                </div>
                <p className="text-sm text-muted-foreground">Sections</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <p className="text-3xl font-bold text-primary">3</p>
                </div>
                <p className="text-sm text-muted-foreground">Langues</p>
              </div>
            </motion.div>

            {/* Quick Start */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Démarrage rapide
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Users, label: 'Pour les Citoyens', to: '/docs/citizens/search-provider' },
                  { icon: Stethoscope, label: 'Pour les Professionnels', to: '/docs/providers/registration' },
                  { icon: BookOpen, label: 'Premiers pas', to: '/docs/getting-started/first-steps' },
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all"
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Sections Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {docsStructure.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={`/docs/${section.id}/${section.pages[0]?.id}`}
                    className="group relative block p-6 rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className={cn(
                      "relative p-3 rounded-xl w-fit mb-4 bg-gradient-to-br from-background to-muted shadow-sm",
                      section.color
                    )}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    
                    <h3 className="relative font-bold text-lg mb-2 group-hover:text-primary transition-colors flex items-center gap-1">
                      {section.title}
                      <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    
                    <p className="relative text-sm text-muted-foreground mb-4 line-clamp-2">
                      {section.description}
                    </p>
                    
                    <Badge variant="secondary" className="relative">
                      {section.pages.length} article{section.pages.length > 1 ? 's' : ''}
                    </Badge>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center"
            >
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Besoin d'aide ?</h3>
              <p className="text-muted-foreground mb-4">
                Notre assistant IA est disponible 24/7 pour répondre à vos questions.
              </p>
              <p className="text-sm text-muted-foreground">
                Utilisez le raccourci <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono border">⌘K</kbd> ou le bouton <strong>« Demandez à l'IA »</strong> dans le header.
              </p>
            </motion.div>
          </div>
        </ScrollArea>
      </motion.div>
    );
  }

  const readingTime = estimateReadingTime(currentPage.content);

  return (
    <motion.div
      key={`${sectionId}-${pageId}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex"
    >
      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 md:p-8 lg:p-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link 
              to="/docs" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Docs</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              to={`/docs/${sectionId}/${currentSection?.pages[0]?.id}`}
              className="hover:text-foreground transition-colors"
            >
              {currentSection?.title}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate">{currentPage.title}</span>
          </nav>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min de lecture</span>
            </div>
            {currentPage.tags && currentPage.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentPage.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <article className="prose prose-slate dark:prose-invert max-w-none">
            {renderContent(currentPage.content)}
          </article>

          <Separator className="my-10" />

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {prevPage ? (
              <Link
                to={`/docs/${prevPage.sectionId}/${prevPage.id}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all flex-1"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                <div>
                  <p className="text-xs text-muted-foreground">Précédent</p>
                  <p className="font-medium group-hover:text-primary transition-colors">{prevPage.title}</p>
                </div>
              </Link>
            ) : <div className="flex-1" />}
            
            {nextPage ? (
              <Link
                to={`/docs/${nextPage.sectionId}/${nextPage.id}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all flex-1 justify-end text-right"
              >
                <div>
                  <p className="text-xs text-muted-foreground">Suivant</p>
                  <p className="font-medium group-hover:text-primary transition-colors">{nextPage.title}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ) : <div className="flex-1" />}
          </div>

          {/* Feedback */}
          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 text-center">
            <p className="font-medium mb-4">Cet article vous a-t-il été utile ?</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" className="gap-2 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-600">
                <ThumbsUp className="h-4 w-4" />
                Oui
              </Button>
              <Button variant="outline" size="sm" className="gap-2 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-600">
                <ThumbsDown className="h-4 w-4" />
                Non
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Table of Contents - Right side */}
      <TableOfContents content={currentPage.content} className="p-6" />
    </motion.div>
  );
};
