import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Quote
} from "lucide-react";
import logo from "@/assets/logo_municonnect.png";

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
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-emerald-100 py-32 md:py-40 text-center">
      {/* Abstract background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-200 rounded-full opacity-30 blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-200 rounded-full opacity-30 blur-3xl animate-blob animation-delay-4000"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative"
      >
        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
          Modernize a Gestão de Conselhos do seu Município
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
          MuniConnect é a solução completa que organiza, digitaliza e dá transparência aos conselhos municipais, destravando eficiência e novas receitas.
        </motion.p>
        <motion.div variants={itemVariants} className="flex justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/auth')} className="bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
            Solicitar Demonstração
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white/50 backdrop-blur-sm border-gray-300 hover:bg-white/80 transition-all duration-300">
            Conhecer Funcionalidades
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    { icon: <Users />, title: "Gestão de Membros", description: "Controle mandatos, atas de posse e informações de todos os conselheiros em um só lugar." },
    { icon: <FileText />, title: "Atas e Reuniões Digitais", description: "Agende reuniões, crie pautas, registre presenças e gere atas automaticamente." },
    { icon: <ShieldCheck />, title: "Portal da Transparência", description: "Publique resoluções, atas e documentos de forma automática, cumprindo a legislação." },
    { icon: <BarChart3 />, title: "Relatórios e Dashboards", description: "Acompanhe a frequência dos membros, o status das resoluções e o desempenho do conselho." },
    { icon: <MessageSquare />, title: "Comunicação Centralizada", description: "Envie convocações e notificações para todos os membros com apenas um clique." },
    { icon: <Zap />, title: "Destrave Receitas (ICMS Ecológico)", description: "Organize seu conselho e aumente a pontuação do seu município para acessar novas fontes de receita." },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900">Tudo o que seu Conselho precisa</motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Uma plataforma robusta para transformar a gestão e a transparência.</motion.p>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="mb-4 inline-block p-4 bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    { name: "Carlos Mendes", role: "Secretário de Planejamento", city: "Nova Esperança", text: "Com o MuniConnect, o processo de aprovação de resoluções, que levava semanas, agora é concluído em dias. A organização das atas e documentos nos deu uma base sólida para o ICMS Ecológico.", avatar: "CM" },
    { name: "Ana Paula Ferreira", role: "Prefeita", city: "Serra Verde", text: "Nosso município é pequeno, mas conseguimos uma solução tecnológica de ponta. O retorno em transparência e na imagem da gestão perante a comunidade e o Ministério Público foi imenso.", avatar: "AF" },
  ];
  return (
    <section className="py-24 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900">O que dizem os gestores públicos</motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Resultados reais em municípios que já transformaram seus conselhos.</motion.p>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="p-8 border-0 shadow-lg h-full relative">
                <Quote className="absolute top-6 left-6 w-12 h-12 text-gray-100" />
                <p className="text-gray-700 italic mb-6 relative z-10">"{testimonial.text}"</p>
                <div className="flex items-center relative z-10">
                  <Avatar>
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.city}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FaqSection = () => {
  const faqs = [
    { q: "Qual o tempo de implementação?", a: "O tempo médio de implementação é de 1 a 2 semanas. Nossa equipe cuida de toda a importação de dados e configuração inicial." },
    { q: "O sistema atende a legislação para transparência?", a: "Sim, o MuniConnect foi desenvolvido seguindo as principais diretrizes de transparência pública, gerando um portal de fácil acesso para os cidadãos." },
    { q: "É necessário treinamento para a equipe?", a: "Sim, oferecemos um treinamento completo para todos os usuários, do presidente do conselho aos membros, e disponibilizamos suporte técnico contínuo." },
    { q: "O sistema se integra com outros portais da prefeitura?", a: "Sim, podemos integrar o portal de transparência do conselho ao site principal da prefeitura para garantir uma experiência unificada." },
  ];
  return (
    <section className="py-24 bg-white">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900">Perguntas Frequentes</motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-600 mt-4">Respostas para as dúvidas mais comuns.</motion.p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <motion.div key={index} variants={itemVariants}>
              <AccordionItem value={`item-${index}`} className="border-b">
                <AccordionTrigger className="font-bold text-lg hover:no-underline text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-700 text-base pt-2">{faq.a}</AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

const CtaSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-green-700 text-white">
      <div className="container text-center">
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">Pronto para transformar a gestão do seu conselho?</motion.h2>
        <motion.p variants={itemVariants} className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">Agende uma demonstração gratuita e veja como nossa plataforma pode aumentar sua receita, otimizar processos e fortalecer sua gestão.</motion.p>
        <motion.div variants={itemVariants}>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="transform hover:scale-105 transition-transform duration-300">
            Solicitar Demonstração Gratuita
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white pt-20 pb-10">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div>
          <img src={logo} alt="MuniConnect Logo" className="h-10 mb-4" />
          <p className="text-gray-400">Digitalizando e conectando a gestão pública municipal.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Soluções</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#features" className="hover:text-green-400 transition-colors">Gestão de Conselhos</a></li>
            <li><a href="#features" className="hover:text-green-400 transition-colors">Portal da Transparência</a></li>
            <li><a href="#features" className="hover:text-green-400 transition-colors">ICMS Ecológico</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Empresa</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-green-400 transition-colors">Sobre Nós</a></li>
            <li><a href="#" className="hover:text-green-400 transition-colors">Contato</a></li>
            <li><a href="#" className="hover:text-green-400 transition-colors">Política de Privacidade</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Contato</h4>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2"><Mail size={16} /> contato@municonnect.com.br</li>
            <li className="flex items-center gap-2"><Phone size={16} /> (31) 99999-9999</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> Belo Horizonte, MG</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
        <p>&copy; 2024 MuniConnect. Todos os direitos reservados.</p>
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
