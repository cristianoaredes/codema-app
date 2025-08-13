import { useNavigate } from "react-router-dom";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ShieldCheck, 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Zap,
  Mail,
  MapPin,
  Phone,
  Quote,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";

// --- Modern Navbar Component ---
const ModernNavbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      label: 'Soluções',
      dropdown: [
        { label: 'Para Municípios', desc: 'Gestão completa municipal', icon: '🏛️' },
        { label: 'Para Conselhos', desc: 'Digitalização de conselhos', icon: '👥' },
        { label: 'Para Cidadãos', desc: 'Transparência e participação', icon: '🌟' },
      ]
    },
    {
      label: 'Recursos',
      dropdown: [
        { label: 'Funcionalidades', desc: 'Conheça todos os recursos', icon: '⚡' },
        { label: 'Integrações', desc: 'Conecte suas ferramentas', icon: '🔗' },
        { label: 'Segurança', desc: 'Proteção de dados', icon: '🔒' },
      ]
    },
    { label: 'Casos de Sucesso', link: '#testimonials' },
    { label: 'Preços', link: '#pricing' },
    { label: 'Contato', link: '#contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' 
          : 'bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl blur-md opacity-70"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-2.5">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  MuniConnect
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Gestão Municipal Inteligente</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.dropdown ? (
                    <>
                      <button
                        className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 flex items-center gap-1 group"
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {item.label}
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                            onMouseEnter={() => setActiveDropdown(item.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                          >
                            {item.dropdown.map((subItem, idx) => (
                              <motion.a
                                key={subItem.label}
                                href="#"
                                className="flex items-start gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <span className="text-2xl">{subItem.icon}</span>
                                <div>
                                  <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                                    {subItem.label}
                                  </p>
                                  <p className="text-xs text-gray-500">{subItem.desc}</p>
                                </div>
                              </motion.a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <a
                      href={item.link}
                      className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium"
              >
                Entrar
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100"
            >
              <div className="container mx-auto px-4 py-6 space-y-2">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.dropdown ? (
                      <div className="space-y-1">
                        <p className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                        {item.dropdown.map((subItem) => (
                          <a
                            key={subItem.label}
                            href="#"
                            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-colors"
                          >
                            <span>{subItem.icon}</span>
                            <div>
                              <p className="font-medium text-gray-800">{subItem.label}</p>
                              <p className="text-xs text-gray-500">{subItem.desc}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <a
                        href={item.link}
                        className="block px-4 py-3 text-gray-700 hover:text-emerald-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 space-y-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => navigate('/auth')}
                  >
                    Entrar
                  </Button>
                  <Button
                    className="w-full justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    onClick={() => navigate('/auth')}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  );
};

// --- Framer Motion Variants ---

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

// --- Seções como Componentes ---

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-32 md:py-48 text-center">
      {/* Modern gradient background with multiple layers */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/40 to-teal-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-green-200/40 to-emerald-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-gradient-to-tr from-teal-200/30 to-green-200/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative z-10"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-medium shadow-sm">
            🚀 Solução Completa para Gestão Municipal
          </span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants} 
          className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight"
        >
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
            Modernize
          </span>{' '}
          a Gestão de
          <br className="hidden md:block" />
          <span className="relative">
            Conselhos
            <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-emerald-200 to-teal-200 -z-10 transform -rotate-1"></div>
          </span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants} 
          className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
        >
          <strong className="font-semibold text-gray-700">MuniConnect</strong> é a solução completa que organiza, digitaliza e dá{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-medium">
            transparência total
          </span>{' '}
          aos conselhos municipais, destravando eficiência e novas receitas.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')} 
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
          >
            🎯 Solicitar Demonstração
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
            className="bg-white/70 backdrop-blur-sm border-emerald-200 hover:bg-white/90 hover:border-emerald-300 transition-all duration-300 px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl"
          >
            ✨ Conhecer Funcionalidades
          </Button>
        </motion.div>
        
        {/* Trust indicators */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>100% Seguro e Confiável</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            <span>+50 Municípios Atendidos</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            <span>Implementação em 2 Semanas</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    { 
      icon: <Users className="h-7 w-7" />, 
      title: "Gestão de Membros", 
      description: "Controle mandatos, atas de posse e informações de todos os conselheiros em um só lugar.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    { 
      icon: <FileText className="h-7 w-7" />, 
      title: "Atas e Reuniões Digitais", 
      description: "Agende reuniões, crie pautas, registre presenças e gere atas automaticamente.",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50"
    },
    { 
      icon: <ShieldCheck className="h-7 w-7" />, 
      title: "Portal da Transparência", 
      description: "Publique resoluções, atas e documentos de forma automática, cumprindo a legislação.",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    { 
      icon: <BarChart3 className="h-7 w-7" />, 
      title: "Relatórios e Dashboards", 
      description: "Acompanhe a frequência dos membros, o status das resoluções e o desempenho do conselho.",
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50"
    },
    { 
      icon: <MessageSquare className="h-7 w-7" />, 
      title: "Comunicação Centralizada", 
      description: "Envie convocações e notificações para todos os membros com apenas um clique.",
      color: "from-orange-500 to-amber-500",
      bgColor: "from-orange-50 to-amber-50"
    },
    { 
      icon: <Zap className="h-7 w-7" />, 
      title: "Destrave Receitas (ICMS Ecológico)", 
      description: "Organize seu conselho e aumente a pontuação do seu município para acessar novas fontes de receita.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50"
    },
  ];

  return (
    <section id="features" className="py-32 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-700 text-sm font-medium">
              ✨ Funcionalidades Completas
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Tudo o que seu{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Conselho precisa
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Uma plataforma robusta e intuitiva para transformar completamente a gestão e a transparência do seu conselho municipal.
          </motion.p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full bg-white">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10 p-8 text-center">
                  <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
                
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <div className={`w-full h-full bg-gradient-to-bl ${feature.color} transform rotate-45 translate-x-6 -translate-y-6`}></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-8">
            Pronto para revolucionar a gestão do seu conselho?
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-3 rounded-xl"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            🚀 Começar Agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    { 
      name: "Carlos Mendes", 
      role: "Secretário de Planejamento", 
      city: "Nova Esperança", 
      text: "Com o MuniConnect, o processo de aprovação de resoluções, que levava semanas, agora é concluído em dias. A organização das atas e documentos nos deu uma base sólida para o ICMS Ecológico.", 
      avatar: "CM",
      rating: 5
    },
    { 
      name: "Ana Paula Ferreira", 
      role: "Prefeita", 
      city: "Serra Verde", 
      text: "Nosso município é pequeno, mas conseguimos uma solução tecnológica de ponta. O retorno em transparência e na imagem da gestão perante a comunidade e o Ministério Público foi imenso.", 
      avatar: "AF",
      rating: 5
    },
  ];
  
  return (
    <section className="py-32 bg-gradient-to-b from-gray-50/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-to-l from-emerald-100/50 to-teal-100/50 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-700 text-sm font-medium">
              💬 Depoimentos Reais
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            O que dizem os{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              gestores públicos
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Resultados reais em municípios que já transformaram seus conselhos com nossa plataforma.
          </motion.p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full bg-white">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Quote decoration */}
                <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
                  <Quote className="w-8 h-8 text-emerald-600" />
                </div>
                
                <div className="relative z-10 p-8">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">★</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Testimonial text */}
                  <p className="text-gray-700 text-lg leading-relaxed mb-8 italic relative z-10">
                    "{testimonial.text}"
                  </p>
                  
                  {/* Author info */}
                  <div className="flex items-center relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-emerald-600 font-medium">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.city}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="font-medium">+50 Municípios Atendidos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">4.9/5 Satisfação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">100% Conformidade Legal</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FaqSection = () => {
  const faqs = [
    { 
      q: "Qual o tempo de implementação?", 
      a: "O tempo médio de implementação é de 1 a 2 semanas. Nossa equipe cuida de toda a importação de dados e configuração inicial.",
      icon: "⏱️"
    },
    { 
      q: "O sistema atende a legislação para transparência?", 
      a: "Sim, o MuniConnect foi desenvolvido seguindo as principais diretrizes de transparência pública, gerando um portal de fácil acesso para os cidadãos.",
      icon: "🏛️"
    },
    { 
      q: "É necessário treinamento para a equipe?", 
      a: "Sim, oferecemos um treinamento completo para todos os usuários, do presidente do conselho aos membros, e disponibilizamos suporte técnico contínuo.",
      icon: "👨‍🏫"
    },
    { 
      q: "O sistema se integra com outros portais da prefeitura?", 
      a: "Sim, podemos integrar o portal de transparência do conselho ao site principal da prefeitura para garantir uma experiência unificada.",
      icon: "🔗"
    },
  ];
  
  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-700 text-sm font-medium">
              ❓ Dúvidas Frequentes
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Perguntas{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Frequentes
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Respostas claras e diretas para as dúvidas mais comuns sobre nossa plataforma.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AccordionItem 
                  value={`item-${index}`} 
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline text-left group">
                    <div className="flex items-center gap-4 w-full">
                      <span className="text-2xl">{faq.icon}</span>
                      <span className="font-semibold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {faq.q}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 pt-2">
                    <div className="bg-gray-50 rounded-lg p-4 ml-12">
                      <p className="text-gray-700 text-base leading-relaxed">{faq.a}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
        
        {/* Additional help section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Não encontrou sua resposta?</h3>
          <p className="text-gray-600 mb-6">Nossa equipe está pronta para esclarecer todas as suas dúvidas</p>
          <Button 
            size="lg"
            variant="outline"
            className="bg-white border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 font-medium px-8 py-3 rounded-xl"
          >
            📞 Falar com Especialista
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const CtaSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-32 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      <div className="container text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
            🎯 Hora de Agir
          </span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold mb-8 leading-tight"
        >
          Pronto para{' '}
          <span className="relative">
            transformar
            <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white/20 -z-10 transform -rotate-1 rounded"></div>
          </span>
          <br className="hidden md:block" />
          a gestão do seu conselho?
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
        >
          Agende uma demonstração gratuita e descubra como nossa plataforma pode{' '}
          <strong className="font-semibold">aumentar sua receita</strong>, otimizar processos e fortalecer sua gestão municipal.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
        >
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')} 
            className="bg-white text-emerald-600 hover:bg-gray-50 shadow-2xl transform hover:scale-105 transition-all duration-300 px-12 py-4 text-lg font-bold rounded-xl border-0"
          >
            🚀 Demonstração Gratuita
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 px-12 py-4 text-lg font-medium rounded-xl"
          >
            📞 Falar com Vendas
          </Button>
        </motion.div>
        
        {/* Trust indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 text-white/80"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">✓</span>
            </div>
            <span className="font-medium">Sem compromisso</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">⚡</span>
            </div>
            <span className="font-medium">Setup em 2 semanas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">🏆</span>
            </div>
            <span className="font-medium">Suporte especializado</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
    </div>
    
    <div className="container relative z-10 pt-20 pb-10">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg">
              M
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">MuniConnect</h3>
              <p className="text-sm text-emerald-400">CODEMA Itanhomi</p>
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed mb-6">
            Digitalizando e conectando a gestão pública municipal com transparência e eficiência.
          </p>
          {/* Social links */}
          <div className="flex items-center gap-3">
            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-300">
              <span className="text-sm">📧</span>
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-300">
              <span className="text-sm">📱</span>
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-300">
              <span className="text-sm">🌐</span>
            </a>
          </div>
        </div>
        
        {/* Solutions */}
        <div>
          <h4 className="font-bold mb-6 text-lg text-white">Soluções</h4>
          <ul className="space-y-3">
            <li>
              <a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Gestão de Conselhos
              </a>
            </li>
            <li>
              <a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Portal da Transparência
              </a>
            </li>
            <li>
              <a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                ICMS Ecológico
              </a>
            </li>
            <li>
              <a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Relatórios e Analytics
              </a>
            </li>
          </ul>
        </div>
        
        {/* Company */}
        <div>
          <h4 className="font-bold mb-6 text-lg text-white">Empresa</h4>
          <ul className="space-y-3">
            <li>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Sobre Nós
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Nossa Equipe
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Carreiras
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Política de Privacidade
              </a>
            </li>
          </ul>
        </div>
        
        {/* Contact */}
        <div>
          <h4 className="font-bold mb-6 text-lg text-white">Contato</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-gray-400">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center mt-0.5">
                <Mail size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">Email</p>
                <a href="mailto:contato@municonnect.com.br" className="hover:text-emerald-400 transition-colors">
                  contato@municonnect.com.br
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3 text-gray-400">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center mt-0.5">
                <Phone size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">Telefone</p>
                <a href="tel:+5531999999999" className="hover:text-emerald-400 transition-colors">
                  (31) 99999-9999
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3 text-gray-400">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center mt-0.5">
                <MapPin size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">Endereço</p>
                <p>Belo Horizonte, MG</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-center md:text-left">
            &copy; 2024 MuniConnect. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">
              Termos de Uso
            </a>
            <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">
              Privacidade
            </a>
            <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

const Index = () => {
  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants} 
      className="bg-white"
    >
      <ModernNavbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </motion.div>
  );
};

export default Index;
