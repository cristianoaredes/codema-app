import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, FileText, MapPin, Phone, Mail, ArrowRight, CheckCircle, TreePine, Star, Award, Clock, ChevronRight, Sparkles, Zap, Target, TrendingUp, Lock, BarChart3, Globe, Leaf } from "lucide-react";
import logo from "@/assets/logo_with_text.png";
import { motion } from "framer-motion";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Detectar tokens de magic link na URL e redirecionar para callback
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlParams = new URLSearchParams(window.location.search);
    
    if (hashParams.get('access_token') || urlParams.get('token_hash')) {
      navigate('/auth/callback' + window.location.search + window.location.hash);
      return;
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-green-100/80 backdrop-blur-sm border border-green-200/80 rounded-full text-green-800 text-sm font-semibold mb-8 shadow-sm">
              <Sparkles className="w-5 h-5 mr-2 text-green-700" />
              Plataforma para Gestão de Conselhos Municipais
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Modernize a Gestão de Conselhos
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block mt-2">
                do seu Município
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              MuniConnect é a solução SaaS completa que organiza seus Conselhos, aumenta a transparência e destrava novas fontes de receita para sua cidade.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Zap className="w-5 h-5 mr-2" />
              Agendar Demonstração
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-10 py-4 text-lg font-semibold transition-all duration-300"
              onClick={() => document.getElementById('ganhos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Benefícios
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Sistema Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-600" />
              <span>Transparente</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span>24/7 Disponível</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="ganhos" className="py-32 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 bg-green-100/80 border border-green-200/80 rounded-full text-green-800 text-sm font-semibold mb-6 shadow-sm">
              Resultados para seu Município
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              O que sua Gestão <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Ganha ao Contratar</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma não é apenas um software, é um investimento estratégico que destrava potencial financeiro, legal e administrativo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 group h-full p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Aumento de Receita</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Organize seu CODEMA e cumpra os requisitos para maximizar o repasse do <strong>ICMS Ecológico</strong>, transformando conformidade ambiental em receita direta para o município.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 group h-full p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Acesso a Fundos</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Um conselho ativo e transparente é chave para acessar <strong>financiamentos estaduais, federais e de ONGs</strong>. Nossa plataforma gera os relatórios que você precisa para comprovar sua governança.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 group h-full p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-8 h-8 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Segurança Jurídica</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Mantenha todas as atas, resoluções e licenciamentos organizados e em conformidade. <strong>Evite multas e sanções</strong> com uma gestão documental impecável e auditável.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 bg-green-100/80 border border-green-200/80 rounded-full text-green-800 text-sm font-semibold mb-6 shadow-sm">
              Soluções Completas
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Transforme a Burocracia em <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Eficiência</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nossas funcionalidades foram desenhadas para eliminar gargalos, automatizar processos e dar total controle sobre a gestão ambiental.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 group h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Conselho 100% Digital</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Gestão completa de membros, mandatos, reuniões e atas. Tudo centralizado, automatizado e acessível de qualquer lugar.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Convocação automática de reuniões.</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Geração e assinatura digital de atas.</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Controle de quórum e votações online.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 group h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Portal da Transparência</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Publique automaticamente todas as decisões, atas e resoluções em um portal público moderno e acessível para os cidadãos.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Cumpra a Lei de Acesso à Informação.</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Aumente a confiança da população.</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Canal direto para denúncias e relatórios.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 group h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-8 h-8 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Relatórios e Dashboards</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Tenha uma visão completa da situação ambiental do município com dashboards inteligentes e gere relatórios customizados com um clique.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Monitore indicadores para o ICMS Ecológico.</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Acompanhe o status de todas as solicitações.</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Exporte dados para auditorias facilmente.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 bg-green-100/80 border border-green-200/80 rounded-full text-green-800 text-sm font-semibold mb-6 shadow-sm">
              Processo Simplificado
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Participação em <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">3 Passos Simples</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Facilitamos a colaboração entre a comunidade e o conselho para resolver questões ambientais de forma ágil e transparente.
            </p>
          </motion.div>

          <div className="relative">
            {/* Dashed line connector for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px border-t-2 border-dashed border-gray-300 -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6 text-green-600 text-3xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Reporte ou Denuncie</h3>
                <p className="text-gray-600 leading-relaxed">
                  Utilize a plataforma para registrar um problema ambiental, anexar fotos e descrever a situação em detalhes.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6 text-green-600 text-3xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Análise e Deliberação</h3>
                <p className="text-gray-600 leading-relaxed">
                  O conselho recebe, analisa o relatório, e delibera sobre as ações necessárias em reuniões transparentes.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6 text-green-600 text-3xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ação e Resolução</h3>
                <p className="text-gray-600 leading-relaxed">
                  Acompanhe a implementação das soluções e a publicação de resoluções que impactam positivamente o nosso meio ambiente.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-32 bg-gradient-to-br from-green-50 via-emerald-50/30 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-green-700 text-sm font-medium mb-6">
                <TreePine className="w-4 h-4 mr-2" />
                Nossa Missão
              </div>
              
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Construindo o Futuro da
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block">
                  Governança Municipal
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                MuniConnect trabalha para promover a eficiência e a transparência na gestão pública, 
                garantindo o desenvolvimento sustentável e a qualidade de vida da população.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Licenciamento Ambiental</h3>
                    <p className="text-gray-600 text-sm">Análise e aprovação responsável de projetos.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Fiscalização Ativa</h3>
                    <p className="text-gray-600 text-sm">Monitoramento contínuo e controle eficiente.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Engajamento Cívico</h3>
                    <p className="text-gray-600 text-sm">Programas de conscientização comunitária.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Políticas Efetivas</h3>
                    <p className="text-gray-600 text-sm">Diretrizes para desenvolvimento responsável.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 shadow-2xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <TreePine className="w-12 h-12 text-green-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Compromisso com o Futuro</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Trabalhamos para capacitar municípios a promoverem práticas sustentáveis e transparentes em suas comunidades.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-700">100%</div>
                      <div className="text-sm text-gray-600">Transparência</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-700">24/7</div>
                      <div className="text-sm text-gray-600">Monitoramento</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Aprovado por quem <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Entende de Gestão</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-16">
              Veja o que secretários e gestores de meio ambiente estão dizendo sobre nossa plataforma.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg h-full">
                <CardContent className="p-8 flex flex-col justify-between h-full">
                  <p className="text-gray-600 italic mb-6">"A plataforma revolucionou nosso CODEMA. O que antes levava semanas de papelada, agora resolvemos em minutos. O aumento no repasse do ICMS Ecológico foi a prova final do ROI."</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Juliana Costa</p>
                      <p className="text-sm text-gray-500">Secretária de Meio Ambiente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg h-full">
                <CardContent className="p-8 flex flex-col justify-between h-full">
                  <p className="text-gray-600 italic mb-6">"Finalmente temos uma ferramenta que nos dá segurança jurídica. Ter todas as atas e resoluções auditáveis e acessíveis online não tem preço."</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Ricardo Mendes</p>
                      <p className="text-sm text-gray-500">Procurador Municipal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg h-full">
                <CardContent className="p-8 flex flex-col justify-between h-full">
                  <p className="text-gray-600 italic mb-6">"A transparência com a população melhorou 100%. O portal público é fácil de usar e fortaleceu a imagem da nossa gestão como moderna e responsável."</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Fernanda Lima</p>
                      <p className="text-sm text-gray-500">Prefeita</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-6">
            Entre em Contato
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Estamos Aqui para <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Ajudar</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Nossa equipe está sempre disponível para esclarecer dúvidas e auxiliar em questões ambientais.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sede</h3>
                <p className="text-gray-600 leading-relaxed">
                  Belo Horizonte/MG<br />
                  Atendemos todo o Brasil
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Suporte</h3>
                <p className="text-gray-600 leading-relaxed">
                  (31) 99999-9999<br />
                  Seg. a Sex., 8h às 18h
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contato Comercial</h3>
                <p className="text-gray-600 leading-relaxed">
                  comercial@municonnect.com.br<br />
                  suporte@municonnect.com.br<br />
                  Resposta em até 24h
                </p>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-white shadow-2xl"
          >
            <h3 className="text-4xl font-bold mb-4">
              Pronto para Transformar a Gestão Ambiental do seu Município?
            </h3>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Agende uma demonstração gratuita e veja como nossa plataforma pode aumentar sua receita, otimizar processos e fortalecer sua gestão.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-green-700 hover:bg-gray-100 px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Zap className="w-6 h-6 mr-3" />
              Solicitar Demonstração
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <img src={logo} alt="MuniConnect Logo" className="h-10 w-auto" />
                <div>
                  <h3 className="text-xl font-bold">MuniConnect</h3>
                  <p className="text-sm text-gray-400">Conectando Gestões Municipais</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-xs">
                Promovendo um futuro sustentável através da colaboração e transparência.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6 tracking-wide">Navegação</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors duration-300">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-300">Soluções</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-300">Planos</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-300">Blog</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-6 tracking-wide">Contato</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
                  <span>Belo Horizonte - MG<br/>Atendimento Nacional</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
                  <a href="mailto:contato@municonnect.com.br" className="hover:text-green-400 transition-colors duration-300">contato@municonnect.com.br</a>
                </li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-lg mb-6 tracking-wide">Mantenha-se Informado</h4>
              <p className="text-gray-400 mb-4">Receba atualizações sobre nossas ações e reuniões.</p>
              <form className="flex">
                <input type="email" placeholder="Seu email" className="w-full bg-gray-800 border border-gray-700 rounded-l-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-r-md transition-colors duration-300">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-gray-500 mb-4 md:mb-0 text-sm">
              © 2024 MuniConnect. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-green-400 transition-colors duration-300">Política de Privacidade</a>
              <a href="#" className="text-gray-500 hover:text-green-400 transition-colors duration-300">Termos de Uso</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
