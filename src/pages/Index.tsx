import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Zap,
  CheckCircle,
  Mail,
  MapPin,
  Phone
} from "lucide-react";
import logo from "@/assets/logo_municonnect.png";

// --- Seções como Componentes ---

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 py-24 md:py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
          Modernize a Gestão de Conselhos do seu Município
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
          MuniConnect é a solução completa que organiza, digitaliza e dá transparência aos conselhos municipais, destravando eficiência e novas receitas.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/auth')} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
            Solicitar Demonstração
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Conhecer Funcionalidades
          </Button>
        </div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Tudo o que seu Conselho precisa</h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Uma plataforma robusta para transformar a gestão e a transparência.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="mb-4 inline-block p-4 bg-green-100 text-green-600 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">O que dizem os gestores públicos</h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Resultados reais em municípios que já transformaram seus conselhos.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 border-0 shadow-lg">
              <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
              <div className="flex items-center">
                <Avatar>
                  <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.city}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Perguntas Frequentes</h2>
          <p className="text-lg text-gray-600 mt-4">Respostas para as dúvidas mais comuns.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="font-bold text-lg">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-gray-700 text-base">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

const CtaSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-green-600 text-white">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para transformar a gestão do seu conselho?</h2>
        <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">Agende uma demonstração gratuita e veja como nossa plataforma pode aumentar sua receita, otimizar processos e fortalecer sua gestão.</p>
        <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
          Solicitar Demonstração Gratuita
        </Button>
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
            <li><a href="#features" className="hover:text-green-400">Gestão de Conselhos</a></li>
            <li><a href="#features" className="hover:text-green-400">Portal da Transparência</a></li>
            <li><a href="#features" className="hover:text-green-400">ICMS Ecológico</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Empresa</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-green-400">Sobre Nós</a></li>
            <li><a href="#" className="hover:text-green-400">Contato</a></li>
            <li><a href="#" className="hover:text-green-400">Política de Privacidade</a></li>
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
    <div className="bg-white">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
