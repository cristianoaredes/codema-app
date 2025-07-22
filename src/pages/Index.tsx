import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, FileText, MapPin, Phone, Mail, ArrowRight, CheckCircle, TreePine, Star, Award, Clock } from "lucide-react";
import logo from "@/assets/logo_with_text.png";

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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="CODEMA Logo" className="h-10 w-auto" />
              <div className="border-l border-gray-200 pl-4">
                <h1 className="text-xl font-semibold text-gray-900">CODEMA</h1>
                <p className="text-sm text-gray-600">Itanhomi - MG</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
            >
              Acessar Sistema
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-8">
            <Award className="w-4 h-4 mr-2" />
            Governo Municipal de Itanhomi - MG
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Conselho de Defesa do
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block">
              Meio Ambiente
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Sistema integrado para gestão municipal, relatórios ambientais e participação cidadã. 
            Construindo um futuro sustentável para Itanhomi através da tecnologia e transparência.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Shield className="w-5 h-5 mr-2" />
              Acessar Sistema
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-10 py-4 text-lg font-semibold transition-all duration-300"
              onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Saiba Mais
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

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

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-gray-50 to-green-50/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                15+
              </div>
              <p className="text-gray-600 font-medium">Conselheiros Ativos</p>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                120+
              </div>
              <p className="text-gray-600 font-medium">Relatórios Processados</p>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                24
              </div>
              <p className="text-gray-600 font-medium">Reuniões Realizadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-6">
              Funcionalidades Principais
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Sistema <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Completo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todas as ferramentas necessárias para uma gestão ambiental eficiente, transparente e moderna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-10 h-10 text-green-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Relatórios Inteligentes</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Crie, acompanhe e gerencie relatórios de problemas ambientais com ferramentas avançadas e interface intuitiva.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestão Integrada</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Gerencie conselheiros, reuniões, atas e resoluções de forma organizada e colaborativa.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Máxima Segurança</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Sistema seguro com controle de acesso avançado, auditoria completa e proteção de dados.
                  </p>
                </div>
              </CardContent>
            </Card>
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
                Preservando o Futuro do
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block">
                  Meio Ambiente
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                O CODEMA de Itanhomi trabalha incansavelmente para promover a proteção e preservação do meio ambiente, 
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
                    <h3 className="font-bold text-gray-900 mb-2">Educação Ambiental</h3>
                    <p className="text-gray-600 text-sm">Programas de conscientização comunitária.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Políticas Sustentáveis</h3>
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
                    Desde nossa criação, trabalhamos para preservar os recursos naturais de Itanhomi 
                    e promover práticas sustentáveis em nossa comunidade.
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
                <h3 className="text-xl font-bold text-gray-900 mb-4">Localização</h3>
                <p className="text-gray-600 leading-relaxed">
                  Rua Principal, 123<br />
                  Centro - Itanhomi/MG<br />
                  CEP: 35120-000
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Telefones</h3>
                <p className="text-gray-600 leading-relaxed">
                  (33) 3361-1234<br />
                  (33) 99999-9999<br />
                  Seg. a Sex., 8h às 17h
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Email</h3>
                <p className="text-gray-600 leading-relaxed">
                  codema@itanhomi.mg.gov.br<br />
                  meioambiente@itanhomi.mg.gov.br<br />
                  Resposta em até 24h
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Pronto para Começar?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Acesse nosso sistema e faça parte da transformação ambiental de Itanhomi.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Shield className="w-6 h-6 mr-3" />
              Acessar Sistema CODEMA
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <img src={logo} alt="CODEMA Logo" className="h-10 w-auto" />
                <div>
                  <h3 className="text-xl font-bold">CODEMA Itanhomi</h3>
                  <p className="text-gray-400">Conselho de Defesa do Meio Ambiente</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                Trabalhando por um futuro sustentável e preservação ambiental em Itanhomi. 
                Transparência, eficiência e compromisso com as futuras gerações.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">Sobre o CODEMA</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Legislação</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Resoluções</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Transparência</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contato</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(33) 3361-1234</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>codema@itanhomi.mg.gov.br</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Centro, Itanhomi - MG</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2024 CODEMA Itanhomi. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <span className="text-gray-400 hover:text-green-400 cursor-pointer transition-colors">Política de Privacidade</span>
              <span className="text-gray-400 hover:text-green-400 cursor-pointer transition-colors">Termos de Uso</span>
              <span className="text-gray-400 hover:text-green-400 cursor-pointer transition-colors">Acessibilidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
